"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, cardItem } from "./motion";

const NAV_LINKS = [
  { label: "Fitur", href: "#fitur" },
  { label: "Kenapa Velox", href: "#kenapa" },
  { label: "Harga", href: "#harga" },
  { label: "FAQ", href: "#faq" },
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-light)] bg-white/90 shadow-[0_1px_0_rgba(27,58,82,0.03),0_8px_24px_rgba(27,58,82,0.04)] backdrop-blur-xl">
      <nav className="mx-auto flex h-24 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logos/velox-primary-horizontal.png"
            alt="VELOX Investment Community"
            width={1920}
            height={700}
            className="hidden h-[4.5rem] w-auto object-contain sm:block"
            priority
          />
          <Image
            src="/logos/velox-favicon-mark.png"
            alt="VELOX"
            width={40}
            height={40}
            className="sm:hidden h-9 w-9 object-contain"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-9 lg:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-[15px] font-semibold text-[var(--text-muted)] transition-colors hover:text-[var(--brand-navy)]"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden text-[15px] font-semibold text-[var(--brand-navy)] transition-colors hover:text-[var(--brand-gold)] sm:block"
          >
            Masuk
          </Link>
          <Link
            href="/signup"
            className="landing-button-gold rounded-xl px-5 py-2.5 text-[15px] font-bold"
          >
            Bergabung
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg lg:hidden"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="border-t border-[var(--border-light)] bg-white px-4 py-4 lg:hidden"
          >
            <ul className="flex flex-col gap-2">
              {NAV_LINKS.map((l) => (
                <motion.li key={l.href} variants={cardItem}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-[var(--text-muted)] hover:bg-[var(--surface-soft)]"
                  >
                    {l.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
