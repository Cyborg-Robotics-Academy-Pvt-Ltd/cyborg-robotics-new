"use client";

import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type BentoTone =
  | "brand"
  | "amber"
  | "rose"
  | "teal"
  | "orange"
  | "violet";

export type BentoIconMotion = "spin" | "tilt" | "lift" | "pop" | "launch";

interface ToneStyles {
  readonly card: string;
  readonly badge: string;
  readonly mark: string;
  readonly dots: string;
  readonly index: string;
  readonly desc: string;
  readonly bar: string;
  readonly vars: string;
  readonly sheen: boolean;
}

// Static class strings so Tailwind can detect them.
const TONES: Record<BentoTone, ToneStyles> = {
  brand: {
    card: "border-transparent bg-gradient-to-br from-[#e8431f] to-[#b8330e] text-white hover:shadow-[#e8431f]/30",
    badge: "bg-white text-[#d63b12]",
    mark: "text-white/15",
    dots: "text-white/25",
    index: "text-white/80",
    desc: "text-white/90",
    bar: "bg-white/70",
    vars: "[--spot:rgba(255,255,255,0.22)] [--ring:rgba(255,255,255,0.55)]",
    sheen: true,
  },
  amber: {
    card: "border-amber-200/70 bg-gradient-to-br from-amber-50 to-white text-zinc-900 hover:shadow-amber-500/15",
    badge: "bg-amber-600 text-white",
    mark: "text-amber-600/[0.09]",
    dots: "text-amber-500/30",
    index: "text-amber-800/70",
    desc: "text-zinc-600",
    bar: "bg-amber-500",
    vars: "[--spot:rgba(245,158,11,0.16)] [--ring:rgba(245,158,11,0.55)]",
    sheen: false,
  },
  rose: {
    card: "border-rose-200/70 bg-gradient-to-br from-rose-50 to-white text-zinc-900 hover:shadow-rose-500/15",
    badge: "bg-rose-600 text-white",
    mark: "text-rose-600/[0.08]",
    dots: "text-rose-500/30",
    index: "text-rose-800/70",
    desc: "text-zinc-600",
    bar: "bg-rose-500",
    vars: "[--spot:rgba(244,63,94,0.14)] [--ring:rgba(244,63,94,0.5)]",
    sheen: false,
  },
  teal: {
    card: "border-teal-200/70 bg-gradient-to-br from-teal-50 to-white text-zinc-900 hover:shadow-teal-500/15",
    badge: "bg-teal-600 text-white",
    mark: "text-teal-600/[0.09]",
    dots: "text-teal-500/30",
    index: "text-teal-800/70",
    desc: "text-zinc-600",
    bar: "bg-teal-500",
    vars: "[--spot:rgba(20,184,166,0.15)] [--ring:rgba(20,184,166,0.55)]",
    sheen: false,
  },
  orange: {
    card: "border-[#ffd9cf] bg-gradient-to-br from-[#fff1ec] to-white text-zinc-900 hover:shadow-[#e8431f]/15",
    badge: "bg-[#e8431f] text-white",
    mark: "text-[#e8431f]/[0.08]",
    dots: "text-[#e8431f]/25",
    index: "text-[#b8330e]/70",
    desc: "text-zinc-600",
    bar: "bg-[#e8431f]",
    vars: "[--spot:rgba(232,67,31,0.14)] [--ring:rgba(232,67,31,0.5)]",
    sheen: false,
  },
  violet: {
    card: "border-violet-200/70 bg-gradient-to-br from-violet-50 to-white text-zinc-900 hover:shadow-violet-500/15",
    badge: "bg-violet-600 text-white",
    mark: "text-violet-600/[0.08]",
    dots: "text-violet-500/30",
    index: "text-violet-800/70",
    desc: "text-zinc-600",
    bar: "bg-violet-500",
    vars: "[--spot:rgba(139,92,246,0.15)] [--ring:rgba(139,92,246,0.55)]",
    sheen: false,
  },
};

const ICON_MOTION: Record<BentoIconMotion, string> = {
  spin: "transition-transform duration-700 ease-in-out motion-safe:group-hover/bento:-rotate-[360deg]",
  tilt: "transition-transform duration-300 motion-safe:group-hover/bento:-rotate-12",
  lift: "transition-transform duration-300 motion-safe:group-hover/bento:-translate-y-0.5 motion-safe:group-hover/bento:scale-110",
  pop: "transition-transform duration-300 motion-safe:group-hover/bento:scale-125",
  launch:
    "transition-transform duration-300 motion-safe:group-hover/bento:-translate-y-0.5 motion-safe:group-hover/bento:translate-x-0.5",
};

const MAX_TILT_DEG = 4;

interface BentoGridProps {
  className?: string;
  children?: ReactNode;
}

export const BentoGrid = ({ className, children }: BentoGridProps) => {
  const reduceMotion = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduceMotion ? 0 : 0.08 } },
  };

  return (
    <motion.ul
      role="list"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className={cn(
        "mx-auto grid max-w-7xl grid-cols-1 gap-4 md:auto-rows-[14rem] md:grid-cols-3",
        className,
      )}
    >
      {children}
    </motion.ul>
  );
};

interface BentoGridItemProps {
  className?: string;
  title: ReactNode;
  description?: ReactNode;
  icon: LucideIcon;
  index?: number;
  tone?: BentoTone;
  iconMotion?: BentoIconMotion;
}

export const BentoGridItem = ({
  className,
  title,
  description,
  icon: Icon,
  index,
  tone = "orange",
  iconMotion = "pop",
}: BentoGridItemProps) => {
  const reduceMotion = useReducedMotion();
  const t = TONES[tone];

  const item: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.35, ease: "easeOut" },
    },
  };

  // Writes CSS vars directly: no React re-render on pointer move.
  const handlePointerMove = (e: ReactPointerEvent<HTMLLIElement>) => {
    if (reduceMotion || e.pointerType !== "mouse") return;
    const el = e.currentTarget;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
    el.style.setProperty("--ry", `${(x / width - 0.5) * 2 * MAX_TILT_DEG}deg`);
    el.style.setProperty(
      "--rx",
      `${-(y / height - 0.5) * 2 * MAX_TILT_DEG}deg`,
    );
  };

  const handlePointerLeave = (e: ReactPointerEvent<HTMLLIElement>) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };

  return (
    <motion.li
      variants={item}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn("group/bento [perspective:1000px]", t.vars, className)}
    >
      <div
        className={cn(
          "relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border p-6 shadow-sm md:p-7",
          "transition-[transform,box-shadow] duration-200 ease-out hover:shadow-xl",
          "[transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] motion-reduce:transform-none",
          t.card,
        )}
      >
        {/* Cursor spotlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/bento:opacity-100 motion-reduce:hidden [background:radial-gradient(260px_circle_at_var(--mx,50%)_var(--my,50%),var(--spot),transparent_70%)]"
        />

        {/* Sheen sweep (hero only) */}
        {t.sheen && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 ease-out group-hover/bento:translate-x-[420%] motion-reduce:hidden"
          />
        )}

        {/* Dot-grid texture */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(to_bottom_left,black,transparent_55%)]",
            t.dots,
          )}
        />

        {/* Watermark */}
        <Icon
          aria-hidden="true"
          strokeWidth={1}
          className={cn(
            "pointer-events-none absolute -bottom-10 -right-8 size-44 transition-transform duration-500",
            "motion-safe:group-hover/bento:-rotate-6 motion-safe:group-hover/bento:scale-110",
            t.mark,
          )}
        />

        {/* Top row */}
        <div className="relative flex items-start justify-between">
          <span
            aria-hidden="true"
            className={cn(
              "grid size-12 place-items-center rounded-2xl shadow-md ring-4 ring-white/40",
              t.badge,
            )}
          >
            <Icon
              className={cn("size-6", ICON_MOTION[iconMotion])}
              strokeWidth={1.8}
            />
          </span>

          {typeof index === "number" && (
            <span
              aria-hidden="true"
              className={cn(
                "font-mono text-sm font-semibold tabular-nums",
                t.index,
              )}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
          )}
        </div>

        {/* Text */}
        <div className="relative max-w-[36ch]">
          <h3 className="text-xl font-bold tracking-tight">{title}</h3>
          {description && (
            <p
              className={cn(
                "mt-1.5 text-pretty text-base leading-relaxed",
                t.desc,
              )}
            >
              {description}
            </p>
          )}
        </div>

        {/* Hover accent bar */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute bottom-0 left-0 h-1 w-0 transition-[width] duration-500 ease-out group-hover/bento:w-full motion-reduce:transition-none",
            t.bar,
          )}
        />
      </div>
    </motion.li>
  );
};
