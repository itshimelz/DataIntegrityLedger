import { NextResponse } from "next/server"
import { supabaseLedger } from "@/lib/supabase/ledger"
import { getAuthenticatedUser } from "@/lib/supabase/server"

export async function POST(req: Request) {
  // FR-14: demo-only simulation — still requires an authenticated session
  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    )
  }
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
