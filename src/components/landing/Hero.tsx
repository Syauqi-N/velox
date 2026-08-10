"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "./motion";
import DashboardMock from "./DashboardMock";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[var(--bg)]">
      {/* Soft ambient background: grain + radial glow instead of blob shapes */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grain" />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-32 h-[560px] w-[560px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, rgba(201,169,97,0.32) 0%, rgba(201,169,97,0.10) 45%, transparent 70%)",
        }}
      />
      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16 lg:py-[4.5rem] xl:gap-20">
        {/* Left: copy */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={fadeUp}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)]/70 bg-white/90 px-3.5 py-2 text-xs font-semibold tracking-[0.04em] text-[var(--brand-navy)] shadow-[0_8px_22px_rgba(27,58,82,0.06)]"
          >
            <span className="h-2 w-2 rounded-full bg-[var(--brand-gold)] shadow-[0_0_0_4px_var(--accent-soft)]" />
            Private Investment Circle
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="max-w-[11ch] text-[2.85rem] font-extrabold leading-[0.99] tracking-[-0.045em] text-[var(--text)] sm:text-6xl lg:text-[4.15rem] xl:text-[4.7rem]"
          >
            <span className="block">Investasi saham</span>
            <span className="block">
              lebih <span className="text-[var(--brand-navy)]">tenang.</span>
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-xl text-[17px] leading-8 text-[var(--text-muted)] sm:text-lg"
          >
            Tempat privat untuk mengikuti pasar dengan riset yang lebih jelas,
            watchlist personal, dan diskusi bersama member yang serius.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="landing-button-navy rounded-xl px-6 py-3.5 text-sm font-bold"
            >
              Bergabung ke Circle
            </Link>
            <a
              href="#harga"
              className="rounded-xl border border-[var(--border-strong)] bg-white/70 px-6 py-3.5 text-sm font-bold text-[var(--brand-navy)] transition-all hover:-translate-y-0.5 hover:border-[var(--brand-navy)] hover:bg-white"
            >
              Lihat Membership
            </a>
          </motion.div>
          <motion.p
            variants={fadeUp}
            className="mt-5 flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]"
          >
            <span className="text-[var(--brand-gold)]">✦</span>
            Akses member melalui proses persetujuan circle.
          </motion.p>
        </motion.div>

        {/* Right: product mock placeholder */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="relative mx-auto w-full max-w-[640px] lg:ml-auto"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] opacity-80 blur-2xl"
            style={{
              background:
                "radial-gradient(circle at 62% 42%, rgba(201,169,97,0.26), transparent 62%)",
            }}
          />
          <motion.div
            whileHover={{ y: -6 }}
            className="overflow-hidden rounded-[1.35rem] border border-white bg-white/75 p-2 shadow-[0_24px_70px_rgba(14,34,48,0.18),0_4px_16px_rgba(14,34,48,0.08)]"
          >
            <DashboardMock />
          </motion.div>
          {/* Floating badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, type: "spring", bounce: 0.2 }}
            className="absolute -bottom-5 left-5 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3 py-2 shadow-[0_14px_30px_rgba(14,34,48,0.14)]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--brand-gold)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.4 7.2H22l-6 4.6 2.3 7.2-6.3-4.6-6.3 4.6L8 13.8 2 9.2h7.6z" />
              </svg>
            </span>
            <div>
              <div className="text-sm font-semibold text-[var(--text)]">
                Trading Call Hari Ini
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                dari tim circle
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
