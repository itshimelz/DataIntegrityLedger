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
import { useAuth } from "@/hooks/use-auth"

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
  const { user, profile } = useAuth()
  const {
    verificationReport,
    setIsAddModalOpen,
    records,
  } = useLedger()

  const displayName = profile?.name || (user?.user_metadata?.full_name as string) || user?.email || "Faculty Signer"
  const displayEmail = profile?.email || user?.email || ""
  const displayRole = profile?.role || "FACULTY"

  // Breadcrumb mapping
  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Overview & Chain Health"
    if (pathname.startsWith("/records")) return "Grade Ledger Records"
    if (pathname.startsWith("/verify")) return "Cryptographic Verification"
    return "Portal"
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 w-full max-w-full items-center justify-between gap-2 overflow-hidden border-b border-border bg-card/90 px-3 backdrop-blur-md sm:px-4 md:px-6">
      {/* Left: Sidebar Toggle, Breadcrumbs and Page Identity */}
      <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden text-xs sm:gap-2.5">
        <SidebarTrigger className="-ml-1 shrink-0 text-foreground hover:bg-muted" />
        <span className="hidden shrink-0 text-xs font-semibold tracking-tight text-muted-foreground lg:inline">
          Data Integrity Ledger
        </span>
        <CaretRight className="hidden size-3 shrink-0 text-muted-foreground lg:block" />
        <span className="min-w-0 truncate text-xs font-semibold tracking-tight text-foreground">
          {getPageTitle()}
        </span>
      </div>

      {/* Right: Status Beacon, Signer Pill, Action Button, Theme Switcher - All Unified h-8 */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
        {/* Real-time Ledger Health Beacon — never claims health before an audit exists */}
        <div className="hidden h-8 items-center gap-2 rounded-md border border-border bg-card/80 px-3 text-xs md:inline-flex">
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
                className="group relative hidden h-8 cursor-pointer items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-3 text-[11px] font-medium text-primary transition-all hover:border-primary/60 hover:bg-primary/20 lg:inline-flex"
              />
            }
          >
            <span
              aria-hidden
              className="arc-border opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100"
            />
            <Key className="size-3.5 shrink-0 text-primary" weight="bold" />
            <span className="truncate">
              Signer: {displayName}
            </span>
          </PopoverTrigger>
          <PopoverContent
            side="bottom"
            align="end"
            className="w-80 rounded-md border border-border bg-card p-4"
          >
            <PopoverHeader>
              <PopoverTitle className="text-xs font-semibold tracking-tight text-foreground">
                Active Signing Authority
              </PopoverTitle>
              <PopoverDescription className="text-xs text-muted-foreground">
                Live RSA-2048 signing session for {displayName}
              </PopoverDescription>
            </PopoverHeader>
            <div className="mt-3 space-y-2 text-xs">
              <div>
                <span className="block text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                  Authenticated User
                </span>
                <span className="font-medium text-foreground">
                  {displayName}
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                  Email & Authority
                </span>
                <span className="font-mono text-xs text-foreground">
                  {displayEmail} ({displayRole})
                </span>
              </div>
              <div>
                <span className="block text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                  Authentication Status
                </span>
                <span className="text-foreground">
                  Verified Supabase Live Session
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
          className="group relative inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-md border border-primary bg-primary px-2.5 text-[11px] font-medium text-primary-foreground transition-all hover:bg-primary/90 sm:px-3.5"
        >
          <span
            aria-hidden
            className="arc-border opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100"
          />
          <Plus className="size-3.5 shrink-0" weight="bold" />
          <span className="hidden sm:inline">New Record</span>
        </motion.button>

        {/* Theme Switcher Toggle with Motion & Hermes Arc Border */}
        <motion.button
          type="button"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          whileHover={{ y: -1 }}
          whileTap={{ y: 0 }}
          transition={{ duration: 0.12 }}
          className="group relative inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-foreground"
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
