// hooks/useScrollProgress.ts
"use client";

import { RefObject, useEffect, useRef, useState } from "react";

/**
 * Returns:
 * - progress: 0..1 state, for consumers that need re-renders (e.g. text overlay opacity)
 * - progressRef: same value, always current, zero re-render cost — use this in rAF loops
 */
export function useScrollProgress<T extends HTMLElement>(
  pinRef: RefObject<T | null>,
) {
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = pinRef.current;
    if (!el) return;

    const compute = () => {
      const rect = el.getBoundingClientRect();
      const scrollable = el.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const p = scrollable > 0 ? Math.min(Math.max(scrolled / scrollable, 0), 1) : 0;

      progressRef.current = p;
      // Overlay transitions are eased by Framer Motion. Limiting React updates
      // to 2% progress steps keeps scrolling smooth without visible jumps.
      setProgress((prev) => (Math.abs(prev - p) >= 0.02 ? p : prev));
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        compute();
      });
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [pinRef]);

  return { progress, progressRef };
}
