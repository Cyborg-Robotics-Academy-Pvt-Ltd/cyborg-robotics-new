import React from "react";
import { motion } from "framer-motion";
import { IndianRupee, Check } from "lucide-react";

const OfferSection = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };
  return (
    <div>
      {/* Value Proposition Section with Enhanced Card Design */}
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
              Why we are{" "}
              <span className="gradient-text font-bold">
                offering This @ ₹499.
              </span>
            </motion.h2>

            {/* Enhanced value list with more depth */}
            <div className="space-y-1 max-w-2xl mx-auto text-left">
              <>
                <motion.div
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    className="p-2 bg-white rounded-full mr-2"
                  >
                    <Check className="text-green-500 flex-shrink-0" size={24} />
                  </motion.span>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    100% hands-on LEGO® learning
                  </p>
                </motion.div>
                <motion.div
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    className="p-2 bg-white rounded-full mr-2"
                  >
                    <Check className="text-green-500 flex-shrink-0" size={24} />
                  </motion.span>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    Expert mentors, child-friendly approach
                  </p>
                </motion.div>
                <motion.div
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                    className="p-2 bg-white rounded-full mr-2"
                  >
                    <Check className="text-green-500 flex-shrink-0" size={24} />
                  </motion.span>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    Small batches for personal attention
                  </p>
                </motion.div>
                <motion.div
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.7 }}
                    className="p-2 bg-white rounded-full mr-2"
                  >
                    <Check className="text-green-500 flex-shrink-0" size={24} />
                  </motion.span>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    Souvenir + certificate your child takes home
                  </p>
                </motion.div>
                <motion.div
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.8 }}
                    className="p-2 bg-white rounded-full mr-2"
                  >
                    <Check className="text-green-500 flex-shrink-0" size={24} />
                  </motion.span>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    Zero pressure. Pure learning.
                  </p>
                </motion.div>
              </>
            </div>

            {/* Enhanced separate value proposition section */}
            <motion.div
              className="mt-10 pt-8 border-t-2 border-[#062341] max-w-3xl mx-auto text-center"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <motion.h3
                className="text-xl md:text-2xl font-bold text-[#062341] mb-6 font-sans"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                Transformative Learning Experience
              </motion.h3>
              <div className="space-y-4">
                <motion.div
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl shadow-sm border border-blue-100"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.6 }}
                >
                  <p className="text-gray-800 leading-relaxed text-lg md:text-xl font-semibold font-sans">
                    One hour that could spark a lifelong interest in technology
                  </p>
                </motion.div>
                <motion.div
                  className="bg-gradient-to-r from-red-50 to-pink-50 p-5 rounded-xl shadow-sm border border-red-100"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.7 }}
                >
                  <p className="text-gray-800 leading-relaxed text-lg md:text-xl font-semibold font-sans">
                    Give Your Child an Experience — Not Just a Class
                  </p>
                </motion.div>
                <motion.div
                  className="bg-gradient-to-r from-orange-50 to-amber-50 p-5 rounded-xl shadow-sm border border-orange-100"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.8 }}
                >
                  <p className="text-gray-800 leading-relaxed text-lg md:text-xl font-semibold font-sans">
                    Limited seats available per batch to ensure quality learning
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default OfferSection;
