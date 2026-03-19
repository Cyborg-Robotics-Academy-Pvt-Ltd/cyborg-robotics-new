"use client";
import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-project-showcase";

const ProjectShowcases = () => {
  // Map age tags to their corresponding color classes from ageGroups
  const getAgeTagColor = (ageTag: string) => {
    switch (ageTag) {
      case "4-6":
        return "from-[#A81B1E] to-[#C73E1D]"; // Red tones for ages 4-6
      case "7-9":
        return "from-[#0855AB] to-[#2B6ECC]"; // Blue tones for ages 7-9
      case "10+":
        return "from-[#B1B2B3] to-[#D1D2D3]"; // Gray tones for ages 10+
      default:
        return "from-blue-500 to-purple-600"; // Fallback
    }
  };

  // Prepare projects data for infinite moving cards with age tags and colors
  const projectItems = [
    // Ages 4-6 Projects
    {
      title: "Ice Hockey Robot",
      imageUrl: "/assets/lego/early-simple-machine/ice-hockey-robot.jpg",
      ageTag: "4-6",
      ageColor: getAgeTagColor("4-6"),
    },
    {
      title: "Tow Truck",
      imageUrl: "/assets/lego/early-simple-machine/tow-truck.jpg",
      ageTag: "4-6",
      ageColor: getAgeTagColor("4-6"),
    },
    {
      title: "Tricycle",
      imageUrl: "/assets/lego/early-simple-machine/tricycle.jpg",
      ageTag: "4-6",
      ageColor: getAgeTagColor("4-6"),
    },
    // Ages 7-9 Projects
    {
      title: "Power Car",
      imageUrl: "/assets/lego/simple-and-powered/power-car.jpg",
      ageTag: "7-9",
      ageColor: getAgeTagColor("7-9"),
    },

    {
      title: "Sweeper Car",
      imageUrl: "/assets/lego/simple-and-powered/car-launcher1.jpg",
      ageTag: "7-9",
      ageColor: getAgeTagColor("7-9"),
    },
    // Ages 10+ Projects
    {
      title: "Fly Trap",
      imageUrl: "/assets/lego/ev3/flytrap.jpg",
      ageTag: "10+",
      ageColor: getAgeTagColor("10+"),
    },
    {
      title: "Mindstorm",
      imageUrl: "/assets/lego/ev3/mindstorm.jpg",
      ageTag: "10+",
      ageColor: getAgeTagColor("10+"),
    },
    {
      title: "Robo Arm",
      imageUrl: "/assets/lego/ev3/roboarm.jpg",
      ageTag: "10+",
      ageColor: getAgeTagColor("10+"),
    },
  ];

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div>
      {/* Infinite Carousel Projects Showcase */}
      <motion.section
        className=" bg-gradient-to-b from-white to-gray-50 relative overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header */}
          <motion.div className="text-center " variants={fadeInUp}>
            <motion.h2
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#062341] mb-3 md:mb-4 font-sans"
              variants={fadeInUp}
            >
              PROJECTS BY{" "}
              <span className="gradient-text font-bold">AGE GROUP</span>
            </motion.h2>
            <motion.p
              className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg"
              variants={fadeInUp}
            >
              Explore hands-on projects designed for each age group
            </motion.p>
          </motion.div>

          {/* Infinite Moving Cards Carousel */}
          <motion.div
            className="relative max-w-8xl mx-auto px-4"
            variants={fadeInUp}
          >
            <InfiniteMovingCards
              items={projectItems}
              direction="left"
              speed="slow"
              pauseOnHover={true}
              className="py-8"
            />
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default ProjectShowcases;
