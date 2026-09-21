"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const navItems = ["Learn", "Build", "Compete", "Grow"];

const BANNER_BG = "/assets/competition/ftc/ftc-banner-bg.png";
const ROBOT_IMAGE = "/assets/competition/ftc/ftc-robot.png";

export default function FTCBanner() {
  return (
    <section
      className="relative w-full overflow-hidden bg-[#07090D]"
      style={{ aspectRatio: "2170 / 220" }}
    >
      {/* =========================================================
          1. BACKGROUND
      ========================================================= */}
      <Image
        src={BANNER_BG}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Dark overlay to improve text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#07090D]/20 via-transparent to-[#07090D]/50" />

      {/* =========================================================
          2. ROBOT
      ========================================================= */}
      <Image
        src={ROBOT_IMAGE}
        alt="FTC competition robot"
        width={500}
        height={500}
        priority
        sizes="(max-width: 640px) 35vw, 30vw"
        className="
          absolute
          bottom-[8%]
          left-[1%]
          z-[5]
          h-[95%]
          w-auto
          max-w-none
          object-contain
        "
      />

      {/* Dark fade behind the robot */}
      <div
        className="
          pointer-events-none
          absolute
          inset-y-0
          left-0
          z-[6]
          w-[34%]
          bg-gradient-to-r
          from-[#07090D]/25
          via-transparent
          to-transparent
        "
      />

      {/* =========================================================
          3. CONTENT
      ========================================================= */}
      <div
        className="
          relative
          z-10
          flex
          h-full
          items-center
          justify-between
          gap-[3%]
          px-[4%]
          md:px-[6%]
        "
      >
        {/* =======================================================
            Robot spacer
        ======================================================= */}
        <div className="hidden sm:block sm:w-[27%] md:w-[28%]" />

        {/* =======================================================
            Heading + description
        ======================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
          className="
            flex
            min-w-0
            flex-col
            gap-[clamp(0.1rem,0.4vw,0.35rem)]
          "
        >
          <h2
            className="
              font-syne
              text-[clamp(0.6rem,1.7vw,1.4rem)]
              font-extrabold
              leading-[1.1]
              text-white
            "
          >
            READY TO BUILD
            <br />
            YOUR ROBOT?
          </h2>

          <p
            className="
              hidden
              max-w-md
              font-dm-sans
              text-[clamp(0.4rem,0.65vw,0.7rem)]
              leading-snug
              text-white/70
              md:block
            "
          >
            Join Cyborg Robotics Academy for FTC 2026–27
            <br />
            and be part of something bigger.
          </p>
        </motion.div>

        {/* =======================================================
            Register button
        ======================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
            delay: 0.1,
          }}
          className="shrink-0"
        >
          <Link
            href="/ftc-registration"
            className="
              group
              inline-flex
              w-fit
              items-center
              gap-1.5
              rounded-md
              bg-[#B92423]
              px-[clamp(0.5rem,1.2vw,1.25rem)]
              py-[clamp(0.2rem,0.5vw,0.5rem)]
              font-dm-sans
              text-[clamp(0.45rem,0.8vw,0.8rem)]
              font-semibold
              text-white
              transition-all
              duration-200
              hover:scale-[1.03]
              hover:bg-[#A81B1E]
              hover:shadow-[0_0_20px_rgba(185,36,35,0.35)]
            "
          >
            Register Now
            <ArrowRight
              className="
                h-[1em]
                w-[1em]
                transition-transform
                duration-200
                group-hover:translate-x-1
              "
            />
          </Link>
        </motion.div>

        {/* =======================================================
            Navigation
        ======================================================= */}
        <div
          className="
            hidden
            flex-col
            gap-[clamp(0.1rem,0.35vw,0.3rem)]
            font-dm-sans
            text-[clamp(0.4rem,0.65vw,0.7rem)]
            font-bold
            uppercase
            tracking-[0.2em]
            text-white/80
            lg:flex
          "
        >
          {navItems.map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className="
                transition-colors
                duration-200
                hover:text-white
              "
            >
              {item}
            </Link>
          ))}
        </div>
      </div>

      {/* =========================================================
          Bottom red glow
      ========================================================= */}
      <div
        className="
          pointer-events-none
          absolute
          bottom-0
          left-0
          z-[20]
          h-px
          w-full
          bg-[#E52521]
          shadow-[0_0_10px_rgba(229,37,33,0.8)]
        "
      />
    </section>
  );
}
