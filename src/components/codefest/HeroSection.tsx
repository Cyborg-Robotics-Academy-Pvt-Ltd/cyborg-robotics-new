// src/features/codefest/components/HeroSection.tsx

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { Button } from "../ui/button";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}
// Fixed target: August 16, 2025 at 00:00:00 IST
const TARGET_DATE = new Date("2026-08-16T00:00:00+05:30").getTime();
export default function HeroSection() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const updateTimer = () => {
      const distance = TARGET_DATE - Date.now();

      if (distance <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((distance / 1000 / 60) % 60),
        seconds: Math.floor((distance / 1000) % 60),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);
  // Square dot pattern grid
  const SquareDotPattern = ({
    position,
  }: {
    position: "top-left" | "bottom-right";
  }) => (
    <svg
      className={`absolute pointer-events-none opacity-70 ${
        position === "top-left" ? "top-24 left-0     " : "bottom-44 right-10"
      }`}
      width="100"
      height="100"
      viewBox="0 0 100 100"
    >
      <defs>
        <pattern
          id={`square-dots-${position}`}
          x="0"
          y="0"
          width="18"
          height="18"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="9" cy="9" r="3" fill="#c4c4c4" />
        </pattern>
      </defs>
      <rect width="200" height="200" fill={`url(#square-dots-${position})`} />
    </svg>
  );

  return (
    <section className="relative pt-18  bg-white overflow-hidden px-3">
      {/* Square dot patterns */}
      <SquareDotPattern position="top-left" />
      <SquareDotPattern position="bottom-right" />

      <div className="max-w-7xl  mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-3 lg:gap-1 items-center relative z-10">
        {/* Left Column - Content (5 columns) */}
        <div className="flex flex-col justify-center lg:col-span-5 ">
          <div className="mb-4  inline-flex w-fit items-center gap-2 rounded-full border border-red-200 bg-gradient-to-r from-red-50 via-white to-red-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-red-700 shadow-sm shadow-red-100/70 sm:mb-5 sm:text-xs">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-700 text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span>CODE FEST 1.0 • THE LONGEST DAY CHALLENGE</span>
          </div>

          <h1 className="text-5xl bg-white  sm:text-6xl lg:text-6xl font-black leading-[0.95] text-[#082c78] mb-3 sm:mb-2">
            CAN YOU
            <br />
            <span className="text-red-700">FIND THE</span>
            <br />
            WAY OUT?
          </h1>

          <p className="text-base sm:text-lg text-gray-600 max-w-xl leading-relaxed mb-5 sm:mb-4">
            A national-level maze challenge where students test their logic,
            creativity, speed, and problem-solving skills through exciting
            interactive gameplay.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 sm:mb-4 w-full sm:w-auto">
            {/* Primary CTA */}
            <button
              className="h-[58px] w-auto rounded-2xl bg-gray-300 text-[16px] font-bold text-gray-700 shadow-none hover:bg-gray-300   
    "
            >
              {/* Shine Effect */}
              <span className="absolute inset-0 overflow-hidden rounded-2xl">
                <span
                  className="
          absolute left-[-120%] top-0 h-full w-[80%]
          bg-gradient-to-r from-transparent via-white/25 to-transparent
          skew-x-[-25deg]
          group-hover:left-[120%]
          transition-all duration-1000
        "
                />
              </span>

              <Button
                disabled
                className="h-[58px] w-full rounded-2xl bg-gray-300 text-[16px] font-bold text-gray-700 shadow-none hover:bg-gray-300"
              >
                Registrations Closed
              </Button>
            </button>

            {/* Secondary CTA */}
            <button
              onClick={() =>
                window.open("/assets/codefest/CODE_FEST_RULEBOOK.pdf", "_blank")
              }
              className="
    group relative overflow-hidden
    border border-[#0d3b99]/30
    bg-white/70 dark:bg-white/5
    hover:bg-[#082c78]
    text-[#082c78] hover:text-white
    active:scale-[0.98]
    px-8 sm:px-10 py-3.5 sm:py-4
    rounded-xl sm:rounded-2xl
    font-semibold tracking-wide
    flex items-center justify-center gap-2
    shadow-[0_8px_25px_rgba(8,44,120,0.12)]
    hover:shadow-[0_15px_35px_rgba(8,44,120,0.28)]
    backdrop-blur-md
    transition-all duration-300
    whitespace-nowrap
    text-sm sm:text-base
  "
            >
              {/* Hover Glow */}
              <div
                className="
      absolute inset-0 opacity-0 group-hover:opacity-100
      bg-gradient-to-r from-[#082c78] via-[#0d47c2] to-[#082c78]
      transition-opacity duration-300
    "
              />

              <span className="relative z-10">View Rulebook</span>

              <BookOpen
                className="
      relative z-10 h-5 w-5
      transition-transform duration-300
      group-hover:rotate-6
      text-blue-800
    "
              />
            </button>
          </div>
        </div>

        {/* Right Column - Image (7 columns) */}
        <div className="relative flex justify-center lg:order-last lg:col-span-7">
          <div className="relative -z-10 h-[340px] w-full sm:h-[400px] lg:h-[540px]">
            <Image
              src="/assets/codefest/codefest.png"
              alt="Maze challenge illustration"
              fill
              className="object-contain scale-110 lg:scale-125"
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
