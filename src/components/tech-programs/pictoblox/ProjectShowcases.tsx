"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Lightbulb,
  Gamepad2,
  Code2,
  Bug,
  Trophy,
  Sparkles,
} from "lucide-react";

const PictobloxProjectShowcases = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const studentJourney = [
    {
      title: "Intro to PictoBlox",
      description:
        "Get familiar with block-based coding and the PictoBlox platform.",
      icon: Lightbulb,
      color: "text-[#A81B1E]",
      bg: "bg-[#A81B1E]/10",
    },
    {
      title: "Design the Maze",
      description:
        "Build a maze environment with start and goal points using drag-and-drop blocks.",
      icon: Gamepad2,
      color: "text-[#0855AB]",
      bg: "bg-[#0855AB]/10",
    },
    {
      title: "Code the Character",
      description:
        "Program character movement, directions, and basic game logic.",
      icon: Code2,
      color: "text-[#A81B1E]",
      bg: "bg-[#A81B1E]/10",
    },
    {
      title: "Test & Debug",
      description:
        "Run the game, identify issues, and fix them using debugging techniques.",
      icon: Bug,
      color: "text-[#0855AB]",
      bg: "bg-[#0855AB]/10",
    },
    {
      title: "Play Your Game",
      description:
        "Play the completed Maze Game and take home a working project to improve later.",
      icon: Trophy,
      color: "text-[#A81B1E]",
      bg: "bg-[#A81B1E]/10",
    },
  ];

  return (
    <div>
      <motion.section
        className="bg-gradient-to-b from-white via-slate-50/70 to-white relative overflow-hidden py-10 md:py-14"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
      >
        <div className="pointer-events-none absolute -left-20 top-8 h-52 w-52 rounded-full bg-[#A81B1E]/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-6 h-56 w-56 rounded-full bg-[#0855AB]/10 blur-3xl" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <motion.div className="text-center" variants={fadeInUp}>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#062341]/5 px-4 py-1.5 text-sm font-semibold text-[#062341] mb-4">
              <Sparkles size={14} className="text-[#A81B1E]" />
              How students go from zero to a working game
            </div>
            <motion.h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#062341] mb-3 md:mb-4 font-sans"
              variants={fadeInUp}
            >
              Workshop{" "}
              <span className="gradient-text font-bold">Project Journey</span>
            </motion.h2>
            <motion.p
              className="text-gray-600 max-w-3xl mx-auto text-base md:text-lg"
              variants={fadeInUp}
            >
              Students design, code, and play their own Maze Game — all in a
              single 90-minute live session.
            </motion.p>
          </motion.div>

          <div className="mt-10 overflow-x-auto pb-4">
            <div className="relative min-w-[1180px] lg:min-w-0 flex items-stretch gap-4 lg:gap-5">
              {studentJourney.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <React.Fragment key={step.title}>
                    <motion.div
                      className="relative w-[220px] lg:flex-1 self-stretch"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.45, delay: index * 0.1 }}
                    >
                      <div className="h-full rounded-2xl bg-gradient-to-br from-[#A81B1E]/15 via-[#0855AB]/10 to-transparent p-[1px]">
                        <div className="h-full min-h-[180px] rounded-2xl border border-white/70 bg-white/95 p-5 lg:p-6 shadow-lg shadow-slate-200/60 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                          <div className="absolute right-3 top-3 rounded-full bg-[#062341]/5 px-2 py-0.5 text-xs font-semibold text-[#062341]">
                            {`0${index + 1}`}
                          </div>

                          <div
                            className={`w-12 h-12 rounded-full ${step.bg} ring-4 ring-white flex items-center justify-center mb-3 shadow-sm`}
                          >
                            <StepIcon size={21} className={step.color} />
                          </div>
                          <h3 className="font-bold text-lg text-[#062341] mb-2">
                            {step.title}
                          </h3>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {index < studentJourney.length - 1 && (
                      <div className="pt-[64px] text-[#0855AB]/70 shrink-0">
                        <div className="h-6 w-6 rounded-full bg-white border border-[#0855AB]/20 flex items-center justify-center shadow-sm">
                          <ArrowRight size={14} />
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default PictobloxProjectShowcases;
