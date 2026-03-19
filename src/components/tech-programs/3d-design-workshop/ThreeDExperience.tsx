import React from "react";
import { motion } from "framer-motion";
import { Layers3, Box, Printer, Trophy, MoveRight } from "lucide-react";

const ThreeDExperience = () => {
  const modules = [
    {
      icon: Layers3,
      number: "01",
      title: "3D Design Basics",
      description:
        "Introduction to 3D design concepts and core modeling ideas.",
      highlight: "#A81B1E",
    },
    {
      icon: Box,
      number: "02",
      title: "Create Your First 3D Model",
      description:
        "Build your first model step by step using beginner-friendly tools.",
      highlight: "#062341",
    },
    {
      icon: Printer,
      number: "03",
      title: "3D Printing Technology",
      description:
        "Understand printers, materials, layers, and how designs become real objects.",
      highlight: "#0855AB",
    },
  ];

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600&display=swap');

        .learn-section { font-family: 'Outfit', sans-serif; }
        .display-font { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.04em; }

        /* ── Apple-style progressive reveal trick ── */
        /* Each row has a left-border that "fills" on hover using a pseudo-element */
        .module-row {
          border-bottom: 1px solid rgba(6,35,65,0.07);
          border-left: 3px solid transparent;
          transition: background 0.28s ease, border-left-color 0.28s ease, transform 0.28s cubic-bezier(0.23,1,0.32,1);
          cursor: default;
          border-radius: 0 12px 12px 0;
        }
        .module-row:first-child { border-top: 1px solid rgba(6,35,65,0.07); }

        .module-row:hover {
          background: rgba(6,35,65,0.025);
          transform: translateX(4px);
        }
        .module-row.red:hover   { border-left-color: #A81B1E; background: rgba(168,27,30,0.03); }
        .module-row.navy:hover  { border-left-color: #062341; background: rgba(6,35,65,0.035); }
        .module-row.blue:hover  { border-left-color: #0855AB; background: rgba(8,85,171,0.03); }

        .module-row:hover .row-icon  { opacity: 1; }
        .module-row:hover .row-number { opacity: 0.45; }
        .module-row:hover .row-arrow  { transform: translateX(8px); opacity: 1; }
        .module-row:hover .row-title  { letter-spacing: 0.06em; }

        .row-icon   { transition: transform 0.35s cubic-bezier(0.23,1,0.32,1), opacity 0.28s; opacity: 0.5; }
        .row-number { opacity: 0.22; transition: opacity 0.28s; font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.04em; }
        .row-arrow  { opacity: 0.25; transition: transform 0.3s ease, opacity 0.28s; }
        .row-title  { transition: letter-spacing 0.3s ease; }

        /* ── Outcome box ── */
        .outcome-strip {
          background: linear-gradient(120deg, #7f1518 0%, #A81B1E 46%);
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }
        /* Faint giant printer watermark — Apple product page trick */
        .outcome-strip::before {
          content: '';
          position: absolute;
          right: 5%;
          top: 50%;
          transform: translateY(-50%);
          width: 220px;
          height: 220px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='0.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 6 2 18 2 18 9'/%3E%3Cpath d='M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2'/%3E%3Crect x='6' y='14' width='12' height='8'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-size: contain;
          opacity: 0.04;
          pointer-events: none;
        }
        /* Subtle diagonal shimmer line */
        .outcome-strip::after {
          content: '';
          position: absolute;
          top: -60%;
          left: -10%;
          width: 40%;
          height: 220%;
          background: linear-gradient(105deg, transparent, rgba(8,85,171,0.22), transparent);
          pointer-events: none;
        }

        .tag-chip {
          font-family: 'Outfit', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }
      `}</style>

      <motion.section
        className="learn-section relative py-16 md:py-24 overflow-hidden bg-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Dot grid */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.032]"
          style={{
            backgroundImage: "radial-gradient(#062341 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Ambient glows */}
        <div className="pointer-events-none absolute top-0 left-0 w-[420px] h-[280px] rounded-full bg-[#A81B1E]/5 blur-[110px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-[380px] h-[280px] rounded-full bg-[#0855AB]/7 blur-[100px]" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6">
          {/* ── Header ── */}
          <motion.div
            className="mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-10 bg-[#A81B1E]" />
                <span className="tag-chip text-[#A81B1E]">Curriculum</span>
              </div>
              <h2 className="display-font text-6xl md:text-7xl lg:text-8xl leading-none text-[#062341]">
                WHAT
                <br />
                <span
                  style={{
                    WebkitTextStroke: "2px #0855AB",
                    color: "transparent",
                  }}
                >
                  STUDENTS
                </span>
                <br />
                <span className="text-[#A81B1E]">WILL LEARN</span>
              </h2>
            </div>
            <p className="text-slate-400 text-sm md:text-base max-w-xs leading-relaxed font-light md:text-right">
              A step-by-step curriculum that transforms complete beginners into
              confident creators.
            </p>
          </motion.div>

          {/* ── Module rows ── */}
          <div className="mb-12">
            {modules.map((mod, index) => {
              const ModIcon = mod.icon;
              const colorClass =
                mod.highlight === "#A81B1E"
                  ? "red"
                  : mod.highlight === "#062341"
                    ? "navy"
                    : "blue";
              return (
                <motion.div
                  key={mod.number}
                  className={`module-row ${colorClass} flex items-center gap-4 md:gap-8 py-8 md:py-10 px-3 md:px-5`}
                  initial={{ opacity: 0, x: -24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.12,
                    ease: [0.23, 1, 0.32, 1],
                  }}
                >
                  {/* Ghost number — improved contrast */}
                  <span
                    className="row-number display-font text-5xl md:text-7xl shrink-0 w-14 md:w-24 text-right select-none"
                    style={{ color: mod.highlight }}
                  >
                    {mod.number}
                  </span>

                  {/* Vertical divider */}
                  <div className="h-14 w-px bg-[#062341]/08 shrink-0 hidden md:block" />

                  {/* Icon */}
                  <div
                    className="row-icon shrink-0 w-13 h-13 w-[52px] h-[52px] rounded-xl flex items-center justify-center"
                    style={{
                      background: `${mod.highlight}0f`,
                      border: `1.5px solid ${mod.highlight}22`,
                      boxShadow: `0 4px 14px ${mod.highlight}14`,
                    }}
                  >
                    <ModIcon
                      size={23}
                      style={{ color: mod.highlight }}
                      strokeWidth={1.6}
                    />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <h3 className="row-title display-font text-2xl md:text-3xl lg:text-[2.6rem] leading-none mb-2 text-[#062341]">
                      {mod.title.toUpperCase()}
                    </h3>
                    <p className="text-slate-400 text-sm md:text-[15px] font-light leading-relaxed max-w-lg">
                      {mod.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  <MoveRight
                    className="row-arrow shrink-0"
                    style={{ color: mod.highlight }}
                    size={22}
                    strokeWidth={1.5}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default ThreeDExperience;
