"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sun,
  Moon,
  ShieldCheck,
  WarningOctagon,
  Plus,
  Key,
  CaretRight,
} from "@phosphor-icons/react"
import { useLedger } from "@/hooks/use-ledger"

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from "@/components/ui/popover"

export function Topbar() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const { verificationReport, setIsAddModalOpen, records, faculty, activeSignerId } = useLedger()

  const activeFaculty = faculty.find((f) => f.id === activeSignerId) || faculty[0]
  const isChainTampered = verificationReport?.status === "FLAGGED"

  // Breadcrumb mapping
  const getPageTitle = () => {
    if (pathname === "/") return "Overview & Chain Health"
    if (pathname.startsWith("/records")) return "Grade Ledger Records"
    if (pathname.startsWith("/verify")) return "Cryptographic Verification"
    return "Portal"
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border bg-card/90 px-6 backdrop-blur-md">
      {/* Left: Breadcrumbs and Page Identity */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          AILedger
        </span>
        <CaretRight className="size-3 text-muted-foreground" />
        <span className="font-heading text-xs font-semibold tracking-wider text-foreground uppercase">
          {getPageTitle()}
        </span>
      </div>

      {/* Right: Status Beacon, Signer Pill, Action Button, Theme Switcher */}
      <div className="flex items-center gap-3">
        {/* Real-time Ledger Health Beacon with Framer Motion Pulse */}
        <div className="hidden items-center gap-2 rounded-none border border-border bg-card px-3 py-1 text-xs md:flex">
          {isChainTampered ? (
            <>
              <span className="relative flex size-2">
                <motion.span
                  animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="absolute inline-flex h-full w-full rounded-full bg-destructive"
                />
                <span className="relative inline-flex size-2 rounded-full bg-destructive" />
              </span>
              <WarningOctagon
                className="size-3.5 text-destructive"
                weight="bold"
              />
              <span className="font-mono text-[10px] font-semibold tracking-wider text-destructive uppercase">
                TAMPER DETECTED ({verificationReport?.invalid} Issues)
              </span>
            </>
          ) : (
            <>
              <span className="relative flex size-2">
                <motion.span
                  animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="absolute inline-flex h-full w-full rounded-full bg-primary"
                />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              <ShieldCheck
                className="size-3.5 text-primary"
                weight="bold"
              />
              <span className="font-mono text-[10px] font-medium tracking-wider text-primary uppercase">
                Ledger Chain: Healthy ({records.length} Blocks)
              </span>
            </>
          )}
        </div>

        {/* Active Faculty Signer Tag Popover */}
        <Popover>
          <PopoverTrigger
            render={
              <motion.button
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
                transition={{ duration: 0.12 }}
                className="hidden cursor-pointer items-center gap-1.5 rounded-none border border-primary/30 bg-primary/10 px-2.5 py-1 font-heading text-[10px] font-semibold tracking-widest text-primary uppercase transition-colors hover:bg-primary/20 lg:flex"
              />
            }
          >
            <Key
              className="size-3.5 text-primary"
              weight="bold"
            />
            <span>Signer: {activeFaculty?.name || "Prof. S. H. Mamun"}</span>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="end" className="w-80 rounded-none border border-border bg-card p-4">
            <PopoverHeader>
              <PopoverTitle className="font-heading text-xs uppercase tracking-wider text-foreground">
                Active Signing Authority
              </PopoverTitle>
              <PopoverDescription className="text-xs text-muted-foreground">
                RSA-2048 signing credentials for {activeFaculty?.name}
              </PopoverDescription>
            </PopoverHeader>
            <div className="mt-3 space-y-2 text-xs">
              <div>
                <span className="block font-heading text-[9px] uppercase tracking-wider text-muted-foreground">
                  Faculty Member
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
            </div>
          </PopoverContent>
        </Popover>

        {/* Add Record Modal Trigger Button with Motion */}
        <motion.button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          whileHover={{ y: -1 }}
          whileTap={{ y: 0 }}
          transition={{ duration: 0.12 }}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-none border border-transparent bg-primary px-3.5 py-1.5 font-heading text-xs font-semibold tracking-widest text-primary-foreground uppercase transition-colors hover:bg-primary/90"
        >
          <Plus className="size-3.5" weight="bold" />
          <span>New Record</span>
        </motion.button>

        {/* Theme Switcher Toggle with Motion */}
        <motion.button
          type="button"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          whileHover={{ y: -1 }}
          whileTap={{ y: 0 }}
          transition={{ duration: 0.12 }}
          className="cursor-pointer rounded-none border border-border bg-card p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Toggle theme"
          title="Toggle light/dark theme"
        >
          <AnimatePresence mode="wait">
            {resolvedTheme === "dark" ? (
              <motion.div
                key="sun"
                initial={{ rotate: -45, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 45, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Sun className="size-4" weight="bold" />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ rotate: 45, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -45, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Moon className="size-4" weight="bold" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </header>
  )
}

