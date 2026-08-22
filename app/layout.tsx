import type { Metadata } from "next"
import { Geist, Geist_Mono, Newsreader } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontSerif = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  style: ["normal", "italic"],
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Academic Integrity Ledger | Tamper-Evident Grade Ledger",
  description:
    "Tamper-evident academic grade management system with SHA-256 hash chaining and RSA-2048 digital signatures.",
}

import { TooltipProvider } from "@/components/ui/tooltip"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontSans.variable,
        fontSerif.variable,
        fontMono.variable
      )}
    >
      <body className="min-h-screen bg-[#faf9f5] font-sans text-stone-900 antialiased dark:bg-[#0c0f12] dark:text-stone-100">
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
