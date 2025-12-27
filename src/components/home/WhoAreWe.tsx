"use client";

import Image from "next/image";
import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function WhoAreWe() {
  return (
    <>
      {/* Who Are We Section */}
      <section className="relative my-auto px-4 sm:px-6 lg:px-8 to-blue-50/30 overflow-hidden">
        <div className="relative max-w-7xl mx-auto mt-10">
          {/* Header section */}
          <div className="text-center">
            <div className="flex justify-center">
              <h1 className="text-center">
                <span className="text-3xl font-bold gradient-text">Who</span>
                <span className="text-3xl font-bold text-black"> Are We ?</span>
              </h1>
              <div className="">
                <Image
                  src="/assets/logo1.png"
                  alt="Cyborg Robotics Logo"
                  width={60}
                  height={60}
                  unoptimized
                />
              </div>
            </div>
            <div className="flex items-center justify-center gap-1 my-3">
              <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-[#8D0F11]/60 rounded-full"></div>
              <div className="w-16 h-0.5 bg-gradient-to-r from-[#8D0F11]/60 to-[#8D0F11] rounded-full"></div>
              <div className="w-8 h-0.5 bg-gradient-to-r from-[#8D0F11] to-transparent rounded-full"></div>
            </div>
          </div>

          {/* Two-container layout */}
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            {/* Left Container - About Us Content */}
            <div className="lg:w-1/2">
              <div className="bg-white rounded-2xl p-6 ">
                <h2 className="text-2xl font-bold gradient-text mb-2 flex  items-center ">
                  <GraduationCap className="mr-2 h-6 w-6 text-[#a63534]" />
                  About Us{" "}
                </h2>
                <p className="text-gray-700 mb-4">
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

                {/* Our Achievements & Awards Section */}
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-xl font-bold text-[#a63534] mb-2 flex items-center">
                    <GraduationCap className="mr-2 h-5 w-5" />
                    Achievements
                  </h3>
                  <p className="text-gray-700">
                    Our students have won multiple awards, including 3rd Place &
                    Judges' Award and 2nd Runner Up at IRO 2024, top prizes at
                    the World STEM & Robotics Olympiad and podium finishes in
                    Lego Line Follower and Line Follower categories.
                  </p>
                </div>

                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">
                    <strong>Contact:</strong> +91 9175159292 or
                    info@cyborgrobotics.in
                  </p>
                </div>
                <div className="mt-2">
                  <Link
                    href="/all-courses"
                    className="inline-flex items-center px-4 py-2 bg-[#a63534] text-white rounded-lg hover:bg-[#8a2d2d] transition-colors"
                  >
                    View Courses
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 ml-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
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
            </div>

            {/* Right Container - Image */}
            <div className="lg:w-1/2 md:mb-8 lg:mb-2">
              <div className="rounded-4xl overflow-hidden ">
                <Image
                  src="/assets/events/competition.png"
                  alt="Cyborg Robotics Academy"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
