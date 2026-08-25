import { NextResponse } from "next/server"
import { supabaseLedger } from "@/lib/supabase/ledger"
import { getAuthenticatedUser } from "@/lib/supabase/server"

async function guard() {
  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    )
  }
  return null
}

export async function GET() {
  const denied = await guard()
  if (denied) return denied
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
  const denied = await guard()
  if (denied) return denied
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

