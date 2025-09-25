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
      className="relative text-center py-6 px-4 sm:px-6 lg:px-8 bg-white"
      aria-label="About Us Hero Section"
    >
      {/* Breadcrumb */}
      <motion.nav
        variants={itemVariants}
        aria-label="Breadcrumb"
        className="flex items-center justify-center mb-6"
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
      <motion.div variants={itemVariants} className="mb-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900">
          <span className="gradient-text">About Us</span>
        </h1>
        <div className="mt-4 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
          Empowering the next generation of{" "}
          <FlipWords words={flipWords} className="text-red-600 font-semibold" />{" "}
          through hands-on robotics and technology education.
        </div>
      </motion.div>
    </motion.section>
  );
}
