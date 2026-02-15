"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/app/components/ui/field";
import { Input } from "@/app/components/ui/input";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import {Turnstile} from "@marsidev/react-turnstile";
import { useRef } from "react";

export function PasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cfToken, setCfToken] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const turnstileRef = useRef<any>(null);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("login_email");
    if (!storedEmail) {
      router.push("/log-in");
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!cfToken) {
      setError("Silakan verifikasi captcha terlebih dahulu.");
      return;
    }

    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      cfToken,
      redirect: false,
    });

    // console.log(res)
    if (!res || res.error) {
      setError("Email atau password salah");
      setLoading(false);
      setCfToken(null);
      turnstileRef.current?.reset();
    
      return;
    }
    sessionStorage.removeItem("login_email");
    router.push("/dashboard");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-10", className)}
      {...props}
    >
      <FieldGroup>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Masuk ke Akun
          </h1>
          <p className="text-sm text-muted-foreground">
            Gunakan email dan password kamu
          </p>
        </div>

        <Field>
          <FieldLabel>Email</FieldLabel>
          <Input
            value={email}
            readOnly
            className="h-12 rounded-full px-6 text-base bg-muted/40 border-0 shadow-sm"
          />
        </Field>

        <Field>
          <FieldLabel>Password</FieldLabel>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-full px-6 pr-14 text-base shadow-sm"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </Field>

        <Field>
          <Turnstile
            ref={turnstileRef}
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            onSuccess={(token) => setCfToken(token)}
            onExpire={() => setCfToken(null)}
          />

        </Field>

        {error && (
          <p className="text-sm text-red-500 text-center">
            {error}
          </p>
        )}

        <Field>
          <Button
            type="submit"
            disabled={loading}
            className="cursor-pointer h-12 rounded-full"
          >
            {loading ? "Memproses..." : "Masuk"}
          </Button>
        </Field>

      </FieldGroup>
    </form>
  );
}
