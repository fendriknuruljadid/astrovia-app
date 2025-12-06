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

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
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
        {/* <FieldSeparator>OR</FieldSeparator>
        
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" placeholder="Alamat email" required />
        </Field> */}
        <Field>
          <Button type="button" onClick={() => signIn("google", { callbackUrl: "/dashboard" })} className="cursor-pointer dark:text-white">Lanjutkan</Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
