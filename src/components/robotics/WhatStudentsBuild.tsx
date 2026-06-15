"use client";

import React from "react";
import Image from "next/image";
import { motion } from "motion/react";
import {
  Cog,
  Cpu,
  Box,
  Code2,
  type LucideIcon,
  ChevronRight,
  Plane,
} from "lucide-react";

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
}

const cards: CourseCard[] = [
  {
    accent: "#A81B1E",
    bg: "#fdf0f0",
    iconBg: "#f7c9c9",
    image: "/assets/year-long-course/courses/mechanical-2.png",
    Icon: Cog,
    label: "Mechanical Module",
    title: "LEGO SPIKE, EV3, Quarky & App Design",
    desc: "Build robots, automation systems, smart vehicles, and interactive web projects.",
    tag: "Robotics",
  },
  {
    accent: "#0855AB",
    bg: "#f0f5fd",
    iconBg: "#c4d9f5",
    image: "/assets/year-long-course/courses/Electronics-Module.png",
    Icon: Cpu,
    label: "Electronics Module",
    title: "Electronics, Arduino & Smart Systems",
    desc: "Learn circuits, sensors, Arduino programming, and smart automation projects.",
    tag: "Embedded",
  },
  {
    accent: "#A81B1E",
    bg: "#fdf0f0",
    iconBg: "#f7c9c9",
    image: "/assets/year-long-course/courses/3dprinting-module.png",
    Icon: Box,
    label: "3D Printing Module",
    title: "Tinkercad, Design & Fabrication",
    desc: "Design and create 3D models, prototypes, and real-world products.",
    tag: "3D Lab",
  },
  {
    accent: "#0855AB",
    bg: "#f0f5fd",
    iconBg: "#c4d9f5",
    image: "/assets/year-long-course/courses/Coding-Module.png",
    Icon: Code2,
    label: "Coding Module",
    title: "Python Programming & Game Development",
    desc: "Learn Python, build games, animations, and robotics applications.",
    tag: "Software",
  },
  {
    accent: "#A81B1E",
    bg: "#fdf0f0",
    iconBg: "#f7c9c9",
    image: "/assets/year-long-course/courses/oding-Module.png",
    Icon: Plane,
    label: "Drone Module",
    title: "Drone Technology & Flight Systems",
    desc: "Understand drone technology, flight control, and hands-on flying.",
    tag: "Aerial Tech",
  },
];

// ─── CardItem ────────────────────────────────────────────────────────────────

interface CardItemProps {
  card: CourseCard;
  index: number;
}

const CardItem = ({ card, index }: CardItemProps) => {
  return (
    <motion.div
      key={card.title}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -12 }}
      className="group relative overflow-hidden rounded-[30px] bg-white border border-gray-100 flex flex-col"
      style={{
        boxShadow: "0 15px 35px rgba(0,0,0,0.06), 0 5px 15px rgba(0,0,0,0.04)",
      }}
    >
      {/* Hover Glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(180deg, ${card.accent}08 0%, transparent 100%)`,
        }}
      />

      {/* Image Section */}
      <div
        className="relative h-[200px] overflow-hidden flex items-center justify-center flex-shrink-0"
        style={{
          background: `linear-gradient(180deg, ${card.bg} 0%, #ffffff 100%)`,
        }}
      >
        {/* Grid Pattern */}
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

        {/* Big Number */}
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
          className="absolute w-40 h-40 rounded-full blur-3xl opacity-25"
          style={{ backgroundColor: card.accent }}
        />

        {/* Image */}
        <motion.div
          whileHover={{ scale: 1.08, rotate: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="relative z-10"
        >
          <Image
            src={card.image}
            alt={card.title}
            width={220}
            height={220}
            className="object-contain"
          />
        </motion.div>

        {/* Icon */}
        <div
          className="absolute bottom-4 left-4 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg z-20"
          style={{ backgroundColor: card.iconBg }}
        >
          <card.Icon size={24} style={{ color: card.accent }} />
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

        <h3 className="mt-1 text-[15px] font-bold text-[#062341] leading-tight">
          {card.title}
        </h3>

        <div
          className="mt-2 w-12 h-1 rounded-full"
          style={{ backgroundColor: card.accent }}
        />

        <p className="mt-4 text-[12px] leading-relaxed text-gray-600 flex-1 line-clamp-5">
          {card.desc}
        </p>
      </div>

      {/* Bottom Accent Bar */}
      <div
        className="absolute bottom-0 left-0 h-1 w-full scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500"
        style={{ backgroundColor: card.accent }}
      />
    </motion.div>
  );
};

// ─── WhatStudentsBuild ────────────────────────────────────────────────────────

const WhatStudentsBuild = () => {
  return (
    <section className=" px-4 bg-white">
      {/* Header */}
      <div className="text-center mb-4">
        <p className="text-[11px] font-semibold tracking-[0.25em] text-gray-400 uppercase ">
          Curriculum
        </p>

        <h2 className="text-[clamp(1.6rem,4vw,2.25rem)] font-bold text-[#062341] ">
          What students <span className="text-red-600">build</span>
        </h2>

        <div className="flex items-center justify-center gap-2">
          <div className="h-[2px] w-12 bg-red-600 rounded-full" />
          <div className="w-2 h-2 rounded-full bg-red-600" />
          <div className="h-[2px] w-12 bg-red-600 rounded-full" />
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-7xl mx-auto space-y-7">
        {/* Row 1 — 3 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  xl:grid-cols-5  gap-7">
          {cards.map((card, index) => (
            <CardItem key={card.title} card={card} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatStudentsBuild;
