"use client"

import React from "react"
import {
  WarningOctagon,
  ArrowRight,
  ArrowClockwise,
  Eye,
} from "@phosphor-icons/react"
import { useLedger } from "@/hooks/use-ledger"

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export function TamperAlert() {
  const {
    verificationReport,
    records,
    setSelectedRecordForCrypto,
    resetDemoData,
    tamperSimulation,
  } = useLedger()

  const isTampered = verificationReport?.status === "FLAGGED"
  if (!isTampered) return null

  // Find the flagged issues
  const flaggedIssues =
    verificationReport?.issues.filter((i) => i.status === "FLAGGED") || []
  const firstFlagged = flaggedIssues[0]
  const targetRecord = firstFlagged
    ? records.find((r) => r.id === firstFlagged.record_id)
    : null

  return (
    <Alert
      variant="destructive"
      className="rounded-none border-destructive bg-destructive/10 p-5"
    >
      <div className="flex w-full flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="flex items-start gap-3.5">
          <div className="text-destructive-foreground flex size-9 shrink-0 items-center justify-center border border-destructive/40 bg-destructive">
            <WarningOctagon className="size-5" weight="bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <AlertTitle className="font-heading text-sm font-semibold tracking-wider text-destructive uppercase">
                Integrity Compromised: Unauthorized Database Mutation
              </AlertTitle>
              <span className="border border-destructive/40 bg-destructive/20 px-1.5 py-0.5 font-mono text-[11px] font-bold tracking-widest text-destructive uppercase">
                {flaggedIssues.length} Violation
                {flaggedIssues.length > 1 ? "s" : ""}
              </span>
            </div>
            <AlertDescription className="mt-1 max-w-3xl text-xs leading-relaxed text-destructive/90">
              The automated verification scanner detected an unauthorized
              mutation in stored records. The stored SHA-256 digest and RSA-2048
              signature do not match the modified content.
            </AlertDescription>

            {/* Tampered Record Quick Diagnosis */}
            {targetRecord && (
              <div className="mt-3 rounded-none border border-destructive/30 bg-card p-3 text-foreground">
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-destructive">
                      Block #{targetRecord.block_index} ({targetRecord.id})
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="font-medium text-foreground">
                      {targetRecord.student?.name || targetRecord.student_id} (
                      {targetRecord.student?.student_id})
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="font-mono text-xs text-foreground">
                      {targetRecord.course?.course_code}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {tamperSimulation && (
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span className="text-muted-foreground line-through">
                          Original: {tamperSimulation.previousGrade}
                        </span>
                        <ArrowRight className="size-3 text-destructive" />
                        <span className="font-bold text-destructive">
                          Altered: {targetRecord.grade}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-2 font-mono text-[11px] text-destructive">
                  Failed checks:{" "}
                  {firstFlagged.error ||
                    "Content hash mismatch (stored hash does not match current payload)"}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex shrink-0 items-center gap-2 md:flex-col">
          {targetRecord && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setSelectedRecordForCrypto(targetRecord)}
              className="text-destructive-foreground inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-none bg-destructive px-3 py-2 font-heading text-xs font-semibold tracking-widest uppercase transition-colors hover:bg-destructive/90 active:translate-y-px"
            >
              <Eye className="size-3.5" />
              <span>Inspect Proof</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => resetDemoData()}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-none border border-border bg-card px-3 py-2 font-heading text-xs font-semibold tracking-widest text-foreground uppercase transition-colors hover:bg-muted active:translate-y-px"
          >
            <ArrowClockwise className="size-3.5" />
            <span>Reset Demo</span>
          </Button>
        </div>
      </div>
    </Alert>
  )
}
