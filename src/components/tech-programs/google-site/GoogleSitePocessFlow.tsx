import React from "react";
import { motion } from "framer-motion";

const GoogleSiteProcessFlow = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const formatItems = [
    "Live Online Session via Zoom",
    "Hands-on Website Building",
    "Limited Seats per Batch",
    "Guided by Digital Mentors",
  ];

  return (
    <div>
      <motion.section
        className="py-4 md:py-10 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
      >
        <div className="max-w-[1200px] mx-auto px-4">
          <motion.div className="text-center" variants={fadeInUp}>
            <motion.h2
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#062341] mb-4 md:mb-6 font-sans"
              variants={fadeInUp}
            >
              Program <span className="gradient-text font-bold">Format</span>
            </motion.h2>
          </motion.div>

          <div className="relative max-w-5xl mx-auto mt-8 md:mt-10">
            <div className="absolute left-5 top-0 h-full w-1 rounded-full bg-gradient-to-b from-[#A81B1E]/30 via-[#0855AB]/40 to-[#A81B1E]/30 md:hidden" />
            <div className="absolute left-0 right-0 top-4 hidden h-1 rounded-full bg-gradient-to-r from-[#A81B1E] md:block" />

            <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-4 md:gap-4">
              {formatItems.map((item, index) => (
                <motion.div
                  key={item}
                  className="relative pl-16 md:pl-0 md:pt-16 text-left md:text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.12 * index }}
                >
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-red-800 text-sm font-bold text-white shadow-lg md:left-1/2 md:-translate-x-1/2">
                    {index + 1}
                  </div>
                  <p className="text-base md:text-lg font-semibold text-[#062341] leading-snug">
                    {item}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default GoogleSiteProcessFlow;
