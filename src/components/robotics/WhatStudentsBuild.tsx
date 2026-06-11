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
  colorKey: "red" | "blue";
}

const cards: CourseCard[] = [
  {
    accent: "#A81B1E",
    bg: "#fdf0f0",
    iconBg: "#f7c9c9",
    image: "/assets/year-long-course/courses/mechanical.png",
    Icon: Cog,
    label: "Mechanical Robotics",
    title: "Robotic Arm Design",
    desc: "Design robot mechanisms, kinematics, CAD models and intelligent automation systems.",
    tag: "Hardware",
    colorKey: "red",
  },
  {
    accent: "#0855AB",
    bg: "#f0f5fd",
    iconBg: "#c4d9f5",
    image: "/assets/year-long-course/courses/electronics.png",
    Icon: Cpu,
    label: "Electronics",
    title: "Arduino & Electronics",
    desc: "Build circuits with sensors, microcontrollers and real-world electronic systems.",
    tag: "Embedded",
    colorKey: "blue",
  },
  {
    accent: "#A81B1E",
    bg: "#fdf0f0",
    iconBg: "#f7c9c9",
    image: "/assets/year-long-course/courses/3dprinting.png",
    Icon: Box,
    label: "3D Printing",
    title: "3D Modeling & Printing",
    desc: "Design and prototype innovative products using advanced 3D modeling and fabrication.",
    tag: "Fabrication",
    colorKey: "red",
  },
  {
    accent: "#0855AB",
    bg: "#f0f5fd",
    iconBg: "#c4d9f5",
    image: "/assets/year-long-course/courses/coding-AI.png",
    Icon: Code2,
    label: "Coding & AI",
    title: "AI & Robot Programming",
    desc: "Program robots using Python, AI algorithms, computer vision and smart applications.",
    tag: "Software",
    colorKey: "blue",
  },
];

const WhatStudentsBuild = () => {
  return (
    <section className="py-20 px-4 bg-white">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-[11px] font-semibold tracking-[0.25em] text-gray-400 uppercase mb-2">
          Curriculum
        </p>

        <h2 className="text-[clamp(1.6rem,4vw,2.25rem)] font-bold text-[#062341] mb-4">
          What students <span className="text-red-600">build</span>
        </h2>

        <div className="flex items-center justify-center gap-2">
          <div className="h-[2px] w-12 bg-red-600 rounded-full" />
          <div className="w-2 h-2 rounded-full bg-red-600" />
          <div className="h-[2px] w-12 bg-red-600 rounded-full" />
        </div>
      </div>
      {/* Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-7">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.5,
              delay: index * 0.08,
            }}
            whileHover={{
              y: -12,
            }}
            className="group relative overflow-hidden rounded-[30px] bg-white border border-gray-100"
            style={{
              boxShadow:
                "0 15px 35px rgba(0,0,0,0.06), 0 5px 15px rgba(0,0,0,0.04)",
            }}
          >
            {/* Hover Glow */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500"
              style={{
                background: `linear-gradient(180deg, ${card.accent}08 0%, transparent 100%)`,
              }}
            />

            {/* Image Section */}
            <div
              className="relative h-[200px] overflow-hidden flex items-center justify-center"
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
                className="absolute top-4 left-4 text-6xl font-black opacity-10"
                style={{
                  color: card.accent,
                }}
              >
                0{index + 1}
              </div>

              {/* Badge */}
              <div
                className="absolute top-4 right-4 px-3 py-1 rounded-full text-[11px] font-bold z-20"
                style={{
                  backgroundColor: card.accent,
                  color: "white",
                }}
              >
                {card.tag}
              </div>

              {/* Glow */}
              <div
                className="absolute w-40 h-40 rounded-full blur-3xl opacity-25"
                style={{
                  backgroundColor: card.accent,
                }}
              />

              {/* Image */}
              <motion.div
                whileHover={{
                  scale: 1.08,
                  rotate: -2,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                }}
                className="relative z-10"
              >
                <Image
                  src={card.image}
                  alt={card.title}
                  width={280}
                  height={280}
                  className="object-contain"
                />
              </motion.div>

              {/* Icon */}
              <div
                className="absolute bottom-4 left-4 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                style={{
                  backgroundColor: card.iconBg,
                }}
              >
                <card.Icon
                  size={24}
                  style={{
                    color: card.accent,
                  }}
                />
              </div>
            </div>

            {/* Content */}
            <div className="p-3">
              <span
                className="text-[11px] uppercase tracking-[0.2em] font-bold"
                style={{
                  color: card.accent,
                }}
              >
                {card.label}
              </span>

              <h3 className="mt-1 text-[24px] font-bold text-[#062341] leading-tight">
                {card.title}
              </h3>

              <div
                className="mt-2 w-12 h-1 rounded-full"
                style={{
                  backgroundColor: card.accent,
                }}
              />

              <p className="mt-4 text-[15px] leading-relaxed text-gray-600 min-h-[80px]">
                {card.desc}
              </p>

              {/* CTA */}
              <div
                className=" flex items-center gap-2 font-semibold transition-all duration-300 group-hover:translate-x-1"
                style={{
                  color: card.accent,
                }}
              >
                Explore Module
                <ChevronRight size={16} />
              </div>
            </div>

            {/* Bottom Accent Bar */}
            <div
              className="absolute bottom-0 left-0 h-1 w-full scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500"
              style={{
                backgroundColor: card.accent,
              }}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default WhatStudentsBuild;
