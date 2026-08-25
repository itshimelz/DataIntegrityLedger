"use client"

import React, { useState } from "react"
import {
  PencilSimpleLine,
  Key,
  ShieldCheck,
  WarningCircle,
  ArrowBendDownRight,
} from "@phosphor-icons/react"
import { useLedger } from "@/hooks/use-ledger"
import { useAuth } from "@/hooks/use-auth"
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

// FR-07: corrections append a new signed block; the original block is never mutated
export function EditGradeModal() {
  const { user, profile } = useAuth()
  const {
    recordToEdit,
    setRecordToEdit,
    faculty,
    correctGradeRecord,
  } = useLedger()

  const [grade, setGrade] = useState<string>("A")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const displayName = profile?.name || (user?.user_metadata?.full_name as string) || user?.email || "Faculty Signer"
  const signerId = profile?.id || (user?.user_metadata?.faculty_id as string) || user?.id || faculty[0]?.id || ""

  const isOpen = recordToEdit !== null

  React.useEffect(() => {
    if (recordToEdit) {
      setGrade(recordToEdit.grade)
      setErrorMessage(null)
    }
  }, [recordToEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recordToEdit) return
    setErrorMessage(null)

    if (grade === recordToEdit.grade) {
      setErrorMessage(
        `The corrected grade must differ from the currently recorded grade (${recordToEdit.grade}).`
      )
      return
    }

    setIsSubmitting(true)
    const res = await correctGradeRecord({
      record_id: recordToEdit.id,
      new_grade: grade,
      faculty_id: signerId,
    })
    setIsSubmitting(false)

    if (res.success && res.record) {
      toast.success(`Correction appended as Block #${res.record.block_index}`, {
        description: `${recordToEdit.student?.name || recordToEdit.student_id}: ${recordToEdit.grade} → ${grade}. Original block preserved as evidence.`,
      })
      setRecordToEdit(null)
    } else {
      setErrorMessage(res.error || "Failed to append grade correction")
      toast.error("Failed to append correction block", {
        description: res.error || "Please check inputs and try again.",
      })
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && setRecordToEdit(null)}
    >
      <DialogContent className="flex max-h-[90vh] w-full max-w-[calc(100%-2rem)] flex-col overflow-y-auto rounded-md border border-border bg-card p-6 sm:max-w-xl md:max-w-2xl">
        <DialogHeader className="border-b border-border/60 pr-10 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center border border-primary/30 bg-primary/10 text-primary">
              <PencilSimpleLine className="size-5" weight="bold" />
            </div>
            <div>
              <DialogTitle className="text-sm font-semibold tracking-tight text-foreground">
                Issue Signed Grade Correction
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Appends a new tamper-evident ledger block referencing the
                original entry. The original authenticated state is never
                destroyed.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4 pt-1">
          {errorMessage && (
            <div className="border border-l-2 border-destructive/40 border-l-destructive bg-destructive/10 p-3 text-xs leading-relaxed text-destructive">
              <div className="flex items-center gap-2 font-mono">
                <WarningCircle className="size-4 shrink-0" weight="fill" />
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Original Record Summary */}
          {recordToEdit && (
            <div className="border border-l-2 border-border/40 border-l-muted-foreground bg-muted/20 p-3.5 font-mono text-[11px]">
              <div className="flex items-center gap-1.5 pb-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                <ArrowBendDownRight className="size-3.5" weight="bold" />
                Correcting Block #{recordToEdit.block_index} ({recordToEdit.id})
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground uppercase">
                    Student:
                  </span>
                  <span className="text-foreground">
                    {recordToEdit.student?.name || recordToEdit.student_id}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground uppercase">
                    Course:
                  </span>
                  <span className="text-foreground">
                    {recordToEdit.course?.course_code}{" "}
                    {recordToEdit.course?.course_name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground uppercase">
                    Current Grade:
                  </span>
                  <span className="font-bold text-foreground">
                    {recordToEdit.grade}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground uppercase">
                    Stored Hash:
                  </span>
                  <span className="max-w-[220px] truncate text-foreground">
                    {recordToEdit.record_hash.substring(0, 16)}...
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* New Grade & Signer */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col">
              <label className="mb-1.5 flex h-5 items-center gap-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                <PencilSimpleLine
                  className="size-3.5 text-primary"
                  weight="bold"
                />
                Corrected Grade
              </label>
              <Select
                value={grade}
                onValueChange={(val) => {
                  if (typeof val === "string") setGrade(val)
                }}
              >
                <SelectTrigger className="h-10 w-full rounded-md border border-border bg-card px-3 font-sans text-xs font-semibold text-primary">
                  <SelectValue placeholder="Select Grade">
                    {grade ? `Grade ${grade}` : "Select Grade"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {GRADE_OPTIONS.map((g) => (
                    <SelectItem key={g} value={g}>
                      <span className="font-mono font-bold text-foreground">
                        Grade {g}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col">
              <label className="mb-1.5 flex h-5 items-center gap-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                <Key className="size-3.5 text-primary" weight="bold" />
                Authorized Faculty Signer
              </label>
              <div className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-muted/40 px-3 text-xs">
                <span className="truncate font-medium text-foreground">
                  {displayName}
                </span>
                <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary">
                  AUTHENTICATED
                </span>
              </div>
            </div>
          </div>

          {/* Cryptographic Linkage Preview */}
          <div className="border border-l-2 border-border/40 border-l-primary bg-muted/20 p-3.5">
            <div className="flex items-center justify-between pb-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              <span className="flex items-center gap-1.5 text-primary">
                <ShieldCheck className="size-3.5" weight="bold" />
                Correction Chaining Preview
              </span>
              <span className="font-mono text-xs tracking-wide text-muted-foreground italic">
                Appends Block #
                {recordToEdit ? recordToEdit.block_index + 1 : "?"}
              </span>
            </div>
            <div className="mt-2 space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground uppercase">
                  References Original:
                </span>
                <span className="text-foreground">{recordToEdit?.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground uppercase">
                  Signing Algorithm:
                </span>
                <span className="font-semibold text-primary">
                  RSA-2048 / SHA-256
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRecordToEdit(null)}
              className="rounded-md border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="rounded-md bg-primary text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting
                ? "Signing Correction..."
                : "Sign & Append Correction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
