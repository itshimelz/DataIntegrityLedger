"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { ShieldCheck, ArrowRight, ArrowsOut } from "@phosphor-icons/react"
import { useLedger } from "@/hooks/use-ledger"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChainExplorerModal } from "./chain-explorer-modal"
import { cn } from "@/lib/utils"

export function ChainHealthWidget() {
  const { records } = useLedger()
  const [isExplorerOpen, setIsExplorerOpen] = useState(false)
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<
    number | undefined
  >(undefined)

  const handleOpenExplorer = (blockIndex?: number) => {
    setSelectedBlockIndex(
      blockIndex ?? (records.length > 0 ? records[0].block_index : 1)
    )
    setIsExplorerOpen(true)
  }

  return (
    <>
      <Card className="rounded-none border border-border bg-card">
        <CardHeader className="border-b border-border/60 pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="font-heading text-sm font-semibold tracking-wider text-foreground uppercase">
                  Cryptographic Hash Chain Sequence
                </CardTitle>
                <span className="border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary uppercase">
                  Height: {records.length}
                </span>
              </div>
              <CardDescription className="mt-0.5 text-xs text-muted-foreground">
                Sequential SHA-256 block linking (
                <code className="font-mono text-primary">
                  prev_hash → record_hash
                </code>
                ) with RSA-2048 signing.
              </CardDescription>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenExplorer()}
              className="h-7 cursor-pointer gap-1.5 rounded-none border-border bg-card px-2.5 font-heading text-[11px] tracking-wider text-foreground uppercase transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
            >
              <ArrowsOut className="size-3.5 text-primary" weight="bold" />
              <span>Expand Visual Explorer</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="relative overflow-x-auto">
            <div className="flex min-w-max items-center gap-2 py-1">
              {/* Compact Genesis Capsule */}
              <div className="flex h-8 items-center gap-1.5 border border-dashed border-border bg-muted/30 px-2.5 font-mono text-[11px] text-muted-foreground">
                <span className="font-semibold uppercase">#0 Genesis</span>
              </div>

              {/* Connecting Arrow */}
              <ArrowRight
                className="size-3 shrink-0 text-muted-foreground/50"
                weight="bold"
              />

              {/* Sequential Compact Block Capsules */}
              {records.map((rec, index) => {
                const isTampered = rec.verification?.status === "FLAGGED"
                const isLast = index === records.length - 1

                return (
                  <React.Fragment key={rec.id}>
                    <motion.button
                      type="button"
                      onClick={() => handleOpenExplorer(rec.block_index)}
                      whileHover={{ y: -1 }}
                      whileTap={{ y: 0 }}
                      transition={{ duration: 0.12 }}
                      className={`group relative flex h-8 cursor-pointer items-center gap-2 px-2.5 font-mono text-[11px] transition-all ${
                        isTampered
                          ? "border border-destructive/60 bg-destructive/10 text-destructive hover:border-destructive hover:bg-destructive/20"
                          : "border border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "arc-border opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100",
                          isTampered && "arc-border-destructive"
                        )}
                      />
                      <span className="font-semibold">#{rec.block_index}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {rec.course?.course_code}
                      </span>
                      <span className="font-bold text-primary">
                        {rec.grade}
                      </span>
                      {isTampered ? (
                        <span
                          className="size-1.5 rounded-full bg-destructive"
                          aria-label="Block flagged"
                        />
                      ) : (
                        <ShieldCheck
                          className="size-3.5 text-primary"
                          weight="fill"
                        />
                      )}
                    </motion.button>

                    {!isLast && (
                      <ArrowRight
                        className={`size-3 shrink-0 ${
                          isTampered
                            ? "text-destructive"
                            : "text-muted-foreground/50"
                        }`}
                        weight="bold"
                      />
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expanded Chain Visualizer Modal */}
      <ChainExplorerModal
        isOpen={isExplorerOpen}
        onClose={() => setIsExplorerOpen(false)}
        initialBlockIndex={selectedBlockIndex}
      />
    </>
  )
}
