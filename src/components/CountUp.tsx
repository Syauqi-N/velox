"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  /** Target numeric value to count up to. */
  end: number;
  /** Duration in ms. */
  duration?: number;
  /** Whether to animate on mount (true) or only when scrolled into view. */
  animateOnView?: boolean;
  /** Custom formatter for the displayed value (e.g. currency). */
  format?: (value: number) => string;
  /** Optional CSS class for the rendered span. */
  className?: string;
}

/**
 * Animated number counter. Counts from 0 to `end` with an ease-out curve.
 * If `animateOnView` is true, starts when the element scrolls into view.
 */
export default function CountUp({
  end,
  duration = 1200,
  animateOnView = true,
  format,
  className = "",
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const run = () => {
      if (startedRef.current) return;
      startedRef.current = true;

      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(end * eased);
        if (progress < 1) requestAnimationFrame(tick);
        else setValue(end);
      };
      requestAnimationFrame(tick);
    };

    if (!animateOnView) {
      run();
      return;
    }

    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            run();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration, animateOnView]);

  const display = format ? format(value) : Math.round(value).toLocaleString();

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}