import React from "react";
import { motion } from "framer-motion";

const LegoPocessFlow = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };
  return (
    <div>
      {/* Enhanced Process Flow Section */}
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
              Simple 3-Step Process{" "}
              <span className="gradient-text font-bold">for Your Child</span>
            </motion.h2>
          </motion.div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 max-w-4xl mx-auto">
            {[
              {
                step: 1,
                title: "Reserve Seat",
                desc: "By registration",
                color: "from-[#A81B1E] to-[#C73E1D]",
              },
              {
                step: 2,
                title: "Complete Payment",
                desc: "Secure payment",
                color: "from-[#0855AB] to-[#2B6ECC]",
              },
              {
                step: 3,
                title: "Workshop & Certificate",
                desc: "Limited batch size",
                color: "from-[#B1B2B3] to-[#D1D2D3]",
              },
            ].map((process, index, array) => (
              <React.Fragment key={index}>
                <motion.div
                  className="text-center flex-1"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <div
                    className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r ${process.color} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}
                  >
                    {process.step}
                  </div>
                  <h3 className="font-bold text-lg text-[#062341] mb-2">
                    {process.title}
                  </h3>
                  <p className="text-gray-600">{process.desc}</p>
                </motion.div>

                {/* Arrow between steps, except after the last step */}
                {index < array.length - 1 && (
                  <>
                    {/* Desktop arrow */}
                    <div className="hidden md:flex items-center justify-center flex-0">
                      <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </div>
                    {/* Mobile arrow */}
                    <div className="md:hidden flex items-center justify-center my-4">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    </div>
                  </>
                )}
              </React.Fragment>
            ))}
          </div>

          <motion.div
            className="text-center mt-8 md:mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="inline-flex items-center bg-gradient-to-r from-[#A81B1E] to-[#C73E1D] text-white px-6 py-3 rounded-full text-lg font-bold shadow-lg">
              <span className="mr-2">⚡</span> Hurry! Only few seats available
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default LegoPocessFlow;
