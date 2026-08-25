import { Suspense } from "react"
import { LoginForm } from "@/components/auth/login-form"

export const metadata = {
  title: "Login — Data Integrity Ledger",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
