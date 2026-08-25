import { NextResponse } from "next/server"
import { supabaseLedger } from "@/lib/supabase/ledger"
import { requireRole } from "@/lib/supabase/server"

export async function POST() {
  // SRS §21: demo controls only exist when the demo flag is on
  if (process.env.ENABLE_TAMPER_DEMO !== "true") {
    return NextResponse.json(
      {
        success: false,
        error:
          "Demo controls are disabled — set ENABLE_TAMPER_DEMO=true to enable (SRS §21)",
      },
      { status: 403 }
    )
  }
  // Destructive seed reset — restricted to FACULTY/ADMIN sessions
  const auth = await requireRole(["FACULTY", "ADMIN"])
  if (auth.error) return auth.error
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
