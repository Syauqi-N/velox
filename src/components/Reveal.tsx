"use client";

import { useEffect, useRef, useState } from "react";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Delay in ms before the animation starts (useful for staggering). */
  delay?: number;
  /** When true, animates once on first intersection then stays visible. */
  once?: boolean;
}

/**
 * Scroll-reveal wrapper. Fades + rises content into view when it enters the
 * viewport. Uses IntersectionObserver (no scroll listener).
 *
 * Robustness contract (so content is never lost, which previously read as
 * "static / overlapping / missing"):
 *   - Elements already inside the viewport on mount reveal immediately.
 *   - A short fallback timer reveals content shortly after mount even if the
 *     observer misbehaves (e.g. inside a nested scroll container).
 *   - "once" defaults to true so revealed content stays visible.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Reveal straight away when the element is already fully in view,
    // avoiding invisible/stacked content when the observer fires late.
    const rect = el.getBoundingClientRect();
    const fullyInView =
      rect.top >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
    if (fullyInView) {
      setVisible(true);
      return;
    }

    let settled = false;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            settled = true;
            setVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(el);

    // Guaranteed fallback: never leave content hidden if the observer never
    // fires (e.g. element inside an overflow/scroll parent). Reveals after a
    // beat so the entrance animation can still play for above-fold items.
    const fallback = window.setTimeout(() => {
      if (!settled && ref.current) {
        const r = ref.current.getBoundingClientRect();
        if (r.top < (window.innerHeight || document.documentElement.clientHeight)) {
          settled = true;
          setVisible(true);
        }
      }
    }, 400);

    return () => {
      settled = true;
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, [once]);

  return (
    <div
      ref={ref}
      className={`${visible ? "reveal-visible" : "reveal"} ${className}`}
      style={{ transitionDelay: `${delay}ms`, animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
