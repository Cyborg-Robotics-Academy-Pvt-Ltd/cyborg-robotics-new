"use client";
import Script from "next/script";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  Variants,
} from "framer-motion";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    particlesJS?: (tagId: string, params: unknown) => void;
  }
}

const MyComp = () => {
  const statsContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const statItemVariants: Variants = {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 120, damping: 14 },
    },
  };

  const StatCard = ({
    icon,
    target,
    label,
    suffix = "+",
  }: {
    icon: string;
    target: number;
    label: string;
    suffix?: string;
  }) => {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));
    const formatted = useTransform(rounded, (v) => v.toLocaleString());
    const [display, setDisplay] = useState<string>("0");

    useEffect(() => {
      const unsubscribe = formatted.on("change", (v) => setDisplay(String(v)));
      return () => unsubscribe();
    }, [formatted]);

    return (
      <motion.div
        variants={statItemVariants}
        whileHover={{ y: -4, scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        viewport={{ once: true, amount: 0.6 }}
        onViewportEnter={() => {
          animate(count, target, { duration: 1.6, ease: "easeOut" });
        }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 flex items-center gap-4 shadow-lg"
      >
        <span className="text-red-500 text-4xl">{icon}</span>
        <div>
          <h3 className="text-2xl font-bold text-white">
            {display} {suffix}
          </h3>
          <p className="text-gray-200 text-sm">{label}</p>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/particles.js/2.0.0/particles.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          window.particlesJS?.("particles-js", {
            particles: {
              number: {
                value: 120,
                density: { enable: true, value_area: 800 },
              },
              color: { value: "#ffffff" },
              shape: { type: "circle" },
              opacity: { value: 0.4 },
              size: { value: 3, random: true },
              line_linked: {
                enable: true,
                distance: 150,
                color: "#ffffff",
                opacity: 0.3,
                width: 1,
              },
              move: { enable: true, speed: 3, out_mode: "out" },
            },
            interactivity: {
              events: {
                onhover: { enable: true, mode: "repulse" },
                onclick: { enable: true, mode: "push" },
              },
            },
            retina_detect: true,
          });
        }}
      />
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-r from-[#7A1C1E] via-[#A84C4C] to-[#3F1213]">
        <div id="particles-js" className="absolute inset-0 z-0"></div>

        <div className="relative z-10 w-full px-6">
          <div className="container mx-auto grid md:grid-cols-2 gap-10 items-center py-16">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center md:text-left text-white"
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                className="font-headline text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight drop-shadow-lg"
              >
                Build the Future,{" "}
                <span className="text-yellow-300">One Robot</span> at a Time
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25, ease: "easeOut" }}
                className="mt-6 max-w-2xl mx-auto md:mx-0 text-lg text-gray-200 leading-relaxed"
              >
                Cyborg Robotics Academy in Pune offers hands-on courses in
                robotics, coding, and more. Our{" "}
                <span className="italic font-semibold">
                  &quot;Learning by Doing&quot;
                </span>{" "}
                approach prepares students for the future of technology.
              </motion.p>
              <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    asChild
                    size="lg"
                    className="bg-yellow-400 rounded-xl text-black font-semibold hover:bg-yellow-300 transition-all duration-300 shadow-lg"
                  >
                    <Link href="/courses">Explore Courses</Link>
                  </Button>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.55, ease: "easeOut" }}
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-yellow-300 rounded-xl text-yellow-300 hover:bg-yellow-300 hover:text-black transition-all duration-300"
                  >
                    <Link href="/contact">Book a Free Trial</Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Right image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden md:block"
            >
              <div className="relative group">
                <Image
                  src="https://placehold.co/600x400.png"
                  width={600}
                  height={400}
                  alt="Robotics hero image"
                  className="rounded-2xl shadow-2xl border-4 border-yellow-300 transition-transform duration-500"
                />
              </div>
            </motion.div>
          </div>

          {/* Stats Section */}
          <motion.div
            variants={statsContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="relative z-10 w-full mt-12"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <StatCard icon="⚙️" target={50} label="Robotics Kits" />
              <StatCard icon="👩‍🎓" target={1000} label="Students" />
              <StatCard icon="📚" target={20} label="Unique Courses" />
              <StatCard icon="📅" target={100} label="Events Hosted" />
            </div>
          </motion.div>
        </div>
        <div className="">
          <div className=""></div>
        </div>
      </section>
    </>
  );
};
export default MyComp;
