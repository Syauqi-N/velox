"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

function SetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code") ?? "";
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!code) {
      setError("Kode masuk tidak ditemukan. Ulangi dari halaman kode.");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    if (password.length < 12 || password.length > 128) {
      setError("Password harus 12–128 karakter.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, password, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal mengaktifkan akun.");
        return;
      }
      router.push("/login?activated=1");
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (!code) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-center shadow-[0_8px_40px_rgba(14,34,48,0.1)]">
        <p className="text-sm text-[var(--text-muted)]">
          Kode tidak ditemukan.{" "}
          <Link href="/activate" className="font-medium text-[var(--brand-navy-deep)] hover:underline hover:text-[var(--accent)]">
            Masukkan kode
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div className="rounded-lg border border-[var(--up)]/30 bg-[var(--up)]/10 px-3 py-2.5 text-[13px] font-medium text-[var(--up)]">
        Kode terverifikasi ✅ — sekarang buat password untuk akunmu.
      </div>
      <div>
        <label htmlFor="setp-name" className="mb-1.5 block text-sm font-medium text-[var(--text)]">
          Nama
        </label>
        <input
          id="setp-name"
          type="text"
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background-2)] px-3.5 py-2.5 text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
          placeholder="Nama panggilan"
          autoComplete="name"
        />
      </div>
      <div>
        <label htmlFor="setp-password" className="mb-1.5 block text-sm font-medium text-[var(--text)]">
          Password
        </label>
        <input
          id="setp-password"
          type="password"
          required
          minLength={12}
          maxLength={128}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background-2)] px-3.5 py-2.5 text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
          placeholder="12–128 karakter"
          autoComplete="new-password"
        />
      </div>
      <div>
        <label htmlFor="setp-confirm" className="mb-1.5 block text-sm font-medium text-[var(--text)]">
          Konfirmasi Password
        </label>
        <input
          id="setp-confirm"
          type="password"
          required
          minLength={12}
          maxLength={128}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background-2)] px-3.5 py-2.5 text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
          placeholder="Ulangi password"
          autoComplete="new-password"
        />
      </div>
      {error && (
        <div className="rounded-lg border border-[var(--down)]/30 bg-[var(--down)]/10 px-3 py-2 text-sm text-[var(--down)]">
          {error}
        </div>
      )}
      <button type="submit" disabled={loading} className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold ${
        loading 
          ? "cursor-not-allowed bg-[var(--brand-navy-muted)] text-white" 
          : "bg-gradient-to-r from-[#dec783] via-[#c9a961] to-[#b78e39] text-[var(--app-bg-dark)] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[var(--accent-soft)]"
      }`}>
        {loading ? "Mengaktifkan…" : "Aktifkan Akun & Masuk"}
      </button>
    </form>
  );
}

export default function SetPasswordPage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[var(--background)] px-4 py-8">
      {/* Grain overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-30 bg-grain z-0" />
      
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-5 flex flex-col items-center gap-1 text-center">
          <div className="mb-1 flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-[0_0_24px_rgba(255,215,0,0.3)]">
            <Image
              src="/logos/velox-shield-icon.png"
              alt="Velox Capital"
              width={44}
              height={44}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <h1 className="brand-text text-2xl font-bold tracking-tight">Buat Password</h1>
          <p className="text-sm text-[var(--text-muted)]">Langkah terakhir mengaktifkan akun member</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_8px_40px_rgba(14,34,48,0.1)]">
          <Suspense fallback={<div className="text-sm text-[var(--text-muted)]">Memulat...</div>}>
            <SetPasswordForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
