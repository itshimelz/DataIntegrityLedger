import React from "react"
import { Shell } from "@/components/layout/shell"
import { VerificationPanel } from "@/components/verification/verification-panel"

export default function VerifyPage() {
  return (
    <Shell>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="font-heading text-xl font-bold tracking-wider uppercase text-foreground md:text-2xl">
            Cryptographic Integrity Verification
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Automated cryptographic audit engine validating SHA-256 hash continuity and RSA-2048 faculty digital signatures.
          </p>
        </div>

        {/* Verification Panel */}
        <VerificationPanel />
      </div>
    </Shell>
  )
}
