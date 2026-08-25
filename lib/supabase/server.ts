import { createServerClient } from "@supabase/ssr"
import type { User } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { Database } from "./database.types"

/**
 * If using Fluid compute: Don't put this client in a global variable. Always create a new client within each
 * function when using it.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * NFR-01: server-side session check for Route Handlers.
 * Returns the authenticated user or null — callers must 401 on null (FR-02).
 */
export async function getAuthenticatedUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export type LedgerRole = Database["public"]["Enums"]["role_enum"]

/**
 * FR-02: resolve the signed-in user's ledger role from the users table.
 * Mirrors the client profile lookup (faculty_id metadata → email → auth uuid)
 * but never fabricates a role — unprovisioned users resolve to null.
 */
export async function getUserRole(user: User): Promise<LedgerRole | null> {
  const supabase = await createClient()
  const facultyId = user.user_metadata?.faculty_id as string | undefined
  const lookups: Array<{ column: "id" | "email"; value?: string }> = [
    { column: "id", value: facultyId },
    { column: "email", value: user.email },
    { column: "id", value: user.id },
  ]
  for (const { column, value } of lookups) {
    if (!value) continue
    const { data } = await supabase
      .from("users")
      .select("role")
      .eq(column, value)
      .maybeSingle()
    if (data) return data.role
  }
  return null
}

/**
 * FR-02: server-side role-based authorization for Route Handlers.
 * Returns the authenticated user, or a ready-to-return 401/403 error response.
 */
export async function requireRole(
  allowed: LedgerRole[]
): Promise<{ user: User; error: null } | { user: null; error: NextResponse }> {
  const user = await getAuthenticatedUser()
  if (!user) {
    return {
      user: null,
      error: NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      ),
    }
  }
  const role = await getUserRole(user)
  if (!role || !allowed.includes(role)) {
    return {
      user: null,
      error: NextResponse.json(
        {
          success: false,
          error: `Forbidden — this action requires role: ${allowed.join(" or ")}`,
        },
        { status: 403 }
      ),
    }
  }
  return { user, error: null }
}
