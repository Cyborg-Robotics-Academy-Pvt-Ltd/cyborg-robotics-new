"use client";
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Brain, Lightbulb, BookOpen, Cpu, Eye } from "lucide-react";
import { GlowingCards, GlowingCard } from "../lightswind/glowing-cards";
import {
  cardHoverProps,
  sectionContainerVariants,
  sectionItemVariants,
} from "@/lib/motion";
import { useMotionPreferences } from "@/hooks/useMotionPreferences";

const Feature2: React.FC = React.memo(() => {
  const { reduceMotion } = useMotionPreferences();

  const features = useMemo(
    () => [
      {
        title: "Creative Learning",
        quote: "Hands-on projects that turn ideas into working creations.",
        icon: Lightbulb,
        glowColor: "#8D0F11",
        backgroundImage: "/assets/whoarewe/creative.jpg",
      },
      {
        title: "Simplified Education",
        quote: "Clear, step-by-step lessons that make robotics accessible.",
        icon: BookOpen,
        glowColor: "#8D0F11",
        backgroundImage: "/assets/whoarewe/simplifiededucation.jpg",
      },
      {
        title: "Latest Technology",
        quote: "Practical experience with modern tools like AI and automation.",
        icon: Cpu,
        glowColor: "#8D0F11",
        backgroundImage: "/assets/whoarewe/latesttechnology.jpg",
      },
      {
        title: "Futuristic Vision",
        quote: "Preparing learners for AI-driven industries of the future.",
        icon: Eye,
        glowColor: "#8D0F11",
        backgroundImage: "/assets/whoarewe/futuristicvision.jpg",
      },
    ],
    []
  );

  return (
    <motion.section
      className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 py-2 text-black md:py-2"
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "visible"}
      viewport={reduceMotion ? undefined : { once: true, amount: 0.2 }}
      variants={sectionContainerVariants(0.1)}
    >
      {/* Background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-5 w-48 h-48 bg-[#8D0F11]/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-10 right-5 w-56 h-56 bg-[#8D0F11]/5 rounded-full filter blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header Section */}
        <motion.div variants={sectionItemVariants} className="mb-10 text-center">
          <div className="flex justify-center mb-3">
            <div className="rounded-full bg-[#8D0F11]/10 p-3">
              <Brain className="w-6 h-6 text-[#8D0F11]" />
            </div>
          </div>

          <h1 className="font-extrabold text-2xl sm:text-3xl md:text-4xl">
            Why <span className="gradient-text">Learn Robotics?</span>
          </h1>

          <div className="flex items-center justify-center gap-1 my-3">
            <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-[#8D0F11]/60 rounded-full"></div>
            <div className="w-16 h-0.5 bg-gradient-to-r from-[#8D0F11]/60 to-[#8D0F11] rounded-full"></div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-[#8D0F11] to-transparent rounded-full"></div>
          </div>

          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Hands-on projects in engineering and coding — build creativity,
            logic and future-ready skills.
          </p>
        </motion.div>

        {/* Feature Cards with Glowing Effect */}
        <GlowingCards
          enableGlow={true}
          glowRadius={20}
          glowOpacity={0.8}
          animationDuration={400}
          gap="1.5rem"
          maxWidth="75rem"
          padding="1rem"
        >
          {features.map((t, index) => {
            const IconComponent = t.icon;
            return (
              <motion.div
                key={index}
                variants={sectionItemVariants}
                whileHover={reduceMotion ? undefined : cardHoverProps}
              >
                <GlowingCard
                  glowColor={t.glowColor}
                  className="group relative flex flex-col items-center overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-6 text-center shadow-lg backdrop-blur-lg"
                >
                  {/* Background image - shown with animation only on hover */}
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-0 transition-all duration-500 transform scale-90 group-hover:scale-100 group-hover:opacity-25"
                    style={{
                      backgroundImage: `url(${t.backgroundImage})`,
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                    }}
                  ></div>

                  <div className="relative z-10">
                    <div className="mb-4 flex items-center justify-center">
                      <div className="transform rounded-2xl bg-[#8D0F11] p-3 shadow-lg transition-all duration-500 group-hover:scale-110">
                        <div
                          className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 
                       transition-opacity duration-300"
                        ></div>
                        <IconComponent className="relative z-10 h-6 w-6 text-white" />
                      </div>
                    </div>

                    <h2 className="gradient-text mb-3 text-2xl font-bold transition-colors duration-300 group-hover:text-[#8D0F11] lg:text-xl">
                      {t.title}
                    </h2>

                    <div
                      className="mx-auto mb-4 h-1 w-12 rounded-full bg-gradient-to-r transition-transform duration-300 group-hover:scale-x-125"
                      style={{
                        backgroundImage: `linear-gradient(to right, ${t.glowColor}, ${t.glowColor}90)`,
                      }}
                    ></div>

                    <p className="text-center text-sm leading-relaxed text-gray-600">
                      {t.quote}
                    </p>
                  </div>
                </GlowingCard>
              </motion.div>
            );
          })}
        </GlowingCards>
      </div>
    </motion.section>
  );
});

Feature2.displayName = "Feature2";
export default Feature2;
