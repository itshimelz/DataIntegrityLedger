"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShieldCheck,
  WarningOctagon,
  ArrowClockwise,
  Fingerprint,
  FileText,
  LockKey,
} from "@phosphor-icons/react"
import { useLedger } from "@/hooks/use-ledger"
import { Card, CardContent } from "@/components/ui/card"
import { TamperAlert } from "./tamper-alert"
import { VerificationChecklist } from "./verification-checklist"
import { toast } from "sonner"

export function VerificationPanel() {
  const { records, verificationReport, runVerification, isVerifying } =
    useLedger()

  const [auditMessage, setAuditMessage] = useState<string | null>(null)

  const isTampered = verificationReport?.status === "FLAGGED"
  // ponytail: honesty first — before an audit runs, show "not yet audited", never implied health
  const audited = verificationReport !== null
  const total = records.length
  const valid = verificationReport?.valid ?? null
  const invalid = verificationReport?.invalid ?? null
  const chainLinked = records.filter(
    (r) => r.verification?.chain_valid !== false
  ).length
  const signaturesValid = records.filter(
    (r) => r.verification?.signature_valid !== false
  ).length
  const verifiedAt = verificationReport?.verified_at
    ? new Date(verificationReport.verified_at).toLocaleTimeString()
    : null

  const handleVerify = async () => {
    const report = await runVerification()
    if (report) {
      setAuditMessage(`AUDIT COMPLETED AT ${new Date().toLocaleTimeString()}`)
      if (report.status === "VERIFIED") {
        toast.success("Ledger Verification Passed", {
          description: `All ${report.total} blocks cryptographically verified and intact.`,
        })
      } else {
        toast.error("Integrity Alert: Tampering Detected", {
          description: `${report.invalid} of ${report.total} blocks failed cryptographic assertions.`,
        })
      }
      setTimeout(() => setAuditMessage(null), 3000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner: Verification Audit Runner */}
      <Card className="rounded-none border border-border bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div
                className={`flex size-12 shrink-0 items-center justify-center border ${
                  isTampered
                    ? "text-destructive-foreground border-destructive/40 bg-destructive"
                    : "border-primary/40 bg-primary text-primary-foreground"
                }`}
              >
                {isTampered ? (
                  <WarningOctagon className="size-6" weight="bold" />
                ) : (
                  <ShieldCheck className="size-6" weight="bold" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-base font-semibold tracking-wider text-foreground uppercase">
                    {isTampered ? (
                      <>
                        Ledger Chain Flagged:{" "}
                        <em className="italic">Tampering Detected</em>
                      </>
                    ) : audited ? (
                      <>
                        Ledger Chain <em className="italic">Verified</em> &amp;
                        Healthy
                      </>
                    ) : (
                      "Ledger Awaiting First Audit"
                    )}
                  </h2>
                </div>
                <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground">
                  The automated verification engine independently verifies every
                  block by reconstructing the canonical byte serialization,
                  re-calculating SHA-256 digests, traversing sequential previous
                  hashes, and validating faculty RSA-2048 digital signatures.
                </p>
                <div className="mt-3 flex items-center gap-4 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                  <span>
                    Last Audit:{" "}
                    <strong className="text-foreground">
                      {verifiedAt ?? "Not yet run"}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Scanned:{" "}
                    <strong className="text-foreground">{total} Blocks</strong>
                  </span>
                  {audited && (
                    <>
                      <span>•</span>
                      <span
                        className={
                          isTampered
                            ? "font-bold text-destructive"
                            : "font-bold text-primary"
                        }
                      >
                        {valid} Valid / {invalid} Flagged
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Run Verification Button */}
            <div className="flex shrink-0 items-center gap-2 sm:flex-col">
              <motion.button
                type="button"
                onClick={handleVerify}
                disabled={isVerifying}
                whileHover={!isVerifying ? { y: -1 } : undefined}
                whileTap={!isVerifying ? { y: 0 } : undefined}
                transition={{ duration: 0.12 }}
                className="group relative inline-flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-none bg-primary px-5 py-3 font-heading text-xs font-semibold tracking-widest text-primary-foreground uppercase transition-all hover:bg-primary/90 disabled:opacity-80"
              >
                <span
                  aria-hidden
                  className="arc-border opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100"
                />
                <AnimatePresence mode="wait">
                  {isVerifying ? (
                    <motion.div
                      key="scanning"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center justify-center"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          ease: "linear",
                        }}
                      >
                        <ArrowClockwise className="size-4" weight="bold" />
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center justify-center"
                    >
                      <ShieldCheck className="size-4" weight="bold" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <span>
                  {isVerifying ? "Scanning Chain..." : "Run Verification Audit"}
                </span>
              </motion.button>

              <AnimatePresence>
                {auditMessage && (
                  <motion.span
                    initial={{ opacity: 0, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -2 }}
                    className="font-mono text-[11px] font-semibold text-primary uppercase"
                  >
                    {auditMessage}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prominent Tamper Alert if Compromised */}
      <TamperAlert />

      {/* Verification Breakdown Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="rounded-none border border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 font-heading text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              <FileText className="size-4 text-primary" />
              <span>1. Payload Content Integrity</span>
            </div>
            <div className="mt-2 font-serif text-2xl font-bold text-foreground">
              {audited ? (
                `${valid} / ${total} Match`
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
            <p className="mt-1 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
              Recomputed SHA-256 digests against canonical JSON.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-none border border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 font-heading text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              <Fingerprint className="size-4 text-primary" />
              <span>2. Hash Chain Continuity</span>
            </div>
            <div className="mt-2 font-serif text-2xl font-bold text-foreground">
              {audited ? (
                isTampered ? (
                  <span className="text-destructive">{chainLinked} / {total} Linked</span>
                ) : (
                  `${chainLinked} / ${total} Linked`
                )
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
            <p className="mt-1 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
              Validated sequential prev_hash linkage.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-none border border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 font-heading text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              <LockKey className="size-4 text-primary" />
              <span>3. Cryptographic Authenticity</span>
            </div>
            <div className="mt-2 font-serif text-2xl font-bold text-foreground">
              {audited ? (
                `${signaturesValid} / ${total} Signed`
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
            <p className="mt-1 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
              Faculty signatures verified with RSA-2048 public keys.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Per-Block Checklist Report */}
      <VerificationChecklist />
    </div>
  )
}
