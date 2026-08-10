"use client";

import { useState } from "react";
import { Reveal, cardItem, staggerContainer } from "./motion";
import { motion } from "framer-motion";

const PLANS = [
  {
    name: "Komunitas",
    price: 0,
    tagline: "Mulai diskusi & pantau pasar",
    features: [
      "Akses social feed member",
      "Watchlist pribadi",
      "Riset dasar saham",
      "Notifikasi trading calls dasar",
    ],
    cta: "Bergabung Gratis",
    featured: false,
  },
  {
    name: "Premium Circle",
    price: 99000,
    tagline: "Akses penuh riset & trading calls",
    features: [
      "Semua fitur Komunitas",
      "Trading calls harian dari tim",
      "Riset & analisis mendalam",
      "Chart lanjutan & data pasar",
      "Prioritas diskusi dengan member",
    ],
    cta: "Mulai Premium",
    featured: true,
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="harga" className="relative overflow-hidden bg-[var(--bg)] bg-pattern-grid py-16 lg:py-24">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-gold)]">
            Keanggotaan
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl">
            Pilih cara bergabung
          </h2>
          <p className="mt-4 text-lg text-[var(--text-muted)]">
            Mulai gratis, upgrade kapanpun untuk akses penuh riset dan trading
            calls.
          </p>

          {/* Billing toggle */}
          <div className="mt-6 inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-white p-1">
            <button
              onClick={() => setYearly(false)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                !yearly ? "bg-[var(--brand-navy)] text-white" : "text-[var(--text-muted)]"
              }`}
            >
              Bulanan
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                yearly ? "bg-[var(--brand-navy)] text-white" : "text-[var(--text-muted)]"
              }`}
            >
              Tahunan
              <span className="ml-1.5 rounded-full bg-[var(--accent-soft)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--brand-navy)]">
                -20%
              </span>
            </button>
          </div>
        </Reveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2"
        >
          {PLANS.map((p) => {
            const price = yearly ? Math.round(p.price * 0.8) : p.price;
            return (
              <motion.div
                key={p.name}
                variants={cardItem}
                whileHover={{ y: -4 }}
                className={`relative flex flex-col rounded-2xl border p-7 ${
                  p.featured
                    ? "border-[var(--brand-gold)] bg-white shadow-xl shadow-[var(--brand-navy)]/10"
                    : "border-[var(--border)] bg-white"
                }`}
              >
                {p.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--brand-gold)] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[var(--brand-navy-deep)]">
                    Paling Populer
                  </span>
                )}
                <h3 className="text-lg font-bold text-[var(--text)]">{p.name}</h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{p.tagline}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[var(--brand-navy)]">
                    {p.price === 0 ? "Gratis" : `Rp${price.toLocaleString("id-ID")}`}
                  </span>
                  {p.price > 0 && (
                    <span className="text-sm text-[var(--text-muted)]">/bulan</span>
                  )}
                </div>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                      <span className="mt-0.5 text-[var(--brand-gold)]">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="/signup"
                  className={`mt-7 rounded-lg px-5 py-3 text-center text-sm font-semibold transition-all ${
                    p.featured
                      ? "bg-[var(--brand-navy)] text-white shadow-lg shadow-[var(--brand-navy)]/20 hover:-translate-y-0.5 hover:bg-[var(--brand-navy-deep)]"
                      : "border-2 border-[var(--brand-navy)] text-[var(--brand-navy)] hover:bg-[var(--brand-navy)] hover:text-white"
                  }`}
                >
                  {p.cta}
                </a>
              </motion.div>
            );
          })}
        </motion.div>
        <Reveal className="mt-6 text-center text-xs text-[var(--text-muted)]">
          Harga placeholder — sesuaikan dengan struktur membership asli Velox.
        </Reveal>
      </div>
    </section>
  );
}