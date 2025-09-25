"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function ImpactSection() {
  const impactRef = useRef(null);
  const impactInView = useInView(impactRef, { once: true, margin: "-50px" });

  return (
    <motion.section
      ref={impactRef}
      initial={{ opacity: 0, y: 50 }}
      animate={impactInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="max-w-6xl mx-auto mb-20"
    >
      <div className="bg-white rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Our Impact
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={impactInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <div className="text-4xl md:text-5xl font-bold mb-2">5000+</div>
              <div className="text-red-100 text-sm md:text-base">
                Students Trained
              </div>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={impactInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <div className="text-4xl md:text-5xl font-bold mb-2">6+</div>
              <div className="text-red-100 text-sm md:text-base">
                Years Experience
              </div>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={impactInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
              <div className="text-red-100 text-sm md:text-base">
                Projects Completed
              </div>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={impactInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 1.1, duration: 0.6 }}
            >
              <div className="text-4xl md:text-5xl font-bold mb-2">100%</div>
              <div className="text-red-100 text-sm md:text-base">
                Dedication
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
