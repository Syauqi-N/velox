"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Terjadi kesalahan.");
        return;
      }
      router.push("/activate");
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--background-2)] px-3 py-2.5 text-[13px] leading-relaxed text-[var(--text-muted)]">
        Daftar dulu sebagai calon member. Setelah disetujui admin, kamu akan
        mendapat <span className="font-semibold text-[var(--foreground)]">kode masuk</span> untuk
        mengaktifkan akun.
      </div>
      <div>
        <label htmlFor="signup-name" className="mb-1.5 block text-sm font-medium text-[var(--text)]">
          Nama
        </label>
        <input
          id="signup-name"
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
        <label htmlFor="signup-email" className="mb-1.5 block text-sm font-medium text-[var(--text)]">
          Email
        </label>
        <input
          id="signup-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--background-2)] px-3.5 py-2.5 text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
          placeholder="nama@email.com"
          autoComplete="email"
        />
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
        {loading ? "Mengirim…" : "Daftar Sekarang"}
      </button>
      <p className="text-center text-sm text-[var(--text-muted)]">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-medium text-[var(--brand-navy-deep)] hover:underline hover:text-[var(--accent)]">
          Masuk
        </Link>
      </p>
    </form>
  );
}

export default function SignupPage() {
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
          <h1 className="brand-text text-2xl font-bold tracking-tight">Velox Capital</h1>
          <p className="text-sm text-[var(--text-muted)]">Daftar sebagai calon member</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_8px_40px_rgba(14,34,48,0.1)]">
          <Suspense fallback={<div className="text-sm text-[var(--text-muted)]">Memulat...</div>}>
            <SignupForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
