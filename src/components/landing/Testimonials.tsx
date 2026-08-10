"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Reveal, cardItem, staggerContainer } from "./motion";

// Placeholder testimonials — replace names/avatar/quotes with real member data.
const TESTIMONIALS = [
  {
    name: "Andi",
    role: "Investor aktif",
    quote:
      "Sebelumnya riset sendiri jadi bingung. Di circle, diskusinya terarah dan ada data yang bisa dipercaya.",
  },
  {
    name: "Budi",
    role: "Member premium",
    quote:
      "Trading calls dari tim emang beda — ada analisisnya, bukan cuma kode saham doang.",
  },
  {
    name: "Citra",
    role: "Investor ritel",
    quote:
      "Watchlist & chart-nya bikin gue lebih percaya diri ambil keputusan. Komunitasnya sehat banget.",
  },
];

export default function Testimonials() {
  return (
    <section className="border-y border-[var(--border-light)] bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand-gold)]">
            Testimoni
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-[var(--text)] sm:text-4xl">
            Apa kata member
          </h2>
        </Reveal>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-12 grid gap-5 md:grid-cols-3"
        >
          {TESTIMONIALS.map((t) => (
            <motion.figure
              key={t.name}
              variants={cardItem}
              whileHover={{ y: -4 }}
              className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-6"
            >
              <div className="mb-3 flex text-[var(--brand-gold)]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l2.4 7.2H22l-6 4.6 2.3 7.2-6.3-4.6-6.3 4.6L8 13.8 2 9.2h7.6z" />
                  </svg>
                ))}
              </div>
              <blockquote className="flex-1 text-sm leading-relaxed text-[var(--text-muted)]">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <Image
                  src={`https://ui-avatars.com/api/?name=${t.name}&background=C9A961&color=1B3A52&font-size=0.4`}
                  alt={t.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                  unoptimized
                />
                <div>
                  <div className="text-sm font-semibold text-[var(--text)]">{t.name}</div>
                  <div className="text-xs text-[var(--text-muted)]">{t.role}</div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
