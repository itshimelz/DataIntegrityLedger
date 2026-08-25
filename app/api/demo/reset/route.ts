import { NextResponse } from "next/server"
import { supabaseLedger } from "@/lib/supabase/ledger"
import { getAuthenticatedUser } from "@/lib/supabase/server"

export async function POST() {
  const user = await getAuthenticatedUser()
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    )
  }
  try {
    await supabaseLedger.resetDemoData()
    return NextResponse.json({
      success: true,
      message:
        "Ledger and Supabase database successfully reset to initial pristine seed dataset.",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to reset demo data",
      },
      { status: 500 }
    )
  }
}
