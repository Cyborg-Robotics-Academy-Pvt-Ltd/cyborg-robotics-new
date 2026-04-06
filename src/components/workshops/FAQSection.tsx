"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { createStaggerContainer, fadeUpVariants } from "./motion";
import type { FAQItem } from "./types";

interface Props {
  faqs: FAQItem[];
}

const FAQSection = ({ faqs }: Props) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <motion.section
      className="bg-[#FAFAFA] px-4 py-20 sm:px-6"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={createStaggerContainer(0.08)}
    >
      <div className="max-w-[760px] mx-auto">
        <motion.div variants={fadeUpVariants} className="text-center mb-10">
          <span className="inline-block bg-[rgba(141,15,17,0.07)] border border-[rgba(141,15,17,0.15)] text-[#8D0F11] text-[11px] font-bold uppercase tracking-widest px-4 py-1 rounded-full mb-3">
            FAQ
          </span>
          <h2 className="text-[clamp(1.8rem,3.5vw,2.5rem)] font-black text-[#1a1a1a] leading-tight">
            Parent Questions,{" "}
            <span className="bg-gradient-to-r from-[#8D0F11] to-[#B92423] bg-clip-text text-transparent">
              Answered.
            </span>
          </h2>
        </motion.div>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.q}
              variants={fadeUpVariants}
              className="bg-white border border-[rgba(141,15,17,0.1)] rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(141,15,17,0.04)] transition-all duration-200 hover:border-[rgba(141,15,17,0.2)]"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="flex w-full items-center justify-between gap-4 border-0 bg-transparent px-4 py-4 text-left cursor-pointer sm:px-6"
              >
                <span className="text-[15px] font-bold text-[#1a1a1a]">
                  {faq.q}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-[#8D0F11] shrink-0 transition-transform duration-200 ${
                    openFaq === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === index && (
                <div className="px-4 pb-5 sm:px-6">
                  <p className="text-[13px] text-[#666] leading-[1.7] m-0 border-t border-[rgba(141,15,17,0.08)] pt-4">
                    {faq.a}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default FAQSection;
