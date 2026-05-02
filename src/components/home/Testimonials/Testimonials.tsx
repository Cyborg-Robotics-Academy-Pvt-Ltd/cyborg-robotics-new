"use client";

import React from "react";
import { motion } from "framer-motion";
import Parents from "./Parents";
import Students from "./Students";
import {
  sectionContainerVariants,
  sectionItemVariants,
} from "@/lib/motion";
import { useMotionPreferences } from "@/hooks/useMotionPreferences";

const Testimonials = () => {
  const { reduceMotion } = useMotionPreferences();

  return (
    <motion.section
      className="mt-10 flex w-full flex-col items-center"
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={reduceMotion ? undefined : { once: true, amount: 0.2 }}
      variants={sectionContainerVariants(0.12)}
    >
      <motion.h1 variants={sectionItemVariants} className="mb-1 text-center">
        <span className="text-3xl font-bold gradient-text">Success</span>
        <span className="text-3xl font-bold text-black"> stories</span>
        <div className="flex items-center justify-center gap-1 my-3">
          <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-[#8D0F11]/60 rounded-full"></div>
          <div className="w-16 h-0.5 bg-gradient-to-r from-[#8D0F11]/60 to-[#8D0F11] rounded-full"></div>
          <div className="w-8 h-0.5 bg-gradient-to-r from-[#8D0F11] to-transparent rounded-full"></div>
        </div>
      </motion.h1>

      <motion.h2
        variants={sectionItemVariants}
        className="mb-10 max-w-2xl text-center text-base text-gray-600 md:text-lg"
      >
        Hear from parents and students about their learning journeys with us.
      </motion.h2>

      <motion.div
        variants={sectionItemVariants}
        className="grid w-[90%] max-w-6xl grid-cols-1 gap-5 md:gap-6 lg:grid-cols-2 lg:gap-6"
      >
        <div className="flex-1">
          <Parents />
        </div>
        <div className="flex-1">
          <Students />
        </div>
      </motion.div>
    </motion.section>
  );
};

export default Testimonials;
