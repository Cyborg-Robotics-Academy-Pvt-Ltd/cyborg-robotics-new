"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Box,
  Lightbulb,
  PencilRuler,
  Printer,
  Sparkles,
  Wrench,
} from "lucide-react";

const ProjectShowcases = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const studentJourney = [
    {
      title: "Idea",
      description: "Start with a creative concept students want to build.",
      icon: Lightbulb,
      color: "text-[#A81B1E]",
      bg: "bg-[#A81B1E]/10",
    },
    {
      title: "Design",
      description:
        "Sketch and shape the concept in beginner-friendly 3D tools.",
      icon: PencilRuler,
      color: "text-[#0855AB]",
      bg: "bg-[#0855AB]/10",
    },
    {
      title: "Prepare Model",
      description: "Convert the design into a clean, print-ready model file.",
      icon: Wrench,
      color: "text-[#A81B1E]",
      bg: "bg-[#A81B1E]/10",
    },
    {
      title: "3D Print",
      description: "Run the model on real printers with guided setup.",
      icon: Printer,
      color: "text-[#0855AB]",
      bg: "bg-[#0855AB]/10",
    },
    {
      title: "Final Product",
      description:
        "Finish and present the physical model made by each student.",
      icon: Box,
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
              How students build from concept to creation
            </div>
            <motion.h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#062341] mb-3 md:mb-4 font-sans"
              variants={fadeInUp}
            >
              Student{" "}
              <span className="gradient-text font-bold">Project Journey</span>
            </motion.h2>
            <motion.p
              className="text-gray-600 max-w-3xl mx-auto text-base md:text-lg"
              variants={fadeInUp}
            >
              Students design and print their own creations using real 3D
              printing technology.
            </motion.p>
          </motion.div>

          <div className="mt-10 overflow-x-auto pb-6">
            {/* 
              Key fixes:
              - min-w card: 260px → 280px (was 220px, too narrow)
              - min-h card: 260px (was 180px, too short)
              - gap increased: gap-6 lg:gap-7
              - inner padding: p-6 lg:p-7 (was p-5 lg:p-6)
              - icon size: 56x56 (was 48x48)
              - description: text-sm → text-[15px] with more line-height
              - arrow connector vertically centered at 80px (accounts for taller cards)
            -->
            */}
            <div className="relative min-w-[1360px] lg:min-w-0 flex items-stretch gap-6 lg:gap-7">
              {studentJourney.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <React.Fragment key={step.title}>
                    <motion.div
                      className="relative w-[280px] lg:flex-1 self-stretch"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.45, delay: index * 0.1 }}
                    >
                      <div className="h-full rounded-2xl bg-gradient-to-br from-[#A81B1E]/15 via-[#0855AB]/10 to-transparent p-[1px]">
                        <div className="h-full min-h-[260px] rounded-2xl border border-white/70 bg-white/95 p-6 lg:p-7 shadow-lg shadow-slate-200/60 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col">
                          {/* Step number */}
                          <div className="absolute right-4 top-4 rounded-full bg-[#062341]/5 px-2.5 py-1 text-xs font-semibold text-[#062341] tracking-wide">
                            {`0${index + 1}`}
                          </div>

                          {/* Icon */}
                          <div
                            className={`w-14 h-14 rounded-full ${step.bg} ring-4 ring-white flex items-center justify-center mb-5 shadow-sm shrink-0`}
                          >
                            <StepIcon size={24} className={step.color} />
                          </div>

                          {/* Title */}
                          <h3 className="font-bold text-xl text-[#062341] mb-3 leading-snug">
                            {step.title}
                          </h3>

                          {/* Description — flex-1 pushes it to fill remaining card height */}
                          <p className="text-[15px] text-gray-600 leading-relaxed flex-1">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Arrow connector — pt adjusted for taller cards */}
                    {index < studentJourney.length - 1 && (
                      <div className="pt-[80px] text-[#0855AB]/70 shrink-0">
                        <div className="h-7 w-7 rounded-full bg-white border border-[#0855AB]/20 flex items-center justify-center shadow-sm">
                          <ArrowRight size={15} />
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

export default ProjectShowcases;
