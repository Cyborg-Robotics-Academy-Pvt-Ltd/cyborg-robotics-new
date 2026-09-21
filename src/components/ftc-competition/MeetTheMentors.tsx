"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Linkedin, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Mentor {
  id: string;
  name: string;
  specialization: string;
  role: string;
  image: string;
  linkedinUrl: string;
}

const MENTORS: Mentor[] = [
  {
    id: "nilesh-jaiswar",
    name: "Nilesh Jaiswar",
    specialization: "3D PRINTING & MECHANICAL DESIGN",
    role: "3D Printing & Mechanical Design",
    image: "/assets/team/nilesh.png",
    linkedinUrl: "https://linkedin.com/in/nilesh-jaiswar",
  },
  {
    id: "anchal-mishra",
    name: "Anchal Mishra",
    specialization: "PROGRAM LEAD",
    role: "Program Lead",
    image: "/assets/team/anchal.png",
    linkedinUrl: "https://linkedin.com/in/anchal-mishra",
  },
  {
    id: "pratima-thakur",
    name: "Pratima Thakur",
    specialization: "Soft Skills Expert",
    role: "Soft Skills Expert",
    image: "/assets/team/pratima.png",
    linkedinUrl: "https://linkedin.com/in/pratima-thakur-robotics",
  },
];

function TechnicalCorners() {
  return (
    <>
      <span className="absolute left-5 top-5 h-5 w-5 border-l border-t border-white/15" />
      <span className="absolute right-5 top-5 h-5 w-5 border-r border-t border-white/15" />
      <span className="absolute bottom-5 left-5 h-5 w-5 border-b border-l border-white/15" />
      <span className="absolute bottom-5 right-5 h-5 w-5 border-b border-r border-white/15" />
    </>
  );
}

function MentorCard({ mentor, index }: { mentor: Mentor; index: number }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.7,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="
        group relative
        h-[240px]
        w-full
        max-w-[240px]
        justify-self-center
        overflow-hidden
        rounded-[24px]
        border border-white/[0.11]
        bg-[#0D0F12]
        shadow-[0_25px_80px_rgba(0,0,0,0.45)]
        transition-all duration-500
        hover:border-[#ED1C24]/60
        hover:shadow-[0_30px_100px_rgba(237,28,36,0.12)]
        sm:h-[350px]
        sm:w-[330px]
        py-10
      "
    >
      {/* Card radial red lighting */}
      <div
        className="
          pointer-events-none absolute
          -top-32 left-1/2
          h-80 w-80
          -translate-x-1/2
          rounded-full
          bg-[#ED1C24]/10
          blur-[100px]
          transition-all duration-700
          group-hover:bg-[#ED1C24]/20
        "
      />

      {/* Technical grid */}
      <div
        className="
          pointer-events-none absolute inset-0 z-10 opacity-[0.12]
          [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)]
          [background-size:42px_42px]
          [mask-image:linear-gradient(to_bottom,black,transparent_65%)]
        "
      />

      {/* Portrait */}
      <div className="absolute inset-0">
        {imgFailed ? (
          <div className="flex h-full w-full items-center justify-center bg-[#14161A] text-[#3a3d42]">
            <span className="font-[Syne] text-6xl font-bold">
              {mentor.name.charAt(0)}
            </span>
          </div>
        ) : (
          <Image
            src={mentor.image}
            alt={mentor.name}
            fill
            priority={index === 0}
            sizes="(max-width: 640px) 70vw, (max-width: 1280px) 45vw, 280px"
            onError={() => setImgFailed(true)}
            className="
              object-cover
              object-top
              transition-transform
              duration-1000
              ease-out
              group-hover:scale-[1.035]
            "
          />
        )}

        {/* portrait cinematic grading */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(7,8,9,0.08)_0%,rgba(7,8,9,0)_38%,rgba(7,8,9,0.38)_60%,#070809_100%)]" />

        {/* red side rim */}
        <div
          className="
            absolute inset-y-0 right-0 w-24
            bg-gradient-to-l from-[#ED1C24]/10 to-transparent
            opacity-70
          "
        />
      </div>

      {/* subtle diagonal engineering lines */}
      <div className="pointer-events-none absolute right-0 top-32 z-20 h-px w-28 rotate-[-35deg] bg-[#ED1C24]/40" />
      <div className="pointer-events-none absolute right-3 top-36 z-20 h-px w-16 rotate-[-35deg] bg-white/15" />

      {/* Top UI */}
      <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between p-5">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ED1C24] shadow-[0_0_12px_#ED1C24]" />

          <span className="rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-white/75 backdrop-blur-xl">
            Mentor
          </span>
        </div>

        <Link
          href={mentor.linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${mentor.name} on LinkedIn`}
          className="
            flex h-10 w-10 items-center justify-center
            rounded-full
            border border-white/15
            bg-black/35
            text-white/80
            backdrop-blur-xl
            transition-all duration-300
            hover:border-[#ED1C24]/60
            hover:bg-[#ED1C24]
            hover:text-white
          "
        >
          <Linkedin size={15} strokeWidth={2} />
        </Link>
      </div>

      {/* Technical ID */}
      <div className="absolute left-5 top-[92px] z-20 font-mono text-[8px] tracking-[0.22em] text-white/30">
        CRA / MENTOR / 0{index + 1}
      </div>

      {/* Corner brackets */}
      <TechnicalCorners />

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-0 z-30 p-6 sm:p-7">
        <h3
          className="
            font-[Syne]
            text-[30px]
            font-bold
            leading-none
            tracking-[-0.03em]
            text-white
            sm:text-[34px]
          "
        >
          {mentor.name}
        </h3>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-[13px] text-[#A7ADB5]">{mentor.role}</p>

          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/50 transition-all duration-300 group-hover:border-[#ED1C24]/40 group-hover:text-[#ED1C24]">
            <ArrowUpRight size={14} />
          </div>
        </div>

        {/* animated technical line */}
        <div className="mt-5 h-px w-full bg-white/[0.10]">
          <div className="h-full w-10 bg-[#ED1C24] transition-all duration-700 group-hover:w-full" />
        </div>
      </div>

      {/* hover red atmosphere */}
      <div className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,rgba(237,28,36,0.10),transparent_35%)]" />
      </div>
    </motion.article>
  );
}

export default function MeetTheMentors() {
  return (
    <section
      id="mentors"
      className="
        relative
        overflow-hidden
        bg-[#070809]
        py-24
        sm:py-28
        lg:py-32
      "
    >
      {/* =========================================================
          BACKGROUND ATMOSPHERE
      ========================================================== */}

      <div className="pointer-events-none absolute inset-0">
        {/* subtle red light */}
        <div className="absolute -left-40 top-20 h-[500px] w-[500px] rounded-full bg-[#ED1C24]/[0.055] blur-[150px]" />

        <div className="absolute right-[-200px] bottom-[-150px] h-[500px] w-[500px] rounded-full bg-[#9E1118]/[0.045] blur-[150px]" />

        {/* horizontal technical line */}
        <div className="absolute left-0 right-0 top-[42%] h-px bg-white/[0.035]" />

        {/* ghost typography */}
        <div
          className="
            absolute
            -bottom-10
            left-[2%]
            select-none
            font-[Syne]
            text-[18vw]
            font-bold
            leading-none
            tracking-[-0.08em]
            text-transparent
            [-webkit-text-stroke:1px_rgba(255,255,255,0.035)]
          py-12
          "
        >
          MENTORS
        </div>
      </div>

      <div className="relative mx-auto max-w-[1500px] px-6 sm:px-10 lg:px-16">
        <div className="grid items-center gap-14 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16 xl:grid-cols-[0.68fr_1.32fr]">
          {/* =====================================================
              LEFT — EDITORIAL CONTENT
          ====================================================== */}

          <div className="relative z-10 max-w-[500px]">
            {/* section marker */}
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-8 bg-[#ED1C24]" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#ED1C24]">
                Our Support System
              </span>
            </div>

            {/* heading */}
            <h2
              className="
                font-[Syne]
                text-[52px]
                font-bold
                leading-[0.95]
                tracking-[-0.045em]
                text-white
                sm:text-[64px]
                lg:text-[70px]
                xl:text-[76px]
              "
            >
              Meet the <span className="text-[#ED1C24]">Mentors</span>
            </h2>

            {/* description */}
            <p
              className="
                mt-7
                max-w-[430px]
                text-[15px]
                leading-[1.8]
                text-[#A7ADB5]
                sm:text-[16px]
              "
            >
              Learn from industry experts, passionate educators and experienced
              professionals who are dedicated to your success.
            </p>

            {/* decorative engineering lines */}
            <div className="mt-8 flex items-center gap-2">
              <div className="h-[2px] w-16 bg-[#ED1C24]" />
              <div className="h-px w-24 bg-white/10" />
              <div className="h-px w-8 bg-white/10" />
            </div>

            {/* small system metadata */}
            <div className="mt-12 hidden items-center gap-8 lg:flex">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">
                  Network
                </p>

                <p className="mt-2 text-[13px] font-medium text-white/70">
                  Industry Experts
                </p>
              </div>

              <div className="h-8 w-px bg-white/10" />

              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">
                  System
                </p>

                <p className="mt-2 text-[13px] font-medium text-white/70">
                  Learning Support
                </p>
              </div>
            </div>
          </div>

          {/* =====================================================
              RIGHT — MENTOR CARDS
          ====================================================== */}

          <div className="relative min-w-0">
            {/* top technical label */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ED1C24] shadow-[0_0_10px_#ED1C24]" />

                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">
                  Mentor Network
                </span>
              </div>

              <span className="font-mono text-[9px] tracking-[0.18em] text-white/20">
                CRA / 2026
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {MENTORS.map((mentor, index) => (
                <MentorCard key={mentor.id} mentor={mentor} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          MINIMAL CHAT WIDGET
          ⚠️ Fixed-position element scoped to this section — if this
          component unmounts/remounts across routes, extract it to
          layout.tsx to avoid duplicate/flickering renders.
      ========================================================== */}

      <div className="fixed bottom-6 right-6 z-50 hidden items-center gap-2 sm:flex">
        <div
          className="
            rounded-full
            border border-white/10
            bg-[#0D0F12]/90
            px-4 py-2.5
            text-[11px]
            font-medium
            text-white/65
            shadow-2xl
            backdrop-blur-xl
          "
        >
          Need help? We’re here!
        </div>

        <button
          aria-label="Open support chat"
          className="
            relative
            flex h-12 w-12
            items-center justify-center
            rounded-full
            bg-[#ED1C24]
            text-white
            shadow-[0_8px_30px_rgba(237,28,36,0.25)]
            transition-all duration-300
            hover:scale-105
            hover:shadow-[0_10px_40px_rgba(237,28,36,0.4)]
          "
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H8l-4 3v-6.2A7.5 7.5 0 1 1 20 11.5Z" />
          </svg>

          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[#070809] bg-[#ED1C24]" />
        </button>
      </div>
    </section>
  );
}
