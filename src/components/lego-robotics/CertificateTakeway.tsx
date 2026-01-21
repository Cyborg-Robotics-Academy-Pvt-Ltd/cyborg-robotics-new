import React from "react";
import { motion } from "framer-motion";

const CertificateTakeway = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div>
      {/* Enhanced Certificate & Takeaway Section */}
      <motion.section
        className="py-8 md:py-12 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
      >
        <div className="max-w-[1200px] mx-auto px-4">
          <motion.div className="text-center mb-12 md:mb-4" variants={fadeInUp}>
            <motion.h2
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#062341] mb-4 md:mb-6 font-sans"
              variants={fadeInUp}
            >
              Certificate & Takeaway
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                emoji: "🧠",
                title: "ESM Certificate",
                desc: "Early Simple Machines",
                color: "from-[#A81B1E] to-[#C73E1D]",
              },
              {
                emoji: "⚙",
                title: "SNP Certificate",
                desc: "Simple & Powered Machines",
                color: "from-[#0855AB] to-[#2B6ECC]",
              },
              {
                emoji: "🤖",
                title: "EV3 Certificate",
                desc: "EV3 Robotics",
                color: "from-[#B1B2B3] to-[#D1D2D3]",
              },
            ].map((cert, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <div
                  className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r ${cert.color} flex items-center justify-center text-white text-3xl shadow-md`}
                >
                  {cert.emoji}
                </div>
                <h3 className="font-bold text-xl text-[#062341] mb-2 text-center">
                  {cert.title}
                </h3>
                <p className="text-gray-600 text-center">{cert.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.p
            className="text-center text-lg mt-8 text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Certificates are issued after active participation.
          </motion.p>
        </div>
      </motion.section>
    </div>
  );
};

export default CertificateTakeway;
