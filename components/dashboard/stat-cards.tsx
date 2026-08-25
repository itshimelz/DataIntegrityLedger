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
import { toast } from "sonner"

export function StatCards() {
  const { records, verificationReport, loading } = useLedger()
  const [copiedHash, setCopiedHash] = useState<boolean>(false)

  const totalRecords = records.length
  const latestBlock = records[records.length - 1]
  const headHash = latestBlock ? latestBlock.record_hash : "—"

  // ponytail: honest states — no report means nobody has audited; never fake counts
  const audited = verificationReport !== null
  const validCount = verificationReport?.valid ?? null
  const invalidCount = verificationReport?.invalid ?? null
  const isTampered = (invalidCount ?? 0) > 0

  const copyHeadHash = () => {
    if (headHash && headHash !== "—") {
      navigator.clipboard.writeText(headHash)
      setCopiedHash(true)
      toast.success("Head Record Digest Copied", {
        description: `${headHash.substring(0, 16)}... copied to clipboard.`,
      })
      setTimeout(() => setCopiedHash(false), 2000)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Metric 1: Total Records (Informational - No hover/motion) */}
      <div className="h-full">
        <Card className="flex h-full flex-col justify-between rounded-md border border-border bg-card">
          <CardContent className="flex flex-1 flex-col justify-between p-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  Total Records
                </span>
                <div className="flex size-8 items-center justify-center border border-border bg-muted/50 text-foreground">
                  <FileText className="size-4" weight="bold" />
                </div>
              </div>
              <div className="mt-3 flex h-9 items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-foreground">
                  {loading ? "..." : totalRecords}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  blocks
                </span>
              </div>
            </div>
            <p className="mt-2 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
              Chain height: Block #{latestBlock?.block_index ?? 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Metric 2: Verified Blocks (Informational - No hover/motion) */}
      <div className="h-full">
        <Card className="flex h-full flex-col justify-between rounded-md border border-border bg-card">
          <CardContent className="flex flex-1 flex-col justify-between p-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  Verified Blocks
                </span>
                <div className="flex size-8 items-center justify-center border border-primary/30 bg-primary/10 text-primary">
                  <ShieldCheck className="size-4" weight="bold" />
                </div>
              </div>
              <div className="mt-3 flex h-9 items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-primary">
                  {loading
                    ? "..."
                    : (validCount ?? (
                        <span className="text-muted-foreground">—</span>
                      ))}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  / {totalRecords} valid
                </span>
              </div>
            </div>
            <p
              className={`mt-2 font-mono text-[11px] tracking-wide uppercase ${audited ? "font-semibold text-primary" : "text-muted-foreground"}`}
            >
              {audited
                ? "SHA-256 + RSA-2048 valid"
                : "Run verification to confirm"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Metric 3: Discrepancies Detected (Informational - No hover/motion) */}
      <div className="h-full">
        <Card
          className={`flex h-full flex-col justify-between rounded-md border ${
            isTampered
              ? "border-destructive/50 bg-destructive/5"
              : "border-border bg-card"
          }`}
        >
          <CardContent className="flex flex-1 flex-col justify-between p-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
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
                  className={`text-3xl font-bold tracking-tight ${
                    isTampered ? "text-destructive" : "text-foreground"
                  }`}
                >
                  {loading
                    ? "..."
                    : (invalidCount ?? (
                        <span className="text-muted-foreground">—</span>
                      ))}
                </span>
                <span className="font-mono text-xs text-muted-foreground uppercase">
                  {isTampered ? "violations" : "tamper-free"}
                </span>
              </div>
            </div>
            <p
              className={`mt-2 font-mono text-[11px] tracking-wide uppercase ${
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
        <Card className="flex h-full flex-col justify-between rounded-md border border-border bg-card">
          <CardContent className="flex flex-1 flex-col justify-between p-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
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
                        className="group relative flex size-8 cursor-pointer items-center justify-center border border-border bg-muted/50 text-foreground transition-all hover:border-primary/60 hover:bg-primary/5 hover:text-primary"
                      />
                    }
                  >
                    <span
                      aria-hidden
                      className="arc-border opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100"
                    />
                    <Hash className="size-4" weight="bold" />
                  </PopoverTrigger>
                  <PopoverContent
                    side="bottom"
                    align="end"
                    className="w-80 rounded-md border border-border bg-card p-4"
                  >
                    <PopoverHeader>
                      <PopoverTitle className="text-xs font-semibold tracking-tight text-foreground">
                        Current Head Block
                      </PopoverTitle>
                      <PopoverDescription className="text-xs text-muted-foreground">
                        Latest block committed to the tamper-evident chain.
                      </PopoverDescription>
                    </PopoverHeader>
                    <div className="mt-3 space-y-2 text-xs">
                      <div>
                        <span className="block text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                          Block Index & ID
                        </span>
                        <span className="font-mono text-xs text-foreground">
                          #{latestBlock?.block_index} ({latestBlock?.id})
                        </span>
                      </div>
                      <div>
                        <span className="block text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                          Full SHA-256 Digest
                        </span>
                        <span className="font-mono text-[11px] break-all text-primary select-all">
                          {headHash}
                        </span>
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
                  className="group relative flex h-7 cursor-pointer items-center gap-1 border border-border bg-muted/40 px-2 font-mono text-[11px] text-muted-foreground uppercase transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                  title="Copy full 64-char SHA-256 hash"
                >
                  <span
                    aria-hidden
                    className="arc-border opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100"
                  />
                  {copiedHash ? (
                    <Check className="size-3 text-primary" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                  <span>{copiedHash ? "Copied" : "Copy"}</span>
                </motion.button>
              </div>
            </div>
            <p className="mt-2 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
              Linked to preceding block
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
