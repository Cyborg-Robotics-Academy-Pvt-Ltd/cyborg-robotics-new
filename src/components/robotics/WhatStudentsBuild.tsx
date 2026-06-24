"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  Cog,
  Cpu,
  Layers,
  Trophy,
  X,
  Clock,
  Users,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  type LucideIcon,
  Drone,
  CodeXml,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";

interface CourseCard {
  accent: string;
  bg: string;
  iconBg: string;
  image: string;
  Icon: LucideIcon;
  label: string;
  title: string;
  desc: string;
  tag: string;
  duration: string;
  ageGroup: string;
  level: string;
  difficulty: DifficultyLevel;
  progressPct: number;
  prerequisites: string[];
  nextModule: string | null;
  curriculum: { topic: string }[];
  projects: string[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const cards: CourseCard[] = [
  {
    accent: "#A81B1E",
    bg: "#fdf0f0",
    iconBg: "#f7c9c9",
    image: "/assets/year-long-course/courses/mechanical-2.png",
    Icon: Cog,
    label: "Mechanical Module",
    title: "LEGO SPIKE, EV3, Quarky & App Design",
    desc: "Build competition robots, smart vehicles, Quarky-powered machines, and interactive Google Sites — from gears to code.",
    tag: "Robotics",
    duration: "12 Sessions",
    ageGroup: "8–16 yrs",
    level: "Beginner → Intermediate",
    difficulty: "Beginner",
    progressPct: 40,
    prerequisites: ["None — open to all students"],
    nextModule: "Electronics, Arduino & 3D Printing",
    curriculum: [
      { topic: "Quality Check Robot — SPIKE Prime build & logic" },
      { topic: "Smart Bike — gear systems & motion control" },
      { topic: "Driving Base with Ultrasonic Sensor" },
      { topic: "Colour Sorter — sensor-based automation" },
      { topic: "Robot Control & Expressions with Quarky" },
      { topic: "Smart Navigation with Sensors" },
      { topic: "Actuators & Pick-and-Place Mechanism" },
      { topic: "Creative Computing — Fruit Piano project" },
      { topic: "Google Sites — site structure & pages" },
      { topic: "Google Sites — styling, media & publishing" },
      { topic: "Doodle Making — digital illustration basics" },
      { topic: "Capstone showcase & module review" },
    ],
    projects: [
      "Quality Check Robot",
      "Smart Bike",
      "Colour Sorter",
      "Quarky Fruit Piano",
      "Personal Google Site",
    ],
  },
  {
    accent: "#0855AB",
    bg: "#f0f5fd",
    iconBg: "#c4d9f5",
    image: "/assets/year-long-course/courses/Electronics-Module.png",
    Icon: Cpu,
    label: "Electronics Module",
    title: "Electronics, Arduino & 3D Printing",
    desc: "Go from circuit fundamentals to Arduino robotics and hands-on 3D design — ending with a full printed mega-project.",
    tag: "Embedded",
    duration: "12 Sessions",
    ageGroup: "10–16 yrs",
    level: "Beginner → Advanced",
    difficulty: "Intermediate",
    progressPct: 65,
    prerequisites: ["Mechanical Module (recommended)"],
    nextModule: "Python, Game Dev & SPIKE + Python",
    curriculum: [
      { topic: "Introduction to Electronics — components & safety" },
      { topic: "Logic and Control — switches, relays & gates" },
      { topic: "Sensors and Components — types & interfacing" },
      { topic: "Applications & Advanced Components" },
      { topic: "Introduction to Robotics & Arduino IDE" },
      { topic: "LED Blinking & Basic Electronics — Mini Project Day" },
      { topic: "Sensors & Motion — understanding the Hand Follower Robot" },
      { topic: "Building & Testing the Hand Follower Robot (8hr Bootcamp)" },
      { topic: "Introduction to 3D Printing & Tinkercad Interface" },
      { topic: "Using Tools & Shapes — Mini Projects (Rocket + Keychain)" },
      {
        topic: "Intro to Slicer + Start Mega Project (House Interior/Exterior)",
      },
      { topic: "Continue & Complete Mega Project — Capstone showcase" },
    ],
    projects: [
      "Hand Follower Robot",
      "LED Mini Project",
      "3D Rocket & Keychain",
      "3D House Mega Project",
    ],
  },
  {
    accent: "#A81B1E",
    bg: "#fdf0f0",
    iconBg: "#f7c9c9",
    image: "/assets/year-long-course/courses/Coding-Module.png",
    Icon: CodeXml,
    label: "Coding Module",
    title: "Python, Game Dev & SPIKE + Python",
    desc: "Master Python from basics to GUI apps and games, then combine it with SPIKE Prime for real physical-world programming.",
    tag: "Software",
    duration: "13 Sessions",
    ageGroup: "10–16 yrs",
    level: "Beginner → Intermediate",
    difficulty: "Intermediate",
    progressPct: 70,
    prerequisites: ["Basic computer usage", "Electronics Module (recommended)"],
    nextModule: "Drone Technology & Flight Systems",
    curriculum: [
      { topic: "Python Basics + Input / Output" },
      { topic: "Conditional Logic + Functions" },
      { topic: "Loops + Error Handling + Modular Design" },
      { topic: "GUI Calculator using Tkinter" },
      { topic: "Introduction to Turtle Graphics" },
      { topic: "Animation & Keyboard Control" },
      { topic: "Game Setup — Jumping, Gravity & Obstacle Movement" },
      { topic: "Final Dino Game — Scoring, Collision & Game Over" },
      { topic: "Music Maker — SPIKE + Python audio control" },
      { topic: "Grabber — mechanical arm with Python logic" },
      { topic: "Ferris Wheel — motion & timing sequences" },
      { topic: "Weather Forecaster — sensor data + display" },
      { topic: "Financial Literacy session + Capstone showcase" },
    ],
    projects: [
      "Tkinter GUI Calculator",
      "Dino Game (Turtle)",
      "SPIKE Music Maker",
      "SPIKE Ferris Wheel",
      "Weather Forecaster",
    ],
  },
  {
    accent: "#0855AB",
    bg: "#f0f5fd",
    iconBg: "#c4d9f5",
    image: "/assets/year-long-course/courses/image.png",
    Icon: Drone,
    label: "Drone Module",
    title: "Drone Technology & Flight Systems",
    desc: "Learn flight physics, assemble a real drone, train on simulators, and complete a live flying mission.",
    tag: "Aerial Tech",
    duration: "4 Sessions",
    ageGroup: "12–16 yrs",
    level: "Intermediate",
    difficulty: "Advanced",
    progressPct: 90,
    prerequisites: ["Mechanical Module", "Electronics Module"],
    nextModule: "Final Showcase & Show and Tell",
    curriculum: [
      { topic: "Introduction to Drones & safety protocols" },
      { topic: "Drone components & working principle" },
      { topic: "Drone assembly & controller setup" },
      { topic: "Flying & Stability — hands-on flight session" },
    ],
    projects: ["Assembled & Calibrated Drone", "Controlled Flight Mission"],
  },
  {
    accent: "#A81B1E",
    bg: "#fdf0f0",
    iconBg: "#f7c9c9",
    image: "/assets/year-long-course/courses/graduation1.png",
    Icon: Trophy,
    label: "Graduation",
    title: "Final Showcase & Show and Tell",
    desc: "Students present their best projects from all modules to an audience of peers, parents, and mentors.",
    tag: "Demo Day",
    duration: "1 Day",
    ageGroup: "All students",
    level: "All Modules",
    difficulty: "Advanced",
    progressPct: 100,
    prerequisites: ["All 4 modules completed"],
    nextModule: null,
    curriculum: [
      { topic: "Final Showcase — present projects from all modules" },
      { topic: "Show and Tell — peer demos & audience Q&A" },
      { topic: "Capstone presentations with mentors & judges" },
      { topic: "Certificate ceremony & graduation" },
    ],
    projects: [
      "Cross-module portfolio",
      "Live project demo",
      "Graduation certificate",
    ],
  },
];

// ─── Difficulty config ────────────────────────────────────────────────────────

const DIFFICULTY_CONFIG: Record<
  DifficultyLevel,
  { label: string; color: string; filledDots: number }
> = {
  Beginner: { label: "Beginner", color: "#16a34a", filledDots: 1 },
  Intermediate: { label: "Intermediate", color: "#d97706", filledDots: 2 },
  Advanced: { label: "Advanced", color: "#A81B1E", filledDots: 3 },
};

// ─── DifficultyBadge ──────────────────────────────────────────────────────────

const DifficultyBadge = ({ difficulty }: { difficulty: DifficultyLevel }) => {
  const cfg = DIFFICULTY_CONFIG[difficulty];
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-[3px]">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-colors"
            style={{
              backgroundColor: i <= cfg.filledDots ? cfg.color : "#e5e7eb",
            }}
          />
        ))}
      </div>
      <span className="text-[11px] font-bold" style={{ color: cfg.color }}>
        {cfg.label}
      </span>
    </div>
  );
};

// ─── ProgressBar ─────────────────────────────────────────────────────────────

interface ProgressBarProps {
  pct: number;
  accent: string;
}

const ProgressBar = ({ pct, accent }: ProgressBarProps) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-gray-400 font-medium">
          Course progress
        </span>
        <span className="text-[11px] font-bold" style={{ color: accent }}>
          {pct}%
        </span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="h-full rounded-full"
          style={{ backgroundColor: accent }}
        />
      </div>
    </div>
  );
};

// ─── ProgressSection ─────────────────────────────────────────────────────────

interface ProgressSectionProps {
  card: CourseCard;
}

const ProgressSection = ({ card }: ProgressSectionProps) => {
  return (
    <div className="rounded-2xl border border-gray-100 overflow-hidden">
      {/* Difficulty row */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
        <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-gray-400">
          Difficulty
        </span>
        <DifficultyBadge difficulty={card.difficulty} />
      </div>

      {/* Progress bar row */}
      <div className="px-4 py-3 border-b border-gray-100 bg-white">
        <ProgressBar pct={card.progressPct} accent={card.accent} />
      </div>

      {/* Prerequisites */}
      <div className="px-4 py-3 border-b border-gray-100 bg-white">
        <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-gray-400 mb-2">
          Prerequisites
        </p>
        <ul className="space-y-1">
          {card.prerequisites.map((p) => (
            <li
              key={p}
              className="flex items-center gap-2 text-[12px] text-[#062341]"
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: card.accent }}
              />
              {p}
            </li>
          ))}
        </ul>
      </div>

      {/* Next module */}
      {card.nextModule && (
        <div className="px-4 py-3 bg-white flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-gray-400 mb-1">
              Next Module
            </p>
            <p className="text-[12px] font-semibold text-[#062341]">
              {card.nextModule}
            </p>
          </div>
          <ArrowRight
            size={16}
            style={{ color: card.accent }}
            className="flex-shrink-0"
          />
        </div>
      )}
    </div>
  );
};

// ─── CurriculumDrawer ─────────────────────────────────────────────────────────

interface DrawerProps {
  card: CourseCard | null;
  onClose: () => void;
}

const CurriculumDrawer = ({ card, onClose }: DrawerProps) => {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = card ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [card]);

  return (
    <AnimatePresence>
      {card && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 z-40 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed top-0 right-0 bottom-0 w-[380px] max-w-[95vw] bg-white z-50 flex flex-col shadow-2xl overflow-hidden"
            aria-label={`${card.label} curriculum`}
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div
              className="flex items-start justify-between gap-4 px-6 pt-6 pb-5 border-b border-gray-100 flex-shrink-0"
              style={{ borderLeftColor: card.accent, borderLeftWidth: 4 }}
            >
              <div>
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.18em] px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: card.bg, color: card.accent }}
                >
                  {card.tag}
                </span>
                <h2
                  className="mt-2 text-[15px] font-bold leading-snug"
                  style={{ color: "#062341" }}
                >
                  {card.title}
                </h2>
                <p className="mt-0.5 text-[12px] text-gray-500">{card.label}</p>
              </div>

              <button
                onClick={onClose}
                className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                aria-label="Close drawer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Meta */}
            <div className="px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { Icon: Clock, label: "Duration", value: card.duration },
                  { Icon: Users, label: "Age group", value: card.ageGroup },
                  { Icon: TrendingUp, label: "Level", value: card.level },
                ].map(({ Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex flex-col gap-1 bg-gray-50 rounded-xl p-3"
                  >
                    <Icon size={14} style={{ color: card.accent }} />
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">
                      {label}
                    </span>
                    <span className="text-[12px] font-semibold text-[#062341] leading-tight">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Difficulty & Progress */}
              <ProgressSection card={card} />

              {/* Weekly breakdown */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-3">
                  Topics Covered
                </p>
                <div className="space-y-2">
                  {card.curriculum.map(({ topic }, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 py-2.5 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <span
                        className="text-[10px] font-bold mt-0.5 flex-shrink-0 w-6"
                        style={{ color: card.accent }}
                      >
                        {index + 1}.
                      </span>
                      <span className="text-[12px] text-[#062341] leading-snug">
                        {topic}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-3">
                  Projects
                </p>
                <div className="space-y-2">
                  {card.projects.map((project) => (
                    <div
                      key={project}
                      className="flex items-center gap-3 py-2.5 px-3 rounded-xl border border-gray-100 bg-white"
                    >
                      <CheckCircle2
                        size={15}
                        style={{ color: card.accent }}
                        className="flex-shrink-0"
                      />
                      <span className="text-[13px] font-medium text-[#062341]">
                        {project}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer CTA */}
            <div className="px-6 py-5 border-t border-gray-100 flex-shrink-0">
              <button
                className="w-full py-3 rounded-2xl text-[13px] font-bold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: card.accent }}
              >
                Enroll in {card.label}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── CardItem ─────────────────────────────────────────────────────────────────

interface CardItemProps {
  card: CourseCard;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

const CardItem = ({ card, index, isActive, onClick }: CardItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -8 }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Open ${card.label} curriculum`}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className="group relative overflow-hidden rounded-[28px] bg-white flex flex-col cursor-pointer outline-none focus-visible:ring-2 transition-shadow"
      style={{
        border: isActive ? `2px solid ${card.accent}` : "1.5px solid #f0f0f0",
        boxShadow: isActive
          ? `0 0 0 4px ${card.accent}18`
          : "0 8px 24px rgba(0,0,0,0.06)",
      }}
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, ${card.accent}0a 0%, transparent 100%)`,
        }}
      />

      {/* Image area */}
      <div
        className="relative h-[200px] overflow-hidden flex items-center justify-center flex-shrink-0"
        style={{
          background: `linear-gradient(180deg, ${card.bg} 0%, #ffffff 100%)`,
        }}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `
              linear-gradient(${card.accent} 1px, transparent 1px),
              linear-gradient(90deg, ${card.accent} 1px, transparent 1px)
            `,
            backgroundSize: "22px 22px",
          }}
        />

        {/* Big number */}
        <div
          className="absolute top-4 left-4 z-[9] text-6xl font-black opacity-10"
          style={{ color: card.accent }}
        >
          0{index + 1}
        </div>

        {/* Badge */}
        <div
          className="absolute top-4 right-4 px-3 py-1 rounded-full text-[11px] font-bold z-20"
          style={{ backgroundColor: card.accent, color: "white" }}
        >
          {card.tag}
        </div>

        {/* Glow */}
        <div
          className="absolute w-40 h-40 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: card.accent }}
        />

        {/* Image */}
        <motion.div
          whileHover={{ scale: 1.06, rotate: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="relative z-10"
        >
          <Image
            src={card.image}
            alt={card.title}
            width={200}
            height={200}
            className="object-contain"
          />
        </motion.div>

        {/* Icon */}
        <div
          className="absolute bottom-4 left-4 w-10 h-10 rounded-2xl flex items-center justify-center shadow z-20"
          style={{ backgroundColor: card.iconBg }}
        >
          <card.Icon size={22} style={{ color: card.accent }} />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <span
          className="text-[10px] uppercase tracking-[0.2em] font-bold"
          style={{ color: card.accent }}
        >
          {card.label}
        </span>

        <h3 className="mt-1 text-[14px] font-bold text-[#062341] leading-snug">
          {card.title}
        </h3>

        <div
          className="mt-2 w-10 h-[3px] rounded-full"
          style={{ backgroundColor: card.accent }}
        />

        <p className="mt-3 text-[12px] leading-relaxed text-gray-500 flex-1 line-clamp-3">
          {card.desc}
        </p>

        {/* "View curriculum" hint */}
        <div
          className="mt-4 flex items-center gap-1 text-[11px] font-semibold  transition-opacity"
          style={{ color: card.accent }}
        >
          View curriculum
          <span className="text-[14px]">→</span>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div
        className="absolute bottom-0 left-0 h-[3px] w-full scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500"
        style={{ backgroundColor: card.accent }}
      />
    </motion.div>
  );
};

// ─── WhatStudentsBuild ────────────────────────────────────────────────────────

const WhatStudentsBuild = () => {
  const [activeCard, setActiveCard] = useState<CourseCard | null>(null);

  const handleClose = useCallback(() => setActiveCard(null), []);

  return (
    <>
      <section className="px-4 bg-white">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[11px] font-semibold tracking-[0.25em] text-gray-400 uppercase">
            Curriculum
          </p>
          <h2 className="text-[clamp(1.6rem,4vw,2.25rem)] font-bold text-[#062341] mt-1">
            What students <span className="text-red-600">build</span>
          </h2>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="h-[2px] w-12 bg-red-600 rounded-full" />
            <div className="w-2 h-2 rounded-full bg-red-600" />
            <div className="h-[2px] w-12 bg-red-600 rounded-full" />
          </div>
        </div>

        {/* Cards */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {cards.map((card, index) => (
              <CardItem
                key={card.title}
                card={card}
                index={index}
                isActive={activeCard?.title === card.title}
                onClick={() =>
                  setActiveCard(activeCard?.title === card.title ? null : card)
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* Drawer */}
      <CurriculumDrawer card={activeCard} onClose={handleClose} />
    </>
  );
};

export default WhatStudentsBuild;
