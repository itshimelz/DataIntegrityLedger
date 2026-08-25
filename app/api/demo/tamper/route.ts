import { NextResponse } from "next/server"
import { supabaseLedger } from "@/lib/supabase/ledger"
import { requireRole } from "@/lib/supabase/server"

export async function POST(req: Request) {
  // SRS §21: the tamper simulation only runs when explicitly enabled for demos
  if (process.env.ENABLE_TAMPER_DEMO !== "true") {
    return NextResponse.json(
      {
        success: false,
        error:
          "Tamper demo is disabled — set ENABLE_TAMPER_DEMO=true to enable (SRS §21)",
      },
      { status: 403 }
    )
  }
  // FR-14: demo-only, destructive — restricted to FACULTY/ADMIN sessions
  const auth = await requireRole(["FACULTY", "ADMIN"])
  if (auth.error) return auth.error
  try {
    const body = await req.json()
    const { target, newGrade } = body

    if (!target || !newGrade) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing target (record ID or student query) or newGrade",
        },
        { status: 400 }
      )
    }

    const result = await supabaseLedger.tamperRecord(target, newGrade)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Record not found",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      record: result.record,
      previousGrade: result.previousGrade,
      message: `Controlled DB tampering simulation executed on record ${result.record?.id}. Grade modified from '${result.previousGrade}' to '${newGrade}' without recalculating cryptographic hash or signature.`,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Tampering failed",
      },
      { status: 500 }
    )
  }
}
