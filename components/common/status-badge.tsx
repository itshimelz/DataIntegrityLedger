"use client"

import React from "react"
import { motion } from "framer-motion"
import { CheckCircle, WarningCircle, Clock } from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { VerificationStatus } from "@/lib/types"

interface StatusBadgeProps {
  status: VerificationStatus
  size?: "sm" | "md"
  className?: string
}

export function StatusBadge({
  status,
  size = "md",
  className,
}: StatusBadgeProps) {
  if (status === "VERIFIED") {
    return (
      <motion.span
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="inline-flex"
      >
        <Badge
          variant="outline"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-none border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[9px] font-semibold tracking-widest text-primary uppercase",
            size === "sm" ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-1",
            className
          )}
        >
          <CheckCircle
            className={
              size === "sm"
                ? "size-3 text-primary"
                : "size-3.5 text-primary"
            }
            weight="fill"
          />
          <span>VERIFIED</span>
        </Badge>
      </motion.span>
    )
  }

  if (status === "FLAGGED") {
    return (
      <motion.span
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="inline-flex"
      >
        <Badge
          variant="destructive"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-none border border-destructive/40 bg-destructive/10 px-2 py-0.5 font-mono text-[9px] font-semibold tracking-widest text-destructive uppercase",
            size === "sm" ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-1",
            className
          )}
        >
          <WarningCircle
            className={
              size === "sm"
                ? "size-3 text-destructive animate-pulse"
                : "size-3.5 text-destructive animate-pulse"
            }
            weight="fill"
          />
          <span>FLAGGED</span>
        </Badge>
      </motion.span>
    )
  }

  return (
    <motion.span
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="inline-flex"
    >
      <Badge
        variant="secondary"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-none border border-border bg-muted/60 px-2 py-0.5 font-mono text-[9px] font-semibold tracking-widest text-muted-foreground uppercase",
          size === "sm" ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-1",
          className
        )}
      >
        <Clock
          className={
            size === "sm"
              ? "size-3 text-muted-foreground"
              : "size-3.5 text-muted-foreground"
          }
          weight="fill"
        />
        <span>PENDING</span>
      </Badge>
    </motion.span>
  )
}
