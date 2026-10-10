"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  CalendarCheck,
  ClipboardCheck,
  MessageCircleHeart,
  Route,
  Bot,
  type LucideIcon,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils";

interface ProcessStep {
  readonly id: string;
  readonly title: string;
  readonly icon: LucideIcon;
}

const CONTENT = {
  kicker: "Simple process",
  title: "You don't have to choose the course today.",
  highlight: "course today",
  description: "We make the first decision easy.",
} as const;

const STEPS: readonly ProcessStep[] = [
  { id: "trial", title: "Book Free Trial", icon: CalendarCheck },
  { id: "experience", title: "Experience Robotics", icon: Bot },
  { id: "assessment", title: "Child Assessment", icon: ClipboardCheck },
  { id: "counselling", title: "Parent Counselling", icon: MessageCircleHeart },
  { id: "path", title: "Choose the Learning Path", icon: Route },
];

export default function TrialProcess() {
  const reduceMotion = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduceMotion ? 0 : 0.12 } },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.4, ease: "easeOut" },
    },
  };

  const drawX: Variants = {
    hidden: { scaleX: reduceMotion ? 1 : 0 },
    show: {
      scaleX: 1,
      transition: { duration: reduceMotion ? 0 : 1.2, ease: "easeInOut" },
    },
  };

  const drawY: Variants = {
    hidden: { scaleY: reduceMotion ? 1 : 0 },
    show: {
      scaleY: 1,
      transition: { duration: reduceMotion ? 0 : 1.2, ease: "easeInOut" },
    },
  };

  return (
    <section
      id="process"
      aria-labelledby="process-heading"
      className="relative scroll-mt-28 overflow-hidden bg-white py-16 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-[48rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff5a36]/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-[1180px] px-6">
        <SectionHeader id="process-heading" {...CONTENT} />

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="relative"
        >
          {/* Connecting line: vertical on mobile */}
          <span
            aria-hidden="true"
            className="absolute bottom-7 left-7 top-7 w-0.5 -translate-x-1/2 bg-zinc-200 lg:hidden"
          >
            <motion.span
              variants={drawY}
              className="block h-full origin-top bg-red-800"
            />
          </span>

          {/* Connecting line: horizontal on desktop */}
          <span
            aria-hidden="true"
            className="absolute left-[10%] right-[10%] top-7 hidden h-0.5 -translate-y-1/2 bg-zinc-200 lg:block"
          >
            <motion.span
              variants={drawX}
              className="block h-full origin-left bg-red-800"
            />
          </span>

          <ol role="list" className="grid gap-6 lg:grid-cols-5 lg:gap-4">
            {STEPS.map(({ id, title, icon: Icon }, index) => {
              const isLast = index === STEPS.length - 1;
              return (
                <motion.li
                  key={id}
                  variants={item}
                  className="relative flex items-center gap-5 lg:flex-col lg:gap-4 lg:text-center"
                >
                  <span
                    className={cn(
                      "relative z-10 grid size-14 shrink-0 place-items-center rounded-full border-2 ring-8 ring-white",
                      isLast
                        ? "border-transparent bg-gradient-to-br from-red-600 to-red-800 text-white shadow-lg shadow-[#ff5a36]/30"
                        : "border-red-800 bg-white text-red-800",
                    )}
                  >
                    <Icon aria-hidden="true" className="size-6" />
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute -right-1 -top-1 grid size-6 place-items-center rounded-full text-xs font-bold ring-2 ring-white",
                        isLast
                          ? "bg-white text-red-800"
                          : "bg-red-800 text-white",
                      )}
                    >
                      {index + 1}
                    </span>
                  </span>

                  <div
                    className={cn(
                      "flex-1 rounded-2xl border p-4 text-left shadow-sm lg:w-full lg:flex-none lg:text-center",
                      "transition-[transform,box-shadow,border-color] duration-300",
                      "hover:shadow-lg motion-safe:hover:-translate-y-1",
                      isLast
                        ? "border-red-800/40 bg-orange-50"
                        : "border-zinc-200 bg-white hover:border-red-800/40",
                    )}
                  >
                    <span className="sr-only">Step {index + 1}: </span>
                    <h3 className="font-bold leading-snug tracking-tight text-zinc-900">
                      {title}
                    </h3>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </motion.div>
      </div>
    </section>
  );
}
