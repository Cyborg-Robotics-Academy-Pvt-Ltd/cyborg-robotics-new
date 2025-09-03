"use client";

import { FaEye, FaUsers, FaFlag } from "react-icons/fa";

const whatWeOfferItems = [
  {
    title: "Our Vision",
    description:
      "Our Vision is to be a leading global academy, influencing the future of robotics for kids.",
    icon: FaEye,
  },
  {
    title: "About Us",
    description:
      "Cyborg Robotics Academy is a premier educational institution dedicated to teaching robotics, coding, and STEM skills to students of all ages through hands-on learning experiences.",
    icon: FaUsers,
  },
  {
    title: "Our Mission",
    description:
      "Our mission is to transform the way parents & children think about learning robotics technology.",
    icon: FaFlag,
  },
];

export default function WhatWeOffer() {
  return (
    <>
      {/* Who Are We Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        {/* Decorative background accents */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-red-100 blur-3xl opacity-60" />
          <div className="absolute bottom-10 -right-10 h-56 w-56 rounded-full bg-blue-100 blur-3xl opacity-50" />
        </div>
        <div className="relative max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
            Who <span className="gradient-text">Are We?</span>
          </h2>
          <p className="text-gray-600 text-base md:text-lg text-center mb-12 max-w-3xl mx-auto">
            Empowering future innovators through cutting-edge robotics
            education.
          </p>

          <div className="h-1 w-24 bg-red-800/90 mx-auto rounded-full mb-6 -mt-6"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {whatWeOfferItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  tabIndex={0}
                  className="group relative bg-white/90 backdrop-blur-sm border border-gray-200 rounded-3xl shadow-lg p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/20 hover:-translate-y-2 hover:border-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 via-transparent to-blue-50/30 opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-3xl"></div>

                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700">
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-l-2 border-red-300 rounded-tl-lg"></div>
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-r-2 border-blue-300 rounded-br-lg"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-red-400 rounded-full"></div>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-center mb-6">
                      <div className="text-4xl text-red-700 mr-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 group-hover:text-red-600 tech-pulse">
                        <Icon />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 group-hover:text-red-700 transition-colors duration-300">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300 text-center">
                      {item.description}
                    </p>
                  </div>

                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 blur-xl"></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
