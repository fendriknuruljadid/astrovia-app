"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/app/components/ui/field";
import { Input } from "@/app/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export function CreatePasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("login_email");
    if (!storedEmail) {
      router.push("/log-in");
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  // simple strength scoring
  const strength = useMemo(() => {
    let score = 1;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const strengthColor = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
  ][strength - 1] || "bg-gray-200";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (strength < 2) {
      setError("Gunakan password yang lebih kuat.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/proxy/auth/create-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      setError("Gagal membuat password");
      setLoading(false);
      return;
    }
    const data = await res.json();
    localStorage.setItem("otp_expired_at", data.data.otp_expired_at)
    router.push("/log-in/verification");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-10", className)}
      {...props}
    >
      <FieldGroup>

        {/* HEADER */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Buat Password
          </h1>
          <p className="text-sm text-muted-foreground">
            Gunakan password yang aman untuk akun kamu
          </p>
        </div>

        <Field>
            <FieldLabel>Email</FieldLabel>

            <div className="relative">
                <Input
                value={email}
                readOnly
                className="h-12 rounded-full px-6 pr-28 text-base bg-muted/40 border-0 shadow-sm"
                />

                {/* EDIT BUTTON */}
                <button
                type="button"
                onClick={() => router.push("/")}
                className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 
                            h-10 px-4 rounded-full 
                            text-sm font-medium
                            bg-background border shadow-sm
                            hover:bg-muted transition"
                >
                Edit
                </button>
            </div>
        </Field>

        {/* PASSWORD INPUT */}
        <Field>
          <FieldLabel>Password</FieldLabel>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-full px-6 pr-14 text-base shadow-sm focus-visible:ring-2 focus-visible:ring-primary"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Strength Bar */}
          <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-300",
                strengthColor
              )}
              style={{ width: `${strength * 25}%` }}
            />
          </div>
        </Field>

        {error && (
          <p className="text-sm text-red-500 text-center -mt-4">
            {error}
          </p>
        )}

        {/* BUTTON */}
        <Field>
          <Button
            type="submit"
            disabled={loading}
            className="cursor-pointer h-12 rounded-full text-base font-medium shadow-md hover:shadow-lg transition"
          >
            {loading ? "Menyimpan..." : "Lanjutkan"}
          </Button>
        </Field>

      </FieldGroup>
    </form>
  );
}
