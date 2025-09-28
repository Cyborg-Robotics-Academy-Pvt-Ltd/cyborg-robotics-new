"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, ExternalLink } from "lucide-react";
import Link from "next/link";

// Type definitions
interface TeamMember {
  name: string;
  role: string;
  bio: string;
  photo: string;
  linkedin: string;
}

interface TeamCardProps {
  member: TeamMember;
  index: number;
  onHover: (index: number) => void;
  onLeave: () => void;
}

export default function EnhancedTeamSection() {
  const [, setHoveredTeam] = useState<number | null>(null);

  const teamMembers = [
    {
      name: "Dr. Sarah Johnson",
      role: "Tech Lead",
      bio: "AI development expert specializing in robotics and machine learning.",
      photo:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      linkedin: "https://www.linkedin.com/in/your-profile",
    },
    {
      name: "Prof. Michael Chen",
      role: "Senior Mentor",
      bio: "Electronics expert in circuit design and embedded systems.",
      photo:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      linkedin: "https://www.linkedin.com/in/shrikant11",
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Project Coordinator",
      bio: "Innovation strategist focused on educational technology.",
      photo:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      linkedin: "https://www.linkedin.com/in/your-profile",
    },
    {
      name: "Lisa Thompson",
      role: "Student Success",
      bio: "Student success expert in educational psychology and mentorship.",
      photo:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
      linkedin: "https://www.linkedin.com/in/your-profile",
    },
  ];

  const TeamCard = ({ member, index, onHover, onLeave }: TeamCardProps) => {
    return (
      <motion.div
        className="relative group cursor-pointer block"
        onMouseEnter={() => onHover(index)}
        onMouseLeave={onLeave}
        initial={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          mass: 0.8,
        }}
        style={{
          transformOrigin: "center",
          willChange: "transform",
        }}
      >
        <Link
          href={member.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="block h-full"
        >
          {/* Enhanced Card Background with Multi-Layer Effects */}
          <div className="relative p-[3px] rounded-3xl bg-gradient-to-br from-[#BF2121] via-[#BF2121]/80 to-[#BF2121]/90 shadow-lg transform-gpu">
            {/* Outer Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-br from-[#BF2121]/30 via-[#BF2121]/20 to-[#BF2121]/40 rounded-3xl blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-500" />

            {/* Glass Morphism Background */}
            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl overflow-hidden h-[320px] sm:h-[340px] md:h-[360px] flex flex-col transform-gpu border border-white/20">
              {/* Decorative Corner Elements */}
              <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-[#BF2121]/20 to-transparent rounded-br-3xl" />
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-[#BF2121]/20 to-transparent rounded-tl-3xl" />

              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-4 right-8 w-2 h-2 bg-[#BF2121] rounded-full animate-pulse" />
                <div className="absolute top-12 right-4 w-1 h-1 bg-[#BF2121]/70 rounded-full animate-pulse delay-300" />
                <div className="absolute bottom-8 left-6 w-1.5 h-1.5 bg-[#BF2121]/50 rounded-full animate-pulse delay-700" />
              </div>
              {/* Enhanced Image Section */}
              <div className="relative h-44 sm:h-48 md:h-52 overflow-hidden rounded-t-3xl">
                {/* Image Frame Enhancement */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 z-10 pointer-events-none" />
                <motion.img
                  src={member.photo}
                  alt={member.name}
                  className="w-full h-full object-cover transform-gpu"
                  whileHover={{ scale: 1.1 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  style={{
                    transformOrigin: "center",
                    willChange: "transform",
                  }}
                />
                {/* Enhanced Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-[#BF2121]/20 to-transparent z-20" />

                {/* Enhanced External Link Indicator */}
                <motion.div
                  className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 sm:p-2 bg-black/80 backdrop-blur-md rounded-full text-white border border-white/20 shadow-md z-40"
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  whileHover={{ opacity: 1, scale: 1.1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    duration: 0.3,
                  }}
                >
                  <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </motion.div>

                {/* Enhanced LinkedIn Indicator */}
                <motion.div
                  className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 p-1.5 sm:p-2 bg-gradient-to-br from-[#BF2121] to-[#BF2121]/80 backdrop-blur-md rounded-full text-white border border-white/30 shadow-md z-40"
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  whileHover={{ opacity: 1, scale: 1.1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    duration: 0.3,
                    delay: 0.1,
                  }}
                >
                  <svg
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </motion.div>
              </div>

              {/* Enhanced Content Section */}
              <div className="relative p-4 sm:p-5 md:p-6 flex-1 flex flex-col justify-between">
                {/* Enhanced Content Background Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-white/60 backdrop-blur-sm rounded-b-3xl border-t border-white/30" />

                {/* Content Container */}
                <div className="relative z-10">
                  <div className="flex-1">
                    {/* Enhanced Name with Gradient */}
                    <h3 className="text-base sm:text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent mb-2 cursor-default select-none drop-shadow-sm">
                      {member.name}
                    </h3>

                    {/* Enhanced Role with Badge Style */}
                    <div className="inline-flex items-center gap-2 mb-2 sm:mb-3">
                      <div className="w-2 h-2 bg-gradient-to-r from-[#BF2121] to-[#BF2121]/80 rounded-full shadow-sm" />
                      <p className="text-[#BF2121] font-semibold text-sm sm:text-base cursor-default select-none">
                        {member.role}
                      </p>
                    </div>

                    {/* Enhanced Bio with Better Typography */}
                    <p
                      className="text-gray-700 text-xs sm:text-sm leading-relaxed cursor-default select-none font-medium"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        maxHeight: "2.6em",
                        lineHeight: "1.3em",
                      }}
                    >
                      {member.bio}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2">
      {/* Header Section */}
      <div className="text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 bg-[#BF2121]/10 text-[#BF2121] px-4 py-2 rounded-full text-sm font-medium mb-4 cursor-default select-none">
          <Users size={16} />
          Our Team
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 cursor-default select-none">
          Meet the{" "}
          <span className="bg-gradient-to-r from-[#BF2121] to-[#BF2121]/80 bg-clip-text text-transparent">
            Experts
          </span>
        </h2>

        <div className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r from-[#BF2121] to-[#BF2121]/80 mx-auto rounded-full mt-6 sm:mt-8" />
      </div>

      {/* Team Members Section */}
      <div className="mb-12 sm:mb-16 md:mb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {teamMembers.map((member, index) => (
            <TeamCard
              key={index}
              member={member}
              index={index}
              onHover={setHoveredTeam}
              onLeave={() => setHoveredTeam(null)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
