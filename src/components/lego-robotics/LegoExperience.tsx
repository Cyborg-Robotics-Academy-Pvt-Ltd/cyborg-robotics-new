import React from "react";
import { motion } from "framer-motion";

const LegoExperience = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };
  return (
    <div>
      {/* Enhanced Parents Choice Section */}
      <motion.section
        className="py-4 md:py-10 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
      >
        <div className="max-w-[1200px] mx-auto px-4">
          <motion.div className="text-center " variants={fadeInUp}>
            <motion.h2
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#062341] mb-4 md:mb-6 font-sans"
              variants={fadeInUp}
            >
              Why Parents Choose{" "}
              <span className="gradient-text font-bold">
                Our LEGO Experience
              </span>
            </motion.h2>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <motion.ul className="space-y-4" variants={staggerContainer}>
                    {[
                      "Live, mentor-led session",
                      "Confidence & curiosity building",
                      "1.5-hour structured workshop",
                      "Meet like-minded learners",
                    ].map((item, index) => (
                      <motion.li
                        key={index}
                        className="flex items-start text-base md:text-lg"
                        variants={itemVariants}
                      >
                        <div className="w-8 h-8 bg-[#A81B1E] rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <span className="text-white text-sm">✓</span>
                        </div>
                        <span className="text-gray-700">{item}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                </div>

                <motion.div
                  className="bg-gradient-to-br from-[#FFF8E6] to-[#FFF0CC] rounded-2xl p-6 border border-[#FFECB3]"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="flex items-start">
                    <div className="text-2xl mr-3">💭</div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-800 mb-2">
                        Parent Feedback
                      </h4>
                      <p className="text-gray-700 italic">
                        "My child came home excited and kept explaining what
                        they built — that itself says everything."
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default LegoExperience;
