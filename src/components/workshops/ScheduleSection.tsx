"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { createStaggerContainer, fadeUpVariants } from "./motion";
import type { AgeGroup, CampLocation } from "./types";

interface Props {
  activeLocation: CampLocation;
  selectedAge: AgeGroup;
  onRegister: () => void;
}

const ScheduleSection = ({
  activeLocation,
  selectedAge,
  onRegister,
}: Props) => {
  return (
    <motion.section
      key={activeLocation.id}
      className="bg-[#FAFAFA] px-4 py-20 sm:px-6"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={createStaggerContainer(0.1)}
    >
      <div className="max-w-[1200px] mx-auto">
        <motion.div
          variants={fadeUpVariants}
          className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
        >
          <div>
            <span className="mb-3 inline-block rounded-full border border-[rgba(141,15,17,0.15)] bg-[rgba(141,15,17,0.07)] px-4 py-1 text-[11px] font-bold uppercase tracking-widest text-[#8D0F11]">
              Week-by-Week
            </span>
            <h2 className="m-0 text-[clamp(1.8rem,3.5vw,2.5rem)] font-black leading-tight text-[#1a1a1a]">
              {activeLocation.emoji} {activeLocation.name} Schedule
            </h2>
            <p className="mt-1 text-[13px] text-[#888]">
              📅 {activeLocation.packageDates} · {activeLocation.days}
            </p>
          </div>
          <div className="flex w-full items-center gap-2 rounded-xl border border-[rgba(141,15,17,0.12)] bg-white px-4 py-3 shadow-[0_2px_12px_rgba(141,15,17,0.06)] sm:w-auto">
            <Zap size={14} className="text-[#8D0F11]" />
            <span className="text-[12px] font-bold text-[#555]">
              {activeLocation.totalHours} Total · Age {selectedAge} selected
            </span>
          </div>
        </motion.div>

        <div className="space-y-3">
          {activeLocation.schedule.map((week) => (
            <motion.div
              key={`${activeLocation.id}-${week.week}-${week.course}`}
              variants={fadeUpVariants}
              className="flex flex-col gap-4 rounded-2xl border border-[rgba(141,15,17,0.1)] bg-white p-4 shadow-[0_2px_12px_rgba(141,15,17,0.04)] transition-all duration-200 hover:border-[rgba(141,15,17,0.2)] hover:shadow-[0_6px_24px_rgba(141,15,17,0.08)] sm:flex-row sm:items-center sm:p-5"
            >
              <div className="flex flex-1 items-center gap-3 sm:gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgba(141,15,17,0.07)] text-2xl">
                  {week.icon}
                </div>
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#999]">
                      {week.week}
                    </span>
                    <span className="rounded-full bg-[rgba(141,15,17,0.08)] px-2 py-[1px] text-[11px] font-bold text-[#8D0F11]">
                      {week.tag}
                    </span>
                  </div>
                  <div className="text-[17px] font-bold text-[#1a1a1a]">
                    {week.course}
                  </div>
                  <div className="mt-[2px] text-[12px] text-[#999]">
                    📅 {week.dates}
                  </div>
                </div>
              </div>
              <div className="shrink-0 text-left sm:text-right">
                <div className="text-[11px] font-medium text-[#999]">
                  Age {selectedAge}
                </div>
                <div className="text-[22px] font-black text-[#8D0F11]">
                  ₹{week.prices[selectedAge].toLocaleString("en-IN")}
                </div>
                <button
                  onClick={onRegister}
                  className="mt-1 inline-flex cursor-pointer border-0 bg-transparent text-[11px] font-bold text-[#8D0F11] underline underline-offset-2"
                >
                  Book Now →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default ScheduleSection;
