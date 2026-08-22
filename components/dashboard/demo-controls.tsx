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

  const handleRunVerification = async () => {
    const report = await runVerification()
    if (report) {
      if (report.status === "VERIFIED") {
        setLastActionStatus(
          "VERIFICATION COMPLETE: ALL CHECKS PASSED (0 DISCREPANCIES)"
        )
      } else {
        setLastActionStatus(
          `VERIFICATION COMPLETE: TAMPER DETECTED IN ${report.invalid} BLOCK(S)`
        )
      }
      setTimeout(() => setLastActionStatus(null), 4000)
    }
  }

  const handleReset = async () => {
    await resetDemoData()
    setLastActionStatus("DEMO DATASET RESTORED TO PRISTINE STATE")
    setTimeout(() => setLastActionStatus(null), 3000)
  }

  return (
    <Card className="rounded-none border border-border bg-card">
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="font-heading text-sm font-semibold tracking-wider uppercase text-foreground">
              Demonstration & Audit Actions
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Test tamper detection in real-time or append newly signed grade blocks.
            </CardDescription>
          </div>

          <AnimatePresence>
            {lastActionStatus && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-1.5 border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wide text-primary"
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
          {/* Action 1: Run Full Verification with Framer Motion */}
          <motion.button
            type="button"
            onClick={handleRunVerification}
            disabled={isVerifying}
            whileHover={!isVerifying ? { y: -1 } : undefined}
            whileTap={!isVerifying ? { y: 0 } : undefined}
            transition={{ duration: 0.12 }}
            className="flex cursor-pointer items-center justify-between border border-transparent bg-primary px-4 py-3.5 text-left text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-80"
          >
            <div>
              <div className="font-heading text-xs font-semibold tracking-widest uppercase">
                {isVerifying ? "Scanning Chain..." : "Run Verification"}
              </div>
              <div className="mt-0.5 font-mono text-[10px] text-primary-foreground/80">
                {isVerifying ? "Auditing block sequence..." : "Audit hashes & signatures"}
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
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    <ArrowsClockwise className="size-5 text-primary-foreground" weight="bold" />
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
                  <ShieldCheck className="size-5 text-primary-foreground" weight="bold" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Action 2: Simulate DB Tampering */}
          <motion.button
            type="button"
            onClick={() => setIsTamperModalOpen(true)}
            whileHover={{ y: -1 }}
            whileTap={{ y: 0 }}
            transition={{ duration: 0.12 }}
            className="flex cursor-pointer items-center justify-between border border-destructive/30 bg-destructive/10 px-4 py-3.5 text-left text-destructive transition-colors hover:bg-destructive/20"
          >
            <div>
              <div className="font-heading text-xs font-semibold tracking-widest uppercase">
                Simulate Tamper
              </div>
              <div className="mt-0.5 font-mono text-[10px] text-destructive/80">
                Mutate grade directly (FR-14)
              </div>
            </div>
            <Bug className="size-5" weight="bold" />
          </motion.button>

          {/* Action 3: Add Grade Record */}
          <motion.button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            whileHover={{ y: -1 }}
            whileTap={{ y: 0 }}
            transition={{ duration: 0.12 }}
            className="flex cursor-pointer items-center justify-between border border-border bg-card px-4 py-3.5 text-left text-foreground transition-colors hover:bg-muted"
          >
            <div>
              <div className="font-heading text-xs font-semibold tracking-widest uppercase">
                Add Grade Record
              </div>
              <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                Sign & append next block
              </div>
            </div>
            <Plus className="size-5 text-foreground" weight="bold" />
          </motion.button>

          {/* Action 4: Reset Demo Data */}
          <motion.button
            type="button"
            onClick={handleReset}
            disabled={loading}
            whileHover={!loading ? { y: -1 } : undefined}
            whileTap={!loading ? { y: 0 } : undefined}
            transition={{ duration: 0.12 }}
            className="flex cursor-pointer items-center justify-between border border-border bg-card px-4 py-3.5 text-left text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            <div>
              <div className="font-heading text-xs font-semibold tracking-widest uppercase">
                Reset Demo Data
              </div>
              <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
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
    </Card>
  )
}
