"use client";

import { Reveal } from "./motion";

const PRODUCT_SIGNALS = [
  { label: "Feed komunitas", detail: "Diskusi pasar yang lebih terarah" },
  { label: "Watchlist pribadi", detail: "Pantau ticker yang penting buatmu" },
  { label: "Trading calls", detail: "Konteks sebelum mengambil keputusan" },
];

export default function TrustedBy() {
  return (
    <section className="border-y border-[var(--border)] bg-[var(--surface-soft)]">
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-7 sm:px-6 lg:grid-cols-[1.32fr_repeat(3,1fr)] lg:items-center lg:gap-0 lg:py-8">
        <Reveal className="pr-4 lg:pr-10">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-gold)]">
            Dibangun untuk investor Indonesia
          </p>
          <p className="mt-1.5 text-sm font-semibold text-[var(--brand-navy)] sm:text-[15px]">
            Satu circle untuk mengikuti pasar dengan lebih terstruktur.
          </p>
        </Reveal>

        {PRODUCT_SIGNALS.map((signal, index) => (
          <Reveal key={signal.label} delay={(index + 1) * 0.06}>
            <div className="flex items-start gap-3 border-t border-[var(--border-light)] py-4 lg:border-l lg:border-t-0 lg:px-7 lg:py-1">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--brand-gold)] shadow-[0_0_0_4px_var(--accent-soft)]" />
              <div>
                <p className="text-sm font-bold text-[var(--text)]">{signal.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">
                  {signal.detail}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
