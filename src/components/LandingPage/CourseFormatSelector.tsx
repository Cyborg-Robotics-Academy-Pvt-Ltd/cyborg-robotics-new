"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import {
  Sparkles,
  Target,
  Users,
  Clock,
  CheckCircle2,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

interface CourseFormat {
  id: string;
  icon: LucideIcon;
  title: string;
  duration: string;
  ratio: string;
  description: string;
  benefits: string[];
  ctaLabel: string;
  recommended?: boolean;
  illustrationSrc?: string;
  illustrationAlt?: string;
}

interface CourseFormatSelectorProps {
  badgeLabel?: string;
  headingPrefix?: string;
  headingAccent?: string;
  headingSuffix?: string;
  subtitle?: string;
  formats?: CourseFormat[];
  onSelect?: (id: string) => void;
}

function FormatBenefits({
  benefits,
  accentColorClass,
}: {
  benefits: string[];
  accentColorClass: string;
}) {
  return (
    <ul className="space-y-3" role="list">
      {benefits.map((benefit) => (
        <li
          key={benefit}
          className="flex items-start gap-2.5 text-sm text-slate-600"
        >
          <CheckCircle2
            className={`mt-0.5 h-4 w-4 shrink-0 ${accentColorClass}`}
            aria-hidden="true"
          />
          <span>{benefit}</span>
        </li>
      ))}
    </ul>
  );
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function CourseFormatCard({
  format,
  onSelect,
}: {
  format: CourseFormat;
  onSelect?: (id: string) => void;
}) {
  const {
    id,
    icon: Icon,
    title,
    duration,
    ratio,
    description,
    benefits,
    ctaLabel,
    recommended,
    illustrationSrc,
    illustrationAlt,
  } = format;

  const accent = recommended
    ? {
        iconBg: "bg-red-50",
        iconColor: "text-red-500",
        pillBorder: "border-red-200",
        pillText: "text-red-600",
        divider: "bg-red-500",
        check: "text-red-500",
        cta: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800",
        cardBorder: "border-red-100",
        ring: "focus-visible:ring-red-400",
        glow: "hover:shadow-red-100/70",
      }
    : {
        iconBg: "bg-indigo-50",
        iconColor: "text-indigo-600",
        pillBorder: "border-slate-200",
        pillText: "text-slate-600",
        divider: "bg-indigo-500",
        check: "text-indigo-500",
        cta: "bg-slate-900 hover:bg-slate-800",
        cardBorder: "border-slate-200",
        ring: "focus-visible:ring-slate-500",
        glow: "hover:shadow-slate-200/70",
      };

  return (
    <motion.article
      variants={cardVariants}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={`group relative flex flex-col overflow-hidden rounded-[24px] border ${accent.cardBorder} bg-white p-6 shadow-lg shadow-slate-200/40 transition-shadow duration-300 hover:shadow-2xl ${accent.glow} sm:p-8`}
      aria-labelledby={`${id}-title`}
    >
      {recommended && (
        <div
          className="absolute -right-12 top-6 w-40 rotate-45 bg-gradient-to-r from-red-500 to-rose-500 py-1 text-center text-[11px] font-bold tracking-wider text-white shadow-md"
          aria-hidden="true"
        >
          RECOMMENDED
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${accent.iconBg}`}
        >
          <Icon className={`h-7 w-7 ${accent.iconColor}`} aria-hidden="true" />
        </div>
        {illustrationSrc && (
          <div className="hidden absolute right-4 -top-1 h-54 w-72 shrink-0 transition-transform duration-300 group-hover:scale-105 sm:block">
            <Image
              src={illustrationSrc}
              alt={illustrationAlt ?? ""}
              width={160}
              height={120}
              className="h-full w-full object-contain"
            />
          </div>
        )}
      </div>

      <h3 id={`${id}-title`} className="mt-5 text-2xl font-bold text-slate-900">
        {title}
        {recommended && <span className="sr-only"> (Recommended)</span>}
      </h3>

      <div className="mt-3 flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border ${accent.pillBorder} px-3 py-1 text-xs font-semibold ${accent.pillText}`}
        >
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {duration}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border ${accent.pillBorder} px-3 py-1 text-xs font-semibold ${accent.pillText}`}
        >
          <Users className="h-3.5 w-3.5" aria-hidden="true" />
          {ratio}
        </span>
      </div>

      <div
        className={`mt-4 h-1 w-10 rounded-full ${accent.divider}`}
        aria-hidden="true"
      />

      <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
        {description}
      </p>

      <hr className="my-6 border-slate-100" />

      <FormatBenefits benefits={benefits} accentColorClass={accent.check} />

      <button
        type="button"
        onClick={() => onSelect?.(id)}
        className={`group/cta mt-8 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition-all duration-300 ${accent.cta} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${accent.ring}`}
      >
        {ctaLabel}
        <ArrowRight
          className="h-4 w-4 transition-transform duration-300 group-hover/cta:translate-x-1"
          aria-hidden="true"
        />
      </button>
    </motion.article>
  );
}

const defaultFormats: CourseFormat[] = [
  {
    id: "group-class",
    icon: Users,
    title: "Group Class",
    duration: "60 MINUTES",
    ratio: "1 : MANY",
    description:
      "Live interactive class with a small batch of peers — great for kids who enjoy learning alongside others and thrive on friendly competition.",
    benefits: [
      "Small batch size (max 6–8 students)",
      "Peer interaction & group projects",
      "Fixed weekly schedule",
      "Most cost-effective option",
    ],
    ctaLabel: "Choose Group Class",
    illustrationSrc: "/group-class.png",
    illustrationAlt:
      "Illustration of students learning together in a group video call",
  },
  {
    id: "private-class",
    icon: Target,
    title: "1:1 Private Class",
    duration: "45 MINUTES",
    ratio: "1 : 1",
    description:
      "A dedicated mentor works with your child alone — fully paced to their learning speed, with flexible rescheduling.",
    benefits: [
      "100% personalized attention",
      "Flexible scheduling, reschedule anytime",
      "Faster progress tracking",
      "Ideal for focused skill-building",
    ],
    ctaLabel: "Choose 1:1 Class",
    recommended: true,
    illustrationSrc: "/private-class.png",
    illustrationAlt:
      "Illustration of a student in a one-on-one video call with a mentor",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

const headingVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function CourseFormatSelector({
  badgeLabel = "CHOOSE YOUR FORMAT",
  headingPrefix = "Two",
  headingAccent = "ways",
  headingSuffix = "to learn online",
  subtitle = "Every course is available in both formats — pick what suits your child's pace and your schedule.",
  formats = defaultFormats,
  onSelect,
}: CourseFormatSelectorProps) {
  return (
    <section
      className="relative overflow-hidden bg-white px-4 py-20 sm:px-6 lg:px-8"
      aria-labelledby="format-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_15%_10%,rgba(129,140,248,0.12),transparent),radial-gradient(50%_40%_at_85%_15%,rgba(244,114,182,0.10),transparent)]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-[1100px]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={headingVariants}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-xs font-bold tracking-wider text-red-600">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {badgeLabel}
          </span>

          <h2
            id="format-heading"
            className="mt-5 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl"
          >
            {headingPrefix}{" "}
            <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
              {headingAccent}
            </span>{" "}
            {headingSuffix}
          </h2>

          <p className="mt-4 text-base text-slate-500 sm:text-lg">{subtitle}</p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2"
        >
          {formats.map((format) => (
            <CourseFormatCard
              key={format.id}
              format={format}
              onSelect={onSelect}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
