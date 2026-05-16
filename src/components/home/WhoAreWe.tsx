"use client";
import Image from "next/image";
import Link from "next/link";

import { GraduationCap } from "lucide-react";

export default function WhoAreWe() {
  return (
    <section className="relative w-full overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20 bg-gradient-to-b from-transparent to-blue-50/30">
      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div
          // variants={sectionItemVariants}
          className="text-center mb-10 sm:mb-12 lg:mb-16"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold">
                <span className="gradient-text">Who</span>
                <span className="text-black"> Are We?</span>
              </h1>
            </div>
            <Image
              src="/assets/logo1.png"
              alt="Cyborg Robotics Logo"
              width={60}
              height={60}
              className="w-12 h-12 sm:w-16 sm:h-16"
              priority
            />
          </div>
        </div>

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch lg:items-center">
          {/* Left Container */}
          <div
            // variants={sectionItemVariants}
            className="w-full lg:w-1/2"
          >
            <div className="bg-white rounded-2xl p-5 sm:p-6 lg:p-8 shadow-sm h-full flex flex-col">
              {/* About Section */}
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold gradient-text mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 text-[#a63534]" />
                  <span>About Us</span>
                </h2>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed space-y-2">
                  <span className="font-semibold">Cyborg Robotics Academy</span>{" "}
                  is a{" "}
                  <span className="font-semibold text-[#a63534]">
                    leading STEM and Robotics education center
                  </span>{" "}
                  focused on{" "}
                  <span className="font-semibold">
                    developing creativity, problem-solving skills and technical
                    confidence
                  </span>{" "}
                  in <span className="font-semibold">students of all ages</span>
                  . Through{" "}
                  <span className="font-semibold">
                    hands-on learning with LEGO Spike Prime, Arduino and IoT
                    tools
                  </span>
                  , we provide{" "}
                  <span className="font-semibold">
                    practical training in robotics, coding and engineering
                  </span>
                  . We also{" "}
                  <span className="font-semibold">
                    prepare students for major competitions
                  </span>
                  , such as{" "}
                  <span className="font-semibold">FTC, WRO and IRO</span>,
                  promoting{" "}
                  <span className="font-semibold text-[#a63534]">
                    teamwork and innovation
                  </span>
                  .
                </p>
              </div>

              {/* Achievements Card */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg sm:text-xl font-bold text-[#a63534] mb-2 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 flex-shrink-0" />
                  Achievements
                </h3>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Our students have won multiple awards, including 3rd Place &
                  Judges' Award and 2nd Runner Up at IRO 2024, top prizes at the
                  World STEM & Robotics Olympiad and podium finishes in Lego
                  Line Follower and Line Follower categories.
                </p>
              </div>

              {/* Contact Card */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm sm:text-base text-gray-700">
                  <strong>Contact:</strong>
                  <br className="sm:hidden" />
                  <span className="block sm:inline sm:ml-1">
                    +91 9175159292 or info@cyborgrobotics.in
                  </span>
                </p>
              </div>

              {/* CTA Button */}
              <Link
                href="/all-courses"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 w-full sm:w-auto bg-[#a63534] text-white font-semibold rounded-lg hover:bg-[#8a2d2d] transition-colors duration-200"
              >
                View Courses
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  // animate={reduceMotion ? undefined : ctaArrowAnimation}
                  // transition={reduceMotion ? undefined : ctaArrowTransition}
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right Container - Image */}
          <div
            // variants={sectionItemVariants}
            className="w-full lg:w-1/2"
          >
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl lg:rounded-4xl aspect-video sm:aspect-square lg:aspect-auto lg:h-96">
              <Image
                src="/assets/events/competition.png"
                alt="Cyborg Robotics Academy Competition"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
