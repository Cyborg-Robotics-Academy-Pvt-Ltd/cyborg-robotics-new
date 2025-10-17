"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Users } from "lucide-react";

export default function HeroSection() {
  return (
    // Added w-full to ensure full width coverage
    <section
      className="relative text-center px-0 sm:px-4 lg:px-8 bg-white w-full pb-2 sm:pb-4"
      aria-label="About Us Hero Section"
    >
      {/* Breadcrumb */}
      <motion.nav
        aria-label="Breadcrumb"
        className="flex items-center justify-center mt-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
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
      <div className="">
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="gradient-text">About Us</span>
        </motion.h1>
        <motion.div
          className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-2 sm:px-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <blockquote className="text-sm sm:text-base italic text-gray-700 border-l-4 border-red-600 pl-4 mx-4">
            &quot;The best way to predict the future is to create it. We believe
            every child has the potential to be an innovator, and our mission is
            to unlock that potential through practical, engaging learning
            experiences.&quot;
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
}
