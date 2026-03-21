import React from "react";
import { motion } from "framer-motion";
import { Blocks, Gamepad2, Bug, MoveRight } from "lucide-react";

const PictoBloxCurriculum = () => {
  const modules = [
    {
      icon: Blocks,
      number: "01",
      title: "Intro to Block Coding",
      description:
        "Learn PictoBlox interface, drag-and-drop blocks, events, and actions — no syntax required.",
      highlight: "#A81B1E",
    },
    {
      icon: Gamepad2,
      number: "02",
      title: "Build Your Maze Game",
      description:
        "Design the maze environment, code character movement, set start and goal points with game rules.",
      highlight: "#062341",
    },
    {
      icon: Bug,
      number: "03",
      title: "Test, Debug & Play",
      description:
        "Run your game, find bugs, fix logic — experience the real developer workflow firsthand.",
      highlight: "#0855AB",
    },
  ];

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600&display=swap');

        .learn-section { font-family: 'Outfit', sans-serif; }
        .display-font { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.04em; }

        .module-row {
          border-bottom: 1px solid rgba(6,35,65,0.07);
          border-left: 3px solid transparent;
          transition: background 0.28s ease, border-left-color 0.28s ease, transform 0.28s cubic-bezier(0.23,1,0.32,1);
          cursor: default;
          border-radius: 0 12px 12px 0;
        }
        .module-row:first-child { border-top: 1px solid rgba(6,35,65,0.07); }

        .module-row:hover { background: rgba(6,35,65,0.025); transform: translateX(4px); }
        .module-row.red:hover   { border-left-color: #A81B1E; background: rgba(168,27,30,0.03); }
        .module-row.navy:hover  { border-left-color: #062341; background: rgba(6,35,65,0.035); }
        .module-row.blue:hover  { border-left-color: #0855AB; background: rgba(8,85,171,0.03); }

        .module-row:hover .row-icon   { opacity: 1; }
        .module-row:hover .row-number { opacity: 0.45; }
        .module-row:hover .row-arrow  { transform: translateX(8px); opacity: 1; }
        .module-row:hover .row-title  { letter-spacing: 0.06em; }

        .row-icon   { transition: transform 0.35s cubic-bezier(0.23,1,0.32,1), opacity 0.28s; opacity: 0.5; }
        .row-number { opacity: 0.22; transition: opacity 0.28s; font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.04em; }
        .row-arrow  { opacity: 0.25; transition: transform 0.3s ease, opacity 0.28s; }
        .row-title  { transition: letter-spacing 0.3s ease; }

        .tag-chip {
          font-family: 'Outfit', sans-serif;
          font-size: 10px; font-weight: 600;
          letter-spacing: 0.13em; text-transform: uppercase;
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
          {/* Header */}
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
                <span className="tag-chip text-[#A81B1E]">Session Plan</span>
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
                <span className="text-[#A81B1E]">WILL BUILD</span>
              </h2>
            </div>
            <p className="text-slate-400 text-sm md:text-base max-w-xs leading-relaxed font-light md:text-right">
              A focused 90-minute session that takes complete beginners from
              zero code to a fully working Maze Game.
            </p>
          </motion.div>

          {/* Module rows */}
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
                  {/* Ghost number */}
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
                    className="row-icon shrink-0 w-[52px] h-[52px] rounded-xl flex items-center justify-center"
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

export default PictoBloxCurriculum;
