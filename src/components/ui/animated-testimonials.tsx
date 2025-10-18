"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

type Testimonial = {
  quote: string;
  src: string;
};

export const AnimatedTestimonials = ({
  testimonials,
  autoplay = true,
}: {
  testimonials: Testimonial[];
  autoplay?: boolean;
}) => {
  const [active, setActive] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleNext = useCallback(() => {
    setActive((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const isActive = (index: number) => index === active;

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  useEffect(() => {
    if (autoplay && !isHovered) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay, handleNext, isHovered]);

  // Deterministic rotation values to prevent hydration errors
  const getRotationValue = (index: number) => {
    const rotations = [-2, -1, 0, 1, 2, -3, -4, -5];
    return rotations[index % rotations.length];
  };

  useEffect(() => {
    handleNext();
  }, [handleNext]);

  return (
    <div className="max-w-sm md:max-w-4xl mx-auto antialiased font-sans px-4 mt-6 md:mt-2 md:px-8 lg:px-12 md:py-4 bg-white text-black">
      <div
        className="relative grid grid-cols-1 md:grid-cols-2 md:gap-10 items-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Image Section */}

        {/* Quote Section */}
        <div className="flex justify-between flex-col py-1">
          <motion.div
            key={active}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            <motion.p className="text-lg mt-2 text-gray-700 text-mono mb-2">
              {testimonials[active].quote.split(" ").map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ filter: "blur(10px)", opacity: 0, y: 5 }}
                  animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    ease: "easeInOut",
                    delay: 0.02 * index,
                  }}
                  className="inline-block"
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </motion.p>
          </motion.div>
        </div>
        {/* Button Section */}
        <div className="block md:hidden text-end mb-8 mt-4">
          <Link href="/about-us">
            <button className="relative group border-none bg-transparent p-0 outline-none cursor-pointer font-light uppercase text-base">
              <span className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-25 rounded-xl transform translate-y-0.5 transition duration-400 ease-\[cubic-bezier\(0.3,0.7,0.4,1\)\] group-hover:translate-y-1 group-hover:duration-250 group-active:translate-y-px"></span>

              <span className="absolute top-0 left-0 w-full h-full rounded-t-xl bg-gradient-to-l from-[hsl(217,33%,16%)] via-[hsl(217,33%,32%)] to-[hsl(217,33%,16%)]"></span>

              <div className="relative flex items-center justify-between py-2 px-3 text-lg text-white rounded-t-xl transform -translate-y-1 bg-red-700 gap-3 transition duration-400 ease-\[cubic-bezier\(0.3,0.7,0.4,1\)\] group-hover:-translate-y-1.5 group-hover:duration-250 group-active:-translate-y-0.5 brightness-100 group-hover:brightness-110">
                <span className="select-none">Why Cyborg</span>
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5 ml-2 -mr-1 transition duration-250 group-hover:translate-x-1"
                >
                  <path
                    clipRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  ></path>
                </svg>
              </div>
            </button>
          </Link>
        </div>
        <div>
          <div className="relative h-80 w-full z-10 mt-10">
            <AnimatePresence>
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.src}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    z: -100,
                    rotate: getRotationValue(index),
                  }}
                  animate={{
                    opacity: isActive(index) ? 1 : 0.7,
                    scale: isActive(index) ? 1 : 0.95,
                    z: isActive(index) ? 0 : -100,
                    rotate: isActive(index) ? 0 : getRotationValue(index),
                    zIndex: isActive(index)
                      ? 999
                      : testimonials.length + 2 - index,
                    y: isActive(index) ? [0, -80, 0] : 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    z: 100,
                    rotate: getRotationValue(index),
                  }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="absolute inset-0 origin-bottom overflow-hidden"
                >
                  <Image
                    src={testimonial.src}
                    alt="Testimonial Image"
                    width={800}
                    height={800}
                    draggable={false}
                    className="h-72 w-52 rounded-3xl mx-auto my-auto object-contain object-center shadow-gray-400 shadow-md"
                    priority
                    loading="eager"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
      {/* Button Section */}
      <div className="hidden md:block text-start ">
        <Link href="/about-us">
          <button className="relative group border-none bg-transparent p-0 outline-none cursor-pointer font-light uppercase text-base">
            <span className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-25 rounded-xl transform translate-y-0.5 transition duration-400 ease-\[cubic-bezier\(0.3,0.7,0.4,1\)\] group-hover:translate-y-1 group-hover:duration-250 group-active:translate-y-px"></span>

            <span className="absolute top-0 left-0 w-full h-full rounded-t-xl bg-gradient-to-l from-[hsl(217,33%,16%)] via-[hsl(217,33%,32%)] to-[hsl(217,33%,16%)]"></span>

            <div className="relative flex items-center justify-between py-2 px-6 text-lg text-white rounded-t-xl transform -translate-y-1 bg-red-700 gap-3 transition duration-400 ease-\[cubic-bezier\(0.3,0.7,0.4,1\)\] group-hover:-translate-y-1.5 group-hover:duration-250 group-active:-translate-y-0.5 brightness-100 group-hover:brightness-110">
              <span className="select-none">Why Cyborg</span>
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5 ml-2 -mr-1 transition duration-250 group-hover:translate-x-1"
              >
                <path
                  clipRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                ></path>
              </svg>
            </div>
          </button>
        </Link>
      </div>
    </div>
  );
};
