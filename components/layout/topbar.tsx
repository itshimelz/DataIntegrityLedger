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
import { SidebarTrigger } from "@/components/ui/sidebar"

export function Topbar() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const {
    verificationReport,
    setIsAddModalOpen,
    records,
    faculty,
    activeSignerId,
  } = useLedger()

  const activeFaculty =
    faculty.find((f) => f.id === activeSignerId) || faculty[0]

  // Breadcrumb mapping
  const getPageTitle = () => {
    if (pathname === "/") return "Overview & Chain Health"
    if (pathname.startsWith("/records")) return "Grade Ledger Records"
    if (pathname.startsWith("/verify")) return "Cryptographic Verification"
    return "Portal"
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border bg-card/90 px-4 backdrop-blur-md md:px-6">
      {/* Left: Sidebar Toggle, Breadcrumbs and Page Identity */}
      <div className="flex items-center gap-2.5 text-xs">
        <SidebarTrigger className="-ml-1 text-foreground hover:bg-muted" />
        <span className="font-heading text-xs font-semibold tracking-widest text-muted-foreground uppercase">
          AILedger
        </span>
        <CaretRight className="size-3 text-muted-foreground" />
        <span className="font-heading text-xs font-semibold tracking-wider text-foreground uppercase">
          {getPageTitle()}
        </span>
      </div>

      {/* Right: Status Beacon, Signer Pill, Action Button, Theme Switcher - All Unified h-8 */}
      <div className="flex items-center gap-2.5">
        {/* Real-time Ledger Health Beacon — never claims health before an audit exists */}
        <div className="hidden h-8 items-center gap-2 rounded-none border border-border bg-card/80 px-3 text-xs md:inline-flex">
          {verificationReport?.status === "FLAGGED" ? (
            <>
              <span className="size-2 shrink-0 rounded-full bg-destructive" />
              <WarningOctagon
                className="size-3.5 shrink-0 text-destructive"
                weight="bold"
              />
              <span className="font-mono text-[11px] font-semibold tracking-wider text-destructive">
                Tamper detected · {verificationReport.invalid} issue
                {verificationReport.invalid === 1 ? "" : "s"}
              </span>
            </>
          ) : verificationReport ? (
            <>
              <span className="size-2 shrink-0 rounded-full bg-primary" />
              <ShieldCheck
                className="size-3.5 shrink-0 text-primary"
                weight="bold"
              />
              <span className="font-mono text-[11px] font-medium tracking-wider text-primary">
                Ledger verified · {records.length} blocks
              </span>
            </>
          ) : (
            <>
              <span className="size-2 shrink-0 rounded-full bg-muted-foreground/50" />
              <span className="font-mono text-[11px] font-medium tracking-wider text-muted-foreground">
                Not yet audited
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
                className="group relative hidden h-8 cursor-pointer items-center gap-1.5 rounded-none border border-primary/30 bg-primary/10 px-3 font-heading text-[11px] font-semibold tracking-wider text-primary uppercase transition-all hover:border-primary/60 hover:bg-primary/20 lg:inline-flex"
              />
            }
          >
            <span
              aria-hidden
              className="arc-border opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100"
            />
            <Key className="size-3.5 shrink-0 text-primary" weight="bold" />
            <span className="truncate">
              Signer: {activeFaculty?.name || "Prof. S. H. Mamun"}
            </span>
          </PopoverTrigger>
          <PopoverContent
            side="bottom"
            align="end"
            className="w-80 rounded-none border border-border bg-card p-4"
          >
            <PopoverHeader>
              <PopoverTitle className="font-heading text-xs tracking-wider text-foreground uppercase">
                Active Signing Authority
              </PopoverTitle>
              <PopoverDescription className="text-xs text-muted-foreground">
                RSA-2048 signing credentials for {activeFaculty?.name}
              </PopoverDescription>
            </PopoverHeader>
            <div className="mt-3 space-y-2 text-xs">
              <div>
                <span className="block font-heading text-[11px] tracking-wider text-muted-foreground uppercase">
                  Faculty Member
                </span>
                <span className="font-medium text-foreground">
                  {activeFaculty?.name}
                </span>
              </div>
              <div>
                <span className="block font-heading text-[11px] tracking-wider text-muted-foreground uppercase">
                  Email & Authority
                </span>
                <span className="font-mono text-xs text-foreground">
                  {activeFaculty?.email} (FACULTY)
                </span>
              </div>
              <div>
                <span className="block font-heading text-[11px] tracking-wider text-muted-foreground uppercase">
                  Department
                </span>
                <span className="text-foreground">
                  Computer Science & Engineering
                </span>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Add Record Modal Trigger Button with Motion & Hermes Arc Border */}
        <motion.button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          whileHover={{ y: -1 }}
          whileTap={{ y: 0 }}
          transition={{ duration: 0.12 }}
          className="group relative inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-none border border-primary bg-primary px-3.5 font-heading text-[11px] font-semibold tracking-wider text-primary-foreground uppercase transition-all hover:bg-primary/90"
        >
          <span
            aria-hidden
            className="arc-border opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100"
          />
          <Plus className="size-3.5 shrink-0" weight="bold" />
          <span>New Record</span>
        </motion.button>

        {/* Theme Switcher Toggle with Motion & Hermes Arc Border */}
        <motion.button
          type="button"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          whileHover={{ y: -1 }}
          whileTap={{ y: 0 }}
          transition={{ duration: 0.12 }}
          className="group relative inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-none border border-border bg-card text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-foreground"
          aria-label="Toggle theme"
          title="Toggle light/dark theme"
        >
          <span
            aria-hidden
            className="arc-border opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100"
          />
          <AnimatePresence mode="wait">
            {resolvedTheme === "dark" ? (
              <motion.div
                key="sun"
                initial={{ rotate: -45, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 45, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-center"
              >
                <Sun className="size-3.5" weight="bold" />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ rotate: 45, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -45, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-center"
              >
                <Moon className="size-3.5" weight="bold" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </header>
  )
}
