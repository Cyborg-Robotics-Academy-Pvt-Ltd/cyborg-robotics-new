// src/features/codefest/components/HeroSection.tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, BookOpen, Lock, Sparkles } from "lucide-react";
import { Button } from "../ui/button";

export default function HeroSection() {
  // Square dot pattern grid
  const SquareDotPattern = ({
    position,
  }: {
    position: "top-left" | "bottom-right";
  }) => (
    <svg
      className={`absolute pointer-events-none opacity-100 ${
        position === "top-left" ? "top-24 left-0" : "bottom-44 right-10"
      }`}
      width="120"
      height="120"
      viewBox="0 0 100 100"
    >
      <defs>
        <pattern
          id={`square-dots-${position}`}
          x="0"
          y="0"
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="8" cy="8" r="3.5" fill="#a8b3c9" />
        </pattern>
      </defs>
      <rect width="200" height="200" fill={`url(#square-dots-${position})`} />
    </svg>
  );

  return (
    <section className="relative pt-10 pb-16 bg-white overflow-hidden px-3">
      {/* Square dot patterns */}
      <SquareDotPattern position="top-left" />
      <SquareDotPattern position="bottom-right" />

      {/* Soft fade into the next (pink-toned) section instead of a hard cut */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#FEF2F2]" />

      <div className="max-w-7xl mx-auto pt-12 px-4 sm:px-6 grid lg:grid-cols-12 gap-3 lg:gap-6 items-center relative z-10">
        {/* Left Column - Content (5 columns) */}
        <div className="flex flex-col justify-center lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-red-200 bg-gradient-to-r from-red-50 via-white to-red-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.28em] text-red-700 shadow-sm shadow-red-100/70 sm:mb-5 sm:text-xs"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-700 text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span>CODE FEST 1.0 • THE LONGEST DAY CHALLENGE</span>
          </motion.div>

          <h1 className="text-5xl bg-white sm:text-6xl lg:text-6xl font-black leading-[0.95] text-[#082c78] mb-3 sm:mb-2">
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08, duration: 0.5, ease: "easeOut" }}
              className="block"
            >
              CAN YOU
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.16, duration: 0.5, ease: "easeOut" }}
              className="block text-red-700"
            >
              FIND THE
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.24, duration: 0.5, ease: "easeOut" }}
              className="block"
            >
              WAY OUT?
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.34, duration: 0.5, ease: "easeOut" }}
            className="text-base sm:text-lg text-gray-600 max-w-xl leading-relaxed mb-5 sm:mb-4"
          >
            A national-level maze challenge where students test their logic,
            creativity, speed, and problem-solving skills through exciting
            interactive gameplay.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.44, duration: 0.5, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 mb-6 sm:mb-4 w-full sm:w-auto"
          >
            {/* Primary CTA — the only working action, so it now leads visually */}
            <button
              onClick={() =>
                window.open("/assets/codefest/CODE_FEST_RULEBOOK.pdf", "_blank")
              }
              className="
                group relative overflow-hidden order-1
                bg-[#082c78]
                active:scale-[0.98]
                px-8 sm:px-10 h-[58px]
                rounded-xl sm:rounded-2xl
                font-semibold tracking-wide text-white
                flex items-center justify-center gap-2
                shadow-[0_8px_25px_rgba(8,44,120,0.25)]
                hover:shadow-[0_15px_35px_rgba(8,44,120,0.38)]
                hover:bg-[#0d3b99]
                transition-all duration-300
                whitespace-nowrap
                text-sm sm:text-base
              "
            >
              <span className="relative z-10">View Rulebook</span>
              <BookOpen
                className="
                  relative z-10 h-5 w-5 text-white
                  transition-transform duration-300
                  group-hover:rotate-6
                "
              />
            </button>

            {/* Disabled/closed indicator — deliberately quieter than the primary CTA */}
            <Button
              disabled
              className="order-2 h-[58px] w-full sm:w-auto rounded-2xl bg-gray-100 text-sm font-semibold text-gray-500 shadow-none hover:bg-gray-100 cursor-not-allowed flex items-center justify-center gap-2 px-6"
            >
              <Lock className="h-4 w-4" />
              Registrations Closed
            </Button>
          </motion.div>
        </div>

        {/* Right Column - Image (7 columns) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, x: 24 }}
          whileInView={{ opacity: 1, scale: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="relative flex justify-center lg:order-last lg:col-span-7"
        >
          <div className="relative -z-10 h-[300px] w-full sm:h-[360px] lg:h-[480px]">
            <Image
              src="/assets/codefest/codefest.png"
              alt="Maze challenge illustration"
              fill
              className="object-contain scale-125 lg:scale-[1.4]"
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
