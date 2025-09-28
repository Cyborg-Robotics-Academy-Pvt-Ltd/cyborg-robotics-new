"use client";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef, useMemo } from "react";
import { ChevronRight, Users } from "lucide-react";
import { FlipWords } from "@/components/ui/flip-words";

export default function HeroSection() {
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true, margin: "-50px" });

  const flipWords = useMemo(
    () => [
      "Innovators",
      "Problem Solvers",
      "Future Leaders",
      "Tech Pioneers",
      "Creative Minds",
      "Change Makers",
      "Visionaries",
    ],
    []
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, duration: 0.6 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <motion.section
      ref={heroRef}
      initial="hidden"
      animate={heroInView ? "visible" : "hidden"}
      variants={containerVariants}
      className="relative text-center px-2 sm:px-4 lg:px-8 bg-white pb-2 sm:pb-4"
      aria-label="About Us Hero Section"
    >
      {/* Breadcrumb */}
      <motion.nav
        variants={itemVariants}
        aria-label="Breadcrumb"
        className="flex items-center justify-center "
      >
        <div className="flex items-center px-4 py-1.5 bg-white/70 backdrop-blur-md border border-gray-100 rounded-full text-sm">
          <Link
            href="/"
            className="text-gray-600 hover:text-red-600 transition-colors"
          >
            Home
          </Link>
          <ChevronRight className="w-3 h-3 mx-2 text-gray-400" />
          <span className="text-red-600 font-medium flex items-center gap-1">
            <Users className="w-3 h-3" />
            About Us
          </span>
        </div>
      </motion.nav>

      {/* Heading */}
      <motion.div variants={itemVariants} className="">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900">
          <span className="gradient-text">About Us</span>
        </h1>
        <div className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-2 sm:px-0">
          Empowering the next generation of{" "}
          <FlipWords words={flipWords} className="text-red-600 font-semibold" />{" "}
          through hands-on robotics and technology education.
        </div>
      </motion.div>
    </motion.section>
  );
}
