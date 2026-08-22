"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import {
  ShieldCheck,
  Warning,
  ArrowRight,
  Certificate,
  TreeStructure,
} from "@phosphor-icons/react"
import { useLedger, type EnrichedGradeRecord } from "@/hooks/use-ledger"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/common/status-badge"

interface ChainExplorerModalProps {
  isOpen: boolean
  onClose: () => void
  initialBlockIndex?: number
}

export function ChainExplorerModal({
  isOpen,
  onClose,
  initialBlockIndex,
}: ChainExplorerModalProps) {
  const { records, setSelectedRecordForCrypto } = useLedger()
  const [activeBlockIndex, setActiveBlockIndex] = useState<number>(
    initialBlockIndex ?? (records.length > 0 ? records[0].block_index : 1)
  )

  React.useEffect(() => {
    if (isOpen && initialBlockIndex !== undefined) {
      setActiveBlockIndex(initialBlockIndex)
    }
  }, [isOpen, initialBlockIndex])

  const activeRecord: EnrichedGradeRecord | undefined =
    records.find((r) => r.block_index === activeBlockIndex) || records[0]

  const v = activeRecord?.verification || {
    hash_valid: true,
    chain_valid: true,
    signature_valid: true,
    status: "VERIFIED",
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[92vh] w-full max-w-[calc(100%-2rem)] flex-col overflow-y-auto rounded-none border border-border bg-card p-6 sm:max-w-3xl md:max-w-4xl lg:max-w-5xl">
        <DialogHeader className="border-b border-border/60 pr-10 pb-3">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center border border-primary/30 bg-primary/10 text-primary">
                  <TreeStructure className="size-4" weight="bold" />
                </div>
                <div>
                  <DialogTitle className="font-heading text-sm font-semibold tracking-wider text-foreground uppercase">
                    Cryptographic Ledger Chain Explorer
                  </DialogTitle>
                  <DialogDescription className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                    Sequential SHA-256 Hash Chain Topology & Block Verification
                  </DialogDescription>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs tracking-wide text-muted-foreground italic">
                  Block #{activeRecord?.block_index ?? activeBlockIndex}
                </span>
                <StatusBadge status={v.status} />
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-1 text-xs">
          {/* Informational Callout matching reference */}
          <div className="border border-l-2 border-border/40 border-l-primary bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground">
            Chain topology integrity: Each block embeds the cryptographic
            SHA-256 hash digest of its preceding block, establishing an unbroken
            mathematical chain from genesis.
          </div>

          {/* Horizontal Interactive Chain Pipeline */}
          <div className="bg-muted/20 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-heading text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
                Sequential Block Sequence (Click block to inspect telemetry)
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                Left to Right Chronological Progression
              </span>
            </div>

            <div className="relative overflow-x-auto pb-2">
              <div className="flex min-w-max items-center gap-2.5">
                {/* Genesis State Node */}
                <div className="flex flex-col items-center">
                  <div className="flex h-20 w-32 flex-col justify-between border border-dashed border-border bg-muted/40 p-2.5 text-center">
                    <div className="font-heading text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
                      Genesis #0
                    </div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      0000...0000
                    </div>
                    <div className="font-mono text-[11px] text-primary uppercase">
                      Root Anchor
                    </div>
                  </div>
                </div>

                <ArrowRight
                  className="size-3.5 shrink-0 text-muted-foreground/60"
                  weight="bold"
                />

                {/* Blocks */}
                {records.map((rec, idx) => {
                  const isTampered = rec.verification?.status === "FLAGGED"
                  const isSelected = activeRecord?.id === rec.id
                  const isLast = idx === records.length - 1

                  return (
                    <React.Fragment key={rec.id}>
                      <motion.button
                        type="button"
                        onClick={() => setActiveBlockIndex(rec.block_index)}
                        aria-pressed={isSelected}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`group relative flex h-20 w-40 cursor-pointer flex-col justify-between p-2.5 text-left transition-all ${
                          isSelected
                            ? isTampered
                              ? "border-2 border-destructive bg-destructive/15 shadow-sm"
                              : "border-2 border-primary bg-primary/10 shadow-sm"
                            : isTampered
                              ? "border border-destructive/60 bg-destructive/10"
                              : "border border-border bg-card hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold text-foreground">
                            Block #{rec.block_index}
                          </span>
                          {isTampered ? (
                            <span
                              className="flex size-2 rounded-full bg-destructive"
                              aria-label="Block flagged"
                            />
                          ) : (
                            <ShieldCheck
                              className="size-3.5 text-primary"
                              weight="fill"
                            />
                          )}
                        </div>

                        <div className="truncate font-sans text-xs font-medium text-foreground">
                          {rec.student?.name || rec.student_id}
                        </div>

                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {rec.course?.course_code}
                          </span>
                          <span className="font-mono font-bold text-primary">
                            {rec.grade}
                          </span>
                        </div>
                      </motion.button>

                      {!isLast && (
                        <ArrowRight
                          className={`size-3.5 shrink-0 ${
                            isTampered
                              ? "text-destructive"
                              : "text-muted-foreground/60"
                          }`}
                          weight="bold"
                        />
                      )}
                    </React.Fragment>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Active Block Detailed Inspector */}
          {activeRecord && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-xs font-semibold tracking-wider text-foreground uppercase">
                    Block #{activeRecord.block_index} Telemetry & Cryptographic
                    Verification
                  </h3>
                  <StatusBadge status={v.status} />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose()
                    setSelectedRecordForCrypto(activeRecord)
                  }}
                  className="h-7 cursor-pointer gap-1.5 rounded-none border-primary/40 bg-primary/5 px-2.5 font-heading text-[11px] tracking-wider text-primary uppercase hover:bg-primary hover:text-primary-foreground"
                >
                  <Certificate className="size-3.5" weight="bold" />
                  Inspect Full Crypto Proof
                </Button>
              </div>

              {/* Status 3 Cards */}
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <div
                  className={`flex items-center gap-2.5 p-3 ${
                    v.hash_valid
                      ? "bg-primary/5 text-primary"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {v.hash_valid ? (
                    <ShieldCheck
                      className="size-5 shrink-0 text-primary"
                      weight="fill"
                    />
                  ) : (
                    <Warning
                      className="size-5 shrink-0 text-destructive"
                      weight="fill"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-heading text-[11px] font-semibold tracking-wider uppercase">
                      Content SHA-256
                    </div>
                    <div className="truncate font-mono text-[11px] font-semibold uppercase opacity-90">
                      {v.hash_valid ? "Valid Hash Match" : "Content Altered"}
                    </div>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-2.5 p-3 ${
                    v.chain_valid
                      ? "bg-primary/5 text-primary"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {v.chain_valid ? (
                    <ShieldCheck
                      className="size-5 shrink-0 text-primary"
                      weight="fill"
                    />
                  ) : (
                    <Warning
                      className="size-5 shrink-0 text-destructive"
                      weight="fill"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-heading text-[11px] font-semibold tracking-wider uppercase">
                      Chain Continuity
                    </div>
                    <div className="truncate font-mono text-[11px] font-semibold uppercase opacity-90">
                      {v.chain_valid
                        ? "prev_hash Link Verified"
                        : "Broken Sequence"}
                    </div>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-2.5 p-3 ${
                    v.signature_valid
                      ? "bg-primary/5 text-primary"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {v.signature_valid ? (
                    <ShieldCheck
                      className="size-5 shrink-0 text-primary"
                      weight="fill"
                    />
                  ) : (
                    <Warning
                      className="size-5 shrink-0 text-destructive"
                      weight="fill"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-heading text-[11px] font-semibold tracking-wider uppercase">
                      RSA-2048 Signature
                    </div>
                    <div className="truncate font-mono text-[11px] font-semibold uppercase opacity-90">
                      {v.signature_valid
                        ? "Authentic Faculty Key"
                        : "Signature Invalid"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Data & Hashes Grid */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Academic Metadata */}
                <div className="space-y-2 bg-muted/20 p-3.5">
                  <h4 className="font-heading text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
                    Academic Record Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="block font-heading text-[11px] text-muted-foreground uppercase">
                        Student
                      </span>
                      <span className="font-medium text-foreground">
                        {activeRecord.student?.name || activeRecord.student_id}
                      </span>
                    </div>
                    <div>
                      <span className="block font-heading text-[11px] text-muted-foreground uppercase">
                        Student ID
                      </span>
                      <span className="font-mono text-foreground">
                        {activeRecord.student?.student_id ||
                          activeRecord.student_id}
                      </span>
                    </div>
                    <div>
                      <span className="block font-heading text-[11px] text-muted-foreground uppercase">
                        Course
                      </span>
                      <span className="font-mono text-foreground">
                        {activeRecord.course?.course_code}:{" "}
                        {activeRecord.course?.course_name}
                      </span>
                    </div>
                    <div>
                      <span className="block font-heading text-[11px] text-muted-foreground uppercase">
                        Grade Awarded
                      </span>
                      <span className="font-mono text-sm font-bold text-primary">
                        {activeRecord.grade}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cryptographic Linkage Info */}
                <div className="space-y-2 bg-muted/20 p-3.5">
                  <h4 className="font-heading text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">
                    Cryptographic Linkage
                  </h4>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    <div>
                      <span className="block text-[11px] text-primary uppercase">
                        Current Record Hash:
                      </span>
                      <span className="font-semibold break-all text-foreground select-all">
                        {activeRecord.record_hash}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[11px] text-muted-foreground uppercase">
                        Previous Block Hash:
                      </span>
                      <span className="break-all text-muted-foreground select-all">
                        {activeRecord.prev_hash}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
