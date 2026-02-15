"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/app/components/ui/field";
import { Input } from "@/app/components/ui/input";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const MAX_ATTEMPT = 5;

export function VerificationForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptLeft, setAttemptLeft] = useState(MAX_ATTEMPT);
  const [timeLeft, setTimeLeft] = useState(0);

  /* ===============================
     GET EMAIL
  =============================== */
  useEffect(() => {
    const storedEmail = sessionStorage.getItem("login_email");
    if (!storedEmail) {
      router.push("/log-in");
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  /* ===============================
     COUNTDOWN BASED ON EXPIRED_AT
  =============================== */
  useEffect(() => {
    const interval = setInterval(() => {
      const expiredAt = localStorage.getItem("otp_expired_at");

      if (!expiredAt) {
        setTimeLeft(0);
        return;
      }

      const now = new Date().getTime();
      const expiry = new Date(expiredAt).getTime();
      const diff = Math.floor((expiry - now) / 1000);

      if (diff <= 0) {
        setTimeLeft(0);
      } else {
        setTimeLeft(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const forceResendRequired = attemptLeft <= 0 || timeLeft <= 0;

  /* ===============================
     VERIFY OTP
  =============================== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (forceResendRequired) {
      setError("OTP tidak valid. Silakan kirim ulang.");
      return;
    }

    if (otp.length !== 6) {
      setError("Kode OTP harus 6 digit.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/proxy/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      console.log(data);
      if (!res.ok) {
        setAttemptLeft(data?.data?.attempt_left ?? 0);
        setError(
          `OTP salah. Sisa percobaan: ${data?.data?.attempt_left ?? 0}`
        );
        return;
      }

      // SUCCESS
      localStorage.removeItem("otp_expired_at");
      // sessionStorage.removeItem("login_email");

      router.push("/log-in/password");
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  /* ===============================
     RESEND OTP
  =============================== */
  const handleResend = async () => {
    if (!forceResendRequired) return;

    setResendLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/proxy/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError("Gagal mengirim ulang OTP.");
        return;
      }

      // SAVE NEW EXPIRED TIME FROM BACKEND
      localStorage.setItem(
        "otp_expired_at",
        data.data.otp_expired_at
      );

      setAttemptLeft(MAX_ATTEMPT);
      setOtp("");
    } catch {
      setError("Terjadi kesalahan saat resend.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-8", className)}
      {...props}
    >
      <FieldGroup>

        {/* HEADER */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">
            Verifikasi Email
          </h1>
          <p className="text-sm text-muted-foreground">
            Masukkan kode OTP yang dikirim ke email kamu
          </p>
        </div>

        {/* EMAIL */}
        <Field>
          <FieldLabel>Email</FieldLabel>
          <Input
            value={email}
            readOnly
            className="h-12 rounded-full px-6 text-base bg-muted/40 border-0 shadow-sm"
          />
        </Field>

        {/* OTP */}
        <Field>
          <FieldLabel>Kode OTP</FieldLabel>
          <Input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Masukkan 6 digit"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, ""))
            }
            disabled={forceResendRequired}
            className="h-12 rounded-full px-6 text-base text-center tracking-widest shadow-sm"
          />

          <div className="text-center text-xs mt-2">
            {timeLeft > 0 ? (
              <span className="text-muted-foreground">
                OTP aktif selama{" "}
                <span className="font-medium">{formatTime()}</span>
              </span>
            ) : (
              <span className="text-red-500 font-medium">
               
              </span>
            )}
          </div>
        </Field>

        {/* ERROR */}
        {error && (
          <p className="text-sm text-red-500 text-center -mt-4">
            {error}
          </p>
        )}

        {/* VERIFY */}
        <Field>
          <Button
            type="submit"
            disabled={loading || forceResendRequired}
            className="h-12 rounded-full"
          >
            {loading ? "Memverifikasi..." : "Verifikasi"}
          </Button>
        </Field>

        {/* RESEND */}
        <div className="text-center text-sm">
          <button
            type="button"
            onClick={handleResend}
            disabled={!forceResendRequired || resendLoading}
            className={cn(
              "cursor-pointer font-medium transition",
              forceResendRequired
                ? "text-primary hover:underline"
                : "text-muted-foreground cursor-not-allowed"
            )}
          >
            {resendLoading
              ? "Mengirim..."
              : "Kirim Ulang OTP"}
          </button>
        </div>

      </FieldGroup>
    </form>
  );
}
