"use client";

import { useState } from "react";
import { Reveal } from "./motion";
import { motion, AnimatePresence } from "framer-motion";

// Placeholder FAQ — replace with real community FAQs.
const FAQS = [
  {
    q: "Apakah Velox hanya untuk investor berpengalaman?",
    a: "Tidak. Velox terbuka untuk siapa saja yang serius belajar investasi saham Indonesia — dari menengah hingga aktif. Diskusi sehat membantu semua level.",
  },
  {
    q: "Apa bedanya membership gratis dan premium?",
    a: "Member gratis bisa akses social feed, watchlist, dan riset dasar. Premium mendapatkan trading calls harian, riset mendalam, chart lanjutan, dan prioritas diskusi.",
  },
  {
    q: "Bagaimana cara bergabung?",
    a: "Daftar akun di halaman signup, lalu kamu bisa mulai menjelajah. Untuk akses penuh circle, upgrade ke membership premium kapanpun.",
  },
  {
    q: "Informasi trading call seberapa cepat dan bisa dipercaya?",
    a: "Trading calls disusun tim circle dengan riset & analisis. Selalu lakukan due diligence dan keputusan akhir tetap di tanganmu.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-[var(--text)]">{q}</span>
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[var(--brand-navy)] transition-transform ${open ? "rotate-45" : ""}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <p className="px-5 pb-5 text-sm leading-relaxed text-[var(--text-muted)]">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  return (
    <section id="faq" className="relative overflow-hidden bg-[var(--bg)] bg-pattern-dots py-16 lg:py-24">
      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal className="text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-gold)]">
            FAQ
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl">
            Pertanyaan umum
          </h2>
        </Reveal>
        <div className="mt-10 space-y-3">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.06}>
              <FaqItem {...f} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
