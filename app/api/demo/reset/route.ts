import { NextResponse } from "next/server"
import { demoStore } from "@/lib/demo/store"

export async function POST() {
  try {
    demoStore.resetDemoData()
    return NextResponse.json({
      success: true,
      message:
        "Ledger and demo store successfully reset to initial pristine seed dataset.",
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
