"use client";

import { cn } from "@/lib/utils"
import { Button } from "@/app/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/app/components/ui/field"
import { Input } from "@/app/components/ui/input"
import Image from "next/image"
import { signIn, signOut, useSession } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {

  const router = useRouter()

  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. Jika gmail → Google OAuth
      if (email.toLowerCase().endsWith("@gmail.com")) {
        await signIn("google", {
          callbackUrl: "/dashboard",
          login_hint: email,
        })
        return
      }

      // 2. Selain gmail → cek ke backend
      const res = await fetch("/api/proxy/auth/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        throw new Error("Gagal cek email")
      }

      const data = await res.json()

      // 3. Routing berdasarkan exist
      sessionStorage.setItem("login_email", email)
      // console.log(data);
      if (data.data.has_password && data.data.is_verified) {
        router.push(`/log-in/password`)
      } else if(data.data.has_password && !data.data.is_verified){
        localStorage.setItem("otp_expired_at", data.data.otp_expired_at)
        router.push("/log-in/verification");
      }else {
        router.push(`/log-in/create-password`)
      }
    } catch (err) {
      setError("Terjadi kesalahan, coba lagi")
    } finally {
      setLoading(false)
    }
  }


  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Masuk ke Astrovia AI</h1>
          <p className="text-muted-foreground text-sm text-balance">
           Masukkan email anda untuk melanjutkan
          </p>
        </div>
              <Field>
                <Button onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className="cursor-pointer" variant="outline" type="button">
                  <Image
                    src="/google.svg"
                    alt="Microsoft"
                    width={20}
                    height={20}
                    priority
                  />
                  Lanjutkan dengan Google
                </Button>
                {/* <Button onClick={() => signIn("azure-ad", { callbackUrl: "/dashboard" })} variant="outline" type="button">
                  <Image
                    src="/microsoft.svg"
                    alt="Microsoft"
                    width={20}
                    height={20}
                    priority
                  />
                  Continue with Microsoft
                </Button> */}
              
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                      Atau
              </FieldSeparator>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <Button
                  onClick={handleSubmit}
                  type="submit"
                  disabled={loading || !isValidEmail}
                  className="cursor-pointer relative flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <span className="absolute inset-0 flex items-center justify-center">
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          ></path>
                        </svg>
                      </span>
                      <span className="opacity-0">Signing in...</span>
                    </>
                  ) : (
                    "Lanjutkan"
                  )}
                </Button>
              </Field>

             
       
      </FieldGroup>
    </form>
  )
}
