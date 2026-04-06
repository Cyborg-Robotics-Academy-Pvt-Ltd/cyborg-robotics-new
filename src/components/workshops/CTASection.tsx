"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Phone,
  Sparkles,
  Star,
  ShieldCheck,
  Clock3,
} from "lucide-react";
import { createStaggerContainer, fadeUpVariants } from "./motion";
import type { CampLocation } from "./types";

interface Props {
  activeLocation: CampLocation;
  earlyBirdPrice: number;
  onRegister: () => void;
}

const CTASection = ({ activeLocation, earlyBirdPrice, onRegister }: Props) => {
  return (
    <motion.section
      className="relative overflow-hidden bg-gradient-to-br from-[#1C0A06] to-[#3d1408] px-4 py-20 sm:px-6 sm:py-24"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={createStaggerContainer(0.1)}
    >
      {/* Background blobs */}
      <div className="pointer-events-none absolute left-[20%] top-[-60px] h-[300px] w-[300px] rounded-full bg-[rgba(199,62,29,0.15)] blur-[60px]" />
      <div className="pointer-events-none absolute bottom-[-40px] right-[10%] h-[200px] w-[200px] rounded-full bg-[rgba(141,15,17,0.12)] blur-[40px]" />
      <div className="pointer-events-none absolute inset-0 opacity-10 [background-image:radial-gradient(circle,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="relative z-10 mx-auto max-w-[680px] text-center">
        {/* Urgency badge */}
        <motion.div
          variants={fadeUpVariants}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.08)] px-4 py-1.5"
        >
          <span className="relative h-1.5 w-1.5 rounded-full bg-orange-400">
            <span className="absolute inset-0 animate-ping rounded-full bg-orange-400 opacity-75" />
          </span>
          {/* was font-bold uppercase tracking-widest */}
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/65">
            Limited Seats · Early Bird Closing Soon
          </span>
        </motion.div>

        {/* Headline — keep font-black, it's the hero CTA */}
        <motion.h2
          variants={fadeUpVariants}
          className="mb-3 text-[clamp(2rem,5vw,3.2rem)] font-black leading-[1.08] tracking-[-0.02em] text-white"
        >
          Give Your Child
          <br />
          <span className="bg-gradient-to-r from-[#ff9980] to-[#ffb89a] bg-clip-text text-transparent">
            Their Best Summer.
          </span>
        </motion.h2>

        {/* Subtext — was no explicit weight */}
        <motion.p
          variants={fadeUpVariants}
          className="mx-auto mb-6 max-w-[460px] text-[13px] font-normal leading-[1.7] text-white/55"
        >
          Spots are limited per batch. Secure your child&apos;s place at{" "}
          <span className="font-medium text-white/75">
            {activeLocation.name}
          </span>{" "}
          today.
        </motion.p>

        {/* Price callout */}
        <motion.div
          variants={fadeUpVariants}
          className="mb-7 inline-flex flex-col items-center gap-0.5"
        >
          <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-white/40">
            Early Bird Price
          </span>
          <span className="text-[clamp(2.2rem,5vw,3rem)] font-black leading-none text-white">
            ₹{earlyBirdPrice.toLocaleString("en-IN")}
          </span>
          <span className="text-[10px] font-normal text-white/35">
            onwards · varies by age group
          </span>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          variants={fadeUpVariants}
          className="mb-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-3"
        >
          {/* Primary CTA */}
          <button
            onClick={onRegister}
            className="relative inline-flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-[#8D0F11] to-[#B92423] px-8 py-3.5 text-[14px] font-semibold text-white shadow-[0_8px_32px_rgba(141,15,17,0.5)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_48px_rgba(141,15,17,0.6)] before:absolute before:left-[-60%] before:top-0 before:h-full before:w-[50%] before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent before:transition-[left] before:duration-500 before:content-[''] hover:before:left-[150%] sm:w-auto"
          >
            <Sparkles size={14} />
            Book Now
            <ArrowRight size={14} />
          </button>

          {/* Secondary CTA */}
          <a
            href="tel:+91XXXXXXXXXX"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.07)] px-6 py-3.5 text-[13px] font-medium text-white/80 no-underline transition-all duration-200 hover:bg-[rgba(255,255,255,0.12)] hover:text-white sm:w-auto"
          >
            <Phone size={13} />
            Call Us
          </a>
        </motion.div>

        {/* Trust strip */}
        <motion.div
          variants={fadeUpVariants}
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
        >
          {[
            { icon: <ShieldCheck size={11} />, text: "No payment on booking" },
            { icon: <Clock3 size={11} />, text: "Team confirms within 24 hrs" },
            { icon: <Star size={11} />, text: "Certificate included" },
          ].map(({ icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-1.5 text-[10px] font-normal text-white/40"
            >
              <span className="text-white/30">{icon}</span>
              {text}
            </div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default CTASection;
