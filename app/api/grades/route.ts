import { NextResponse } from "next/server"
import { demoStore } from "@/lib/demo/store"

export async function GET() {
  try {
    const rawRecords = demoStore.getGradeRecords()
    const students = demoStore.getStudents()
    const courses = demoStore.getCourses()
    const faculty = demoStore.getFaculty()
    const auditEvents = demoStore.getAuditEvents()

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

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { student_id, course_id, grade, faculty_id } = body

    if (!student_id || !course_id || !grade || !faculty_id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: student_id, course_id, grade, faculty_id",
        },
        { status: 400 }
      )
    }

    const newRecord = demoStore.addGradeRecord({
      student_id,
      course_id,
      grade,
      faculty_id,
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
