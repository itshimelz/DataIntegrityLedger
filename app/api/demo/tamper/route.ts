import { NextResponse } from "next/server"
import { demoStore } from "@/lib/demo/store"

export async function POST(req: Request) {
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

    const result = demoStore.tamperRecord(target, newGrade)

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
