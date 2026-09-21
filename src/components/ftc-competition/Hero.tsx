"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Users, Cpu, Code2, Trophy } from "lucide-react";

import bgImage from "@/../public/assets/competition/ftc/ftc-arena-bg.png";
import robotImageAsset from "@/../public/assets/competition/ftc/robotImageSrc.png";

// ============================================================================
// Types
// ============================================================================

interface TelemetryRow {
  label: string;
  value: string;
}

interface StatItem {
  icon: React.ReactNode;
  label: string;
}

interface FTCHeroProps {
  /**
   * Optional robot image.
   *
   * If not provided, the imported FTC robot asset is used automatically.
   */
  robotImage?: string | StaticImageData;

  robotImageAlt?: string;

  season?: string;
  seasonLabel?: string;

  headlineTop?: string;
  headlineAccent?: string;

  subhead?: string;
  description?: string;

  primaryCtaLabel?: string;
  primaryCtaHref?: string;

  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;

  stats?: StatItem[];

  telemetry?: TelemetryRow[];

  robotOnline?: boolean;

  dimensions?: {
    height: string;
    width: string;
    depth: string;
  };
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_STATS: StatItem[] = [
  {
    icon: <Users className="h-4 w-4" strokeWidth={1.5} />,
    label: "12–18 Years",
  },
  {
    icon: <Cpu className="h-4 w-4" strokeWidth={1.5} />,
    label: "Robotics",
  },
  {
    icon: <Code2 className="h-4 w-4" strokeWidth={1.5} />,
    label: "Programming",
  },
  {
    icon: <Trophy className="h-4 w-4" strokeWidth={1.5} />,
    label: "Team Competition",
  },
];

const DEFAULT_TELEMETRY: TelemetryRow[] = [
  {
    label: "MOTOR 06",
    value: "94%",
  },
  {
    label: "POWER",
    value: "94%",
  },
  {
    label: "TEMP",
    value: "38°C",
  },
];

// ============================================================================
// Motion
// ============================================================================

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 14,
  },

  show: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

// ============================================================================
// Robot Status Panel
// Decorative telemetry HUD — not live data
// ============================================================================

function RobotStatusPanel({
  isOnline = true,
  telemetry = DEFAULT_TELEMETRY,
  dimensions = {
    height: "56 cm",
    width: "70 cm",
    depth: "48 cm",
  },
  className = "",
}: {
  isOnline?: boolean;
  telemetry?: TelemetryRow[];

  dimensions?: {
    height: string;
    width: string;
    depth: string;
  };

  className?: string;
}) {
  return (
    <div
      className={`
        w-[210px]
        rounded-lg
        border
        border-white/10
        bg-black/55
        p-4
        backdrop-blur-md
        ${className}
      `}
    >
      {/* Header */}
      <p className="text-[10px] font-semibold tracking-[0.15em] text-white/50">
        ROBOT STATUS
      </p>

      {/* Online status */}
      <div className="mt-2 flex items-center gap-1.5">
        <span
          className={`
            h-1.5
            w-1.5
            rounded-full
            ${isOnline ? "animate-pulse bg-emerald-400" : "bg-white/30"}
          `}
          aria-hidden="true"
        />

        <span
          className={`
            text-[11px]
            font-semibold
            tracking-wide
            ${isOnline ? "text-emerald-400" : "text-white/40"}
          `}
        >
          {isOnline ? "ONLINE" : "OFFLINE"}
        </span>
      </div>

      {/* Telemetry */}
      <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3">
        {telemetry.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <span className="text-[10px] tracking-wide text-white/45">
              {row.label}
            </span>

            <span className="text-[11px] font-medium text-white/85">
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Robot dimensions */}
      <div className="relative mt-3 h-16 border-t border-white/10 pt-3">
        <svg
          viewBox="0 0 140 50"
          className="h-full w-full"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.75"
          aria-hidden="true"
        >
          <rect
            x="20"
            y="10"
            width="60"
            height="28"
            className="text-white/25"
          />

          <rect x="30" y="4" width="16" height="10" className="text-white/25" />

          <line x1="20" y1="38" x2="10" y2="44" className="text-white/15" />

          <line x1="80" y1="38" x2="90" y2="44" className="text-white/15" />
        </svg>

        <span className="absolute right-0 top-0 text-[9px] text-white/40">
          {dimensions.height}
        </span>

        <span className="absolute bottom-0 left-4 text-[9px] text-white/40">
          {dimensions.width}
        </span>

        <span className="absolute bottom-0 right-4 text-[9px] text-white/40">
          {dimensions.depth}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Hero
// ============================================================================

export default function FTCHero({
  /*
   * IMPORTANT:
   *
   * robotImage defaults to the imported asset.
   *
   * This fixes the original issue where the imported
   * robotImageSrc was being shadowed by an undefined prop.
   */
  robotImage = robotImageAsset,

  robotImageAlt = "FTC competition robot, team 7421",

  season = "FTC 2026–27",

  seasonLabel = "Cyborg Robotics Academy Presents",

  headlineTop = "First Tech",

  headlineAccent = "Challenge",

  subhead = "Build. Code. Compete.",

  description = "Turn your ideas into innovative robots. Build your skills. Compete with the best.",

  primaryCtaLabel = "Register Your Team",

  primaryCtaHref = "/register",

  secondaryCtaLabel = "Explore the Challenge",

  secondaryCtaHref = "#build-sequence",

  stats = DEFAULT_STATS,

  telemetry,

  robotOnline = true,

  dimensions,
}: FTCHeroProps) {
  const shouldReduceMotion = useReducedMotion();

  const v = shouldReduceMotion ? undefined : itemVariants;

  return (
    <section
      className="
        relative
        min-h-[600px]
        overflow-hidden
        bg-[#07090D]
        pt-16
      "
      aria-label="First Tech Challenge introduction"
    >
      {/* ================================================================
          LAYER 0
          Cinematic background
      ================================================================= */}

      <div className="absolute inset-0 z-0">
        <Image
          src={bgImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* Dark gradient over background */}
        <div
          className="
            absolute
            inset-0
            bg-gradient-to-r
            from-[#07090D]
            via-[#07090D]/55
            to-transparent
            lg:via-[#07090D]/35
          "
        />

        {/* Bottom gradient */}
        <div
          className="
            absolute
            inset-x-0
            bottom-0
            h-40
            bg-gradient-to-t
            from-[#07090D]
            to-transparent
          "
        />
      </div>

      {/* ================================================================
          LAYER 1
          Robot foreground
      ================================================================= */}

      {robotImage && (
        <div
          className="
            absolute
            inset-y-0
            right-20
            bottom-20
            z-10
            hidden
            w-[42%]
            sm:block
          "
        >
          <Image
            src={robotImage}
            alt={robotImageAlt}
            fill
            sizes="40vw"
            priority
            className="
              object-contain
              object-right-bottom
              scale-110
              drop-shadow-[0_30px_60px_rgba(0,0,0,0.8)]
            "
          />
        </div>
      )}

      {/* ================================================================
          LAYER 2
          Telemetry HUD
      ================================================================= */}

      {/* ================================================================
          LAYER 3
          Main content
      ================================================================= */}

      <motion.div
        variants={shouldReduceMotion ? undefined : containerVariants}
        initial={shouldReduceMotion ? undefined : "hidden"}
        animate={shouldReduceMotion ? undefined : "show"}
        className="
          relative
          z-20
          flex
          min-h-[calc(600px-4rem)]
          max-w-xl
          flex-col
          justify-center
          gap-4
          px-6
          py-20
          sm:px-10
          lg:px-12
        "
      >
        {/* ============================================================
            Label
        ============================================================= */}

        <motion.p
          variants={v}
          className="
            flex
            items-center
            gap-2
            text-xs
            font-medium
            tracking-wide
            text-white/50
          "
        >
          <span className="h-px w-4 bg-[#B92423]" aria-hidden="true" />

          {seasonLabel}
        </motion.p>

        {/* ============================================================
            Season
        ============================================================= */}

        <motion.p
          variants={v}
          className="
            flex
            items-center
            gap-2
            text-xs
            font-semibold
            tracking-[0.12em]
            text-[#ED1C24]
          "
        >
          <span className="h-px w-4 bg-[#ED1C24]" aria-hidden="true" />

          {season}
        </motion.p>

        {/* ============================================================
            Heading
        ============================================================= */}

        <motion.h1
          variants={v}
          className="
            font-display
            text-4xl
            font-bold
            leading-[0.92]
            tracking-[-0.03em]
            text-white
            sm:text-5xl
            lg:text-[4.2rem]
          "
        >
          {headlineTop}

          <br />

          <span className="text-[#ED1C24]">{headlineAccent}</span>
        </motion.h1>

        {/* ============================================================
            Subheading
        ============================================================= */}

        <motion.p
          variants={v}
          className="
            text-sm
            font-semibold
            uppercase
            tracking-[0.18em]
            text-white/80
            sm:text-base
          "
        >
          {subhead}
        </motion.p>

        {/* ============================================================
            Description
        ============================================================= */}

        <motion.p
          variants={v}
          className="
            max-w-md
            text-sm
            leading-relaxed
            text-white/50
            sm:text-base
          "
        >
          {description}
        </motion.p>

        {/* ============================================================
            CTA
        ============================================================= */}

        <motion.div
          variants={v}
          className="
            flex
            flex-wrap
            items-center
            gap-3
            pt-3
          "
        >
          {/* Primary CTA */}
          <Link
            href={primaryCtaHref}
            className="
              group
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-[#ED1C24]
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              shadow-[0_0_30px_rgba(237,28,36,0.25)]
              transition-all
              duration-300
              hover:bg-[#D9161D]
              hover:shadow-[0_0_40px_rgba(237,28,36,0.4)]
              focus-visible:outline
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-[#ED1C24]
            "
          >
            {primaryCtaLabel}

            <ArrowRight
              className="
                h-4
                w-4
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
              strokeWidth={2}
            />
          </Link>

          {/* Separator */}
          <span
            className="
              hidden
              h-px
              w-5
              bg-white/15
              sm:block
            "
            aria-hidden="true"
          />

          {/* Secondary CTA */}
          <Link
            href={secondaryCtaHref}
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-white/20
              bg-black/20
              px-5
              py-3
              text-sm
              font-semibold
              text-white/90
              backdrop-blur-sm
              transition-all
              duration-300
              hover:border-white/40
              hover:bg-white/5
              focus-visible:outline
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-white/60
            "
          >
            {secondaryCtaLabel}

            <span className="text-white/40">→</span>
          </Link>
        </motion.div>

        {/* ============================================================
            Stats
        ============================================================= */}

        <motion.dl
          variants={v}
          className="
            flex
            flex-wrap
            gap-x-6
            gap-y-3
            pt-5
          "
        >
          {stats.map((stat, i) => (
            <div
              key={`${stat.label}-${i}`}
              className="
                flex
                items-center
                gap-2
                text-white/45
              "
            >
              <dt className="sr-only">{stat.label}</dt>

              <span className="text-[#ED1C24]">{stat.icon}</span>

              <dd
                className="
                  text-[11px]
                  font-medium
                  leading-tight
                  tracking-wide
                "
              >
                {stat.label}
              </dd>
            </div>
          ))}
        </motion.dl>
      </motion.div>

      {/* ================================================================
          Bottom technical decoration
      ================================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-5
          right-8
          z-20
          hidden
          items-center
          gap-2
          text-[9px]
          font-medium
          uppercase
          tracking-[0.2em]
          text-white/30
          lg:flex
        "
      >
        <span className="text-[#ED1C24]">///</span>
        FTC-CRA-2026
        <span className="text-[#ED1C24]">SYSTEM ONLINE</span>
        <span
          className="
            h-1.5
            w-1.5
            rounded-full
            bg-[#ED1C24]
            shadow-[0_0_10px_rgba(237,28,36,0.8)]
          "
        />
      </div>
    </section>
  );
}
