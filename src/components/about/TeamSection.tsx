"use client";
import React, { useState } from "react";
import { Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Type definitions
interface TeamMember {
  id: string;
  name: string;
  title: string;
  department: string;
  image: string;
  linkedin?: string;
}

interface TeamCardProps {
  member: TeamMember;
}

const teamMembers: TeamMember[] = [
  {
    id: "Pratima",
    name: "Ms. Pratima Thakur",
    title: "Project Manager",
    department:
      "Project Leadership | Space Science & Technology | Innovation and Strategic Planning",
    image: "assets/team/pratima.png",
    linkedin: "https://www.linkedin.com/in/pratimathakur/",
  },
  {
    id: "Omkar",
    name: "Mr. Omkar Shinde",
    title: "Head of Programming Instructor",
    department:
      "STEM Education | Robotics & Programming Curriculum Design | Coding & Innovation Training",
    image: "assets/team/omkar.png",
    linkedin: "https://www.linkedin.com/in/omkarshinde711/",
  },
  {
    id: "Shrikant",
    name: "Mr. Shrikant Gaikwad",
    title: "Full Stack Web Developer",
    department:
      "Web Development | System Architecture | UI/UX Design | API & DevOps Integration",
    image: "assets/team/shrikant.png",
    linkedin: "https://www.linkedin.com/in/shrikant-gaikwad-dev/",
  },
  {
    id: "Sirjana",
    name: "Ms. Sirjana Vishwakrma",
    title: "Head of Trainer",
    department:
      "Training & Development | Educational Leadership | Robotics & Scientific Research Mentorship",
    image: "assets/team/sirjana.png",
    linkedin: "https://www.linkedin.com/in/sirjanavishwakarma/",
  },
  {
    id: "Nikita",
    name: "Ms. Nikita Mangale",
    title: "Robotics Trainer",
    department:
      "Robotics Education | STEM Facilitation | Hands-on Learning & Innovation Programs",
    image: "assets/team/nikita.png",
    linkedin: "https://www.linkedin.com/in/nikita-mangle-drdo/",
  },
  {
    id: "Nilesh",
    name: "Mr. Nilesh Jaiswar",
    title: "3D Department R&D",
    department:
      "3D Modeling & Research | Product Design | Robotics Prototyping & Innovation",
    image: "assets/team/nilesh.png",
    linkedin: "https://www.linkedin.com/in/nileshjaiswar/",
  },
  {
    id: "Anchal",
    name: "Ms. Anchal Mishra",
    title: "Head of 3D Department",
    department:
      "3D Visualization & Design | R&D Leadership | Product Innovation & Educational Technology",
    image: "assets/team/anchal.png",
    linkedin: "https://www.linkedin.com/in/anchalmishra1/",
  },
];

function TeamCard({ member }: TeamCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardClick = () => {
    if (isFlipped && member.linkedin) {
      // Open LinkedIn profile in new tab
      window.open(member.linkedin, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="h-78 w-[70%]  md:h-80 md:w-[100%] mx-auto mb-8 ">
      <div
        className="relative w-full h-full cursor-pointer"
        style={{ perspective: "1000px" }}
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
      >
        <div
          className="relative w-full h-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl mx-2 overflow-hidden shadow-xl "
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="w-full h-60 md:h-56 relative">
              <Image
                src={`/${member.image}`}
                alt={member.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-white to-transparent py-7 px-3 ">
              <h4 className="text-black font-extrabold text-sm mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                {member.name}
              </h4>
              <p className="text-black/90 text-[10px] font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                {member.title}
              </p>
              {/* LinkedIn Icon */}
              {member.linkedin && (
                <div className="absolute top-2 right-2 bg-white/80 rounded-full p-1 shadow-md hover:bg-blue-50 transition-colors">
                  <Link
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Back - Enhanced UI with Logo */}
          <div
            className="absolute inset-0 rounded-3xl mx-2 overflow-hidden shadow-2xl"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
            onClick={handleCardClick}
          >
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-red-900"></div>

            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full mix-blend-screen filter blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full mix-blend-screen filter blur-3xl"></div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 h-full flex flex-col justify-center items-center px-3 py-4 text-white">
              {/* Logo in White Circle Container - Top */}
              <div className="mb-2 flex items-center justify-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg p-2 border-2 border-white/30">
                  <Image
                    src="/assets/logo.png"
                    alt="Logo"
                    width={100}
                    height={100}
                    className="object-contain w-full h-full"
                  />
                </div>
              </div>

              {/* Decorative Top Line */}
              <div className="w-8 h-0.5 bg-gradient-to-r from-white/40 to-white rounded-full mb-2"></div>

              {/* Name */}
              <h4 className="font-bold text-base text-center leading-tight mb-1 px-2 whitespace-nowrap overflow-hidden text-ellipsis">
                {member.name}
              </h4>

              {/* Title Badge */}
              <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-2 py-0.5 mb-2">
                <p className="text-[10px] font-semibold text-center text-white/90 whitespace-nowrap overflow-hidden text-ellipsis">
                  {member.title}
                </p>
              </div>

              {/* Divider */}
              <div className="w-6 h-0.5 bg-gradient-to-r from-white/30 to-white/30 rounded-full mb-2"></div>

              {/* Department Description */}
              <p className="text-[9px] text-center leading-relaxed text-white/85 font-medium px-2 mb-2 line-clamp-3">
                {member.department}
              </p>

              {/* Decorative Bottom Line */}
              <div className="w-8 h-0.5 bg-gradient-to-r from-white/40 to-white rounded-full mt-1 mb-2"></div>

              {/* LinkedIn CTA */}
              {member.linkedin && (
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-2.5 py-1 hover:bg-white/20 transition-all">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-white"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  <span className="text-[10px] font-semibold text-white">
                    View Profile
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EnhancedTeamSection() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Header Section - Minimal spacing */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center mb-2 gap-2 px-2 py-[6px] bg-gradient-to-r from-red-50 to-blue-50 rounded-full border border-red-100">
          <Users size={15} />
          Our Team
        </div>

        <h2 className="text-2xl sm:text-3xl md:text-xl lg:text-4xl font-bold text-gray-900 mb-4">
          Meet the{" "}
          <span className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 bg-clip-text text-transparent">
            Team
          </span>
        </h2>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-12 h-1 bg-gradient-to-r from-transparent to-red-600 rounded-full"></div>
          <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-red-800 rounded-full"></div>
          <div className="w-12 h-1 bg-gradient-to-r from-red-800 to-transparent rounded-full"></div>
        </div>
      </div>

      {/* Team Members Section */}
      <div className="mt-8 ">
        {/* Desktop - Show all cards in grid */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-1 w-[80%] mx-auto">
          {teamMembers.map((member) => (
            <TeamCard key={member.id} member={member} />
          ))}
        </div>

        {/* Mobile & Tablet - Swiper Slider */}
        <div className="lg:hidden">
          <style jsx global>{`
            .team-swiper .swiper-button-prev,
            .team-swiper .swiper-button-next {
              background: #9d2723; /* Red background */
              width: 30px;
              height: 30px;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            }
            .team-swiper .swiper-button-prev:after,
            .team-swiper .swiper-button-next:after {
              font-size: 10px;
              color: white; /* White arrows */
              font-weight: bold;
            }
            .team-swiper .swiper-pagination-bullet {
              background: #cbd5e1;
              opacity: 1;
              width: 5px;
              height: 5px;
            }
            .team-swiper .swiper-pagination-bullet-active {
              background: #2563eb;
              width: 16px;
              border-radius: 4px;
            }
          `}</style>

          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={8}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            className="team-swiper"
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 12,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 14,
              },
            }}
          >
            {teamMembers.map((member) => (
              <SwiperSlide key={member.id}>
                <TeamCard member={member} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}
