"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  Check,
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
  /** Attribution, e.g. "Priya S., Arjun's mother". Falls back to "Parent testimonial". */
  readonly parent?: string;
  readonly icon: LucideIcon;
  /** Short proof-point badge shown on the photo, e.g. "Competition Winner" */
  readonly outcome?: string;
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

const PARENT_TESTIMONIALS: Readonly<Record<string, string>> = {
  "journey-01": " Samar's Mother",
  "journey-02": " Livia's Father",
  "journey-03": " Avani's Mother",
};

const STORIES: readonly Story[] = [
  {
    id: "journey-01",
    title: "Samar's journey",
    journey: [
      "Beginner",
      "Robotics + Coding",
      "Projects",
      "National Competition Winner",
    ],
    quote:
      "We could actually see the change in confidence and problem solving.",
    icon: Trophy,
    poster:
      "https://res.cloudinary.com/dqiarwxml/image/upload/f_auto,q_auto/v1791702352/Young_Champion_with_Golden_Trophy_zqkf6i.png",
    outcome: "Competition Winner",
    posterAlt: "Samar holding his first-place robotics competition award",
  },
  {
    id: "journey-02",
    title: "Livia's journey",
    journey: [
      "Curious learner",
      "Advanced robotics",
      "National Competition Winner",
    ],
    outcome: "Competition Winner",
    quote:
      "What started as an activity became something our child genuinely loved.",
    icon: Sparkles,
    poster: "/assets/competition/livia.png",
    posterAlt: "Livia showcasing her robotics journey",
  },
  {
    id: "journey-03",
    title: "Avani's journey",
    journey: [
      "Curious learner",
      "Advanced robotics",
      "National / International exposure",
    ],
    outcome: "Competition Winner",
    quote:
      "The trainers understood the child's level and guided the next step.",
    icon: Rocket,
    poster:
      "https://res.cloudinary.com/dqiarwxml/image/upload/f_auto,q_auto/v1791702707/Young_Robotics_Champion_with_Trophy_vvbqgi.png",
    posterAlt: "Avani developing confidence through robotics learning",
  },
];

export default function StudentStories() {
  const reduceMotion = useReducedMotion();
  const [playing, setPlaying] = useState<Story | null>(null);
  const stories = useMemo(() => {
    return STORIES.map((story) => ({
      ...story,
      parent: story.parent ?? PARENT_TESTIMONIALS[story.id],
    }));
  }, []);

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
        className="pointer-events-none absolute -right-24 top-24 size-96 rounded-full bg-red-700/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 bottom-10 size-80 rounded-full bg-[#C9993A]/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-[1180px] px-6">
        <SectionHeader id="stories-heading" {...CONTENT} />

        <motion.ul
          role="list"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {stories.map((story) => (
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
    parent,
    icon: Icon,
    outcome,
    poster,
    posterAlt,
    videoSrc,
  } = story;

  return (
    <motion.li variants={variants} className="flex">
      <article
        className={cn(
          "group relative flex w-full flex-col overflow-hidden rounded-3xl border border-red-700/15 bg-white shadow-sm",
          "transition-[transform,box-shadow,border-color] duration-300",
          "hover:border-red-700/40 hover:shadow-[0_20px_40px_-12px_rgba(220,38,38,0.35)] motion-safe:hover:-translate-y-1.5",
        )}
      >
        {/* Accent bar that draws in on hover */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 z-20 h-1 origin-left scale-x-0 bg-gradient-to-r from-[#5C1F1E] via-[#8D302F] to-[#C9993A] transition-transform duration-500 group-hover:scale-x-100"
        />

        {/* Media: 4:3 + object-top so the subject isn't cut at the waist */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#FBF1EE] to-[#8D302F]/15">
          {poster ? (
            <Image
              src={poster}
              alt={posterAlt ?? `${title} at Cyborg Robotics Academy`}
              quality={100}
              fill
              sizes="(min-width: 1180px) 380px, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover object-top transition-transform duration-500 motion-safe:group-hover:scale-105"
            />
          ) : (
            <Icon
              aria-hidden="true"
              strokeWidth={1}
              className="absolute -bottom-6 -right-4 size-40 text-red-700"
            />
          )}

          {/* Soft gradient to ease the photo into the card body */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#3A1514]/60 to-transparent"
          />

          {/* Inner hairline so light photos don't bleed into the card edge */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5"
          />

          {outcome && (
            <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#F0CB7A] to-[#C9993A] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#3A1514] shadow ring-1 ring-[#8D302F]/30">
              <Trophy aria-hidden="true" className="size-3 fill-[#8D302F]/25" />
              {outcome}
            </span>
          )}

          {videoSrc && (
            <button
              type="button"
              onClick={onPlay}
              aria-label={`Play video: ${title}`}
              className="absolute inset-0 grid place-items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8D302F]"
            >
              <span className="relative grid size-16 place-items-center">
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-white/60 motion-safe:group-hover:animate-ping"
                />
                <span className="relative grid size-16 place-items-center rounded-full bg-white/95 text-[#8D302F] shadow-lg transition-transform motion-safe:group-hover:scale-110">
                  <Play
                    aria-hidden="true"
                    className="ml-1 size-7 fill-current"
                  />
                </span>
              </span>
            </button>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          {/* Title row: story icon chip fills the otherwise unused `icon` data */}
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl font-extrabold tracking-tight text-[#3A1514]">
              {title}
            </h3>
            <span
              aria-hidden="true"
              className="grid size-8 shrink-0 place-items-center rounded-full bg-red-800 text-[#F0CB7A]"
            >
              <Icon className="size-4" />
            </span>
          </div>

          {/* Journey: compact horizontal stepper */}
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-red-800">
              Journey
            </p>
            <p className="text-xs font-medium text-red-800/70">
              {journey.length} stages
            </p>
          </div>
          <ol
            role="list"
            aria-label={`${title} progress`}
            className="mt-3 flex"
          >
            {journey.map((step, i) => {
              const isCurrent = i === journey.length - 1;
              return (
                <li
                  key={`${i}-${step}`}
                  aria-current={isCurrent ? "step" : undefined}
                  className="relative flex flex-1 flex-col items-center px-1 text-center"
                >
                  {/* Connector to the next step (dot center to dot center) */}
                  {!isCurrent && (
                    <span
                      aria-hidden="true"
                      className="absolute left-1/2 top-[9px] h-0.5 w-full bg-gradient-to-r from-red-700 to-red-800/50"
                    />
                  )}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative z-10 grid size-5 place-items-center rounded-full border-2",
                      isCurrent
                        ? "border-[#C9993A] bg-[#C9993A] ring-4 ring-[#C9993A]/30"
                        : "border-[#8D302F] bg-[#8D302F]",
                    )}
                  >
                    {isCurrent ? (
                      <span className="size-1.5 rounded-full bg-[#3A1514]" />
                    ) : (
                      <Check
                        strokeWidth={3.5}
                        className="size-2.5 text-white"
                      />
                    )}
                  </span>
                  <span
                    className={cn(
                      "mt-2 text-xs leading-tight",
                      isCurrent ? "font-bold text-[#3A1514]" : "text-[#6B4A49]",
                    )}
                  >
                    {step}
                    <span className="sr-only">
                      {isCurrent ? " (current)" : " (completed)"}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>

          {/* Testimonial */}
          <figure className="relative mt-4 flex flex-1 flex-col overflow-hidden rounded-2xl border border-[#8D302F]/15 bg-[#FBF1EE] p-4">
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#C9993A] to-[#8D302F]"
            />
            <span
              aria-hidden="true"
              className="grid size-7 place-items-center rounded-full bg-white text-[#8D302F] shadow-sm ring-1 ring-[#C9993A]/50"
            >
              <Quote className="size-3.5 fill-current" />
            </span>
            <blockquote className="mt-2 flex-1 text-sm font-semibold leading-relaxed text-[#3A1514]">
              {quote}
            </blockquote>
            <figcaption className="mt-3 border-t border-[#8D302F]/20 pt-2 text-xs font-medium text-[#8D302F]">
              — {parent ?? "Parent testimonial"}
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
            className="absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-full bg-white/90 text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8D302F]"
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
