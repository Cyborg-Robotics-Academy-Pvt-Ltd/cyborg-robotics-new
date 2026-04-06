"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Play } from "lucide-react";
import { createStaggerContainer, fadeUpVariants } from "./motion";
import type { Course } from "./types";

interface Props {
  courses: Course[];
}

// ── Video Placeholder ────────────────────────────────────────────────────────
// Replace `thumbnailUrl` with a real thumbnail per course.
// Replace the modal src with the actual video embed URL (YouTube/Vimeo).
const VideoPlaceholder = ({
  thumbnailUrl,
  videoSrc,
  accentColor,
  bg,
}: {
  thumbnailUrl?: string;
  videoSrc?: string;
  accentColor: string;
  bg: string;
}) => {
  const [playing, setPlaying] = useState(false);

  if (playing && videoSrc) {
    return (
      <div className="h-[190px] w-full overflow-hidden">
        <iframe
          src={videoSrc}
          className="h-full w-full"
          allow="autoplay; fullscreen"
          allowFullScreen
          title="Course preview"
        />
      </div>
    );
  }

  return (
    <div
      className="group relative h-[190px] w-full cursor-pointer overflow-hidden"
      style={{ background: thumbnailUrl ? undefined : bg }}
      onClick={() => videoSrc && setPlaying(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && videoSrc && setPlaying(true)}
      aria-label="Play course preview"
    >
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt="Course preview thumbnail"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        // Gradient placeholder when no thumbnail is available
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: `linear-gradient(135deg, ${bg} 0%, ${accentColor}22 100%)`,
          }}
        />
      )}

      {/* Dark overlay on hover */}
      <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />

      {/* Play button */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/80 bg-white/20 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30"
          style={{ boxShadow: `0 8px 32px ${accentColor}55` }}
        >
          <Play size={18} className="ml-0.5 text-white" fill="white" />
        </div>
        <span className="rounded-full bg-black/30 px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.1em] text-white/80 backdrop-blur-sm">
          {videoSrc ? "Watch Preview" : "Video Coming Soon"}
        </span>
      </div>
    </div>
  );
};

// ── Main Section ─────────────────────────────────────────────────────────────
const CoursesSection = ({ courses }: Props) => {
  return (
    <motion.section
      className="bg-[#FAFAFA] px-4 py-16 sm:px-6"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={createStaggerContainer(0.12)}
    >
      <div className="mx-auto max-w-[1200px]">
        {/* Section header */}
        <motion.div variants={fadeUpVariants} className="mb-10 text-center">
          {/* Badge — was font-bold, semibold is enough */}
          <span className="mb-3 inline-block rounded-full border border-[rgba(141,15,17,0.15)] bg-[rgba(141,15,17,0.07)] px-4 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#8D0F11]">
            What They&apos;ll Learn
          </span>
          {/* H2 — keep font-black for hero headings */}
          <h2 className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold  leading-tight text-[#1a1a1a]">
            3 Courses. Real Skills.
            <br />
            <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
              Infinite Curiosity.
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-[480px] text-[13px] font-normal leading-[1.65] text-[#777]">
            Each module is hands-on, project-driven, and designed to spark
            real-world thinking in kids aged 6–16.
          </p>
        </motion.div>

        {/* Course cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {courses.map((course) => (
            <motion.div
              key={course.id}
              variants={fadeUpVariants}
              className={`relative overflow-hidden rounded-2xl border bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] ${
                course.highlight
                  ? "border-[rgba(141,15,17,0.25)] shadow-[0_8px_32px_rgba(141,15,17,0.08)]"
                  : "border-[rgba(0,0,0,0.07)] shadow-[0_2px_16px_rgba(0,0,0,0.04)]"
              }`}
            >
              {/* Top accent bar for highlighted card */}
              {course.highlight && (
                <div className="absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r from-[#8D0F11] to-[#B92423]" />
              )}

              {/* Popular badge — was font-black, semibold */}
              {course.highlight && (
                <div className="absolute right-3 top-4 z-10 rounded-full bg-gradient-to-br from-[#8D0F11] to-[#B92423] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-white shadow-[0_4px_12px_rgba(141,15,17,0.35)]">
                  Most Popular
                </div>
              )}

              {/* Video area — replaces emoji/image */}
              <VideoPlaceholder
                thumbnailUrl={course.thumbnailUrl} // add `thumbnailUrl?: string` to Course type
                videoSrc={course.videoSrc} // add `videoSrc?: string` to Course type
                accentColor={course.color}
                bg={course.bg}
              />

              {/* Card body */}
              <div className="p-4 sm:p-5">
                {/* Course identity row */}
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
                    style={{ background: course.bg }}
                  >
                    {course.icon}
                  </div>
                  <div>
                    {/* Course name — was font-black, semibold enough at 16px */}
                    <div className="text-[15px] font-semibold leading-tight text-[#1a1a1a]">
                      {course.name}
                    </div>
                    {/* Subtitle — was font-semibold, medium */}
                    <div
                      className="text-[11px] font-medium"
                      style={{ color: course.color }}
                    >
                      {course.subtitle}
                    </div>
                  </div>
                </div>

                {/* Description — font-normal, was inheriting bold chain */}
                <p className="mb-4 text-[12px] font-normal leading-[1.65] text-[#777]">
                  {course.description}
                </p>

                {/* Outcomes */}
                <div className="mb-4 space-y-[5px]">
                  {course.outcomes.map((outcome) => (
                    <div
                      key={outcome}
                      className="flex items-start gap-2 text-[12px] font-normal text-[#555]"
                    >
                      <CheckCircle2
                        size={12}
                        style={{ color: course.color }}
                        className="mt-px shrink-0"
                      />
                      {outcome}
                    </div>
                  ))}
                </div>

                {/* Footer row */}
                <div className="flex items-center justify-between border-t border-[rgba(0,0,0,0.05)] pt-3">
                  {/* Duration — was font-medium, normal */}
                  <span className="text-[11px] font-normal text-[#aaa]">
                    ⏱ {course.duration}
                  </span>
                  {/* Age group badge — was font-bold, medium */}
                  <span
                    className="rounded-lg px-2.5 py-1 text-[11px] font-medium"
                    style={{ background: course.bg, color: course.color }}
                  >
                    {course.ageGroup}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default CoursesSection;
