"use client";

import { FaEye, FaUsers, FaFlag } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { GlowingCards, GlowingCard } from "../lightswind/glowing-cards";

const whatWeOfferItems = [
  {
    title: "Our Vision",
    description:
      "Our Vision is to be a leading global academy, influencing the future of robotics for kids.",
    icon: FaEye,
    glowColor: "#a63534", // rich, warm reddish-brown
    link: "/about#story", // Add link property for Our Vision card
  },
  {
    title: "About Us",
    description:
      "Cyborg Robotics Academy Private Limited is one of the leading Robotics Academy in Pune offering various technical courses all under one roof.",
    icon: FaUsers,
    glowColor: "#313a49", // deep desaturated blue-gray
    link: "/about", // Add link property for About Us card
  },
  {
    title: "Our Mission",
    description:
      "Our mission is to transform the way parents & children think about learning robotics technology.",
    icon: FaFlag,
    glowColor: "#a63534", // pure white
    link: "/about#story", // Add link property for Our Mission card
  },
];

export default function WhoAreWe() {
  return (
    <>
      {/* Who Are We Section */}
      <section className="relative px-4 pb-8 sm:px-6 lg:px-8  to-blue-50/30 overflow-hidden">
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
              <h2 className="text-center font-bold flex items-center text-lg md:text-3xl mt-4 md:mt-6 mx-2">
                Who <span className="gradient-text"> Are We?</span>
                <div className=" rounded-full  flex items-center justify-center mr-4  mx-2">
                  <Image
                    src="/assets/logo1.png"
                    alt="Cyborg Robotics Logo"
                    width={60}
                    height={60}
                    unoptimized
                  />
                </div>
              </h2>
            </div>

            <p className="text-gray-600 text-lg md:text-xl text-center mb-8 max-w-4xl mx-auto leading-relaxed">
              Empowering future innovators through cutting-edge robotics
              education and hands-on learning experiences.
            </p>
          </div>

          {/* Using GlowingCards component */}
          <GlowingCards
            enableGlow={true}
            glowRadius={20}
            glowOpacity={0.8}
            animationDuration={400}
            gap="2rem"
            maxWidth="75rem"
            padding="1rem"
          >
            {whatWeOfferItems.map((item) => {
              const Icon = item.icon;

              return (
                <GlowingCard
                  key={item.title}
                  glowColor={item.glowColor}
                  className="flex flex-col items-center text-center p-8 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-lg shadow-lg group"
                >
                  {/* Use Link component inside the card for proper glow effect */}
                  {item.link ? (
                    <Link
                      href={item.link}
                      className="w-full h-full flex flex-col items-center"
                    >
                      {/* Icon container with gradient background */}
                      <div
                        className={`relative mb-6 p-4 rounded-2xl bg-[#a63534] shadow-lg transform transition-all duration-500 group-hover:scale-110`}
                      >
                        <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 transition-opacity duration-300"></div>
                        <Icon className="text-white text-2xl relative z-10" />
                      </div>

                      <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white mb-4 group-hover:text-[#a63534] transition-colors duration-300">
                        {item.title}
                      </h3>

                      <div
                        className="w-16 h-1 bg-gradient-to-r rounded-full mx-auto mb-6 group-hover:scale-x-125 transition-transform duration-300"
                        style={{
                          backgroundImage: `linear-gradient(to right, ${item.glowColor}, ${item.glowColor}90)`,
                        }}
                      ></div>

                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-center text-base lg:text-lg">
                        {item.description}
                      </p>
                    </Link>
                  ) : (
                    <>
                      {/* Icon container with gradient background */}
                      <div
                        className={`relative mb-6 p-4 rounded-2xl bg-[#a63534] shadow-lg transform transition-all duration-500 group-hover:scale-110`}
                      >
                        <div className="absolute inset-0 rounded-2xl bg-white/20  duration-300"></div>
                        <Icon className="text-white text-2xl relative z-10" />
                      </div>

                      <h3 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white mb-4 group-hover:text-[#a63534] transition-colors duration-300">
                        {item.title}
                      </h3>

                      <div
                        className="w-16 h-1 bg-gradient-to-r rounded-full mx-auto mb-6 group-hover:scale-x-125 transition-transform duration-300"
                        style={{
                          backgroundImage: `linear-gradient(to right, ${item.glowColor}, ${item.glowColor}90)`,
                        }}
                      ></div>

                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-center text-base lg:text-lg">
                        {item.description}
                      </p>
                    </>
                  )}
                </GlowingCard>
              );
            })}
          </GlowingCards>
        </div>
      </section>
    </>
  );
}
