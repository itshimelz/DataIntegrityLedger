"use client"

import React, { useState } from "react"
import { ArrowRight, ShieldWarning, Bug } from "@phosphor-icons/react"
import { useLedger } from "@/hooks/use-ledger"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

const GRADE_OPTIONS = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "D", "F"]

export function TamperModal() {
  const { isTamperModalOpen, setIsTamperModalOpen, records, simulateTamper } =
    useLedger()

  const [selectedRecordId, setSelectedRecordId] = useState<string>("")
  const [tamperedGrade, setTamperedGrade] = useState<string>("A+")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  // ponytail: two-step arm/confirm so one click can't silently rewrite a grade
  const [isArmed, setIsArmed] = useState<boolean>(false)

  React.useEffect(() => {
    if (isTamperModalOpen && records.length > 0 && !selectedRecordId) {
      setSelectedRecordId(records[0].id)
    }
    if (!isTamperModalOpen) setIsArmed(false)
  }, [isTamperModalOpen, records, selectedRecordId])

  React.useEffect(() => {
    setIsArmed(false)
  }, [selectedRecordId, tamperedGrade])

  const targetRecord =
    records.find((r) => r.id === selectedRecordId) || records[0]

  const handleTamper = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetRecord) return

    setIsSubmitting(true)
    setError(null)

    const res = await simulateTamper(targetRecord.id, tamperedGrade)
    setIsSubmitting(false)

    if (res.success) {
      toast.error(
        `Tamper simulation committed on Block #${targetRecord.block_index}`,
        {
          description: `Direct database record updated to grade ${tamperedGrade}. Run verification to detect cryptographic discrepancy.`,
        }
      )
      setIsTamperModalOpen(false)
    } else {
      setError(res.error || "Failed to simulate tampering")
      toast.error("Tampering simulation failed", {
        description: res.error || "Please try again.",
      })
    }
  }

  return (
    <Dialog open={isTamperModalOpen} onOpenChange={setIsTamperModalOpen}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-[calc(100%-2rem)] flex-col overflow-y-auto rounded-none border border-destructive/40 bg-card p-6 sm:max-w-lg md:max-w-xl">
        <DialogHeader className="border-b border-border/60 pr-10 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center border border-destructive/40 bg-destructive/10 text-destructive">
              <Bug className="size-5" weight="bold" />
            </div>
            <div>
              <DialogTitle className="font-heading text-sm font-semibold tracking-wider text-destructive uppercase">
                Simulate DB Tampering (SRS FR-14)
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Simulate an unauthorized rogue SQL update on the database that
                bypasses application signing logic.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleTamper} className="flex flex-col space-y-4 pt-1">
          {error && (
            <div className="border border-l-2 border-destructive/40 border-l-destructive bg-destructive/10 p-3 font-mono text-xs leading-relaxed text-destructive">
              {error}
            </div>
          )}

          {/* Educational Explainer Banner - Stylized Left Border Callout */}
          <div className="border border-l-2 border-border/40 border-l-primary bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground">
            <div className="flex items-start gap-2">
              <ShieldWarning
                className="mt-0.5 size-4 shrink-0 text-primary"
                weight="bold"
              />
              <div className="text-[11px] leading-relaxed">
                <strong className="text-foreground">
                  Security Demonstration:
                </strong>{" "}
                In a conventional DB, an SQL{" "}
                <code className="bg-muted px-1 font-mono text-foreground">
                  UPDATE
                </code>{" "}
                overwrites data invisibly. In Data Integrity Ledger, the stored SHA-256 hash
                and RSA signature will immediately detect this modification on
                verification.
              </div>
            </div>
          </div>

          {/* Target Record Selector */}
          <div>
            <label className="mb-1.5 block font-heading text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
              Select Ledger Block to Mutate
            </label>
            <Select
              value={selectedRecordId}
              onValueChange={(val) => {
                if (typeof val === "string") setSelectedRecordId(val)
              }}
            >
              <SelectTrigger className="h-10 w-full rounded-none border border-border bg-card px-3 font-sans text-xs text-foreground focus:border-destructive">
                <SelectValue placeholder="Select Record">
                  {(() => {
                    const r =
                      records.find((item) => item.id === selectedRecordId) ||
                      records[0]
                    return r
                      ? `Block #${r.block_index} — ${r.student?.name || r.student_id} (${r.course?.course_code}) • Current Grade: ${r.grade}`
                      : "Select Record"
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {records.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    <div className="flex flex-col py-0.5 text-left">
                      <span className="font-medium text-foreground">
                        Block #{r.block_index} ({r.id}) —{" "}
                        {r.student?.name || r.student_id}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {r.course?.course_code}: {r.course?.course_name} •
                        Current Grade:{" "}
                        <strong className="text-primary">{r.grade}</strong>
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tampered Grade Input - Always horizontal layout */}
          {targetRecord && (
            <div className="pt-1">
              <div className="mb-2 font-heading text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                Simulated Grade Mutation:
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-1 flex-col bg-muted/40 p-3 text-center">
                  <div className="flex h-5 items-center justify-center font-heading text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
                    Original Grade
                  </div>
                  <div className="mt-1 flex h-10 items-center justify-center font-mono text-xl font-bold text-foreground">
                    {targetRecord.grade}
                  </div>
                </div>

                <div className="flex shrink-0 items-center justify-center">
                  <ArrowRight
                    className="size-4 text-muted-foreground"
                    weight="bold"
                  />
                </div>

                <div className="flex flex-1 flex-col bg-destructive/10 p-3 text-center">
                  <div className="flex h-5 items-center justify-center font-heading text-[11px] font-semibold tracking-widest text-destructive uppercase">
                    Tampered Grade
                  </div>
                  <div className="mt-1 flex h-10 items-center justify-center">
                    <Select
                      value={tamperedGrade}
                      onValueChange={(val) => {
                        if (typeof val === "string") setTamperedGrade(val)
                      }}
                    >
                      <SelectTrigger className="h-10 w-full rounded-none border border-destructive/40 bg-card px-2 font-mono text-sm font-bold text-destructive">
                        <SelectValue placeholder="Grade">
                          {`Grade ${tamperedGrade}`}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {GRADE_OPTIONS.map((g) => (
                          <SelectItem key={g} value={g}>
                            Grade {g}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4 gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsTamperModalOpen(false)}
              className="rounded-none border border-border bg-card font-heading text-xs font-semibold tracking-widest text-foreground uppercase hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              onClick={(e) => {
                if (!isArmed) {
                  e.preventDefault()
                  setIsArmed(true)
                }
              }}
              className={`rounded-none font-heading text-xs font-semibold tracking-widest uppercase ${
                isArmed
                  ? "text-destructive-foreground animate-none bg-destructive hover:bg-destructive"
                  : "text-destructive-foreground bg-destructive hover:bg-destructive/90"
              }`}
            >
              {isSubmitting
                ? "Executing Tamper..."
                : isArmed
                  ? `Confirm: Overwrite ${targetRecord?.grade} with ${tamperedGrade}`
                  : "Arm Mutation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
