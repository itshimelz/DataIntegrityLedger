"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  ShieldCheck,
  SquaresFour,
  Table,
  Fingerprint,
  ArrowClockwise,
  Key,
  GraduationCap,
  Scales,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { useLedger } from "@/hooks/use-ledger"
import { Badge } from "@/components/ui/badge"

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/",
    icon: SquaresFour,
    description: "Ledger status & summary",
  },
  {
    label: "Grade Records",
    href: "/records",
    icon: Table,
    description: "Chain browser & inspector",
  },
  {
    label: "Integrity Verification",
    href: "/verify",
    icon: Fingerprint,
    description: "Cryptographic audit report",
  },
]

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from "@/components/ui/popover"

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const { records, verificationReport, resetDemoData, loading, faculty, activeSignerId } = useLedger()

  const activeFaculty = faculty.find((f) => f.id === activeSignerId) || faculty[0]
  const isChainTampered = verificationReport?.status === "FLAGGED"

  return (
    <aside
      className={cn(
        "flex h-screen w-72 flex-col justify-between border-r border-[#143826] bg-[#061a12] text-stone-200 select-none",
        className
      )}
    >
      {/* Top Section: Seal & Brand */}
      <div className="flex flex-col">
        <div className="border-b border-[#143826] p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-none border border-emerald-500/30 bg-[#0e3b23] text-emerald-400">
              <Scales className="size-5" weight="bold" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-lg font-bold tracking-tight text-white">
                  AILedger
                </span>
                <span className="rounded-none border border-emerald-500/30 bg-emerald-500/20 px-1 font-mono text-[9px] font-semibold text-emerald-300">
                  v1.0
                </span>
              </div>
              <p className="font-heading text-[10px] font-medium tracking-wider text-emerald-400/80 uppercase">
                Academic Integrity Ledger
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-none border border-[#143826] bg-[#0a2618] p-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-stone-400">
                <GraduationCap className="size-3.5 text-emerald-400" />
                Office of Registrar
              </span>
              <span className="font-mono text-[10px] text-emerald-400">
                CSE Dept.
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1 p-4">
          <div className="px-3 pb-2 font-heading text-[10px] font-semibold tracking-widest text-emerald-500/70 uppercase">
            Ledger Portals
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href)
            const Icon = item.icon

            return (
              <motion.div
                key={item.href}
                whileHover={{ x: 3 }}
                transition={{ duration: 0.15 }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center justify-between rounded-none px-3 py-2.5 text-xs font-medium transition-all",
                    isActive
                      ? "border border-emerald-500/40 bg-[#0e3b23] text-emerald-300 shadow-sm"
                      : "text-stone-300 hover:bg-[#0a2618] hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "size-4 transition-colors",
                        isActive
                          ? "text-emerald-400"
                          : "text-stone-400 group-hover:text-emerald-400"
                      )}
                      weight={isActive ? "fill" : "bold"}
                    />
                    <div>
                      <div className="font-heading text-xs uppercase tracking-wider">{item.label}</div>
                      <div className="mt-0.5 text-[10px] font-normal text-stone-400 opacity-80">
                        {item.description}
                      </div>
                    </div>
                  </div>

                  {item.href === "/records" && records.length > 0 && (
                    <span className="rounded-none border border-emerald-500/30 bg-[#143826] px-1.5 py-0.5 font-mono text-[9px] font-semibold text-emerald-400">
                      {records.length}
                    </span>
                  )}

                  {item.href === "/verify" && isChainTampered && (
                    <span className="flex size-2 animate-ping rounded-full bg-rose-500" />
                  )}
                </Link>
              </motion.div>
            )
          })}
        </nav>
      </div>

      {/* Bottom Section: Active Signer & Quick Reset */}
      <div className="space-y-3 border-t border-[#143826] bg-[#05160f]/60 p-4">
        {/* Active Faculty Signer Popover */}
        <Popover>
          <PopoverTrigger className="w-full cursor-pointer text-left">
            <div className="rounded-none border border-[#143826] bg-[#0a2618] p-3 transition-colors hover:border-emerald-500/40">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 font-heading text-[9px] font-semibold tracking-widest text-emerald-400 uppercase">
                  <Key className="size-3" weight="bold" />
                  Active Signer Key
                </span>
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
              </div>
              <div className="mt-2 flex items-center gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-none border border-[#143826] bg-[#143826] font-mono text-xs font-bold text-emerald-300">
                  SM
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold text-white">
                    {activeFaculty?.name || "Prof. S. H. Mamun"}
                  </div>
                  <div className="truncate font-mono text-[10px] text-stone-400">
                    RSA-2048: {activeFaculty?.id || "fac-mamun-001"}
                  </div>
                </div>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent side="right" align="end" className="w-80 rounded-none border border-border bg-card p-4">
            <PopoverHeader>
              <PopoverTitle className="font-heading text-xs uppercase tracking-wider text-foreground">
                Faculty Signer Credentials
              </PopoverTitle>
              <PopoverDescription className="text-xs text-muted-foreground">
                Active cryptographic signing authority for academic ledger blocks.
              </PopoverDescription>
            </PopoverHeader>
            <div className="mt-3 space-y-2 text-xs">
              <div>
                <span className="block font-heading text-[9px] uppercase tracking-wider text-muted-foreground">
                  Faculty Name
                </span>
                <span className="font-medium text-foreground">{activeFaculty?.name}</span>
              </div>
              <div>
                <span className="block font-heading text-[9px] uppercase tracking-wider text-muted-foreground">
                  Email & Authority
                </span>
                <span className="font-mono text-xs text-foreground">{activeFaculty?.email} (FACULTY)</span>
              </div>
              <div>
                <span className="block font-heading text-[9px] uppercase tracking-wider text-muted-foreground">
                  Department
                </span>
                <span className="text-foreground">Computer Science & Engineering</span>
              </div>
              <div>
                <span className="block font-heading text-[9px] uppercase tracking-wider text-muted-foreground">
                  Public Key Fingerprint
                </span>
                <span className="font-mono text-[10px] text-primary">SHA256withRSA-2048</span>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Ledger Chain Status Quick Indicator */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-stone-300">
            <ShieldCheck
              className={cn(
                "size-4",
                isChainTampered ? "text-rose-400" : "text-emerald-400"
              )}
              weight="bold"
            />
            <span>Chain Status:</span>
          </div>
          <Badge
            variant={isChainTampered ? "destructive" : "default"}
            className={cn(
              "rounded-none px-1.5 py-0.5 font-mono text-[9px] tracking-widest uppercase",
              !isChainTampered &&
                "border border-emerald-500/40 bg-emerald-950/60 text-emerald-300"
            )}
          >
            {isChainTampered ? "FLAGGED" : "HEALTHY"}
          </Badge>
        </div>

        {/* Reset Demo Data Button with Motion */}
        <motion.button
          type="button"
          onClick={() => resetDemoData()}
          disabled={loading}
          whileHover={!loading ? { y: -1 } : undefined}
          whileTap={!loading ? { y: 0 } : undefined}
          transition={{ duration: 0.12 }}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-none border border-[#1b4d35] bg-[#0d2d1e] px-3 py-2 font-heading text-xs font-semibold tracking-widest text-emerald-300 uppercase transition-colors hover:bg-[#143826] hover:text-white disabled:opacity-50"
        >
          <ArrowClockwise
            className={cn("size-3.5", loading && "animate-spin")}
          />
          Reset Demo State
        </motion.button>
      </div>
    </aside>
  )
}
