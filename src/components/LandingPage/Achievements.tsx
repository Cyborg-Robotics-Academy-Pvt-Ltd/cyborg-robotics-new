"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Pause, Play, Trophy, type LucideIcon } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils";

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
  events: [
    {
      id: "wro",
      label: "World Robot Olympiad",
      logo: "/assets/events/wro.png",
      logoClass: "bg-white",
    },
    {
      id: "iro",
      label: "Indian Robotics Olympiad",
      logo: "/assets/awards/IRO.png",
      logoClass: "bg-white",
    },
    {
      id: "ftc",
      label: "FIRST Tech Challenge",
      logo: "https://www.firstinspires.org/hubfs/web/design/first-web/Branding/Primaries/Logo%20Primary.svg",
      logoClass: "bg-white",
    },
    {
      id: "wsro",
      label: "World Robotics Olympiad",
      logo: "/assets/events/WSRO.png",
      logoClass: "bg-white",
    },
    {
      id: "robotex",
      label: "Robotex",
      logo: "/assets/events/robotex.png",
      logoClass: "bg-white",
    },
  ],
} as const;

const ACHIEVEMENT_REEL_URL =
  "https://res.cloudinary.com/dqiarwxml/video/upload/v1791711510/IMG_6785_1_uk1nqk.mp4";

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
          className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2"
        >
          {/* Competitions */}
          <motion.article
            variants={item}
            className="flex w-full min-w-0 flex-col rounded-3xl bg-white p-5 shadow-sm sm:p-8 lg:p-10"
          >
            <CardHeading
              icon={Trophy}
              title={COMPETITIONS.title}
              description={COMPETITIONS.description}
            />

            <div className="mt-8 min-w-0 overflow-hidden rounded-2xl bg-white p-2">
              <motion.div
                className="flex w-max items-center gap-3"
                animate={{ x: ["0%", "-50%"] }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 24,
                  ease: "linear",
                }}
              >
                {[...COMPETITIONS.events, ...COMPETITIONS.events].map(
                  ({ id, label, logo, logoClass }, index) => (
                    <div
                      key={`${id}-${index}`}
                      className={cn(
                        "group grid h-24 w-32 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white",
                        "transition-[transform,background-color,box-shadow] duration-300",
                        "hover:bg-orange-50 hover:shadow-md motion-safe:hover:-translate-y-1",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-full place-items-center rounded-xl p-3",
                          logoClass,
                        )}
                      >
                        <Image
                          src={logo}
                          alt={`${label} logo`}
                          width={160}
                          height={96}
                          sizes="(min-width: 1024px) 160px, 30vw"
                          className="max-h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                      </span>
                    </div>
                  ),
                )}
              </motion.div>
            </div>
          </motion.article>

          <motion.div
            variants={item}
            className="flex w-full min-w-0 items-center justify-center"
          >
            <AchievementReel />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function AchievementReel() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackError, setPlaybackError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.muted = false;
          video.play().catch(() => setIsPlaying(false));
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(video);
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, []);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {
        setIsPlaying(false);
        setPlaybackError(true);
      });
    } else {
      video.pause();
    }
  };

  const formatTime = (seconds: number) => {
    const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = Math.floor(safeSeconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative mx-auto aspect-[9/16] w-[min(100%,18rem)] min-w-0 overflow-hidden rounded-2xl bg-black shadow-lg">
      <video
        ref={videoRef}
        src={ACHIEVEMENT_REEL_URL}
        className="absolute inset-0 size-full object-cover"
        aria-label="Cyborg Robotics achievement reel"
        playsInline
        loop
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) =>
          setCurrentTime(event.currentTarget.currentTime)
        }
        onError={() => setPlaybackError(true)}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/40"
      />

      <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 px-3 py-3 text-xs font-semibold text-white">
        <span className="flex items-center gap-2">
          <Image
            src="/cyborglogo.png"
            alt=""
            width={28}
            height={28}
            className="size-7 rounded-full object-cover"
          />
          Cyborg Robotics
        </span>
        <span>{formatTime(duration - currentTime)}</span>
      </div>

      <button
        type="button"
        onClick={togglePlayback}
        aria-label={
          isPlaying ? "Pause achievement reel" : "Play achievement reel"
        }
        className="absolute left-1/2 top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/50 bg-black/40 text-white backdrop-blur-sm"
      >
        {isPlaying ? (
          <Pause aria-hidden="true" className="size-5 fill-white" />
        ) : (
          <Play aria-hidden="true" className="size-5 fill-white" />
        )}
      </button>

      <div className="absolute inset-x-3 bottom-3 flex items-center gap-2">
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={
            isPlaying ? "Pause achievement reel" : "Play achievement reel"
          }
          className="text-white"
        >
          {isPlaying ? (
            <Pause aria-hidden="true" className="size-4 fill-white" />
          ) : (
            <Play aria-hidden="true" className="size-4 fill-white" />
          )}
        </button>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Math.min(currentTime, duration || 0)}
          onChange={(event) => {
            const video = videoRef.current;
            if (!video) return;
            video.currentTime = Number(event.currentTarget.value);
          }}
          aria-label="Seek through achievement reel"
          className="h-1 min-w-0 flex-1 cursor-pointer accent-[#ff5a36]"
        />
      </div>

      {playbackError && (
        <p
          role="alert"
          className="absolute inset-x-3 bottom-10 rounded-lg bg-black/70 p-2 text-center text-xs text-white"
        >
          The reel could not be played.
        </p>
      )}
    </div>
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
