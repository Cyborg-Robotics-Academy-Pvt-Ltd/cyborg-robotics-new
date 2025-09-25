"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Zap,
  Lightbulb,
  Heart,
  Users,
  Linkedin,
  Mail,
  LucideIcon,
} from "lucide-react";

// Type definitions
interface TeamMember {
  name: string;
  role: string;
  specialty: string;
  bio: string;
  icon: LucideIcon;
  photo: string;
  linkedin: string;
  email: string;
}

interface TeamCardProps {
  member: TeamMember;
  index: number;
  isHovered: boolean;
  onHover: (index: number) => void;
  onLeave: () => void;
}

export default function EnhancedTeamSection() {
  const [hoveredTeam, setHoveredTeam] = useState<number | null>(null);

  const teamMembers = [
    {
      name: "Dr. Sarah Johnson",
      role: "Tech Lead",
      specialty: "AI & Robotics",
      bio: "15+ years in AI development. Specializing in robotics architecture and machine learning systems.",
      icon: Zap,
      photo:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      linkedin: "https://www.linkedin.com/in/your-profile",
      email: "sarah@company.com",
    },
    {
      name: "Prof. Michael Chen",
      role: "Senior Mentor",
      specialty: "Electronics",
      bio: "Electronics expert with 20+ years in circuit design and embedded systems development.",
      icon: BookOpen,
      photo:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      linkedin: "https://www.linkedin.com/in/your-profile",
      email: "michael@company.com",
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Project Coordinator",
      specialty: "Innovation",
      bio: "Innovation strategist focused on educational technology and student engagement methods.",
      icon: Lightbulb,
      photo:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      linkedin: "https://www.linkedin.com/in/your-profile",
      email: "emily@company.com",
    },
    {
      name: "Lisa Thompson",
      role: "Student Success",
      specialty: "Support",
      bio: "Dedicated to student success with expertise in educational psychology and mentorship.",
      icon: Heart,
      photo:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
      linkedin: "https://www.linkedin.com/in/your-profile",
      email: "lisa@company.com",
    },
  ];

  const TeamCard = ({
    member,
    index,
    isHovered,
    onHover,
    onLeave,
  }: TeamCardProps) => {
    const Icon = member.icon;

    return (
      <motion.div
        className="relative group cursor-pointer"
        onMouseEnter={() => onHover(index)}
        onMouseLeave={onLeave}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
      >
        {/* Card Background with Gradient Border */}
        <div className="relative p-[2px] rounded-3xl bg-gradient-to-br from-red-500 via-red-600 to-red-700 shadow-2xl">
          <div className="bg-white rounded-3xl overflow-hidden h-[420px]">
            {/* Image Section */}
            <div className="relative h-64 overflow-hidden">
              <motion.img
                src={member.photo}
                alt={member.name}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.7 }}
              />
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* Specialty Badge */}
              <div className="absolute top-4 left-4 bg-red-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                {member.specialty}
              </div>

              {/* Icon */}
              <motion.div
                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white"
                whileHover={{
                  backgroundColor: "rgb(220, 38, 38)",
                  color: "white",
                }}
                transition={{ duration: 0.3 }}
              >
                <Icon size={20} />
              </motion.div>
            </div>

            {/* Content Section */}
            <div className="p-6 h-40 flex flex-col">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-1">
                  {member.name}
                </h3>
                <p className="text-red-600 font-semibold mb-3">{member.role}</p>
                <motion.p
                  className="text-gray-600 text-sm leading-relaxed"
                  animate={{ opacity: isHovered ? 1 : 0.7 }}
                  transition={{ duration: 0.3 }}
                >
                  {member.bio}
                </motion.p>
              </div>

              {/* Action Buttons */}
              <motion.div
                className="flex gap-2 mt-4"
                animate={{
                  opacity: isHovered ? 1 : 0.6,
                  y: isHovered ? 0 : 8,
                }}
                transition={{ duration: 0.3 }}
              >
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-700 transition-colors duration-200 cursor-pointer"
                >
                  <Linkedin size={14} />
                  Connect
                </a>
                <a
                  href={`mailto:${member.email}`}
                  className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
                >
                  <Mail size={14} />
                  Email
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Users size={16} />
          Our Team
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Meet the{" "}
          <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
            Experts
          </span>
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Our passionate team of educators, researchers, and industry experts
          dedicated to shaping the future of technology education.
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-red-800 mx-auto rounded-full mt-8" />
      </div>

      {/* Team Members Section */}
      <div className="mb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <TeamCard
              key={index}
              member={member}
              index={index}
              isHovered={hoveredTeam === index}
              onHover={setHoveredTeam}
              onLeave={() => setHoveredTeam(null)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
