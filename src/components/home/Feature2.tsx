"use client";
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Brain, Lightbulb, BookOpen, Cpu, Eye } from "lucide-react";
import { GlowingCards, GlowingCard } from "../lightswind/glowing-cards";

const Feature2: React.FC = React.memo(() => {
  const features = useMemo(
    () => [
      {
        title: "Creative Learning",
        quote:
          "Exploring robotics has been a journey of creativity and innovation. It merges imagination with technology, bringing ideas to life through hands-on projects and engineering thinking.",
        icon: Lightbulb,
        glowColor: "#8D0F11", // Brand color for glowing effect
        backgroundImage: "/assets/whoarewe/creative.jpg",
      },
      {
        title: "Simplified Education",
        quote:
          "Robotics education has never been this simple and engaging. The structured teaching approach makes complex ideas easy to grasp and enjoyable to learn step by step.",
        icon: BookOpen,
        glowColor: "#8D0F11", // Brand color for glowing effect
        backgroundImage: "/assets/whoarewe/simplifiededucation.jpg",
      },
      {
        title: "Latest Technology",
        quote:
          "Learning robotics connects you with cutting-edge tools — from AI-driven automation to modern programming — giving real-world technological experience and confidence.",
        icon: Cpu,
        glowColor: "#8D0F11", // Brand color for glowing effect
        backgroundImage: "",
      },
      {
        title: "Futuristic Vision",
        quote:
          "Robotics opens doors to a world where intelligent machines collaborate with humans. It empowers learners to lead in tomorrow's AI-powered industries.",
        icon: Eye,
        glowColor: "#8D0F11", // Brand color for glowing effect
        backgroundImage: "/assets/futuristic.png",
      },
    ],
    []
  );

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 text-black py-2 md:py-2 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-5 w-48 h-48 bg-[#8D0F11]/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-10 right-5 w-56 h-56 bg-[#8D0F11]/5 rounded-full filter blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="flex justify-center mb-3">
            <motion.div
              className="p-3 rounded-full bg-[#8D0F11]/10"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            >
              <Brain className="w-6 h-6 text-[#8D0F11]" />
            </motion.div>
          </div>

          <h1 className="font-extrabold text-2xl sm:text-3xl md:text-4xl">
            Why <span className="text-[#8D0F11]">Learn Robotics?</span>
          </h1>

          <div className="flex items-center justify-center gap-1 my-3">
            <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-[#8D0F11]/60 rounded-full"></div>
            <div className="w-16 h-0.5 bg-gradient-to-r from-[#8D0F11]/60 to-[#8D0F11] rounded-full"></div>
            <div className="w-8 h-0.5 bg-gradient-to-r from-[#8D0F11] to-transparent rounded-full"></div>
          </div>

          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Hands-on projects in engineering and coding — build creativity,
            logic, and future-ready skills.
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
              <GlowingCard
                key={index}
                glowColor={t.glowColor}
                className="flex flex-col items-center text-center p-6 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-lg shadow-lg group relative overflow-hidden"
              >
                {/* Background image - shown with animation only on hover */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-25 transition-all duration-500 transform scale-90 group-hover:scale-100"
                  style={{
                    backgroundImage: `url(${t.backgroundImage})`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                  }}
                ></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-4">
                    <div className="p-3 rounded-2xl bg-[#8D0F11] shadow-lg transform transition-all duration-500 group-hover:scale-110">
                      <div
                        className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 
                       transition-opacity duration-300"
                      ></div>
                      <IconComponent className="w-6 h-6 text-white relative z-10" />
                    </div>
                  </div>

                  <h2 className="font-bold text-xl text-gray-800 dark:text-white mb-3 group-hover:text-[#8D0F11] transition-colors duration-300">
                    {t.title}
                  </h2>

                  <div
                    className="w-12 h-1 bg-gradient-to-r rounded-full mx-auto mb-4 group-hover:scale-x-125 transition-transform duration-300"
                    style={{
                      backgroundImage: `linear-gradient(to right, ${t.glowColor}, ${t.glowColor}90)`,
                    }}
                  ></div>

                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-center text-sm">
                    {t.quote}
                  </p>
                </div>
              </GlowingCard>
            );
          })}
        </GlowingCards>
      </div>
    </div>
  );
});

Feature2.displayName = "Feature2";
export default Feature2;
