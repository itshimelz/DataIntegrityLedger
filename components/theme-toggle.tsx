"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "@phosphor-icons/react"

// ponytail: single public-pages toggle; portal Topbar keeps its own popover switcher
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className={
        className ??
        "inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-transparent text-foreground transition-colors hover:border-muted-foreground/40 hover:bg-accent focus-visible:outline-2"
      }
    >
      {mounted && resolvedTheme === "dark" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </button>
  )
}
