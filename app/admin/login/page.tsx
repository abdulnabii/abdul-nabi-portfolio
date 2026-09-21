"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<"password" | "otp">("otp");

  // Common email state
  const [email, setEmail] = useState("");

  // Password mode states
  const [password, setPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // OTP mode states
  const [otpCode, setOtpCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [otpMsg, setOtpMsg] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Handle password login
  async function onPasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Login failed");
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setPasswordLoading(false);
    }
  }

  // Handle request OTP
  async function handleRequestOtp() {
    if (!email.trim()) {
      setOtpError("Please enter your administrator email address first.");
      return;
    }

    setSendingCode(true);
    setOtpError(null);
    setOtpMsg(null);

    try {
      const res = await fetch("/api/auth/admin-otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to dispatch security code.");
      }

      setCodeSent(true);
      setCooldown(60);
      setOtpMsg(
        data.message ||
          "Security OTP code dispatched to your email! Please check your inbox."
      );
    } catch (err) {
      setOtpError(
        err instanceof Error ? err.message : "Failed to dispatch security code."
      );
    } finally {
      setSendingCode(false);
    }
  }

  // Handle verify OTP
  async function handleVerifyOtp(e: FormEvent) {
    e.preventDefault();
    const cleanCode = otpCode.trim();

    if (!cleanCode || cleanCode.length !== 6) {
      setOtpError("Please enter the complete 6-digit code received on your email.");
      return;
    }

    setVerifyingOtp(true);
    setOtpError(null);

    try {
      const res = await fetch("/api/auth/admin-otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: cleanCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed.");
      }

      setOtpMsg("Verified! Redirecting to Admin Operations Dashboard...");
      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 600);
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setVerifyingOtp(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#050814] px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-ambient" />
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent-soft/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.06] p-7 sm:p-9 shadow-glass-lg backdrop-blur-2xl">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-soft">
            Admin Console
          </p>
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            2FA Protected
          </span>
        </div>

        <h1 className="mt-2 text-2xl font-bold text-white tracking-tight">
          Sign in
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          Authenticate with password or security OTP to access portfolio management.
        </p>

        {/* Method Selector Tabs */}
        <div className="mt-6 flex rounded-2xl bg-black/40 p-1 border border-white/10">
          <button
            type="button"
            onClick={() => {
              setAuthMethod("otp");
              setPasswordError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              authMethod === "otp"
                ? "bg-accent text-white shadow-md shadow-accent/20 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Security OTP
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod("password");
              setOtpError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              authMethod === "password"
                ? "bg-accent text-white shadow-md shadow-accent/20 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Admin Password
          </button>
        </div>

        {/* OTP AUTHENTICATION */}
        {authMethod === "otp" && (
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Admin Email Address
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="abdulnabi.khaskhely@gmail.com"
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={sendingCode || cooldown > 0 || !email.trim()}
                  className="px-3.5 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-md shadow-accent/20"
                >
                  {sendingCode ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <KeyRound className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {cooldown > 0 ? `${cooldown}s` : codeSent ? "Resend" : "Get Code"}
                  </span>
                </button>
              </div>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4 pt-1">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                    6-Digit Security OTP Code
                  </label>
                  {codeSent && (
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Code Sent
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) =>
                    setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="• • • • • •"
                  className="w-full bg-black/40 border border-white/15 rounded-xl py-3 px-3 text-center font-mono text-2xl font-extrabold tracking-[0.4em] text-cyan-400 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                />
              </div>

              {otpError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{otpError}</span>
                </div>
              )}

              {otpMsg && !otpError && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{otpMsg}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={verifyingOtp || otpCode.length !== 6}
              >
                {verifyingOtp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span>Verifying OTP Code…</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    <span>Sign In via 6-Digit OTP</span>
                  </>
                )}
              </Button>
            </form>
          </div>
        )}

        {/* PASSWORD AUTHENTICATION */}
        {authMethod === "password" && (
          <form onSubmit={onPasswordSubmit} className="mt-6 space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@email.com"
            />
            <Input
              label="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            {passwordError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{passwordError}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={passwordLoading}
            >
              {passwordLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  <span>Sign in with Password</span>
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
