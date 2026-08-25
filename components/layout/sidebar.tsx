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
  SignOut,
} from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { useLedger } from "@/hooks/use-ledger"
import { useAuth } from "@/hooks/use-auth"
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
    href: "/dashboard",
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

export function AppSidebar({
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()
  const {
    records,
    verificationReport,
  } = useLedger()
  const isChainTampered = verificationReport?.status === "FLAGGED"

  const displayName = profile?.name || (user?.user_metadata?.full_name as string) || user?.email || "Faculty User"
  const displayEmail = profile?.email || user?.email || ""
  const displayRole = profile?.role || "FACULTY"

  const initials = displayName
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
        "border-r border-sidebar-border bg-sidebar text-sidebar-foreground select-none",
        className
      )}
      {...props}
    >
      {/* Header: Brand & Collapse/Expand Trigger — h-14 to align with Topbar */}
      <SidebarHeader className="flex h-14 shrink-0 items-center border-b border-sidebar-border px-2 group-data-[collapsible=icon]:px-2">
        <div className="flex w-full items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center">
          <Link
            href="/dashboard"
            className="flex min-w-0 items-center gap-2.5 overflow-hidden group-data-[collapsible=icon]:hidden"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-sidebar-accent text-primary">
              <Scales className="size-4" weight="bold" />
            </div>
            <div className="min-w-0 truncate">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
                  Data Integrity Ledger
                </span>
                <span className="rounded-md border border-primary/30 bg-primary/20 px-1 font-mono text-[11px] font-semibold text-primary">
                  v1.0
                </span>
              </div>
              <p className="truncate text-[11px] font-medium tracking-wide text-primary/80">
                Academic Ledger
              </p>
            </div>
          </Link>
          <SidebarTrigger className="h-8 w-8 shrink-0 rounded-md border border-sidebar-border bg-sidebar-accent text-muted-foreground hover:border-primary/40 hover:bg-sidebar-accent hover:text-primary" />
        </div>
      </SidebarHeader>

      <SidebarContent className="space-y-1 p-0 group-data-[collapsible=icon]:p-0">
        {/* Navigation Portals Group */}
        <SidebarGroup className="p-2 group-data-[collapsible=icon]:p-2">
          <SidebarGroupLabel className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase group-data-[collapsible=icon]:hidden">
            Ledger Portals
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href)
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "rounded-md text-xs font-medium transition-colors",
                        isActive
                          ? "border border-primary/40 bg-primary/10 font-semibold text-primary"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}
                        weight={isActive ? "fill" : "bold"}
                      />
                      <span className="text-xs font-medium tracking-normal group-data-[collapsible=icon]:hidden">
                        {item.label}
                      </span>
                    </SidebarMenuButton>

                    {item.href === "/records" && records.length > 0 && (
                      <SidebarMenuBadge className="rounded-md border border-primary/30 bg-sidebar-accent px-1 font-mono text-[11px] font-semibold text-primary group-data-[collapsible=icon]:hidden">
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
      <SidebarFooter className="space-y-1 border-t border-sidebar-border p-2 group-data-[collapsible=icon]:p-2">
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
                          <div className="font-semibold text-primary">
                            {displayName}
                          </div>
                          <div className="font-mono text-[11px] text-muted-foreground">
                            {displayEmail}
                          </div>
                          <div className="font-mono text-[11px] text-primary">
                            Authenticated Session
                          </div>
                          <div className="text-[11px] text-primary">
                            Click to view session credentials
                          </div>
                        </div>
                      ),
                      side: "right",
                      align: "center",
                    }}
                    className="h-10 rounded-md border border-sidebar-border bg-sidebar-accent px-2.5 py-1 text-sidebar-foreground transition-colors group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-0! hover:border-primary/40 hover:bg-sidebar-accent hover:text-sidebar-foreground data-[state=open]:border-primary/50 data-[state=open]:bg-sidebar-accent"
                  />
                }
              >
                <div className="flex size-6 shrink-0 items-center justify-center rounded-md border border-primary/30 bg-sidebar-accent font-mono text-[11px] font-bold text-primary">
                  {initials}
                </div>
                <div className="grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-xs font-semibold text-sidebar-foreground">
                      {displayName}
                    </span>
                    <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                  </div>
                  <span className="truncate font-mono text-[11px] text-muted-foreground">
                    {displayEmail}
                  </span>
                </div>
                <CaretUpDown className="ml-auto size-3.5 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
              </PopoverTrigger>

              <PopoverContent
                side="right"
                align="end"
                sideOffset={10}
                className="w-80 rounded-md border border-border bg-card p-4 shadow-xl"
              >
                <PopoverHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <PopoverTitle className="text-xs font-semibold tracking-tight text-foreground">
                      Session Signer Authority
                    </PopoverTitle>
                    <span className="rounded-md border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-primary">
                      AUTHENTICATED
                    </span>
                  </div>
                  <PopoverDescription className="text-xs text-muted-foreground">
                    Active cryptographic signing session
                  </PopoverDescription>
                </PopoverHeader>

                <div className="space-y-2.5 border-t border-border pt-3 text-xs">
                  <div>
                    <span className="block text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                      User Name
                    </span>
                    <span className="font-medium text-foreground">
                      {displayName}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                      Email & Role
                    </span>
                    <span className="font-mono text-xs text-foreground">
                      {displayEmail} ({displayRole})
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                      Identity Status
                    </span>
                    <span className="text-foreground">
                      Live Supabase Session
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                      RSA-2048 Signing Authority
                    </span>
                    <span className="font-mono text-[11px] break-all text-primary">
                      {profile?.public_key ? "Keypair Provisioned & Active" : "Session Active"}
                    </span>
                  </div>
                </div>

                {/* Terminate session */}
                <div className="mt-3 border-t border-border pt-3">
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <SignOut className="size-3.5" weight="bold" />
                    Sign out
                  </button>
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
