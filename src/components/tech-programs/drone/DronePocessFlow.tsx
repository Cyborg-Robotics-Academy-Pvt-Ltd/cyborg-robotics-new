"use client";
import React from "react";
import { motion } from "framer-motion";

const formatItems = [
  "Offline Training at Cyborg Robotics Lab",
  "Small Batch Size",
  "Hands-on Learning Approach",
  "Mentor Guided Sessions",
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

const DroneProcessFlow = () => {
  return (
    <section className="py-4 md:py-2 bg-white">
      <div className="max-w-[1200px] mx-auto px-4">
        <motion.h2
          className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#062341] mb-4 md:mb-6 font-sans text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Program <span className="gradient-text font-bold">Format</span>
        </motion.h2>

        <div className="relative max-w-5xl mx-auto mt-8 md:mt-12">
          {/* Mobile vertical line */}
          <div className="absolute left-5 top-0 h-full w-1 rounded-full bg-gradient-to-b from-[#A81B1E]/30 via-[#0855AB]/40 to-[#A81B1E]/30 md:hidden" />

          {/* Desktop horizontal line */}
          <div className="absolute left-0 right-0 top-4 hidden h-1 rounded-full bg-gradient-to-r from-[#A81B1E] via-[#0855AB] to-[#A81B1E] md:block" />

          <motion.div
            className="space-y-8 md:space-y-0 md:grid md:grid-cols-4 md:gap-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {formatItems.map((item, index) => (
              <motion.div
                key={item}
                className="relative pl-16 md:pl-0 md:pt-16 text-left md:text-center"
                variants={itemVariants}
              >
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-red-800 text-sm font-bold text-white shadow-lg md:left-1/2 md:-translate-x-1/2">
                  {index + 1}
                </div>
                <p className="text-base md:text-lg font-semibold text-[#062341] leading-snug">
                  {item}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DroneProcessFlow;
