"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  ArrowRight,
  Blocks,
  Bot,
  ChevronLeft,
  ChevronRight,
  CircuitBoard,
  Code,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils";

interface Program {
  readonly id: string;
  readonly age: string;
  readonly title: string;
  readonly description: string;
  readonly tools: readonly string[];
  readonly bestFor: string;
  readonly icon: LucideIcon;
}

const CONTENT = {
  kicker: "Learning pathways",
  title: "Find the right starting point for your child.",
  highlight: "starting point",
  description:
    "You don't need to know which kit or course to choose. We assess the child and recommend the appropriate pathway.",
} as const;

const PROGRAMS: readonly Program[] = [
  {
    id: "early-robotics",
    age: "Ages 4–6",
    title: "Early Robotics",
    description:
      "Mechanical exploration, gears, axles, pulleys and creative building.",
    tools: ["Gears", "Axles", "Pulleys"],
    bestFor: "Curious first-time builders",
    icon: Blocks,
  },
  {
    id: "robotics-coding",
    age: "Ages 7–9",
    title: "Robotics + Coding",
    description:
      "Foundations of robotics, programming and structured projects.",
    tools: ["Robotics", "Programming"],
    bestFor: "Kids ready to start coding",
    icon: Code,
  },
  {
    id: "advanced-robotics",
    age: "Ages 10–12",
    title: "Advanced Robotics",
    description: "SPIKE, EV3, coding, engineering challenges and projects.",
    tools: ["SPIKE", "EV3", "Coding"],
    bestFor: "Confident builders ready for challenges",
    icon: Bot,
  },
  {
    id: "engineering-coding",
    age: "Ages 13–16",
    title: "Engineering + Coding",
    description:
      "Arduino, Python, electronics, advanced robotics and projects.",
    tools: ["Arduino", "Python", "Electronics"],
    bestFor: "Teens exploring engineering",
    icon: CircuitBoard,
  },
  {
    id: "advanced-projects",
    age: "16+",
    title: "Advanced Projects",
    description:
      "Programming, robotics, engineering and technology-focused projects.",
    tools: ["Programming", "Robotics", "Engineering"],
    bestFor: "Students building technology projects",
    icon: GraduationCap,
  },
];

const TOTAL = PROGRAMS.length;
const EDGE_TOLERANCE = 4;

export default function ProgramsSection() {
  const reduceMotion = useReducedMotion();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ atStart: true, atEnd: false });

  const { container, item } = useMemo(() => {
    const container: Variants = {
      hidden: {},
      show: { transition: { staggerChildren: reduceMotion ? 0 : 0.1 } },
    };
    const item: Variants = {
      hidden: { opacity: 0, y: reduceMotion ? 0 : 24 },
      show: {
        opacity: 1,
        y: 0,
        transition: { duration: reduceMotion ? 0 : 0.4, ease: "easeOut" },
      },
    };
    return { container, item };
  }, [reduceMotion]);

  const syncEdge = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setEdge({
      atStart: el.scrollLeft <= EDGE_TOLERANCE,
      atEnd: el.scrollLeft + el.clientWidth >= el.scrollWidth - EDGE_TOLERANCE,
    });
  }, []);

  useEffect(() => {
    syncEdge();
    window.addEventListener("resize", syncEdge);
    return () => window.removeEventListener("resize", syncEdge);
  }, [syncEdge]);

  const scrollByPage = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({
      left: direction * el.clientWidth * 0.8,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <section
      id="programs"
      aria-labelledby="programs-heading"
      className="relative scroll-mt-28 overflow-hidden bg-white py-16 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-[48rem] -translate-x-1/2 rounded-full bg-[#ff5a36]/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-[1180px] px-6">
        <SectionHeader id="programs-heading" {...CONTENT} />

        {/* Mobile/tablet carousel controls */}
        <div className="mt-8 flex items-center justify-between lg:hidden">
          <p className="text-sm font-medium text-zinc-600">
            Swipe to see all {TOTAL} levels
          </p>
          <div className="flex gap-2">
            <ScrollButton
              label="Previous pathways"
              disabled={edge.atStart}
              onClick={() => scrollByPage(-1)}
              icon={ChevronLeft}
            />
            <ScrollButton
              label="Next pathways"
              disabled={edge.atEnd}
              onClick={() => scrollByPage(1)}
              icon={ChevronRight}
            />
          </div>
        </div>

        <div
          ref={scrollerRef}
          onScroll={syncEdge}
          role="region"
          aria-label="Learning pathways by age"
          tabIndex={0}
          className={cn(
            "-mx-6 mt-4 snap-x snap-mandatory scroll-px-6 overflow-x-auto px-6 pb-6",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800",
            "lg:mx-0 lg:mt-12 lg:overflow-visible lg:px-0 lg:pb-0",
          )}
        >
          <motion.ul
            role="list"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="relative flex gap-4 lg:grid lg:grid-cols-5 lg:items-start"
          >
            <StairRail />
            {PROGRAMS.map((program, index) => (
              <ProgramCard
                key={program.id}
                program={program}
                level={index + 1}
                variants={item}
                // Staircase: first card sits lowest, last card highest.
                style={
                  {
                    "--i": index,
                    "--last": TOTAL - 1,
                  } as CSSProperties
                }
              />
            ))}
          </motion.ul>
        </div>

        <div className="mt-12 text-center lg:mt-16">
          <a
            href="#trial"
            className={cn(
              "group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-700 to-red-800 px-7 py-4 font-bold text-white",
              "shadow-lg shadow-[#ff5a36]/25 transition-shadow hover:shadow-xl hover:shadow-[#ff5a36]/35",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800 focus-visible:ring-offset-2",
            )}
          >
            Not Sure? Start With a Free Assessment + Trial
            <ArrowRight
              aria-hidden="true"
              className="size-5 transition-transform motion-safe:group-hover:translate-x-1"
            />
          </a>
        </div>
      </div>
    </section>
  );
}

/** Dashed ascending rail linking card tops (desktop only). Matches the 2rem step. */
function StairRail() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 128"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 top-0 hidden h-32 w-full lg:block"
    >
      <polyline
        points="10,128 30,96 50,64 70,32 90,0"
        fill="none"
        stroke="#ff5a36"
        strokeOpacity="0.55"
        strokeWidth="2"
        strokeDasharray="5 5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function ScrollButton({
  label,
  disabled,
  onClick,
  icon: Icon,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  icon: LucideIcon;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "grid size-11 place-items-center rounded-full border border-zinc-300 bg-white text-zinc-900 transition-colors",
        "hover:border-red-800 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-zinc-300 disabled:hover:text-zinc-900",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800 focus-visible:ring-offset-2",
      )}
    >
      <Icon aria-hidden="true" className="size-5" />
    </button>
  );
}

function LevelMeter({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-2">
      <span aria-hidden="true" className="flex gap-1">
        {Array.from({ length: TOTAL }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 w-5 rounded-full",
              i < level ? "bg-red-800" : "bg-zinc-200",
            )}
          />
        ))}
      </span>
      <span className="text-xs font-medium text-zinc-600">
        Level {level} of {TOTAL}
      </span>
    </div>
  );
}

function ProgramCard({
  program,
  level,
  variants,
  style,
}: {
  program: Program;
  level: number;
  variants: Variants;
  style: CSSProperties;
}) {
  const { age, title, description, tools, bestFor, icon: Icon } = program;

  return (
    <motion.li
      variants={variants}
      style={style}
      className="relative w-[17.5rem] shrink-0 snap-start sm:w-80 lg:mt-[calc((var(--last)_-_var(--i))*2rem)] lg:w-auto"
    >
      <article
        className={cn(
          "relative flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm",
          "transition-[box-shadow,border-color] duration-300",
          "hover:border-[#ff5a36]/40 hover:shadow-lg",
        )}
      >
        <span
          aria-hidden="true"
          className="absolute -top-1.5 left-1/2 hidden size-3 -translate-x-1/2 rounded-full border-2 border-white bg-red-800 shadow lg:block"
        />
        <div className="flex items-start justify-between gap-3">
          <span
            aria-hidden="true"
            style={{
              backgroundColor: `rgb(255 90 54 / ${0.06 + level * 0.04})`,
            }}
            className="grid size-12 shrink-0 place-items-center rounded-xl text-red-800 shadow-sm"
          >
            <Icon className="size-6" />
          </span>
          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-800 ring-1 ring-inset ring-red-800/25">
            {age}
          </span>
        </div>

        <h3 className="mt-5 text-xl font-extrabold tracking-tight text-zinc-900">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          {description}
        </p>

        <ul role="list" className="mt-4 flex flex-wrap gap-1.5">
          {tools.map((tool) => (
            <li
              key={tool}
              className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700"
            >
              {tool}
            </li>
          ))}
        </ul>

        <div className="mt-auto space-y-3 border-t border-dashed border-zinc-200 pt-4">
          <p className="pt-1 text-sm text-zinc-600">
            <span className="font-semibold text-zinc-900">Best for: </span>
            {bestFor}
          </p>
          <LevelMeter level={level} />
          <a
            href="#trial"
            aria-label={`Book a trial for ${title}`}
            className={cn(
              "group/cta inline-flex items-center gap-1.5 rounded-md text-sm font-bold text-red-800",
              "hover:text-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800 focus-visible:ring-offset-2",
            )}
          >
            Try this level
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform motion-safe:group-hover/cta:translate-x-1"
            />
          </a>
        </div>
      </article>
    </motion.li>
  );
}
