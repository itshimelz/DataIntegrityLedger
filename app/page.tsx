import React from "react"
import { Shell } from "@/components/layout/shell"
import { StatCards } from "@/components/dashboard/stat-cards"
import { ChainHealthWidget } from "@/components/dashboard/chain-health-widget"
import { DemoControls } from "@/components/dashboard/demo-controls"
import { RecentRecords } from "@/components/dashboard/recent-records"
import { TamperAlert } from "@/components/verification/tamper-alert"

export default function DashboardPage() {
  return (
    <Shell>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold tracking-wider uppercase text-foreground md:text-2xl">
              Registrar Grade Ledger Overview
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Tamper-evident academic records authenticated with SHA-256 hash chaining and RSA-2048 faculty signatures.
            </p>
          </div>
        </div>

        {/* Prominent Tamper Alert if Compromised */}
        <TamperAlert />

        {/* Top Metric Stat Cards */}
        <StatCards />

        {/* Chain Health Visual Timeline */}
        <ChainHealthWidget />

        {/* Interactive Demo & Action Controls */}
        <DemoControls />

        {/* Recent Ledger Entries Snapshot */}
        <RecentRecords />
      </div>
    </Shell>
  )
}
