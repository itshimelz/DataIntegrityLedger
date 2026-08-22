"use client"

import React from "react"
import { CheckCircle, XCircle, Eye } from "@phosphor-icons/react"
import { useLedger } from "@/hooks/use-ledger"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { StatusBadge } from "@/components/common/status-badge"

export function VerificationChecklist() {
  const { records, setSelectedRecordForCrypto } = useLedger()

  return (
    <Card className="rounded-none border border-border bg-card">
      <CardHeader className="border-b border-border/60 pb-4">
        <CardTitle className="font-heading text-sm font-semibold tracking-wider text-foreground uppercase">
          Sequential Block Audit Checklist
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Every ledger block undergoes three independent cryptographic
          assertions: Content SHA-256 Digest match, Sequential Hash Chain
          continuity, and RSA-2048 signature verification.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 p-6">
        {records.map((rec) => {
          const v = rec.verification || {
            hash_valid: true,
            chain_valid: true,
            signature_valid: true,
            status: "VERIFIED",
          }
          const isTampered = v.status === "FLAGGED"

          return (
            <div
              key={rec.id}
              className={`rounded-none border p-4 transition-all ${
                isTampered
                  ? "border-destructive/60 bg-destructive/10"
                  : "border-border bg-card hover:bg-muted/20"
              }`}
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Block Info */}
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center border font-mono text-xs font-semibold ${
                      isTampered
                        ? "text-destructive-foreground border-destructive/40 bg-destructive"
                        : "border-primary/30 bg-primary/10 text-primary"
                    }`}
                  >
                    #{rec.block_index}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">
                        {rec.student?.name || rec.student_id}
                      </span>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        ({rec.student?.student_id})
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="font-mono text-xs text-foreground">
                        {rec.course?.course_code}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                      <span>
                        Awarded Grade:{" "}
                        <strong className="font-mono text-xs font-bold text-foreground">
                          {rec.grade}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        Signer:{" "}
                        <span className="text-foreground">
                          {rec.faculty?.name || rec.signed_by}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3 Cryptographic Checkpoints */}
                <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                  {/* Check 1: SHA-256 Content Hash */}
                  <div
                    className={`flex items-center gap-2 border p-2 ${
                      v.hash_valid
                        ? "border-primary/20 bg-primary/5 text-primary"
                        : "border-destructive/30 bg-destructive/10 text-destructive"
                    }`}
                  >
                    {v.hash_valid ? (
                      <CheckCircle
                        className="size-3.5 shrink-0 text-primary"
                        weight="fill"
                      />
                    ) : (
                      <XCircle
                        className="size-3.5 shrink-0 text-destructive"
                        weight="fill"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="font-heading text-[11px] font-semibold tracking-wider uppercase">
                        1. SHA-256 Digest
                      </div>
                      <div className="truncate font-mono text-[11px] tracking-tight uppercase opacity-80">
                        {v.hash_valid ? "Payload Match" : "Hash Mismatch"}
                      </div>
                    </div>
                  </div>

                  {/* Check 2: Sequential Hash Chain Linkage */}
                  <div
                    className={`flex items-center gap-2 border p-2 ${
                      v.chain_valid
                        ? "border-primary/20 bg-primary/5 text-primary"
                        : "border-destructive/30 bg-destructive/10 text-destructive"
                    }`}
                  >
                    {v.chain_valid ? (
                      <CheckCircle
                        className="size-3.5 shrink-0 text-primary"
                        weight="fill"
                      />
                    ) : (
                      <XCircle
                        className="size-3.5 shrink-0 text-destructive"
                        weight="fill"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="font-heading text-[11px] font-semibold tracking-wider uppercase">
                        2. Chain Linkage
                      </div>
                      <div className="truncate font-mono text-[11px] tracking-tight uppercase opacity-80">
                        {v.chain_valid ? "prev_hash Valid" : "Broken Link"}
                      </div>
                    </div>
                  </div>

                  {/* Check 3: RSA-2048 Digital Signature */}
                  <div
                    className={`flex items-center gap-2 border p-2 ${
                      v.signature_valid
                        ? "border-primary/20 bg-primary/5 text-primary"
                        : "border-destructive/30 bg-destructive/10 text-destructive"
                    }`}
                  >
                    {v.signature_valid ? (
                      <CheckCircle
                        className="size-3.5 shrink-0 text-primary"
                        weight="fill"
                      />
                    ) : (
                      <XCircle
                        className="size-3.5 shrink-0 text-destructive"
                        weight="fill"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="font-heading text-[11px] font-semibold tracking-wider uppercase">
                        3. RSA-2048 Sign
                      </div>
                      <div className="truncate font-mono text-[11px] tracking-tight uppercase opacity-80">
                        {v.signature_valid ? "Faculty Valid" : "Invalid Sign"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex shrink-0 items-center justify-end gap-2">
                  <StatusBadge status={v.status} />
                  <button
                    type="button"
                    onClick={() => setSelectedRecordForCrypto(rec)}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-none border border-border bg-card px-2.5 py-1.5 font-heading text-[11px] font-semibold tracking-widest text-foreground uppercase transition-colors hover:bg-muted"
                  >
                    <Eye className="size-3 text-primary" />
                    <span>Inspect</span>
                  </button>
                </div>
              </div>

              {/* Discrepancy Error Banner if Flagged */}
              {isTampered && v.error && (
                <div className="mt-3 border border-destructive/30 bg-destructive/10 p-2.5 font-mono text-xs text-destructive">
                  <strong className="uppercase">Verification Error:</strong>{" "}
                  {v.error}
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
