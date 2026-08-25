// Next 16 proxy (formerly middleware): refreshes Supabase sessions and guards protected routes
import { updateSession } from "@/lib/supabase/middleware"

import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const proxy = middleware

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets and image optimizations.
     * API routes are NOT matched here — they enforce auth themselves (FR-02).
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
