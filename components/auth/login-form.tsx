"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { CircleNotch } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

// shadcn login-01 block wired to Supabase email/password auth (FR-01)
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = searchParams.get("next") || "/dashboard"

  const [mode, setMode] = React.useState<"login" | "signup">("login")
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [notice, setNotice] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    setIsSubmitting(true)

    const supabase = createClient()

    if (mode === "signup") {
      if (name.trim().length < 2) {
        setIsSubmitting(false)
        setError("Please enter your full name (min 2 characters).")
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name.trim() } },
      })
      if (error) {
        setIsSubmitting(false)
        // Duplicate account: Supabase rejects re-registration with 422
        if (/already registered|already exists|has been taken/i.test(error.message)) {
          setError(
            "An account with this email already exists. Log in instead — we've switched the form for you."
          )
          setMode("login")
        } else {
          setError(error.message)
        }
        return
      }
      if (!data.session) {
        setIsSubmitting(false)
        setNotice(
          "Account created but email confirmation is still enabled. Disable it: Supabase Dashboard → Authentication → Sign In / Providers → turn off \"Confirm email\". Then log in."
        )
        return
      }

      // Provision the faculty signing identity, then straight to the portal
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      })
      const reg = await res.json()
      setIsSubmitting(false)
      if (!res.ok || !reg.success) {
        setError(reg.error || "Account created but faculty provisioning failed.")
        return
      }
      router.replace(nextPath)
      router.refresh()
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setIsSubmitting(false)
    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Invalid email or password."
          : error.message
      )
      return
    }
    router.replace(nextPath)
    router.refresh()
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === "login" ? "Login to the registrar portal" : "Create a faculty account"}
          </CardTitle>
          <CardDescription>
            {mode === "login"
              ? "Authenticate to issue and correct signed grade records"
              : "Register with your faculty email to access the ledger"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {error && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                  {error}
                </div>
              )}
              {notice && (
                <div className="rounded-md border border-primary/40 bg-primary/10 p-3 text-xs text-primary">
                  {notice}
                </div>
              )}
              {mode === "signup" && (
                <Field>
                  <FieldLabel htmlFor="name">Full name</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Dr. Ayesha Rahman"
                    required
                    minLength={2}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                  <FieldDescription>
                    Your RSA-2048 signing identity is provisioned automatically
                    from this name.
                  </FieldDescription>
                </Field>
              )}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="faculty@university.edu"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </Field>
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <CircleNotch className="size-4 animate-spin" />}
                  {mode === "login" ? "Login" : "Sign up"}
                </Button>
                <FieldDescription className="text-center">
                  {mode === "login" ? (
                    <>
                      Don&apos;t have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setMode("signup")
                          setError(null)
                          setNotice(null)
                        }}
                        className="cursor-pointer underline underline-offset-4 hover:text-foreground"
                      >
                        Sign up
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setMode("login")
                          setError(null)
                          setNotice(null)
                        }}
                        className="cursor-pointer underline underline-offset-4 hover:text-foreground"
                      >
                        Login
                      </button>
                    </>
                  )}
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <p className="text-center text-xs text-muted-foreground">
        <Link href="/" className="underline-offset-4 hover:underline">
          ← Back to the landing page
        </Link>
      </p>
    </div>
  )
}
