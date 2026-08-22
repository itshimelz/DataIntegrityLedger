"use client"

import React from "react"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { LedgerProvider } from "@/hooks/use-ledger"
import { CryptoModal } from "@/components/records/crypto-modal"
import { AddGradeModal } from "@/components/records/add-grade-modal"
import { TamperModal } from "@/components/records/tamper-modal"

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <LedgerProvider>
      <div className="flex min-h-screen bg-[#faf9f5] dark:bg-[#0c0f12]">
        {/* Fixed Left Sidebar */}
        <Sidebar className="fixed inset-y-0 left-0 z-40 hidden md:flex" />

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col md:pl-72">
          <Topbar />
          <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-6 md:p-8">
            {children}
          </main>
        </div>

        {/* Global Inspection and Action Modals */}
        <CryptoModal />
        <AddGradeModal />
        <TamperModal />
      </div>
    </LedgerProvider>
  )
}
