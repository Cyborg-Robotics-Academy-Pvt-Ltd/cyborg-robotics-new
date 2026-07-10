// components/MeetTheMentors/MentorCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Linkedin } from "lucide-react";
import { Mentor } from "./types";

interface MentorCardProps {
  mentor: Mentor;
}

const BulletItem = ({ text }: { text: string }) => (
  <div className="flex items-start gap-2">
    <div className="w-[6px] h-[6px] rounded-full bg-[#A81B1E] shrink-0 mt-[5px]" />
    <span className="text-[12px] font-medium text-[#0B1120] leading-snug">
      {text}
    </span>
  </div>
);

export const MentorCard = ({ mentor }: MentorCardProps) => {
  const { name, role, company, tags, image, linkedinUrl, specialtyIcon } =
    mentor;
  return (
    <div className="relative mx-auto w-64 bg-white rounded-[20px] border border-[#f0e0e0] overflow-visible transition-all duration-300 cursor-pointer hover:shadow-[0_16px_40px_rgba(168,27,30,0.12)] hover:-translate-y-1">
      {/* ── Photo Header ── */}
      <div className="relative h-[260px]  rounded-t-[20px] overflow-hidden bg-gradient-to-br from-[#fdeaea] to-[#fde0e0]">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 300px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-[#A81B1E]/10 flex items-center justify-center text-[#A81B1E] text-2xl font-semibold">
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
          </div>
        )}

        {/* Bottom fade — blends into white card body */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-300/30 to-transparent" />

        {/* Specialty Icon — top left */}
        <div className="absolute top-52 left-3 w-[34px] h-[34px] bg-white/90 backdrop-blur-sm rounded-[10px] border border-white/60 flex items-center justify-center shadow-sm z-10">
          {specialtyIcon}
        </div>

        {/* LinkedIn — top right */}
        <Link
          href={linkedinUrl ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-3 right-3 w-[30px] h-[30px] bg-[#0A66C2] backdrop-blur-sm rounded-[8px] flex items-center justify-center hover:bg-white/90  group transition-colors duration-200 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <Linkedin
            size={15}
            className="text-white group-hover:text-[#A81B1E] transition-colors duration-200"
          />
        </Link>
      </div>

      {/* ── Info Body ── */}
      <div className="px-5 pt-2 pb-2">
        <h3 className="text-[17px] font-bold text-[#0B1120] tracking-tight leading-tight">
          {name}
        </h3>
        <p className="text-[12.5px] font-semibold text-[#A81B1E] mt-0.5">
          {role}
        </p>
        <p className="text-[12.5px] text-gray-400 mt-0.5">{company}</p>
      </div>

      {/* ── Divider ── */}
      <div className="mx-5 h-px bg-gray-100" />

      {/* ── Tags ── */}
      <div className="px-5 py-3 flex flex-wrap gap-1.5">
        {tags?.map((tag) => (
          <span
            key={tag}
            className="text-[11px] font-medium px-2.5 py-[3px] rounded-full bg-[#A81B1E]/[0.07] text-[#A81B1E] border border-[#A81B1E]/20"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};
