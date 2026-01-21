import React from "react";
import { motion } from "framer-motion";
import Testimonials from "../home/Testimonials/Testimonials";

const TestimonialSection = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };
  return (
    <div>
      {/* Enhanced Testimonials Section */}
      <motion.section
        className=" bg-gradient-to-br from-[#F4F6F8] to-[#F0F7FF]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
      >
        <div className="max-w-[1200px] mx-auto px-4">
          <Testimonials />
        </div>
      </motion.section>
    </div>
  );
};

export default TestimonialSection;
