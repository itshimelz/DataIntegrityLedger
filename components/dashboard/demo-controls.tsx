"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShieldCheck,
  Bug,
  Plus,
  ArrowClockwise,
  CheckCircle,
  ArrowsClockwise,
} from "@phosphor-icons/react"
import { useLedger } from "@/hooks/use-ledger"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function DemoControls() {
  const {
    runVerification,
    isVerifying,
    setIsTamperModalOpen,
    setIsAddModalOpen,
    resetDemoData,
    loading,
  } = useLedger()

  const [lastActionStatus, setLastActionStatus] = useState<string | null>(null)
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false)

  const handleRunVerification = async () => {
    const report = await runVerification()
    if (report) {
      if (report.status === "VERIFIED") {
        setLastActionStatus(
          "Verification complete: all checks passed (0 discrepancies)"
        )
        toast.success("Ledger Verification: 100% Valid", {
          description:
            "All blocks passed canonical SHA-256 digests, sequential hash chaining, and RSA-2048 faculty signatures.",
        })
      } else {
        setLastActionStatus(
          `Verification complete: tamper detected in ${report.invalid} block(s)`
        )
        toast.error(`Integrity Alert: Tampering Detected`, {
          description: `Discrepancies found in ${report.invalid} block(s). Cryptographic assertions failed.`,
        })
      }
      setTimeout(() => setLastActionStatus(null), 4000)
    }
  }

  const handleReset = async () => {
    await resetDemoData()
    setIsResetConfirmOpen(false)
    setLastActionStatus("Demo dataset restored to pristine state")
    toast.info("Demo dataset reset", {
      description: "Ledger chain restored to pristine verified baseline.",
    })
    setTimeout(() => setLastActionStatus(null), 3000)
  }

  return (
    <Card className="rounded-md border border-border bg-card">
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
              Demonstration & Audit Actions
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Test tamper detection in real-time or append newly signed grade
              blocks.
            </CardDescription>
          </div>

          <AnimatePresence>
            {lastActionStatus && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-1.5 border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wide text-primary"
              >
                <CheckCircle className="size-3 text-primary" weight="fill" />
                <span>{lastActionStatus}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Action 1: Run Full Verification with Framer Motion & Hermes Arc Border */}
          <motion.button
            type="button"
            onClick={handleRunVerification}
            disabled={isVerifying}
            whileHover={!isVerifying ? { y: -1 } : undefined}
            whileTap={!isVerifying ? { y: 0 } : undefined}
            transition={{ duration: 0.12 }}
            className="group relative flex cursor-pointer items-center justify-between border border-transparent bg-primary px-4 py-3.5 text-left text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-80"
          >
            <span
              aria-hidden
              className="arc-border opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100"
            />
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider">
                {isVerifying ? "Scanning Chain..." : "Run Verification"}
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-primary-foreground/80">
                {isVerifying
                  ? "Auditing block sequence..."
                  : "Audit hashes & signatures"}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {isVerifying ? (
                <motion.div
                  key="verifying-icon"
                  initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
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
                    <ArrowsClockwise
                      className="size-5 text-primary-foreground"
                      weight="bold"
                    />
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="idle-icon"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center"
                >
                  <ShieldCheck
                    className="size-5 text-primary-foreground"
                    weight="bold"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Action 2: Simulate DB Tampering with Hermes Arc Border */}
          <motion.button
            type="button"
            onClick={() => setIsTamperModalOpen(true)}
            whileHover={{ y: -1 }}
            whileTap={{ y: 0 }}
            transition={{ duration: 0.12 }}
            className="group relative flex cursor-pointer items-center justify-between border border-destructive/30 bg-destructive/10 px-4 py-3.5 text-left text-destructive transition-all hover:border-destructive/60 hover:bg-destructive/20"
          >
            <span
              aria-hidden
              className="arc-border arc-border-destructive opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100"
            />
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider">
                Simulate Tamper
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-destructive/80">
                Mutate grade directly (FR-14)
              </div>
            </div>
            <Bug className="size-5" weight="bold" />
          </motion.button>

          {/* Action 3: Add Grade Record with Hermes Arc Border */}
          <motion.button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            whileHover={{ y: -1 }}
            whileTap={{ y: 0 }}
            transition={{ duration: 0.12 }}
            className="group relative flex cursor-pointer items-center justify-between border border-border bg-card px-4 py-3.5 text-left text-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            <span
              aria-hidden
              className="arc-border opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100"
            />
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider">
                Add Grade Record
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                Sign & append next block
              </div>
            </div>
            <Plus className="size-5 text-foreground" weight="bold" />
          </motion.button>

          {/* Action 4: Reset Demo Data (confirm-gated) */}
          <motion.button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            disabled={loading}
            whileHover={!loading ? { y: -1 } : undefined}
            whileTap={!loading ? { y: 0 } : undefined}
            transition={{ duration: 0.12 }}
            className="group relative flex cursor-pointer items-center justify-between border border-border bg-card px-4 py-3.5 text-left text-foreground transition-all hover:border-border hover:bg-muted disabled:opacity-50"
          >
            <span
              aria-hidden
              className="arc-border opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100"
            />
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider">
                Reset Demo Data
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                Restore genesis state
              </div>
            </div>
            <ArrowClockwise
              className={`size-5 text-foreground ${loading ? "animate-spin" : ""}`}
              weight="bold"
            />
          </motion.button>
        </div>
      </CardContent>

      {/* Destructive-action confirmation */}
      <Dialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
        <DialogContent className="max-w-sm rounded-md border border-border bg-card p-6">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold tracking-tight text-foreground">
              Reset demo dataset?
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed text-muted-foreground">
              This clears every record and restores the seeded genesis state.
              Any tampering simulation in progress is discarded. This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsResetConfirmOpen(false)}
              className="rounded-md"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleReset}
              disabled={loading}
              className="gap-1.5 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20"
            >
              <ArrowClockwise
                className={`size-3.5 ${loading ? "animate-spin" : ""}`}
                weight="bold"
              />
              Reset demo data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
