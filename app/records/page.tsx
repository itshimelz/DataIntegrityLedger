import React from "react"
import { Shell } from "@/components/layout/shell"
import { GradeTable } from "@/components/records/grade-table"
import { TamperAlert } from "@/components/verification/tamper-alert"

export default function RecordsPage() {
  return (
    <Shell>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Academic Grade Ledger Records
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Browse, filter, and inspect cryptographic proofs for all
            authenticated blocks in the ledger.
          </p>
        </div>

        {/* Prominent Tamper Alert if Flagged */}
        <TamperAlert />

        {/* Main Grade Records Filterable Table */}
        <GradeTable />
      </div>
    </Shell>
  )
}
