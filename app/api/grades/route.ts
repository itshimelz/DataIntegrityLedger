import { NextResponse } from "next/server"
import { supabaseLedger } from "@/lib/supabase/ledger"
import { getAuthenticatedUser, requireRole } from "@/lib/supabase/server"
import { decryptPrivateKey } from "@/lib/supabase/secretbox"

/**
 * FR-03/FR-10: a registered faculty member signs with their own key.
 * The encrypted private key lives in their auth metadata (server-only);
 * demo faculty keys resolve inside the ledger service as before.
 */
function resolveSignerPrivateKey(
  facultyId: string,
  user: Awaited<ReturnType<typeof getAuthenticatedUser>>
): string | undefined {
  if (!user) return undefined
  const userFacultyId = (user.user_metadata?.faculty_id as string) || user.id
  if (facultyId !== userFacultyId && facultyId !== user.id) return undefined
  const blob = user.user_metadata?.private_key_enc
  return blob ? decryptPrivateKey(blob) : undefined
}

export async function GET() {
  // NFR-01: ledger reads are session-gated — no anonymous access to grades or audit events
  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    )
  }
  try {
    const [rawRecords, students, courses, faculty, auditEvents] =
      await Promise.all([
        supabaseLedger.getGradeRecords(),
        supabaseLedger.getStudents(),
        supabaseLedger.getCourses(),
        supabaseLedger.getFaculty(),
        supabaseLedger.getAuditEvents(),
      ])

    const studentMap = new Map(students.map((s) => [s.id, s]))
    const courseMap = new Map(courses.map((c) => [c.id, c]))
    const facultyMap = new Map(faculty.map((f) => [f.id, f]))

    // Hydrate each record with human-readable entity info
    const records = rawRecords.map((rec) => ({
      ...rec,
      student: studentMap.get(rec.student_id),
      course: courseMap.get(rec.course_id),
      faculty: facultyMap.get(rec.signed_by)
        ? {
            id: facultyMap.get(rec.signed_by)!.id,
            name: facultyMap.get(rec.signed_by)!.name,
            email: facultyMap.get(rec.signed_by)!.email,
            public_key: facultyMap.get(rec.signed_by)!.public_key,
          }
        : undefined,
    }))

    return NextResponse.json({
      success: true,
      records,
      students,
      courses,
      faculty: faculty.map((f) => ({
        id: f.id,
        name: f.name,
        email: f.email,
        public_key: f.public_key,
      })),
      auditEvents,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load grade records",
      },
      { status: 500 }
    )
  }
}

// FR-07 Grade Editing: append-only correction, never an in-place update
export async function PATCH(req: Request) {
  // FR-02: only FACULTY may append ledger corrections — server-side role check
  const auth = await requireRole(["FACULTY"])
  if (auth.error) return auth.error
  const user = auth.user
  try {
    const body = await req.json()
    const { record_id, new_grade } = body
    const faculty_id =
      body.faculty_id || (user.user_metadata?.faculty_id as string) || user.id

    if (!record_id || !new_grade || !faculty_id) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: record_id, new_grade",
        },
        { status: 400 }
      )
    }

    const corrected = await supabaseLedger.correctGradeRecord({
      record_id,
      new_grade,
      faculty_id,
      signer_private_key: resolveSignerPrivateKey(faculty_id, user),
    })

    return NextResponse.json({
      success: true,
      record: corrected,
      message: `Grade correction signed and appended at block #${corrected.block_index}; original block preserved.`,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create grade correction",
      },
      { status: 400 }
    )
  }
}

// ponytail: DELETE intentionally absent — the ledger is append-only by design
export async function POST(req: Request) {
  // FR-02: only FACULTY may append ledger records — server-side role check
  const auth = await requireRole(["FACULTY"])
  if (auth.error) return auth.error
  const user = auth.user
  try {
    const body = await req.json()
    const { student_id, course_id, grade } = body
    const faculty_id =
      body.faculty_id || (user.user_metadata?.faculty_id as string) || user.id

    if (!student_id || !course_id || !grade || !faculty_id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: student_id, course_id, grade",
        },
        { status: 400 }
      )
    }

    const newRecord = await supabaseLedger.addGradeRecord({
      student_id,
      course_id,
      grade,
      faculty_id,
      signer_private_key: resolveSignerPrivateKey(faculty_id, user),
    })

    return NextResponse.json({
      success: true,
      record: newRecord,
      message: `Grade record created and cryptographically signed at block #${newRecord.block_index}`,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create grade record",
      },
      { status: 500 }
    )
  }
}

