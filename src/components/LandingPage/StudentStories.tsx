"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  Play,
  Quote,
  Sparkles,
  Trophy,
  Rocket,
  X,
  type LucideIcon,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils";

interface Story {
  readonly id: string;
  readonly title: string;
  readonly journey: readonly string[];
  readonly quote: string;
  readonly icon: LucideIcon;
  /** Real photo, e.g. "/images/stories/journey-01.jpg" */
  readonly poster?: string;
  readonly posterAlt?: string;
  /** Video URL (mp4/webm). Play button only renders when set. */
  readonly videoSrc?: string;
}

const CONTENT = {
  kicker: "Real student journeys",
  title: "Don't just take our word for it.",
  highlight: "our word",
  description: "See their journey.",
} as const;

const STORIES: readonly Story[] = [
  {
    id: "journey-01",
    title: "Student Journey 01",
    journey: [
      "Beginner",
      "Robotics + Coding",
      "Projects",
      "Competition / Award",
    ],
    quote:
      "We could actually see the change in confidence and problem solving.",
    icon: Trophy,
  },
  {
    id: "journey-02",
    title: "Student Journey 02",
    journey: [
      "Curious learner",
      "Advanced robotics",
      "National / International exposure",
    ],
    quote:
      "What started as an activity became something our child genuinely loved.",
    icon: Sparkles,
  },
  {
    id: "journey-03",
    title: "Student Journey 03",
    journey: [
      "No prior experience",
      "Coding + Robotics",
      "Independent project",
    ],
    quote:
      "The trainers understood the child's level and guided the next step.",
    icon: Rocket,
  },
];

export default function StudentStories() {
  const reduceMotion = useReducedMotion();
  const [playing, setPlaying] = useState<Story | null>(null);

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
      id="stories"
      aria-labelledby="stories-heading"
      className="relative scroll-mt-28 overflow-hidden bg-white py-16 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 top-24 size-96 rounded-full bg-[#ff5a36]/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-[1180px] px-6">
        <SectionHeader id="stories-heading" {...CONTENT} />

        <motion.ul
          role="list"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid gap-6 md:grid-cols-3"
        >
          {STORIES.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              variants={item}
              onPlay={() => setPlaying(story)}
            />
          ))}
        </motion.ul>
      </div>

      <VideoModal story={playing} onClose={() => setPlaying(null)} />
    </section>
  );
}

function StoryCard({
  story,
  variants,
  onPlay,
}: {
  story: Story;
  variants: Variants;
  onPlay: () => void;
}) {
  const {
    title,
    journey,
    quote,
    icon: Icon,
    poster,
    posterAlt,
    videoSrc,
  } = story;

  return (
    <motion.li variants={variants} className="flex">
      <article
        className={cn(
          "group flex w-full flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm",
          "transition-[transform,box-shadow,border-color] duration-300",
          "hover:border-[#ff5a36]/40 hover:shadow-xl motion-safe:hover:-translate-y-1.5",
        )}
      >
        {/* Media */}
        <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-orange-50 to-[#ff5a36]/15">
          {poster ? (
            <Image
              src={poster}
              alt={posterAlt ?? `${title} student at Cyborg Robotics Academy`}
              fill
              sizes="(min-width: 1180px) 380px, (min-width: 768px) 33vw, 100vw"
              className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
            />
          ) : (
            <Icon
              aria-hidden="true"
              strokeWidth={1}
              className="absolute -bottom-6 -right-4 size-40 text-[#ff5a36]/20"
            />
          )}

          {videoSrc && (
            <button
              type="button"
              onClick={onPlay}
              aria-label={`Play video: ${title}`}
              className="absolute inset-0 grid place-items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d63a17]"
            >
              <span className="grid size-16 place-items-center rounded-full bg-white/95 text-[#d63a17] shadow-lg transition-transform motion-safe:group-hover:scale-110">
                <Play aria-hidden="true" className="ml-1 size-7 fill-current" />
              </span>
            </button>
          )}
        </div>

        <div className="flex flex-1 flex-col p-6">
          <h3 className="text-xl font-extrabold tracking-tight text-zinc-900">
            {title}
          </h3>

          {/* Journey path */}
          <p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#d63a17]">
            Journey
          </p>
          <ol role="list" className="mt-3">
            {journey.map((step, i) => {
              const last = i === journey.length - 1;
              return (
                <li key={step} className="relative flex gap-3 pb-3 last:pb-0">
                  {!last && (
                    <span
                      aria-hidden="true"
                      className="absolute left-[5px] top-4 h-full w-px bg-[#ff5a36]/30"
                    />
                  )}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative mt-1.5 size-3 shrink-0 rounded-full border-2 border-[#ff5a36]",
                      last ? "bg-[#d63a17]" : "bg-white",
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm",
                      last ? "font-bold text-zinc-900" : "text-zinc-600",
                    )}
                  >
                    {step}
                  </span>
                </li>
              );
            })}
          </ol>

          {/* Testimonial */}
          <figure className="mt-6 flex-1 rounded-2xl bg-orange-50/70 p-4">
            <Quote aria-hidden="true" className="size-5 text-[#d63a17]" />
            <blockquote className="mt-2 font-semibold leading-relaxed text-zinc-800">
              {quote}
            </blockquote>
            <figcaption className="mt-3 text-sm text-zinc-600">
              Parent testimonial
            </figcaption>
          </figure>
        </div>
      </article>
    </motion.li>
  );
}

function VideoModal({
  story,
  onClose,
}: {
  story: Story | null;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (story && !dialog.open) dialog.showModal();
    if (!story && dialog.open) dialog.close();
  }, [story]);

  return (
    <dialog
      ref={ref}
      aria-label={story ? `${story.title} video` : "Video"}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-auto w-[min(92vw,900px)] overflow-hidden rounded-2xl bg-black p-0 backdrop:bg-black/70"
    >
      {story?.videoSrc && (
        <div className="relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close video"
            className="absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-full bg-white/90 text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d63a17]"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
          <video
            src={story.videoSrc}
            poster={story.poster}
            controls
            autoPlay
            playsInline
            className="aspect-video w-full"
          />
        </div>
      )}
    </dialog>
  );
}
