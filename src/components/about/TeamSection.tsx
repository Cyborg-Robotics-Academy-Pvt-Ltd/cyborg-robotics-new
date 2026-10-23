"use client";

import React, { useEffect, useRef, useState } from "react";
import { Users, ChevronLeft, ChevronRight, RotateCw, X } from "lucide-react";
import Image from "next/image";
import { A11y, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide, type SwiperRef } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";

// ==============================
// Types
// ==============================
interface TeamMember {
  id: string;
  name: string;
  title: string;
  image: string;
  linkedin?: string;
}

interface TeamCardProps {
  member: TeamMember;
}

// ==============================
// Data
// ==============================
const teamMembers: readonly TeamMember[] = [
  {
    id: "Pratima",
    name: "Ms. Pratima Thakur",
    title: "Program Manager",
    image: "/assets/team/pratima.png",
    linkedin: "https://www.linkedin.com/in/pratimathakur/",
  },
  {
    id: "Shrikant",
    name: "Mr. Shrikant Gaikwad",
    title: "Full Stack Developer & App Developer",
    image: "/assets/team/shrikant.png",
    linkedin: "https://www.linkedin.com/in/shrikant-gaikwad-dev/",
  },
  {
    id: "Mahvish",
    name: "Ms. Mahvish Fatima",
    title: "Aero-Electronics Educator",
    image: "/assets/team/mahvish3.png",
    linkedin: "https://www.linkedin.com/in/mahvish-fatima03/",
  },
  {
    id: "Nilesh",
    name: "Mr. Nilesh Jaiswar",
    title: "Lead 3D Printing | Technologist",
    image: "/assets/team/nilesh.png",
    linkedin: "https://www.linkedin.com/in/nileshjaiswar/",
  },
  {
    id: "Anchal",
    name: "Ms. Anchal Mishra",
    title: "Lead Embedded Systems Educator | Technologist",
    image: "/assets/team/anchal.png",
    linkedin: "https://www.linkedin.com/in/anchalmishra1/",
  },
  {
    id: "Omkar",
    name: "Mr. Omkar Shinde",
    title: "Lead Programming Educator",
    image: "/assets/team/omkar.png",
    linkedin: "https://www.linkedin.com/in/omkarshinde711/",
  },
  {
    id: "Sirjana",
    // Fixed spelling to match her LinkedIn slug ("vishwakarma"); revert if intentional.
    name: "Ms. Sirjana Vishwakarma",
    title: "Lead Educator | Student Success Counsellor",
    image: "/assets/team/sirjana.png",
    linkedin: "https://www.linkedin.com/in/sirjanavishwakarma/",
  },
  {
    id: "Nikita",
    name: "Ms. Nikita Mangale",
    title: "Build-to-Learn Educator",
    image: "/assets/team/nikita.png",
    linkedin: "https://www.linkedin.com/in/nikita-mangale20/",
  },
];

// ==============================
// Shared bits
// ==============================
const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-600 focus-visible:ring-offset-2";

function LinkedInIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

function CustomNavigationButton({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        direction === "prev" ? "Previous team members" : "Next team members"
      }
      className={`absolute top-[40%] z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-red-800 text-white shadow-lg transition-transform duration-300 hover:scale-110 hover:bg-red-900 motion-reduce:transition-none ${FOCUS_RING} ${
        direction === "prev" ? "left-1" : "right-1"
      }`}
    >
      {direction === "prev" ? (
        <ChevronLeft size={20} aria-hidden="true" />
      ) : (
        <ChevronRight size={20} aria-hidden="true" />
      )}
    </button>
  );
}

// ==============================
// TeamCard (flip)
// - Mouse: flips on hover (pointerType === "mouse" only, so touch taps don't double-fire)
// - Touch / keyboard: front is a real <button>; back has a Close button + real <a>
// - Hidden face is `inert` (skipped by Tab and screen readers)
// - Focus moves to the new face on click/keyboard flips; Esc closes
// ==============================
export function TeamCard({ member }: TeamCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const focusTarget = useRef<"front" | "back" | null>(null);

  useEffect(() => {
    // Imperative so it works on React 18 and 19 without `inert` typing issues.
    frontRef.current?.toggleAttribute("inert", isFlipped);
    backRef.current?.toggleAttribute("inert", !isFlipped);

    if (focusTarget.current === "back") {
      closeRef.current?.focus({ preventScroll: true });
    } else if (focusTarget.current === "front") {
      toggleRef.current?.focus({ preventScroll: true });
    }
    focusTarget.current = null;
  }, [isFlipped]);

  const flipByUser = (next: boolean) => {
    focusTarget.current = next ? "back" : "front";
    setIsFlipped(next);
  };

  const handlePointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") setIsFlipped(true);
  };

  const handlePointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    // Don't yank the back face away from someone using the keyboard inside it.
    if (backRef.current?.contains(document.activeElement)) return;
    setIsFlipped(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && isFlipped) {
      e.stopPropagation();
      flipByUser(false);
    }
  };

  return (
    <div className="mx-auto mb-8 h-80 w-[85%] sm:w-[70%] md:w-[90%] lg:w-full">
      <div
        role="group"
        aria-label={member.name}
        className="relative h-full w-full [perspective:1000px]"
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onKeyDown={handleKeyDown}
      >
        <div
          className={`relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none ${
            isFlipped
              ? "[transform:rotateY(180deg)]"
              : "[transform:rotateY(0deg)]"
          }`}
        >
          {/* -------- FRONT -------- */}
          <div
            ref={frontRef}
            className={`absolute inset-0 overflow-hidden rounded-2xl bg-white shadow-xl [backface-visibility:hidden] ${
              isFlipped ? "pointer-events-none" : ""
            }`}
          >
            <div className="relative mx-auto h-60 w-60">
              <Image
                src={member.image}
                alt={`Portrait of ${member.name}`}
                fill
                className="object-cover object-top"
                sizes="240px"
              />
            </div>

            <div className="absolute inset-x-0 bottom-0 h-20 bg-white px-3 py-2">
              <h3 className="mb-0.5 truncate text-base font-extrabold text-gray-900">
                {member.name}
              </h3>
              <p className="line-clamp-2 text-[13px] font-medium leading-4 text-gray-700">
                {member.title}
              </p>
            </div>

            {/* Full-card toggle (sits under the LinkedIn link) */}
            <button
              ref={toggleRef}
              type="button"
              onClick={() => flipByUser(true)}
              className={`absolute inset-0 z-10 rounded-2xl ${FOCUS_RING}`}
            >
              <span className="sr-only">Show details for {member.name}</span>
            </button>

            {/* Flip hint for touch devices only */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-2 right-2 z-10 hidden h-6 w-6 items-center justify-center rounded-full bg-red-800 text-white [@media(hover:none)]:flex"
            >
              <RotateCw size={14} />
            </span>

            {member.linkedin && (
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name} on LinkedIn (opens in new tab)`}
                className={`absolute right-1 top-1 z-20 flex h-11 w-11 items-center justify-center rounded-full text-blue-700 hover:text-blue-900 ${FOCUS_RING}`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md">
                  <LinkedInIcon />
                </span>
              </a>
            )}
          </div>

          {/* -------- BACK -------- */}
          <div
            ref={backRef}
            className={`absolute inset-0 overflow-hidden rounded-2xl shadow-2xl [backface-visibility:hidden] [transform:rotateY(180deg)_translateZ(1px)] ${
              isFlipped ? "" : "pointer-events-none"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-700 via-red-800 to-red-900" />

            <button
              ref={closeRef}
              type="button"
              onClick={() => flipByUser(false)}
              aria-label="Close details"
              className={`absolute right-1 top-1 z-10 flex h-11 w-11 items-center justify-center rounded-full text-white hover:bg-white/15 ${FOCUS_RING}`}
            >
              <X size={20} aria-hidden="true" />
            </button>

            <div className="relative flex h-full flex-col items-center justify-center px-4 py-4 text-white">
              <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/30 bg-white p-2 shadow-lg">
                <Image
                  src="/assets/Cyborg-logo.png"
                  alt="Cyborg Robotics Academy logo"
                  width={100}
                  height={100}
                  className="h-full w-full object-contain"
                />
              </div>

              <h3 className="mb-2 max-w-full px-2 text-center text-lg font-bold">
                {member.name}
              </h3>

              <p className="mb-4 max-w-[90%] rounded-xl border border-white/25 bg-white/15 px-3 py-1 text-center text-xs font-medium text-white">
                {member.title}
              </p>

              {member.linkedin && (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 text-sm font-medium text-white transition-colors hover:bg-white/25 motion-reduce:transition-none ${FOCUS_RING}`}
                >
                  <LinkedInIcon size={16} />
                  View profile
                  <span className="sr-only">(opens in new tab)</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==============================
// Section
// ==============================
export default function EnhancedTeamSection() {
  const swiperRef = useRef<SwiperRef>(null);

  const goNext = () => swiperRef.current?.swiper.slideNext();
  const goPrev = () => swiperRef.current?.swiper.slidePrev();

  return (
    <section
      aria-labelledby="team-heading"
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
    >
      <div className="mb-6 text-center">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-red-100 bg-gradient-to-r from-red-50 to-blue-50 px-3 py-1 text-gray-800">
          <Users size={16} aria-hidden="true" />
          <span className="text-sm font-medium">Our Team</span>
        </div>

        <h2
          id="team-heading"
          className="mb-3 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl"
        >
          Meet the{" "}
          <span className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 bg-clip-text text-transparent">
            Team
          </span>
        </h2>

        <div
          className="flex items-center justify-center gap-2"
          aria-hidden="true"
        >
          <div className="h-1 w-10 rounded-full bg-gradient-to-r from-transparent to-red-600" />
          <div className="h-1 w-20 rounded-full bg-gradient-to-r from-red-600 to-red-800" />
          <div className="h-1 w-10 rounded-full bg-gradient-to-r from-red-800 to-transparent" />
        </div>
      </div>

      {/* Desktop grid (display:none below lg, so hidden copies are not focusable) */}
      <div className="mx-auto hidden w-[85%] gap-6 lg:grid lg:grid-cols-4">
        {teamMembers.map((member) => (
          <TeamCard key={member.id} member={member} />
        ))}
      </div>

      {/* Mobile / tablet carousel */}
      <div className="relative lg:hidden">
        <Swiper
          ref={swiperRef}
          modules={[Pagination, A11y]}
          spaceBetween={10}
          slidesPerView={1}
          pagination={{ clickable: true }}
          className="team-swiper"
          breakpoints={{
            640: { slidesPerView: 2, spaceBetween: 12 },
            768: { slidesPerView: 3, spaceBetween: 16 },
          }}
        >
          {teamMembers.map((member) => (
            <SwiperSlide key={member.id}>
              <TeamCard member={member} />
            </SwiperSlide>
          ))}
        </Swiper>

        <CustomNavigationButton direction="prev" onClick={goPrev} />
        <CustomNavigationButton direction="next" onClick={goNext} />
      </div>

      <style jsx global>{`
        .team-swiper .swiper-pagination-bullet {
          background: #94a3b8;
          opacity: 1;
          width: 8px;
          height: 8px;
          transition: all 0.3s ease;
        }
        .team-swiper .swiper-pagination-bullet-active {
          background: #b92423;
          width: 20px;
          border-radius: 4px;
        }
        @media (prefers-reduced-motion: reduce) {
          .team-swiper .swiper-pagination-bullet {
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}
