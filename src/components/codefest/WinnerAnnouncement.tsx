"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Trophy,
  MapPin,
  Code2,
  FileBadge2,
  Sparkles,
  Medal,
} from "lucide-react";
import Confetti from "react-confetti-boom";
import Image from "next/image";

interface WinnerAnnouncementProps {
  winnerName?: string;
  location?: string;
}

/**
 * Brand palette used throughout this component:
 *   --brand-red-600: #DC2626   (primary — headline, name, accents)
 *   --brand-red-800: #991B1B   (primary, darker end of gradients)
 *   --brand-gold-500: #F59E0B  (secondary — reserved for trophy/medal motifs only)
 *   --slate-*                   (neutral chrome: text, borders, backgrounds)
 */

export default function WinnerAnnouncement({
  winnerName = "Nimrat Pahwa",
  location = "Maharashtra",
}: WinnerAnnouncementProps) {
  // Fire confetti once the section has scrolled ~75% into view, rather than
  // on a fixed mount timer — reads as a reaction to the user actually
  // reaching the card, not just the page loading.
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, {
    once: true,
    amount: 0.75, // fires once 75% of the section is within the viewport
  });
  const [confettiReady, setConfettiReady] = useState(false);

  useEffect(() => {
    if (!isInView) return;
    const timer = setTimeout(() => setConfettiReady(true), 550);
    return () => clearTimeout(timer);
  }, [isInView]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-b from-[#FDF8F6] to-[#FEF2F2] py-12 px-4"
    >
      {/* top heading */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mx-auto mb-8 max-w-xl text-center"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DC2626]/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#B91C1C]">
          <Trophy className="h-3.5 w-3.5" />
          Results Announcement
        </span>
        <h1 className="mt-3 font-sans text-2xl font-extrabold tracking-tight text-[#1E293B] md:text-4xl">
          Code Fest 1.0{" "}
          <span className="bg-gradient-to-r from-[#DC2626] to-[#991B1B] bg-clip-text text-transparent">
            Winner
          </span>
        </h1>
      </motion.div>

      {/* dotted pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: "radial-gradient(#DC262633 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* abstract blurred curves */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#DC2626]/8 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-[#F59E0B]/10 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#DC2626]/5 blur-3xl" />

      {/* floating sparkles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute"
          style={{ left: `${6 + i * 12}%`, top: `${12 + (i % 3) * 26}%` }}
          animate={{
            y: [0, -12, 0],
            opacity: [0.15, 0.55, 0.15],
            rotate: [0, 20, 0],
          }}
          transition={{
            duration: 3 + i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.25,
          }}
        >
          <Sparkles className="h-3.5 w-3.5 text-[#DC2626]/35" />
        </motion.div>
      ))}

      <div className="pointer-events-none absolute inset-0 z-20">
        {confettiReady && (
          <Confetti
            mode="boom"
            particleCount={80}
            colors={["#DC2626", "#F59E0B", "#991B1B"]}
          />
        )}
      </div>

      {/* main card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -3 }}
        className="group relative mx-auto max-w-lg"
      >
        {/* running border — thin animated beam chasing the card's edge,
            using a padding + mask-composite technique so only a hairline
            ring is visible (not a blurred halo). Same brand colors. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-[1.5px] rounded-[25px] overflow-hidden"
          style={{
            padding: "1.5px",
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-1/2"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0%, transparent 62%, #DC2626 74%, #F59E0B 82%, #991B1B 90%, transparent 100%)",
            }}
          />
        </div>

        {/* soft ambient glow behind the running border, kept subtle so the
            beam itself stays the crisp focal element */}
        <div className="pointer-events-none absolute -inset-3 -z-10 rounded-[28px] bg-gradient-to-br from-[#DC2626]/10 via-[#F59E0B]/8 to-transparent blur-2xl opacity-70 transition-opacity duration-500 group-hover:opacity-100" />

        <div className="relative rounded-[22px] border border-[#DC2626]/15 bg-gradient-to-br from-white to-[#FEF2F2]/60 backdrop-blur-xl px-5 py-4 md:px-8 md:py-5 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_60px_-15px_rgba(220,38,38,0.18),0_8px_24px_-8px_rgba(245,158,11,0.08)] transition-shadow duration-500 group-hover:shadow-[0_1px_2px_rgba(15,23,42,0.06),0_28px_70px_-15px_rgba(220,38,38,0.24),0_10px_28px_-8px_rgba(245,158,11,0.12)]">
          {/* trophy */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: [0, 1.18, 1], rotate: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.6,
              times: [0, 0.7, 1],
              ease: "easeOut",
              delay: 0.1,
            }}
            className="relative mx-auto mb-1.5 flex h-12 w-12 items-center justify-center"
          >
            <motion.div
              aria-hidden
              animate={{ scale: [1, 1.35, 1], opacity: [0.5, 0, 0.5] }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-full bg-[#F59E0B]/40"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FCD34D] via-[#F59E0B] to-[#D97706] shadow-[0_0_30px_7px_rgba(245,158,11,0.35),inset_0_2px_4px_rgba(255,255,255,0.4)]" />
            <motion.div
              animate={{ rotate: [0, -8, 8, -4, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1.4 }}
              className="relative"
            >
              <Trophy
                className="h-5 w-5 text-white drop-shadow-sm"
                strokeWidth={2.2}
              />
            </motion.div>
          </motion.div>

          {/* single consolidated winner badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: -8 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 300,
              damping: 16,
            }}
            className="mx-auto mb-2 inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-white/95 px-3 py-1.5 shadow-sm"
          >
            <Medal className="h-3.5 w-3.5 text-amber-600" strokeWidth={2.3} />
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-700">
              Winner
            </span>
          </motion.div>

          {/* round badge */}
          <motion.span
            initial={{ opacity: 0, scale: 0.7, y: 8 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              delay: 0.28,
              type: "spring",
              stiffness: 300,
              damping: 16,
            }}
            className="relative z-50 inline-flex items-center gap-1.5 overflow-hidden rounded-full bg-[#FEF2F2] border border-[#DC2626]/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#B91C1C]"
          >
            <Code2 className="h-3.5 w-3.5" />
            Code Fest 1.0 · Technical Round
            <motion.span
              aria-hidden
              className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent"
              animate={{ x: ["-20%", "220%"] }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                repeatDelay: 2.2,
                ease: "easeInOut",
              }}
            />
          </motion.span>

          {/* title with laurel image */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.32 }}
            className="relative mt-2 flex items-center justify-center"
          >
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[100px] w-[200px] md:h-[130px] md:w-[280px] -translate-x-1/2 -translate-y-1/2 opacity-90">
              <Image
                src="/laurel-wreath.png"
                alt=""
                fill
                aria-hidden
                sizes="(max-width: 768px) 200px, 280px"
                className="object-contain"
              />
            </div>

            <h2 className="relative font-sans leading-tight tracking-tight px-12 md:px-20">
              <motion.span
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  delay: 0.36,
                  type: "spring",
                  stiffness: 260,
                  damping: 18,
                }}
                className="relative inline-block overflow-hidden text-2xl md:text-[27px] font-bold tracking-tight bg-gradient-to-r from-[#DC2626] to-[#991B1B] bg-clip-text text-transparent"
              >
                {winnerName}
                <motion.span
                  aria-hidden
                  initial={{ x: "-120%" }}
                  whileInView={{ x: "220%" }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.85, duration: 0.9, ease: "easeInOut" }}
                  className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/80 to-transparent mix-blend-overlay"
                />
              </motion.span>
              <span className="mt-0.5 block text-base md:text-lg font-semibold text-[#1E293B]">
                Congratulations!
              </span>
            </h2>
          </motion.div>

          {/* location */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.42 }}
            className="mx-auto mt-2.5 inline-flex items-center gap-1.5 rounded-2xl border border-[#DC2626]/10 bg-white/70 px-3.5 py-1.5 text-sm font-medium text-slate-600 shadow-sm"
          >
            <MapPin className="h-3.5 w-3.5" />
            {location}
          </motion.div>

          {/* achievement divider */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
            className="mt-3.5 flex items-center justify-center"
          >
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-gradient-to-r from-transparent via-[#DC2626]/20 to-[#DC2626]/40 sm:w-16 md:w-20" />

              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
                className="group relative flex items-center gap-2 rounded-full border border-[#F59E0B]/20 bg-gradient-to-r from-[#FFF7ED] via-white to-[#FFFBEB] px-4 py-2 shadow-[0_4px_16px_rgba(217,119,6,0.08)] ring-1 ring-[#F59E0B]/5"
              >
                <span className="absolute inset-0 -z-10 rounded-full bg-[#F59E0B]/5 blur-md" />
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FEF3C7] to-[#FFEDD5] text-[#D97706] shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)]">
                  <Medal className="h-4 w-4" strokeWidth={2.2} />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#B45309] sm:text-[11px]">
                  Winner of the Technical Round
                </span>
                <span className="absolute -right-1 -top-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white text-[#F59E0B] shadow-sm">
                  <Sparkles className="h-2.5 w-2.5" />
                </span>
              </motion.div>

              <span className="h-px w-10 bg-gradient-to-l from-transparent via-[#DC2626]/20 to-[#DC2626]/40 sm:w-16 md:w-20" />
            </div>
          </motion.div>

          {/* achievement message */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mx-auto mt-2.5 max-w-md font-sans text-sm leading-relaxed text-slate-600"
          >
            Your innovative approach to problem-solving, efficient use of
            algorithms, clean code, and strong case study reasoning with
            well-justified responses truly stood out.
          </motion.p>

          {/* footer info */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.72, duration: 0.5 }}
            className="mx-auto mt-3.5 flex max-w-lg items-center gap-3 rounded-full border border-slate-200/80 bg-slate-50/70 px-4 py-2.5"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
              <FileBadge2 className="h-4 w-4 text-[#DC2626]" strokeWidth={2} />
            </div>
            <p className="text-left text-xs font-medium leading-relaxed text-slate-600 sm:text-sm">
              Certificates & prizes will be shared after final review.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
