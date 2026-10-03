"use client";

import { motion } from "framer-motion";
import {
  Settings,
  Code2,
  User,
  Lightbulb,
  Monitor,
  LucideIcon,
} from "lucide-react";

interface Criterion {
  num: string;
  icon: LucideIcon;
  title: string;
  desc: string;
}

const CRITERIA: Criterion[] = [
  {
    num: "01",
    icon: Settings,
    title: "Functionality",
    desc: "Does it actually work?",
  },
  {
    num: "02",
    icon: Code2,
    title: "Code Quality",
    desc: "Is the implementation logical and structured?",
  },
  {
    num: "03",
    icon: User,
    title: "User Experience",
    desc: "Is it easy to understand and use?",
  },
  {
    num: "04",
    icon: Lightbulb,
    title: "Problem Solving",
    desc: "Does the solution address the challenge effectively?",
  },
  {
    num: "05",
    icon: Monitor,
    title: "Presentation",
    desc: "Can you explain what you built and why?",
  },
];

function EvaluationCard({
  criterion,
  index,
}: {
  criterion: Criterion;
  index: number;
}) {
  const Icon = criterion.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative min-w-[140px] flex-1"
    >
      <div
        className="
          relative h-full overflow-hidden rounded-xl
          border border-white/60 bg-white/70
          px-3.5 pb-3.5 pt-5
          shadow-[0_1px_2px_rgba(10,31,68,0.04),0_8px_18px_-8px_rgba(10,31,68,0.10)]
          backdrop-blur-xl
          transition-all duration-300 ease-out
          hover:-translate-y-1 hover:border-white hover:bg-white
          hover:shadow-[0_1px_2px_rgba(10,31,68,0.06),0_14px_28px_-10px_rgba(10,31,68,0.16)]
        "
      >
        {/* Number badge */}
        <span
          className="
    absolute -left-1 -top-1 z-10
    flex h-7 w-7 items-center justify-center
    rounded-full
    bg-gradient-to-br from-[#12295C] via-[#0A1F44] to-[#061530]
    text-[10px] font-bold tracking-wide text-white
    shadow-[0_2px_4px_rgba(10,31,68,0.15),0_6px_14px_-2px_rgba(10,31,68,0.35)]
    ring-[3px] ring-white
    before:absolute before:inset-0 before:rounded-full
    before:bg-gradient-to-br before:from-white/25 before:to-transparent
    transition-all duration-300 ease-out
    group-hover:scale-110 group-hover:shadow-[0_2px_6px_rgba(10,31,68,0.2),0_8px_20px_-2px_rgba(255,107,26,0.35)]
  "
        >
          {criterion.num}
        </span>

        {/* Icon chip */}
        <div
          className="
            mb-2.5 mt-4 flex h-8 w-8 items-center justify-center rounded-lg
            bg-gradient-to-br from-[#0A1F44]/10 to-[#2563A8]/20
            ring-1 ring-[#0A1F44]/[0.06]
            transition-colors duration-300 group-hover:from-[#0A1F44]/[0.16] group-hover:to-[#2563A8]/[0.28]
          "
        >
          <Icon
            size={16}
            strokeWidth={1.9}
            className="text-[#0A1F44] transition-transform duration-300 group-hover:scale-110 group-hover:text-[#2563A8]"
          />
        </div>

        {/* Title */}
        <h3 className="text-[11px] font-extrabold uppercase leading-tight tracking-[0.04em] text-[#0A1F44]">
          {criterion.title}
        </h3>

        {/* Underline accent */}
        <div className="mt-1.5 h-[2px] w-5 rounded-full bg-gradient-to-r from-[#FF6B1A] to-[#FF6B1A]/30 transition-all duration-300 group-hover:w-8" />

        {/* Description */}
        <p className="mt-2 text-[11px] leading-[1.4] text-[#64748B]">
          {criterion.desc}
        </p>
      </div>
    </motion.div>
  );
}

export default function Challenge() {
  return (
    <section
      id="challenge"
      className="relative overflow-hidden bg-[#EEF2F8] py-10 sm:py-24 lg:py-12"
    >
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full bg-[#2563A8]/[0.08] blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-[420px] w-[420px] rounded-full bg-[#FF6B1A]/[0.06] blur-[120px]" />
      <div
        className="
          pointer-events-none absolute inset-0
          bg-[linear-gradient(to_right,#0A1F44_1px,transparent_1px),linear-gradient(to_bottom,#0A1F44_1px,transparent_1px)]
          bg-[size:48px_48px] opacity-[0.025]
        "
      />

      <div className="relative mx-auto w-full max-w-[1400px] px-6 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-14">
          {/* LEFT — INTRODUCTION */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="w-full shrink-0 lg:w-[30%]"
          >
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#2563A8]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2563A8]" />
              Evaluation
            </span>

            <h2 className="mt-4 max-w-[360px] text-3xl font-extrabold leading-[1.08] tracking-tight text-[#0A1F44] sm:text-4xl lg:text-[42px]">
              Your solution will be judged from{" "}
              <span className="bg-gradient-to-r from-[#FF6B1A] to-[#FF8A4C] bg-clip-text text-transparent">
                5 angles.
              </span>
            </h2>

            <p className="mt-5 max-w-[330px] text-sm leading-6 text-[#64748B]">
              We look beyond whether the project works. Each submission is
              evaluated on how well you build, solve, explain, and present your
              solution.
            </p>
          </motion.div>

          {/* RIGHT — EVALUATION CARDS */}
          <div className="w-full min-w-0 lg:w-[70%]">
            <div
              className="
                flex gap-4
                overflow-x-auto
                pb-5 pt-3
                [scrollbar-width:thin]
                lg:grid lg:grid-cols-5 lg:gap-5
                lg:overflow-visible lg:pb-0
              "
            >
              {CRITERIA.map((criterion, i) => (
                <EvaluationCard
                  key={criterion.num}
                  criterion={criterion}
                  index={i}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
