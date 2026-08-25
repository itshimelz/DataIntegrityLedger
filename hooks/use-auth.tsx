"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/supabase/database.types"

export type UserProfile = Database["public"]["Tables"]["users"]["Row"]

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const fetchProfile = useCallback(
    async (
      userId: string,
      userEmail?: string,
      userName?: string,
      facultyId?: string
    ) => {
      try {
        const supabase = createClient()

        // 1. Try finding by faculty_id if present in metadata (e.g. fac-mamun-001)
        if (facultyId) {
          const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", facultyId)
            .maybeSingle()

          if (data && !error) {
            setProfile(data)
            return
          }
        }

        // 2. Try finding by email
        if (userEmail) {
          const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", userEmail)
            .maybeSingle()

          if (data && !error) {
            setProfile(data)
            return
          }
        }

        // 3. Try finding by userId (for backwards compatibility if id was userId)
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .maybeSingle()

        if (data && !error) {
          setProfile(data)
        } else {
          // Fallback minimal profile until provisioned
          setProfile({
            id: facultyId || userId,
            email: userEmail || "",
            name:
              userName || (userEmail ? userEmail.split("@")[0] : "Faculty User"),
            role: "FACULTY",
            public_key: "",
            password_hash: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }
      } catch (err) {
        console.error("Failed to load user profile:", err)
      }
    },
    []
  )

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(
        user.id,
        user.email,
        (user.user_metadata?.full_name as string) ||
          (user.user_metadata?.name as string),
        user.user_metadata?.faculty_id as string | undefined
      )
    }
  }, [user, fetchProfile])

  useEffect(() => {
    const supabase = createClient()

    // 1. Fetch current session & user on mount
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        fetchProfile(
          user.id,
          user.email,
          (user.user_metadata?.full_name as string) ||
            (user.user_metadata?.name as string),
          user.user_metadata?.faculty_id as string | undefined
        ).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    // 2. Listen to live auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        await fetchProfile(
          currentUser.id,
          currentUser.email,
          (currentUser.user_metadata?.full_name as string) ||
            (currentUser.user_metadata?.name as string),
          currentUser.user_metadata?.faculty_id as string | undefined
        )
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const signOut = useCallback(async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      window.location.href = "/login"
    } catch (err) {
      console.error("Sign out error:", err)
      window.location.href = "/login"
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
