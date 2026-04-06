"use client";

import { motion } from "framer-motion";
import { createStaggerContainer, fadeUpVariants } from "./motion";
import type { WhyItem } from "./types";

interface Props {
  items: WhyItem[];
}

const WhySection = ({ items }: Props) => {
  return (
    <motion.section
      className="bg-white px-4 py-16 sm:px-6"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={createStaggerContainer(0.08)}
    >
      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <motion.div variants={fadeUpVariants} className="mb-10 text-center">
          {/* Badge — was font-bold, semibold */}
          <span className="mb-3 inline-block rounded-full border border-[rgba(141,15,17,0.15)] bg-[rgba(141,15,17,0.07)] px-4 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#8D0F11]">
            Why Choose Us
          </span>
          {/* H2 — keep font-black, it's the hero headline */}
          <h2 className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold leading-tight text-[#1a1a1a]">
            Not Just A Camp.
            <br />
            <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
              A Launchpad.
            </span>
          </h2>
          {/* Supporting subtext — gives header more depth */}
          <p className="mx-auto mt-3 max-w-[440px] text-[13px] font-normal leading-[1.65] text-[#888]">
            We go beyond textbooks — every session is designed to build
            confidence, creativity, and real technical skills.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <motion.div
              key={item.title}
              variants={fadeUpVariants}
              className="group rounded-2xl border border-[rgba(141,15,17,0.08)] bg-[#FAFAFA] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[rgba(141,15,17,0.18)] hover:bg-white hover:shadow-[0_8px_32px_rgba(141,15,17,0.07)] sm:p-5"
            >
              {/* Icon container — replaces raw emoji dump with a subtle pill */}
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(141,15,17,0.07)] text-[20px] transition-transform duration-200 group-hover:scale-110">
                {item.icon}
              </div>

              {/* Title — was font-bold, semibold is enough at 15px */}
              <div className="mb-1.5 text-[14px] font-semibold leading-snug text-[#1a1a1a]">
                {item.title}
              </div>

              {/* Description — font-normal, was inheriting bold */}
              <p className="m-0 text-[12px] font-normal leading-[1.65] text-[#888]">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default WhySection;
