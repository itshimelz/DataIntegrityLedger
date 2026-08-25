"use client"

import React from "react"
import { MotionConfig } from "framer-motion"
import { ArrowClockwise, WarningOctagon } from "@phosphor-icons/react"
import { AppSidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { LedgerProvider, useLedger } from "@/hooks/use-ledger"
import { CryptoModal } from "@/components/records/crypto-modal"
import { AddGradeModal } from "@/components/records/add-grade-modal"
import { EditGradeModal } from "@/components/records/edit-grade-modal"
import { TamperModal } from "@/components/records/tamper-modal"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

// ponytail: single global error surface so a dead API never renders as a calm empty ledger
function LedgerErrorBanner() {
  const { error, refreshData, loading } = useLedger()
  if (!error) return null

  return (
    <div className="border-b border-destructive/40 bg-destructive/10">
      <Alert
        variant="destructive"
        className="mx-auto max-w-7xl rounded-md border-0 bg-transparent p-4"
      >
        <div className="flex w-full flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <WarningOctagon
              className="mt-0.5 size-5 shrink-0 text-destructive"
              weight="fill"
            />
            <div>
              <AlertTitle className="text-sm font-semibold text-destructive">
                Ledger connection problem
              </AlertTitle>
              <AlertDescription className="mt-0.5 text-xs text-destructive/90">
                {error} Records shown below may be incomplete or stale.
              </AlertDescription>
            </div>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => refreshData()}
            disabled={loading}
            className="shrink-0 gap-1.5 self-start bg-destructive text-destructive-foreground hover:bg-destructive/90 sm:self-auto"
          >
            <ArrowClockwise
              className={loading ? "size-3.5 animate-spin" : "size-3.5"}
            />
            Retry
          </Button>
        </div>
      </Alert>
    </div>
  )
}

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <LedgerProvider>
      {/* reducedMotion="user" honors prefers-reduced-motion for all JS-driven animation */}
      <MotionConfig reducedMotion="user">
        <TooltipProvider>
          {/* ponytail: start collapsed as the Supabase-style icon rail */}
          <SidebarProvider defaultOpen={false}>
            <AppSidebar />
            <SidebarInset className="flex min-h-screen max-w-full min-w-0 flex-1 flex-col overflow-x-hidden bg-background">
              <Topbar />
              <LedgerErrorBanner />
              <LedgerAnnouncer />
              <main className="mx-auto w-full max-w-7xl min-w-0 flex-1 space-y-6 p-4 sm:p-6 md:p-8">
                {children}
              </main>
            </SidebarInset>

            {/* Global Inspection and Action Modals */}
            <CryptoModal />
            <AddGradeModal />
            <EditGradeModal />
            <TamperModal />
          </SidebarProvider>
        </TooltipProvider>
      </MotionConfig>
    </LedgerProvider>
  )
}

// Screen-reader announcement channel for ledger events (audit results, tamper detection)
function LedgerAnnouncer() {
  const { announcement } = useLedger()
  return (
    <span role="status" aria-live="polite" className="sr-only">
      {announcement}
    </span>
  )
}
