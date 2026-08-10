"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { safeCallbackUrl } from "@/lib/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get("callbackUrl"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const activated = searchParams.get("activated") === "1";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Email atau password salah.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {activated && (
        <div className="rounded-lg border border-[var(--up)]/30 bg-[var(--up)]/10 px-3 py-2 text-sm text-[var(--up)]">
          Akun berhasil diaktifkan. Silakan masuk.
        </div>
      )}
      <div>
        <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-[var(--text)]">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background-2)] px-3.5 py-2.5 text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
          placeholder="nama@email.com"
          autoComplete="email"
        />
      </div>
      <div>
        <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-[var(--text)]">
          Password
        </label>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background-2)] px-3.5 py-2.5 pr-9 text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[var(--text-muted)] hover:bg-[var(--card-hover)] transition-colors"
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8-4 8-11 8-11 8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {error && (
        <div className="rounded-lg border border-[var(--down)]/30 bg-[var(--down)]/10 px-3 py-2 text-sm text-[var(--down)]">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold ${
          loading 
            ? "cursor-not-allowed bg-[var(--brand-navy-muted)] text-white" 
            : "bg-gradient-to-r from-[#dec783] via-[#c9a961] to-[#b78e39] text-[var(--app-bg-dark)] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[var(--accent-soft)]"
        }`}
      >
        {loading ? "Memproses..." : "Masuk"}
      </button>
      <p className="text-center text-sm text-[var(--text-muted)]">
        Belum punya akun?{" "}
        <Link href="/signup" className="font-medium text-[var(--brand-navy-deep)] hover:underline hover:text-[var(--accent)]">
          Daftar
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[var(--background)] px-4 py-8">
      {/* Grain overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-grain z-0" />
      
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          {/* Velox symbol logo */}
          <div className="mb-3 flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-[0_0_32px_rgba(255,215,0,0.25)]">
            <Image
              src="/logos/velox-shield-icon.png"
              alt="Velox Capital"
              width={64}
              height={64}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <h1 className="brand-text text-2xl font-bold tracking-tight">VELOX</h1>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">Investment Community</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_8px_40px_rgba(14,34,48,0.1)]">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
