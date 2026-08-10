"use client";

import { motion } from "framer-motion";
import { Reveal, staggerContainer, cardItem } from "./motion";

const BENEFITS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: "Social Feed Member",
    desc: "Diskusi via feed untuk posting & komentar langsung antar member circle tentang pasar, saham, dan strategi.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" /><path d="M7 14l4-4 4 3 5-6" />
      </svg>
    ),
    title: "Riset & Chart Saham",
    desc: "Temukan saham, lihat chart terbaru, dan akses riset yang mudah dipahami untuk keputusan lebih percaya diri.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" />
      </svg>
    ),
    title: "Watchlist Pribadi",
    desc: "Pantau portofolio dan daftar saham favoritmu dalam satu tempat, dengan gambaran performa yang jelas.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
      </svg>
    ),
    title: "Trading Calls",
    desc: "Terima sinyal dan trading calls harian dari tim circle, lengkap dengan research & analisis actionable.",
  },
];

export default function WhyJoin() {
  return (
    <section id="fitur" className="relative overflow-hidden bg-[var(--bg)] bg-pattern-dots py-16 lg:py-24">
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-gold)]">
            Fitur Circle
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl">
            Kenapa Velox Circle?
          </h2>
          <p className="mt-4 text-lg text-[var(--text-muted)]">
            Banyak investor gagal karena kurang pengetahuan atau berdiskusi di
            tempat yang salah. Velox Circle menyediakan diskusi pasar yang sehat
            dengan riset, analisis, dan insight actionable.
          </p>
        </Reveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {BENEFITS.map((b) => (
            <motion.div
              key={b.title}
              variants={cardItem}
              whileHover={{ y: -4 }}
              className="group rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--brand-navy)] transition-colors group-hover:bg-[var(--brand-navy)] group-hover:text-white">
                {b.icon}
              </div>
              <h3 className="text-base font-bold text-[var(--text)]">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                {b.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
