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
    link: "/about-us#story", // Add link property for Our Vision card
    backgroundImage: "/assets/whoarewe/vision.jpg",
  },
  {
    title: "About Us",
    description:
      "Cyborg Robotics Academy Private Limited is one of the leading Robotics Academy in Pune offering various technical courses all under one roof.",
    icon: FaUsers,
    glowColor: "#313a49", // deep desaturated blue-gray
    link: "/about-us", // Add link property for About Us card
    backgroundImage: "",
  },
  {
    title: "Our Mission",
    description:
      "Our mission is to transform the way parents & children think about learning robotics technology.",
    icon: FaFlag,
    glowColor: "#a63534", // pure white
    link: "/about-us#story", // Add link property for Our Mission card
    backgroundImage: "/assets/whoarewe/mission.jpg",
  },
];

export default function WhoAreWe() {
  return (
    <>
      {/* Who Are We Section */}
      <section className="relative  px-4 pb-1 sm:px-6 lg:px-8  to-blue-50/30 overflow-hidden">
        {/* Enhanced decorative background with floating elements */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        ></div>

        <div className="relative max-w-7xl mx-auto mt-10">
          {/* Enhanced header section */}
          <div className="text-center mb-4">
            <div className="flex  mb-3 justify-center ">
              <h1 className="mb-10 text-center">
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
                  className="flex flex-col items-center text-center p-8 rounded-3xl border border-white/20 bg-white/10 backdrop-blur-lg shadow-lg group relative overflow-hidden"
                >
                  {/* Use Link component inside the card for proper glow effect */}
                  {item.link ? (
                    <Link
                      href={item.link}
                      className="w-full h-full flex flex-col items-center relative"
                    >
                      {/* Background image - reveals on hover/focus using next/image for optimization */}
                      {item.backgroundImage && (
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-30 group-focus-within:opacity-30 motion-reduce:transition-none transition-opacity duration-500">
                            <Image
                              src={item.backgroundImage}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 100vw, 33vw"
                              unoptimized
                            />
                          </div>
                        </div>
                      )}
                      {/* Icon container with gradient background */}
                      <div
                        className={`relative mb-6 p-4 rounded-2xl bg-[#a63534] shadow-lg transform transition-all duration-500 group-hover:scale-110`}
                      >
                        <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 transition-opacity duration-300"></div>
                        <Icon className="text-white text-2xl relative z-10" />
                      </div>

                      <h3 className="text-2xl lg:text-3xl font-bold gradient-text mb-4 group-hover:text-[#a63534] transition-colors duration-300">
                        {item.title}
                      </h3>

                      <div
                        className="w-16 h-1 bg-gradient-to-r rounded-full mx-auto mb-6 group-hover:scale-x-125 transition-transform duration-300"
                        style={{
                          backgroundImage: `linear-gradient(to right, ${item.glowColor}, ${item.glowColor}90)`,
                        }}
                      ></div>

                      <p className="text-gray-600  leading-relaxed text-center text-base lg:text-lg">
                        {item.description}
                      </p>
                    </Link>
                  ) : (
                    <>
                      {/* Background image - reveals on hover/focus for non-link cards */}
                      {item.backgroundImage && (
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-30 group-focus-within:opacity-30 motion-reduce:transition-none transition-opacity duration-500">
                            <Image
                              src={item.backgroundImage}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 100vw, 33vw"
                              unoptimized
                            />
                            <div
                              className="absolute inset-0 bg-black/30"
                              aria-hidden="true"
                            />
                          </div>
                        </div>
                      )}
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
