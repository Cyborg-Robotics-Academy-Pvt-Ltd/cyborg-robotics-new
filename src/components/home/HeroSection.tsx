"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  ChevronRight,
  Medal,
  MoveDiagonal,
  Sparkles,
  Users,
} from "lucide-react";

const heroStats = [
  {
    value: "10K+",
    label: "Students Trained",
    icon: Users,
  },
  {
    value: "10+",
    label: "Expert Mentors",
    icon: Bot,
  },
  {
    value: "4.9/5",
    label: "Google Rating",
    icon: Medal,
  },
  {
    value: "100%",
    label: "Practical Learning",
    icon: MoveDiagonal,
  },
];

const Carousel = () => {
  return (
    <section className="relative w-full overflow-visible -mt-8 md:-mt-14 lg:-mt-8">
      <div className="relative h-[300px] w-full sm:h-[400px] md:h-[500px] lg:h-[700px] xl:h-[640px] 2xl:h-[920px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_38%,rgba(185,28,28,0.34),transparent_28%),radial-gradient(circle_at_72%_18%,rgba(249,115,22,0.16),transparent_22%),linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.68))]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:38px_38px]" />
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        >
          <source
            src="https://res.cloudinary.com/dz8enfjtx/video/upload/v1759653436/cyborg_1_nspmur.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_36%_48%,rgba(255,49,49,0.28),transparent_20%)] mix-blend-screen" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#050816]/85 to-transparent" />

        <div className="absolute inset-0 z-10 flex items-center ">
          <div className="mx-auto w-full max-w-8xl px-4 sm:px-10 lg:px-20">
            <div className="max-w-5xl pt-12 sm:pt-16 lg:pt-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/85 backdrop-blur-md">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400/70" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-400" />
                </span>
                <Sparkles className="h-3.5 w-3.5 text-red-400" />
                Be Future Ready
              </div>

              <h1 className="mt-5 max-w-[7ch] text-4xl font-bold tracking-tight uppercase leading-[0.9]  text-white sm:text-6xl lg:text-7xl">
                Build.
                <span className="block bg-gradient-to-r from-white via-red-100 to-red-300 bg-clip-text text-transparent">
                  Code.
                </span>
                <span className="block text-red-500 drop-shadow-[0_0_28px_rgba(239,68,68,0.38)]">
                  Innovate.
                </span>
              </h1>

              <p className="mt-2 max-w-lg text-sm leading-7 text-white/80 sm:text-base">
                Industry-focused robotics programs for students, makers, and
                future innovators who want practical skills, guided builds, and
                real technology exposure from day one.
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="https://wa.me/917028511161?text=Hello%20Cyborg,%20I%20want%20to%20start%20learning%20robotics."
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-[#ff7a18] via-[#ff5b1f] to-[#ff3131] px-6 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(255,91,31,0.32)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(255,91,31,0.4)]"
                >
                  Start Building
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="https://res.cloudinary.com/dz8enfjtx/video/upload/v1759653436/cyborg_1_nspmur.mp4"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 bg-white/8 px-6 text-sm font-semibold text-white/88 backdrop-blur-md transition-all duration-300 hover:border-red-500/40 hover:bg-white/12"
                >
                  Watch Video
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>

              <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-white/48">
                Trusted by 10,000+ learners and families across hands-on tech
                programs
              </p>

              <div className="mt-6 grid w-full grid-cols-2 gap-4 lg:grid-cols-4">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
                      <stat.icon className="h-3.5 w-3.5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold tracking-tight text-white">
                        {stat.value}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.14em] text-white/45">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Carousel;
