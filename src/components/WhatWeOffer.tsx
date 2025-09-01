"use client";

import { FaEye, FaUsers, FaFlag } from "react-icons/fa";

export default function WhatWeOffer() {
  return (
    <>
      {/* Who Are We Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
            Who <span className="text-red-800">Are We?</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Discover our vision, mission, and commitment to empowering the next
            generation of innovators through cutting-edge robotics education
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Vision Container */}
            <div className="group relative bg-white border border-gray-200 rounded-3xl shadow-lg p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/20 hover:-translate-y-2 hover:border-red-300 overflow-hidden">
              {/* Robotics-themed animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 via-transparent to-blue-50/30 opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-3xl"></div>

              {/* Circuit pattern overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700">
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-l-2 border-red-300 rounded-tl-lg"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-r-2 border-blue-300 rounded-br-lg"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-red-400 rounded-full"></div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <div className="text-4xl text-red-700 mr-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 group-hover:text-red-600">
                    <FaEye />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 group-hover:text-red-700 transition-colors duration-300">
                    Our Vision
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300 text-center">
                  To be the leading robotics education platform that empowers
                  students with cutting-edge technology skills, fostering
                  innovation and creativity for the future workforce.
                </p>
              </div>

              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 blur-xl"></div>
            </div>

            {/* About Us Container */}
            <div className="group relative bg-white border border-gray-200 rounded-3xl shadow-lg p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/20 hover:-translate-y-2 hover:border-red-300 overflow-hidden">
              {/* Robotics-themed animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 via-transparent to-blue-50/30 opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-3xl"></div>

              {/* Circuit pattern overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700">
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-l-2 border-red-300 rounded-tl-lg"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-r-2 border-blue-300 rounded-br-lg"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-red-400 rounded-full"></div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <div className="text-4xl text-red-700 mr-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 group-hover:text-red-600">
                    <FaUsers />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 group-hover:text-red-700 transition-colors duration-300">
                    About Us
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300 text-center">
                  Cyborg Robotics Academy is a premier educational institution
                  dedicated to teaching robotics, coding, and STEM skills to
                  students of all ages through hands-on learning experiences.
                </p>
              </div>

              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 blur-xl"></div>
            </div>

            {/* Mission Container */}
            <div className="group relative bg-white border border-gray-200 rounded-3xl shadow-lg p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/20 hover:-translate-y-2 hover:border-red-300 overflow-hidden">
              {/* Robotics-themed animated background */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 via-transparent to-blue-50/30 opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-3xl"></div>

              {/* Circuit pattern overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700">
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-l-2 border-red-300 rounded-tl-lg"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-r-2 border-blue-300 rounded-br-lg"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-red-400 rounded-full"></div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <div className="text-4xl text-red-700 mr-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 group-hover:text-red-600">
                    <FaFlag />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 group-hover:text-red-700 transition-colors duration-300">
                    Our Mission
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300 text-center">
                  To provide accessible, high-quality robotics education that
                  inspires students to explore, create, and innovate while
                  building essential 21st-century skills for tomorrow&apos;s
                  challenges.
                </p>
              </div>

              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 blur-xl"></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
