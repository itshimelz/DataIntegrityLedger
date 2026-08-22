"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import {
  FileText,
  ShieldCheck,
  WarningOctagon,
  Hash,
  Copy,
  Check,
} from "@phosphor-icons/react"
import { useLedger } from "@/hooks/use-ledger"
import { Card, CardContent } from "@/components/ui/card"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from "@/components/ui/popover"

export function StatCards() {
  const { records, verificationReport, loading } = useLedger()
  const [copiedHash, setCopiedHash] = useState<boolean>(false)

  const totalRecords = records.length
  const latestBlock = records[records.length - 1]
  const headHash = latestBlock ? latestBlock.record_hash : "—"

  const validCount = verificationReport?.valid ?? records.length
  const invalidCount = verificationReport?.invalid ?? 0
  const isTampered = invalidCount > 0

  const copyHeadHash = () => {
    if (headHash && headHash !== "—") {
      navigator.clipboard.writeText(headHash)
      setCopiedHash(true)
      setTimeout(() => setCopiedHash(false), 2000)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Metric 1: Total Records (Informational - No hover/motion) */}
      <div className="h-full">
        <Card className="flex h-full flex-col justify-between rounded-none border border-border bg-card">
          <CardContent className="flex flex-1 flex-col justify-between p-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-heading text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Total Records
                </span>
                <div className="flex size-8 items-center justify-center border border-border bg-muted/50 text-foreground">
                  <FileText className="size-4" weight="bold" />
                </div>
              </div>
              <div className="mt-3 flex h-9 items-baseline gap-2">
                <span className="font-serif text-3xl font-bold tracking-tight text-foreground">
                  {loading ? "..." : totalRecords}
                </span>
                <span className="font-mono text-xs text-muted-foreground">blocks</span>
              </div>
            </div>
            <p className="mt-2 font-mono text-[10px] text-muted-foreground uppercase tracking-wide">
              Chain height: Block #{latestBlock?.block_index ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Metric 2: Verified Blocks (Informational - No hover/motion) */}
      <div className="h-full">
        <Card className="flex h-full flex-col justify-between rounded-none border border-border bg-card">
          <CardContent className="flex flex-1 flex-col justify-between p-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-heading text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Verified Blocks
                </span>
                <div className="flex size-8 items-center justify-center border border-primary/30 bg-primary/10 text-primary">
                  <ShieldCheck className="size-4" weight="bold" />
                </div>
              </div>
              <div className="mt-3 flex h-9 items-baseline gap-2">
                <span className="font-serif text-3xl font-bold tracking-tight text-primary">
                  {loading ? "..." : validCount}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  / {totalRecords} valid
                </span>
              </div>
            </div>
            <p className="mt-2 font-mono text-[10px] font-semibold text-primary uppercase tracking-wide">
              SHA-256 + RSA-2048 valid
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Metric 3: Discrepancies Detected (Informational - No hover/motion) */}
      <div className="h-full">
        <Card
          className={`flex h-full flex-col justify-between rounded-none border ${
            isTampered
              ? "border-destructive/50 bg-destructive/5"
              : "border-border bg-card"
          }`}
        >
          <CardContent className="flex flex-1 flex-col justify-between p-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-heading text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Discrepancies
                </span>
                <div
                  className={`flex size-8 items-center justify-center border ${
                    isTampered
                      ? "border-destructive/40 bg-destructive/20 text-destructive"
                      : "border-border bg-muted/50 text-foreground"
                  }`}
                >
                  <WarningOctagon
                    className="size-4"
                    weight={isTampered ? "fill" : "bold"}
                  />
                </div>
              </div>
              <div className="mt-3 flex h-9 items-baseline gap-2">
                <span
                  className={`font-serif text-3xl font-bold tracking-tight ${
                    isTampered
                      ? "animate-pulse text-destructive"
                      : "text-foreground"
                  }`}
                >
                  {loading ? "..." : invalidCount}
                </span>
                <span className="font-mono text-xs text-muted-foreground uppercase">
                  {isTampered ? "violations" : "tamper-free"}
                </span>
              </div>
            </div>
            <p
              className={`mt-2 font-mono text-[10px] uppercase tracking-wide ${
                isTampered
                  ? "font-semibold text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {isTampered
                ? "Tamper alert: mismatch detected"
                : "Sequential chain intact"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Metric 4: Head Record Hash (Interactive Controls Only) */}
      <div className="h-full">
        <Card className="flex h-full flex-col justify-between rounded-none border border-border bg-card">
          <CardContent className="flex flex-1 flex-col justify-between p-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-heading text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Ledger Head Digest
                </span>
                <Popover>
                  <PopoverTrigger
                    render={
                      <motion.button
                        type="button"
                        whileHover={{ y: -1 }}
                        whileTap={{ y: 0 }}
                        transition={{ duration: 0.12 }}
                        className="flex size-8 cursor-pointer items-center justify-center border border-border bg-muted/50 text-foreground transition-colors hover:border-primary"
                      />
                    }
                  >
                    <Hash className="size-4" weight="bold" />
                  </PopoverTrigger>
                  <PopoverContent side="bottom" align="end" className="w-80 rounded-none border border-border bg-card p-4">
                    <PopoverHeader>
                      <PopoverTitle className="font-heading text-xs uppercase tracking-wider text-foreground">
                        Current Head Block
                      </PopoverTitle>
                      <PopoverDescription className="text-xs text-muted-foreground">
                        Latest block committed to the tamper-evident chain.
                      </PopoverDescription>
                    </PopoverHeader>
                    <div className="mt-3 space-y-2 text-xs">
                      <div>
                        <span className="block font-heading text-[9px] uppercase tracking-wider text-muted-foreground">
                          Block Index & ID
                        </span>
                        <span className="font-mono text-xs text-foreground">#{latestBlock?.block_index} ({latestBlock?.id})</span>
                      </div>
                      <div>
                        <span className="block font-heading text-[9px] uppercase tracking-wider text-muted-foreground">
                          Full SHA-256 Digest
                        </span>
                        <span className="font-mono text-[10px] break-all text-primary select-all">{headHash}</span>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="mt-3 flex h-9 items-center justify-between">
                <span className="font-mono text-xs font-bold tracking-tight text-foreground">
                  {loading
                    ? "..."
                    : `${headHash.substring(0, 6)}...${headHash.substring(58)}`}
                </span>
                <motion.button
                  type="button"
                  onClick={copyHeadHash}
                  disabled={loading || headHash === "—"}
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                  transition={{ duration: 0.12 }}
                  className="flex h-7 cursor-pointer items-center gap-1 border border-border bg-muted/40 px-2 font-mono text-[10px] uppercase text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                  title="Copy full 64-char SHA-256 hash"
                >
                  {copiedHash ? (
                    <Check className="size-3 text-primary" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                  <span>{copiedHash ? "Copied" : "Copy"}</span>
                </motion.button>
              </div>
            </div>
            <p className="mt-2 font-mono text-[10px] text-muted-foreground uppercase tracking-wide">
              Linked to preceding block
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

