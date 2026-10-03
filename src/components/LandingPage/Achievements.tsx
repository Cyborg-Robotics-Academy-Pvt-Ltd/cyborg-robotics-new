"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  Globe,
  Flag,
  Medal,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils";

interface Scope {
  readonly id: string;
  readonly label: string;
  readonly icon: LucideIcon;
}

interface Achievement {
  readonly id: string;
  readonly label: string;
  readonly icon: LucideIcon;
}

interface GalleryPhoto {
  readonly src: string;
  readonly alt: string;
}

const CONTENT = {
  kicker: "Beyond the classroom",
  title: "For students who want to go further.",
  highlight: "go further",
  description:
    "Students can progress from structured learning to advanced projects, competitions and national & international exposure.",
} as const;

const COMPETITIONS = {
  title: "Competitions & Exposure",
  description:
    "Showcase verified Cyborg participation and achievements across robotics and coding competitions.",
  events: ["WRO", "IRO", "FTC"],
  scopes: [
    { id: "national", label: "National Events", icon: Flag },
    { id: "international", label: "International Events", icon: Globe },
  ] as readonly Scope[],
} as const;

const AWARDS = {
  title: "Awards & Recognition",
  description:
    "Use actual certificates, trophies, student photographs and short achievement stories to demonstrate the journey.",
  items: [
    { id: "student", label: "Student Awards", icon: Medal },
    { id: "team", label: "Team Achievements", icon: Users },
    { id: "international", label: "International Exposure", icon: Globe },
  ] as readonly Achievement[],
} as const;

/**
 * Add real certificate / trophy photos here. The gallery is hidden while empty.
 * e.g. { src: "/images/awards/wro-trophy.jpg", alt: "Team holding the WRO trophy" }
 */
const GALLERY: readonly GalleryPhoto[] = [];

export default function CompetitionsAwards() {
  const reduceMotion = useReducedMotion();

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduceMotion ? 0 : 0.12 } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.4, ease: "easeOut" },
    },
  };

  return (
    <section
      id="achievements"
      aria-labelledby="achievements-heading"
      className="relative scroll-mt-28 overflow-hidden bg-zinc-50 py-16 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background-image:radial-gradient(#d4d4d8_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_25%,transparent_75%)]"
      />

      <div className="relative mx-auto max-w-[1180px] px-6">
        <SectionHeader id="achievements-heading" {...CONTENT} />

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid gap-6 lg:grid-cols-2"
        >
          {/* Competitions */}
          <motion.article
            variants={item}
            className="flex flex-col rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm sm:p-10"
          >
            <CardHeading
              icon={Trophy}
              title={COMPETITIONS.title}
              description={COMPETITIONS.description}
            />

            <ul role="list" className="mt-8 grid grid-cols-3 gap-3">
              {COMPETITIONS.events.map((event) => (
                <li
                  key={event}
                  className={cn(
                    "group grid aspect-[4/3] place-items-center rounded-2xl border border-zinc-200 bg-zinc-50",
                    "transition-[transform,background-color,border-color,box-shadow] duration-300",
                    "hover:border-[#ff5a36]/40 hover:bg-orange-50 hover:shadow-md motion-safe:hover:-translate-y-1",
                  )}
                >
                  <span className="text-2xl font-black tracking-tight text-zinc-500 transition-colors group-hover:text-[#d63a17] sm:text-3xl">
                    {event}
                  </span>
                </li>
              ))}
            </ul>

            <ul role="list" className="mt-6 flex flex-wrap gap-2">
              {COMPETITIONS.scopes.map(({ id, label, icon: Icon }) => (
                <li
                  key={id}
                  className="inline-flex items-center gap-2 rounded-full border border-[#ff5a36]/25 bg-orange-50 px-4 py-2 text-sm font-semibold text-[#d63a17]"
                >
                  <Icon aria-hidden="true" className="size-4" />
                  {label}
                </li>
              ))}
            </ul>
          </motion.article>

          {/* Awards */}
          <motion.article
            variants={item}
            className="flex flex-col rounded-3xl border border-zinc-200 bg-gradient-to-br from-white to-orange-50 p-8 shadow-sm sm:p-10"
          >
            <CardHeading
              icon={Medal}
              title={AWARDS.title}
              description={AWARDS.description}
            />

            <ul role="list" className="mt-8 grid gap-3">
              {AWARDS.items.map(({ id, label, icon: Icon }) => (
                <li
                  key={id}
                  className={cn(
                    "group flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4",
                    "transition-[transform,border-color,box-shadow] duration-300",
                    "hover:border-[#ff5a36]/40 hover:shadow-md motion-safe:hover:translate-x-1",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#ff5a36]/10 text-[#d63a17] transition-colors group-hover:bg-[#d63a17] group-hover:text-white"
                  >
                    <Icon className="size-5" />
                  </span>
                  <span className="font-bold text-zinc-900">{label}</span>
                </li>
              ))}
            </ul>

            {GALLERY.length > 0 && (
              <ul
                role="list"
                aria-label="Award and certificate photos"
                className="mt-6 grid grid-cols-3 gap-3"
              >
                {GALLERY.map((photo) => (
                  <li
                    key={photo.src}
                    className="relative aspect-square overflow-hidden rounded-2xl border border-zinc-200 bg-orange-100"
                  >
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(min-width: 1024px) 160px, 30vw"
                      className="object-cover transition-transform duration-500 motion-safe:hover:scale-105"
                    />
                  </li>
                ))}
              </ul>
            )}
          </motion.article>
        </motion.div>
      </div>
    </section>
  );
}

function CardHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div>
      <span
        aria-hidden="true"
        className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-[#d63a17] to-[#e8431f] text-white shadow-lg shadow-[#ff5a36]/30"
      >
        <Icon className="size-7" />
      </span>
      <h3 className="mt-6 text-2xl font-extrabold tracking-tight text-zinc-900">
        {title}
      </h3>
      <p className="mt-2 max-w-[48ch] leading-relaxed text-zinc-600">
        {description}
      </p>
    </div>
  );
}
