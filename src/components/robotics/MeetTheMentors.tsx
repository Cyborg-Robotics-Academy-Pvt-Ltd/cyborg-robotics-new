// components/MeetTheMentors/index.tsx
"use client";

import { motion } from "motion/react";
import { MentorCard } from "./MeetTheMentors/MentorCard";

import { MENTORS } from "./MeetTheMentors/data";

const MeetTheMentors = () => {
  return (
    <section className="py-16 px-6 bg-[#FEF7F7] ">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-center text-[11px] tracking-[3px] uppercase text-gray-400 font-medium mb-2.5">
            What Guides You
          </p>

          <h2 className="text-center font-syne font-extrabold text-[42px] md:text-[48px] text-[#0B1120] leading-tight mb-2">
            Meet The <span className="text-[#A81B1E]">Mentors</span>
          </h2>

          {/* Decorative Divider */}
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <div className="w-8 h-0.5 bg-[#A81B1E] rounded-full" />
            <div className="w-1.5 h-1.5 bg-[#A81B1E] rounded-full" />
            <div className="w-8 h-0.5 bg-[#A81B1E] rounded-full" />
          </div>

          <p className="text-center text-[15px] text-gray-500 mb-10">
            Learn from industry professionals building real products.
          </p>
        </motion.div>

        {/* Mentor Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-10 max-w-4xl mx-auto">
          {MENTORS.map((mentor, id) => (
            <motion.div
              key={mentor.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: id * 0.08 }}
            >
              <MentorCard mentor={mentor} key={mentor.id} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MeetTheMentors;
