"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { foundersData } from "../../../utils/foundersData";
import { Linkedin, Sparkles, Award, Crown } from "lucide-react";

export default function FoundersSection() {
  const [sectionRef, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: "-50px 0px",
  });

  return (
    <section
      ref={sectionRef}
      className="w-full mx-auto relative overflow-hidden bg-white to-gray-50 sm:py-4"
    >
      {/* Header with enhanced animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center mb-12 sm:mb-16"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="inline-block mb-4 mt-4"
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
          <span className="bg-gradient-to-r from-[#b92423] via-[#9d2723] to-[#7f2823] bg-clip-text text-transparent">
            Founders
          </span>
        </h2>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-12 h-1 bg-gradient-to-r from-transparent to-[#b92423] rounded-full"></div>
          <div className="w-24 h-1 bg-gradient-to-r from-[#b92423] to-[#9d2723] rounded-full"></div>
          <div className="w-12 h-1 bg-gradient-to-r from-[#9d2723] to-transparent rounded-full"></div>
        </div>
        {/* Improved paragraph with better line height and alignment */}
        <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base mt-4 leading-relaxed text-center">
          Visionary leaders driving innovation in robotics education
        </p>
      </motion.div>

      {/* Grid layout for founders */}
      <div className="grid grid-cols-1  lg:max-w-[850px]  xl:grid-cols-2 2xl:grid-cols-2  gap-6 sm:gap-8 px-2 sm:px-0 xl:max-w-[1450px] mx-auto mb-4">
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
              {/* Enhanced card with gradient background and improved shadow */}
              <div
                className="relative bg-white shadow-sm rounded-3xl p-5 sm:p-6 transition-all duration-500 hover:shadow-xl border border-gray-100"
                style={{ boxShadow: "0 10px 30px rgba(37,46,67,0.15)" }}
              >
                <div className="flex flex-col sm:flex-row items-center gap-5 md:gap-7">
                  {/* Image Section - Left with enhanced styling */}
                  <div className="flex-shrink-0 w-full sm:w-2/5">
                    <div className="relative w-3/4 mx-auto sm:w-full pb-[75%] sm:pb-[125%] rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                      {/* Gradient border container */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#b94243] via-[#ab2623] to-[#9d0272] p-1">
                        <div className="w-full h-full rounded-xl bg-gradient-to-br from-gray-100 to-gray-200">
                          <Image
                            src={founder.image}
                            alt={founder.name}
                            fill
                            className="object-contain rounded-xl"
                            loading="lazy"
                            sizes="(max-width: 740px) 100vw, (max-width: 868px) 50vw, 33vw"
                            quality={100}
                          />
                        </div>
                      </div>

                      {/* Soft glow effect on hover */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  </div>

                  {/* Content Section - Right with improved spacing and typography */}
                  <div className="flex-1 text-center sm:text-left w-full sm:w-3/5 space-y-4">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.2 * (index + 1) }}
                    >
                      {/* Name and tagline section */}
                      <div className="mb-3">
                        <h3 className="text-xl sm:text-2xl font-bold text-[#252e43] mb-1">
                          {founder.name}
                        </h3>
                      </div>

                      <div className="flex flex-row sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                        {/* Enhanced role badge with brand palette */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={inView ? { opacity: 1 } : {}}
                          transition={{
                            duration: 0.6,
                            delay: 0.3 * (index + 1),
                          }}
                          className={`flex items-center gap-1.5 w-32 px-3 py-1.5 bg-gradient-to-r from-[#b92423] via-[#9d2723] to-[#7f2823] rounded-full shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105`}
                        >
                          {isFounder ? (
                            <Crown className="w-3.5 h-3.5 text-white" />
                          ) : (
                            <Award className="w-3.5 h-3.5 text-white" />
                          )}
                          <span className="text-xs font-bold text-white">
                            {isFounder ? "FOUNDER" : "CO-FOUNDER"}
                          </span>
                        </motion.div>

                        {/* Title badge with improved styling */}
                        <div
                          className={`inline-block w-auto px-2 py-1 bg-[#252e43] rounded-full border border-[#252e43]/20`}
                        >
                          <p
                            className={`text-[#e0e3eb] font-semibold text-sm text-center`}
                          >
                            {founder.title}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Enhanced description with better readability */}
                    <motion.div
                      className="text-[#252e43] leading-relaxed text-sm max-w-prose bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl relative border border-gray-100"
                      style={{ textAlign: "left", lineHeight: "1.6" }}
                      initial={{ opacity: 0 }}
                      animate={inView ? { opacity: 1 } : {}}
                      transition={{
                        duration: 0.5,
                        delay: 0.35 * (index + 1),
                      }}
                    >
                      <span className="relative z-10">
                        {founder.description}
                      </span>
                    </motion.div>

                    <motion.div
                      className="flex justify-center sm:justify-start pt-2"
                      initial={{ opacity: 0 }}
                      animate={inView ? { opacity: 1 } : {}}
                      transition={{ duration: 0.5, delay: 0.4 * (index + 1) }}
                    >
                      <Button
                        asChild
                        className={`bg-gradient-to-r from-[#b92423] to-[#ab2623] hover:from-[#ab2623] hover:to-[#9d2723] text-white px-4 py-2.5 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg text-sm font-semibold group/btn relative overflow-hidden`}
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
