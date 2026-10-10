"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  id?: string;
  kicker: string;
  title: string;
  /** Substring of `title` to emphasise with gradient + underline. */
  highlight?: string;
  description?: string;
  className?: string;
}

export function SectionHeader({
  id,
  kicker,
  title,
  highlight,
  description,
  className,
}: SectionHeaderProps) {
  const reduceMotion = useReducedMotion();

  const index = highlight ? title.indexOf(highlight) : -1;
  const before = index >= 0 ? title.slice(0, index) : title;
  const marked = index >= 0 ? highlight : null;
  const after =
    index >= 0 && highlight ? title.slice(index + highlight.length) : "";

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: reduceMotion ? 0 : 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: {
      duration: reduceMotion ? 0 : 0.5,
      delay: reduceMotion ? 0 : delay,
      ease: "easeOut" as const,
    },
  });

  return (
    <div className={cn("mx-auto mb-12 max-w-3xl text-center", className)}>
      <motion.p
        {...fadeUp(0)}
        className="inline-flex items-center gap-2 rounded-full border border-[#ff5a36]/30 bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-red-800 shadow-sm"
      >
        <span aria-hidden="true" className="relative flex size-2">
          <span className="absolute inline-flex size-full rounded-full bg-red-800 opacity-60 motion-safe:animate-ping" />
          <span className="relative inline-flex size-2 rounded-full bg-red-800" />
        </span>
        {kicker}
      </motion.p>

      <motion.h2
        id={id}
        {...fadeUp(0.08)}
        className="mt-5 text-balance text-[clamp(2rem,4.5vw,3.25rem)] font-extrabold leading-[1.08] tracking-[-0.03em] text-zinc-900"
      >
        {before}
        {marked && (
          <span className="relative inline-block whitespace-nowrap">
            <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
              {marked}
            </span>
            <svg
              aria-hidden="true"
              viewBox="0 0 200 12"
              preserveAspectRatio="none"
              className="absolute -bottom-2 left-0 h-2.5 w-full text-red-800"
              fill="none"
            >
              <motion.path
                d="M2 8 Q 50 2 100 6 T 198 5"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: reduceMotion ? 1 : 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: reduceMotion ? 0 : 0.8,
                  delay: reduceMotion ? 0 : 0.5,
                  ease: "easeInOut",
                }}
              />
            </svg>
          </span>
        )}
        {after}
      </motion.h2>

      {description && (
        <motion.p
          {...fadeUp(0.16)}
          className="mx-auto mt-6 max-w-[60ch] text-pretty text-lg leading-relaxed text-zinc-600"
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}
