import React from "react";
import { motion } from "framer-motion";

const OfferSection = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };
  return (
    <div>
      {/* Value Proposition Section with Enhanced Card Design */}
      <motion.section
        className="py-4 md:py-10bg-white"
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
              Why we are{" "}
              <span className="gradient-text font-bold">
                offering this @ ₹499.
              </span>
            </motion.h2>

            {/* Enhanced value cards with more depth */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  emoji: "🎓",
                  title: "Quality STEM Exposure",
                  desc: "Accessible quality STEM learning",
                  color: "from-[#A81B1E] to-[#C73E1D]",
                },
                {
                  emoji: "🔓",
                  title: "No Commitment Required",
                  desc: "Try before you decide",
                  color: "from-[#0855AB] to-[#2B6ECC]",
                },
                {
                  emoji: "🎯",
                  title: "Fun-Based Learning",
                  desc: "Learning through play",
                  color: "from-[#B1B2B3] to-[#D1D2D3]",
                },
                {
                  emoji: "❤️",
                  title: "Zero Pressure Environment",
                  desc: "Pure learning experience",
                  color: "from-[#FED608] to-[#FFEA4D]",
                },
              ].map((card, index) => (
                <motion.div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${card.color} flex items-center justify-center text-white text-2xl shadow-md`}
                  >
                    {card.emoji}
                  </div>
                  <h3 className="font-bold text-lg text-[#062341] mb-2">
                    {card.title}
                  </h3>
                  <p className="text-gray-600">{card.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default OfferSection;
