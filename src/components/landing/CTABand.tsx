import Link from "next/link";
import { Reveal } from "./motion";
import AnimatedCandles from "./AnimatedCandles";

export default function CTABand() {
  return (
    <section className="relative overflow-hidden bg-[var(--brand-navy)] py-16 lg:py-20">
      {/* Live candles feed behind CTA */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.22]">
        <AnimatedCandles variant="navy" />
      </div>
      <Reveal className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Siap investasi lebih tenang?
        </h2>
        <p className="mt-4 text-lg text-white/70">
          Bergabung dengan circle privat Velox dan diskusikan pasar dengan
          investor lain yang serius.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/signup"
            className="rounded-lg bg-[var(--accent)] px-7 py-3 text-sm font-semibold text-[var(--brand-navy-deep)] shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[var(--accent-hover)]"
          >
            Bergabung Sekarang
          </Link>
          <a
            href="#harga"
            className="rounded-lg border border-white/30 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Lihat Membership
          </a>
        </div>
      </Reveal>
    </section>
  );
}
