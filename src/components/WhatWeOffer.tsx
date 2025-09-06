"use client";

import {
  FaEye,
  FaUsers,
  FaFlag,
  FaRobot,
  FaMicrochip,
  FaCog,
} from "react-icons/fa";
import { motion } from "motion/react";

const whatWeOfferItems = [
  {
    title: "Our Vision",
    description:
      "Our Vision is to be a leading global academy, influencing the future of robotics for kids.",
    icon: FaEye,
    color: "from-red-500 to-pink-500",
    bgColor: "from-red-50 to-pink-50",
    accentColor: "red",
  },
  {
    title: "About Us",
    description:
      "Cyborg Robotics Academy is a premier educational institution dedicated to teaching robotics, coding, and STEM skills to students of all ages through hands-on learning experiences.",
    icon: FaUsers,
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50",
    accentColor: "blue",
  },
  {
    title: "Our Mission",
    description:
      "Our mission is to transform the way parents & children think about learning robotics technology.",
    icon: FaFlag,
    color: "from-green-500 to-emerald-500",
    bgColor: "from-green-50 to-emerald-50",
    accentColor: "green",
  },
];

export default function WhatWeOffer() {
  return (
    <>
      {/* Who Are We Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 overflow-hidden">
        {/* Enhanced decorative background with floating elements */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          {/* Main gradient orbs */}
          <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-gradient-to-br from-red-200/40 to-pink-200/40 blur-3xl animate-pulse" />
          <div
            className="absolute bottom-20 -right-20 h-96 w-96 rounded-full bg-gradient-to-br from-blue-200/40 to-cyan-200/40 blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-gradient-to-br from-green-200/30 to-emerald-200/30 blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          />

          {/* Floating tech elements */}

          <div
            className="absolute bottom-32 left-1/3 w-2 h-2 bg-green-400 rounded-full opacity-60 animate-bounce"
            style={{ animationDelay: "2.5s" }}
          />
          <div
            className="absolute top-1/3 right-1/4 w-1 h-1 bg-purple-400 rounded-full opacity-70 animate-bounce"
            style={{ animationDelay: "3s" }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* Enhanced header section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center mr-4 shadow-lg">
                <FaRobot className="text-white text-xl" />
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
                Who <span className="gradient-text">Are We?</span>
              </h2>
            </div>

            <p className="text-gray-600 text-lg md:text-xl text-center mb-8 max-w-4xl mx-auto leading-relaxed">
              Empowering future innovators through cutting-edge robotics
              education and hands-on learning experiences.
            </p>

            {/* Enhanced divider with tech elements */}
            <div className="flex items-center justify-center mb-8">
              <div className="w-16 h-px bg-gradient-to-r from-transparent to-red-300"></div>
              <div className="mx-4 flex items-center space-x-2">
                <FaMicrochip className="text-red-500 text-sm" />
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <FaCog
                  className="text-red-500 text-sm animate-spin"
                  style={{ animationDuration: "3s" }}
                />
              </div>
              <div className="w-16 h-px bg-gradient-to-l from-transparent to-red-300"></div>
            </div>
          </div>

          {/* Cards grid with one-by-one stagger on first view */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.18 } },
            }}
          >
            {whatWeOfferItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  tabIndex={0}
                  className="group relative glassmorphism-bg border border-white/20 rounded-3xl p-8 lg:p-10 transition-all duration-700 hover:shadow-2xl hover:-translate-y-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 overflow-hidden circuit-border"
                  variants={{
                    hidden: { opacity: 0, y: 24, scale: 0.98 },
                    show: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                >
                  {/* Animated background gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${item.bgColor} opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-3xl`}
                  ></div>

                  {/* Tech pattern overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700">
                    <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-l-2 border-red-300 rounded-tl-lg"></div>
                    <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-r-2 border-blue-300 rounded-br-lg"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
                    <div className="absolute top-8 left-8 w-1 h-1 bg-blue-400 rounded-full"></div>
                    <div className="absolute bottom-8 right-8 w-1 h-1 bg-green-400 rounded-full"></div>
                  </div>

                  <div className="relative z-10">
                    {/* Enhanced icon and title */}
                    <div className="flex flex-col items-center text-center mb-8">
                      <div
                        className={`relative mb-6 p-4 rounded-2xl bg-gradient-to-br ${item.color} shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                      >
                        <Icon className="text-white text-2xl" />
                        <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors duration-300 mb-2">
                        {item.title}
                      </h3>
                      <div
                        className={`w-16 h-1 bg-gradient-to-r ${item.color} rounded-full mx-auto`}
                      ></div>
                    </div>

                    {/* Enhanced description */}
                    <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300 text-center text-base lg:text-lg">
                      {item.description}
                    </p>
                  </div>

                  {/* Enhanced glow effect */}
                  <div
                    className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-700 -z-10 blur-2xl`}
                  ></div>

                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-300/50 rounded-tl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-blue-300/50 rounded-br-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
    </>
  );
}
