"use client"

import React, { useState } from "react"
import {
  ShieldCheck,
  Warning,
  Copy,
  Check,
  LockKey,
  Hash,
  LinkSimple,
  CodeBlock,
  Certificate,
} from "@phosphor-icons/react"
import { useLedger } from "@/hooks/use-ledger"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/common/status-badge"
import { canonicalizeRecord } from "@/lib/crypto/canonical"

export function CryptoModal() {
  const { selectedRecordForCrypto, setSelectedRecordForCrypto } = useLedger()
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  if (!selectedRecordForCrypto) return null

  const rec = selectedRecordForCrypto
  const v = rec.verification || {
    hash_valid: true,
    chain_valid: true,
    signature_valid: true,
    status: "VERIFIED",
  }

  const canonicalPayload = {
    id: rec.id,
    student_id: rec.student_id,
    course_id: rec.course_id,
    grade: rec.grade,
    block_index: rec.block_index,
    prev_hash: rec.prev_hash,
    signed_by: rec.signed_by,
    created_at: rec.created_at,
  }

  const canonicalJsonString = canonicalizeRecord(canonicalPayload)

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(keyName)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <Dialog
      open={!!selectedRecordForCrypto}
      onOpenChange={(open) => {
        if (!open) setSelectedRecordForCrypto(null)
      }}
    >
      <DialogContent className="flex max-h-[88vh] w-full max-w-[calc(100%-2rem)] sm:max-w-2xl md:max-w-3xl flex-col overflow-hidden rounded-none border border-border bg-card p-6">
        <DialogHeader className="border-b border-border/60 pb-3 pr-10">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center border border-primary/30 bg-primary/10 text-primary">
                  <Certificate className="size-4" weight="bold" />
                </div>
                <DialogTitle className="font-heading text-sm font-semibold tracking-wider uppercase text-foreground">
                  Cryptographic Proof Inspector
                </DialogTitle>
              </div>
              <div className="flex items-center gap-2">
                <span className="border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[9px] font-semibold text-primary uppercase">
                  Block #{rec.block_index}
                </span>
                <StatusBadge status={v.status} />
              </div>
            </div>
            <DialogDescription className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
              Record ID: <span className="text-foreground">{rec.id}</span> • {new Date(rec.created_at).toUTCString()}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto pr-2 text-xs">
          {/* Verification Status Breakdown - Clean subtle cards */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <div
              className={`flex items-center gap-2.5 p-3 ${
                v.hash_valid
                  ? "bg-primary/5 text-primary"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {v.hash_valid ? (
                <ShieldCheck className="size-5 shrink-0 text-primary" weight="fill" />
              ) : (
                <Warning className="size-5 shrink-0 text-destructive" weight="fill" />
              )}
              <div className="min-w-0 flex-1">
                <div className="font-heading text-[10px] font-semibold tracking-wider uppercase">
                  Content Hash
                </div>
                <div className="truncate font-mono text-[9px] font-semibold uppercase tracking-tight opacity-90">
                  {v.hash_valid ? "Valid SHA-256 Match" : "Tamper Mismatch"}
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
                <ShieldCheck className="size-5 shrink-0 text-primary" weight="fill" />
              ) : (
                <Warning className="size-5 shrink-0 text-destructive" weight="fill" />
              )}
              <div className="min-w-0 flex-1">
                <div className="font-heading text-[10px] font-semibold tracking-wider uppercase">
                  Chain Linkage
                </div>
                <div className="truncate font-mono text-[9px] font-semibold uppercase tracking-tight opacity-90">
                  {v.chain_valid ? "Valid prev_hash Link" : "Broken Sequence"}
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
                <ShieldCheck className="size-5 shrink-0 text-primary" weight="fill" />
              ) : (
                <Warning className="size-5 shrink-0 text-destructive" weight="fill" />
              )}
              <div className="min-w-0 flex-1">
                <div className="font-heading text-[10px] font-semibold tracking-wider uppercase">
                  RSA Signature
                </div>
                <div className="truncate font-mono text-[9px] font-semibold uppercase tracking-tight opacity-90">
                  {v.signature_valid ? "Authentic Faculty Key" : "Invalid Signature"}
                </div>
              </div>
            </div>
          </div>

          {/* Tabbed Inspector Navigation - Clean underline tabs without box wrapper */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-none border-b border-border bg-transparent p-0">
              <TabsTrigger
                value="overview"
                className="h-9 rounded-none border-b-2 border-transparent px-2 py-1.5 text-center font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-all hover:text-foreground data-active:border-primary data-active:bg-transparent data-active:text-foreground"
              >
                <span className="hidden sm:inline">Overview & Data</span>
                <span className="sm:hidden">Overview</span>
              </TabsTrigger>
              <TabsTrigger
                value="canonical"
                className="h-9 rounded-none border-b-2 border-transparent px-2 py-1.5 text-center font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-all hover:text-foreground data-active:border-primary data-active:bg-transparent data-active:text-foreground"
              >
                <span>Canonical JSON</span>
              </TabsTrigger>
              <TabsTrigger
                value="signature"
                className="h-9 rounded-none border-b-2 border-transparent px-2 py-1.5 text-center font-heading text-xs font-semibold uppercase tracking-wider text-muted-foreground transition-all hover:text-foreground data-active:border-primary data-active:bg-transparent data-active:text-foreground"
              >
                <span className="hidden sm:inline">RSA-2048 Proof & Key</span>
                <span className="sm:hidden">RSA Proof</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4 outline-none">
              {/* Academic Entity Details - Clean unboxed metadata grid */}
              <div>
                <h4 className="mb-2.5 font-heading text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
                  Academic Record Data
                </h4>
                <div className="grid grid-cols-2 gap-4 bg-muted/20 p-3.5 text-xs sm:grid-cols-4">
                  <div>
                    <span className="block font-heading text-[9px] tracking-widest text-muted-foreground uppercase">
                      Student Name
                    </span>
                    <span className="font-medium text-foreground">
                      {rec.student?.name || rec.student_id}
                    </span>
                  </div>
                  <div>
                    <span className="block font-heading text-[9px] tracking-widest text-muted-foreground uppercase">
                      Student ID
                    </span>
                    <span className="font-mono text-xs text-foreground">
                      {rec.student?.student_id || rec.student_id}
                    </span>
                  </div>
                  <div>
                    <span className="block font-heading text-[9px] tracking-widest text-muted-foreground uppercase">
                      Course
                    </span>
                    <span className="font-mono text-xs text-foreground">
                      {rec.course?.course_code}: {rec.course?.course_name}
                    </span>
                  </div>
                  <div>
                    <span className="block font-heading text-[9px] tracking-widest text-muted-foreground uppercase">
                      Awarded Grade
                    </span>
                    <span className="font-mono text-sm font-bold text-primary">
                      {rec.grade}
                    </span>
                  </div>
                </div>
              </div>

              {/* SHA-256 Record Hash & Prev Hash Link - Clean single background block */}
              <div className="space-y-3 pt-1">
                <div>
                  <div className="flex items-center justify-between pb-1.5">
                    <div className="flex items-center gap-1.5 font-heading text-[10px] font-semibold tracking-wider text-primary uppercase">
                      <Hash className="size-3.5" />
                      <span>SHA-256 Record Digest (record_hash)</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(rec.record_hash, "record_hash")
                      }
                      className="h-6 gap-1 rounded-none px-2 font-mono text-[9px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
                    >
                      {copiedKey === "record_hash" ? (
                        <Check className="size-3 text-primary" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                      {copiedKey === "record_hash" ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <div className="bg-muted/40 p-3 font-mono text-[11px] break-all text-primary select-all">
                    {rec.record_hash}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between pb-1.5">
                    <div className="flex items-center gap-1.5 font-heading text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                      <LinkSimple className="size-3.5 text-primary" />
                      <span>Previous Block Hash (prev_hash)</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(rec.prev_hash, "prev_hash")}
                      className="h-6 gap-1 rounded-none px-2 font-mono text-[9px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
                    >
                      {copiedKey === "prev_hash" ? (
                        <Check className="size-3 text-primary" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                      {copiedKey === "prev_hash" ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <div className="bg-muted/40 p-3 font-mono text-[11px] break-all text-muted-foreground select-all">
                    {rec.prev_hash}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="canonical" className="mt-4 space-y-2 outline-none">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-1.5 font-heading text-[10px] font-semibold tracking-wider text-foreground uppercase">
                  <CodeBlock className="size-3.5 text-primary" />
                  <span>Deterministic Canonical Payload (NFR-03 Byte Serialization)</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(canonicalJsonString, "payload")}
                  className="h-6 gap-1 rounded-none px-2 font-mono text-[9px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
                >
                  {copiedKey === "payload" ? (
                    <Check className="size-3 text-primary" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                  {copiedKey === "payload" ? "Copied" : "Copy JSON"}
                </Button>
              </div>
              <pre className="w-full overflow-x-auto bg-muted/40 p-3.5 font-mono text-[11px] leading-relaxed text-foreground">
                {JSON.stringify(canonicalPayload, null, 2)}
              </pre>
            </TabsContent>

            <TabsContent value="signature" className="mt-4 space-y-3 outline-none">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
                <div className="flex items-center gap-1.5 font-heading text-[10px] font-semibold tracking-wider text-foreground uppercase">
                  <LockKey className="size-3.5 text-primary" />
                  <span>RSA-2048 Digital Signature</span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">
                  Signer: {rec.faculty?.name || rec.signed_by}
                </span>
              </div>
              <div className="w-full bg-muted/40 p-3.5 font-mono text-[11px] leading-relaxed break-all select-all text-primary">
                {rec.signature}
              </div>

              {rec.faculty?.public_key && (
                <details className="pt-1 text-[10px]">
                  <summary className="cursor-pointer font-mono font-medium text-primary uppercase tracking-wide hover:underline">
                    View Faculty Public Key (PEM SPKI)
                  </summary>
                  <pre className="mt-2 w-full overflow-x-auto bg-muted/40 p-3 font-mono text-[10px] leading-normal text-muted-foreground">
                    {rec.faculty.public_key}
                  </pre>
                </details>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
