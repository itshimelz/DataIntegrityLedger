"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SquaresFour,
  Table,
  Fingerprint,
  Scales,
  CaretUpDown,
  Check,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { useLedger } from "@/hooks/use-ledger"
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription,
} from "@/components/ui/popover"

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/",
    icon: SquaresFour,
  },
  {
    label: "Grade Records",
    href: "/records",
    icon: Table,
  },
  {
    label: "Integrity Verification",
    href: "/verify",
    icon: Fingerprint,
  },
]

const TEACHER_COURSES: Record<string, string> = {
  "fac-mamun-001": "CSE 323 (OS)",
  "fac-sharifur-002": "CSE 315 (DBMS)",
  "fac-mahbubur-003": "CSE 208 (DSA)",
}

export function AppSidebar({
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const {
    records,
    verificationReport,
    faculty,
    activeSignerId,
    setActiveSignerId,
  } = useLedger()
  const isChainTampered = verificationReport?.status === "FLAGGED"

  const activeFaculty =
    faculty.find((f) => f.id === activeSignerId) || faculty[0]
  const initials = (activeFaculty?.name || "SM")
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <Sidebar
      collapsible="icon"
      className={cn(
        "border-r border-[#143826] bg-[#061a12] text-stone-200 select-none",
        className
      )}
      {...props}
    >
      {/* Header: Brand & Collapse/Expand Trigger */}
      <SidebarHeader className="border-b border-[#143826] p-2 group-data-[collapsible=icon]:p-2">
        <div className="flex h-8 items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2.5 overflow-hidden group-data-[collapsible=icon]:hidden"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-none border border-emerald-500/30 bg-[#0e3b23] text-emerald-400">
              <Scales className="size-4" weight="bold" />
            </div>
            <div className="min-w-0 truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-sm font-bold tracking-tight text-white">
                  AILedger
                </span>
                <span className="rounded-none border border-emerald-500/30 bg-emerald-500/20 px-1 font-mono text-[11px] font-semibold text-emerald-300">
                  v1.0
                </span>
              </div>
              <p className="truncate font-heading text-[11px] font-medium tracking-widest text-emerald-400/70 uppercase">
                Academic Ledger
              </p>
            </div>
          </Link>
          <SidebarTrigger className="h-8 w-8 shrink-0 rounded-none border border-[#143826] bg-[#0a2618] text-stone-400 hover:border-emerald-500/40 hover:bg-[#0e3b23] hover:text-emerald-300" />
        </div>
      </SidebarHeader>

      <SidebarContent className="space-y-1 p-0 group-data-[collapsible=icon]:p-0">
        {/* Navigation Portals Group */}
        <SidebarGroup className="p-2 group-data-[collapsible=icon]:p-2">
          <SidebarGroupLabel className="font-heading text-[11px] font-semibold tracking-widest text-emerald-500/60 uppercase group-data-[collapsible=icon]:hidden">
            Ledger Portals
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href)
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "rounded-none text-xs font-medium transition-colors",
                        isActive
                          ? "border border-emerald-500/40 bg-[#0e3b23] font-semibold text-emerald-300"
                          : "text-stone-300 hover:bg-[#0a2618] hover:text-white"
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          isActive ? "text-emerald-400" : "text-stone-400"
                        )}
                        weight={isActive ? "fill" : "bold"}
                      />
                      <span className="font-heading text-xs tracking-wider uppercase group-data-[collapsible=icon]:hidden">
                        {item.label}
                      </span>
                    </SidebarMenuButton>

                    {item.href === "/records" && records.length > 0 && (
                      <SidebarMenuBadge className="rounded-none border border-emerald-500/30 bg-[#143826] px-1 font-mono text-[11px] font-semibold text-emerald-400 group-data-[collapsible=icon]:hidden">
                        {records.length}
                      </SidebarMenuBadge>
                    )}

                    {item.href === "/verify" && isChainTampered && (
                      <SidebarMenuBadge className="size-2 rounded-full bg-rose-500 p-0 group-data-[collapsible=icon]:hidden">
                        <span className="sr-only">
                          Integrity alerts pending
                        </span>
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer: Logged-in Teacher Profile with Popover & Reset Demo State */}
      <SidebarFooter className="space-y-1 border-t border-[#143826] p-2 group-data-[collapsible=icon]:p-2">
        <SidebarMenu className="gap-1">
          {/* Current Session Faculty User */}
          <SidebarMenuItem>
            <Popover>
              <PopoverTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    tooltip={{
                      children: (
                        <div className="space-y-1 text-left text-xs">
                          <div className="font-semibold text-emerald-300">
                            {activeFaculty?.name}
                          </div>
                          <div className="font-mono text-[11px] text-muted-foreground">
                            {activeFaculty?.email}
                          </div>
                          <div className="font-mono text-[11px] text-primary">
                            RSA-2048: {activeFaculty?.id}
                          </div>
                          <div className="text-[11px] text-emerald-400">
                            Click to view session credentials
                          </div>
                        </div>
                      ),
                      side: "right",
                      align: "center",
                    }}
                    className="h-10 rounded-none border border-[#143826] bg-[#0a2618] px-2.5 py-1 text-stone-200 transition-colors group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-0! hover:border-emerald-500/40 hover:bg-[#0e3b23] hover:text-white data-[state=open]:border-emerald-500/50 data-[state=open]:bg-[#0e3b23]"
                  />
                }
              >
                <div className="flex size-6 shrink-0 items-center justify-center rounded-none border border-emerald-500/30 bg-[#143826] font-mono text-[11px] font-bold text-emerald-300">
                  {initials}
                </div>
                <div className="grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-xs font-semibold text-white">
                      {activeFaculty?.name}
                    </span>
                    <span className="size-1.5 shrink-0 rounded-full bg-emerald-400" />
                  </div>
                  <span className="truncate font-mono text-[11px] text-stone-400">
                    {TEACHER_COURSES[activeFaculty?.id] || activeFaculty?.id}
                  </span>
                </div>
                <CaretUpDown className="ml-auto size-3.5 shrink-0 text-stone-400 group-data-[collapsible=icon]:hidden" />
              </PopoverTrigger>

              <PopoverContent
                side="right"
                align="end"
                sideOffset={10}
                className="w-80 rounded-none border border-border bg-card p-4 shadow-xl"
              >
                <PopoverHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <PopoverTitle className="font-heading text-xs tracking-wider text-foreground uppercase">
                      Session Signer Authority
                    </PopoverTitle>
                    <span className="rounded-none border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-emerald-400">
                      ACTIVE
                    </span>
                  </div>
                  <PopoverDescription className="text-xs text-muted-foreground">
                    Logged-in faculty cryptographic signing session
                  </PopoverDescription>
                </PopoverHeader>

                <div className="space-y-2.5 border-t border-border pt-3 text-xs">
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
                      Email & Role
                    </span>
                    <span className="font-mono text-xs text-foreground">
                      {activeFaculty?.email} (FACULTY)
                    </span>
                  </div>
                  <div>
                    <span className="block font-heading text-[11px] tracking-wider text-muted-foreground uppercase">
                      Assigned Course & Dept.
                    </span>
                    <span className="text-foreground">
                      {TEACHER_COURSES[activeFaculty?.id] || "CSE"} • Computer
                      Science & Eng.
                    </span>
                  </div>
                  <div>
                    <span className="block font-heading text-[11px] tracking-wider text-muted-foreground uppercase">
                      RSA-2048 Signing Key
                    </span>
                    <span className="font-mono text-[11px] break-all text-primary">
                      SHA256withRSA: {activeFaculty?.id}
                    </span>
                  </div>
                </div>

                {/* Quick Authority Switcher */}
                <div className="mt-3 border-t border-border pt-3">
                  <span className="block pb-1.5 font-heading text-[11px] tracking-wider text-muted-foreground uppercase">
                    Switch Session Authority (Demo)
                  </span>
                  <div className="space-y-1">
                    {faculty.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setActiveSignerId(f.id)}
                        className={cn(
                          "flex w-full cursor-pointer items-center justify-between rounded-none px-2 py-1.5 text-xs transition-colors",
                          f.id === activeSignerId
                            ? "bg-primary/10 font-semibold text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold">
                            {f.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                          <span>{f.name}</span>
                        </div>
                        {f.id === activeSignerId && (
                          <Check
                            className="size-3.5 text-primary"
                            weight="bold"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

export { AppSidebar as Sidebar }
