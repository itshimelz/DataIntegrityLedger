import { NextResponse } from "next/server"
import { supabaseLedger } from "@/lib/supabase/ledger"

export async function GET() {
  try {
    const report = await supabaseLedger.verifyLedger()
    return NextResponse.json({
      success: true,
      report,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Verification failed",
      },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const report = await supabaseLedger.verifyLedger()
    return NextResponse.json({
      success: true,
      report,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Verification failed",
      },
      { status: 500 }
    )
  }
}

