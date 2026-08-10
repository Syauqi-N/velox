"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

function formatCode(value: string): string {
  const clean = value.toUpperCase().replace(/[^A-Z2-9]/g, "").slice(0, 8);
  return clean.length > 4 ? `${clean.slice(0, 4)}-${clean.slice(4)}` : clean;
}

export default function ActivatePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Kode tidak valid.");
        return;
      }
      router.push(`/set-password?code=${encodeURIComponent(code)}`);
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

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
          <h1 className="brand-text text-2xl font-bold tracking-tight">Masukkan Kode Masuk</h1>
          <p className="text-sm text-[var(--text-muted)]">
            Kode diberikan oleh admin setelah permintaan signup kamu disetujui.
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_8px_40px_rgba(14,34,48,0.1)]">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label htmlFor="activate-code" className="mb-1.5 block text-sm font-medium text-[var(--text)]">
                Kode Masuk
              </label>
              <input
                id="activate-code"
                value={code}
                onChange={(e) => setCode(formatCode(e.target.value))}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background-2)] px-3.5 py-2.5 text-center font-mono text-lg tracking-[0.2em] text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
                placeholder="XXXX-XXXX"
                inputMode="text"
                autoCapitalize="characters"
                autoComplete="off"
                required
              />
            </div>
            {error && (
              <div className="rounded-lg border border-[var(--down)]/30 bg-[var(--down)]/10 px-3 py-2 text-sm text-[var(--down)]">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading || code.length !== 9}
              className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold ${
                loading || code.length !== 9
                  ? "cursor-not-allowed bg-[var(--brand-navy-muted)] text-white" 
                  : "bg-gradient-to-r from-[#dec783] via-[#c9a961] to-[#b78e39] text-[var(--app-bg-dark)] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[var(--accent-soft)]"
              }`}
            >
              {loading ? "Memeriksa…" : "Lanjutkan"}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-[var(--text-muted)]">
            Belum dapat kode? Hubungi admin circle.
          </p>
          <p className="mt-2 text-center text-sm">
            <Link href="/signup" className="font-medium text-[var(--brand-navy-deep)] hover:underline hover:text-[var(--accent)]">
              Daftar akun baru
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
