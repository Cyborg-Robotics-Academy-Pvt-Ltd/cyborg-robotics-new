"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import {
  foundersData,
  getSkillColorClasses,
} from "../../../utils/foundersData";
import { Linkedin, Sparkles, Award } from "lucide-react";

export default function FoundersSection() {
  const [sectionRef, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: "-50px 0px",
  });

  return (
    <section
      ref={sectionRef}
      className="w-full mx-auto relative overflow-hidden bg-white to-gray-50 sm:py-6"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header with enhanced animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center mb-12 sm:mb-16"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-block mb-4"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-50 to-blue-50 rounded-full border border-red-100">
            <Sparkles className="w-4 h-4 text-red-600" />
            <span className="text-sm font-semibold text-gray-700">
              Leadership Team
            </span>
          </div>
        </motion.div>

        <h2 className="text-2xl sm:text-3xl md:text-xl lg:text-5xl font-bold text-gray-900 mb-4">
          Meet the{" "}
          <span className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 bg-clip-text text-transparent">
            Visionaries
          </span>
        </h2>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-12 h-1 bg-gradient-to-r from-transparent to-red-600 rounded-full"></div>
          <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-red-800 rounded-full"></div>
          <div className="w-12 h-1 bg-gradient-to-r from-red-800 to-transparent rounded-full"></div>
        </div>
        {/* Improved paragraph with better line height and alignment */}
        <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base md:text-lg mt-6 leading-relaxed text-left">
          The visionary leaders behind Cyborg Robotics Academy, driving
          innovation and excellence in robotics education
        </p>
      </motion.div>

      {/* Grid layout for founders */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 px-2 sm:px-0 max-w-7xl mx-auto">
        {foundersData.map((founder, index) => {
          const isFounder = founder.id === "shikha";

          return (
            <motion.div
              key={founder.id}
              className="group"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.15 * (index + 1) }}
            >
              <div className="relative  shadow-lg rounded-3xl p-4 sm:p-6 transition-all duration-500 hover:shadow-xl">
                <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
                  {/* Image Section - Left */}
                  <div className="flex-shrink-0 w-full sm:w-2/5">
                    <div className="relative w-full bg-transparent pb-[125%] rounded-2xl overflow-hidden border-4 border-none ">
                      <Image
                        src={founder.image}
                        alt={founder.name}
                        fill
                        className="object-cover"
                        loading="lazy"
                        sizes="(max-width: 740px) 100vw, (max-width: 868px) 50vw, 33vw"
                        quality={100}
                      />
                    </div>
                  </div>

                  {/* Content Section - Right */}
                  <div className="flex-1 text-center sm:text-left w-full sm:w-3/5 space-y-3">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.2 * (index + 1) }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                          {founder.name}
                        </h3>

                        {/* Role badge */}
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={inView ? { scale: 1, rotate: 0 } : {}}
                          transition={{
                            duration: 0.6,
                            delay: 0.3 * (index + 1),
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 via-red-700 to-red-800 rounded-full shadow-lg`}
                        >
                          <Award className="w-3.5 h-3.5 text-white" />
                          <span className="text-xs font-bold text-white">
                            {isFounder ? "FOUNDER" : "CO-FOUNDER"}
                          </span>
                        </motion.div>
                      </div>

                      <div
                        className={`inline-block px-3 py-1.5 bg-gradient-to-r ${isFounder ? "from-red-50 to-red-100" : "from-blue-50 to-blue-100"} rounded-full border ${isFounder ? "border-[#a63534]" : "border-blue-200"} mb-2`}
                      >
                        <p
                          className={`${isFounder ? "text-red-700" : "text-blue-700"} font-semibold text-sm`}
                        >
                          {founder.title}
                        </p>
                      </div>
                    </motion.div>

                    {/* Skills badges */}
                    <motion.div
                      className="flex flex-wrap justify-center sm:justify-start gap-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.3 * (index + 1) }}
                    >
                      {founder.skills.map((skill, skillIndex) => (
                        <motion.span
                          key={skillIndex}
                          className={`px-3 py-1.5 ${getSkillColorClasses(skill.color)} rounded-full text-xs font-semibold shadow-sm transition-all duration-300 cursor-default relative overflow-hidden group/skill`}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={inView ? { opacity: 1, scale: 1 } : {}}
                          transition={{
                            duration: 0.3,
                            delay: 0.1 * skillIndex,
                            type: "spring",
                            stiffness: 300,
                          }}
                        >
                          <span className="relative z-10">{skill.label}</span>
                          <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover/skill:scale-x-100 transition-transform duration-300 origin-left"></div>
                        </motion.span>
                      ))}
                    </motion.div>

                    {/* Description */}
                    <motion.div
                      className="text-gray-600 leading-relaxed text-sm"
                      style={{ textAlign: "left" }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={{
                        duration: 0.5,
                        delay: 0.35 * (index + 1),
                      }}
                    >
                      {founder.description}
                    </motion.div>

                    <motion.div
                      className="flex justify-center sm:justify-start pt-1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.4 * (index + 1) }}
                    >
                      <Button
                        asChild
                        className={`bg-gradient-to-r ${isFounder ? " from-red-600 via-red-700 to-red-800" : "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"} text-white px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg text-sm font-semibold group/btn relative overflow-hidden`}
                      >
                        <Link href={founder.linkedinUrl} target="_blank">
                          <div className="relative z-10 flex items-center gap-1.5">
                            <Linkedin className="w-3.5 h-3.5" />
                            <span>Connect on LinkedIn</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-1"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                          </div>
                          <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-300 origin-left"></div>
                        </Link>
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}
