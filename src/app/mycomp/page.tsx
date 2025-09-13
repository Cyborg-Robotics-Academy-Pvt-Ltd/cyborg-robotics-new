import React from "react";
import Image from "next/image";

const MENTOR = {
  name: "Dr. Sarah Johnson",
  photo: "/assets/parents/t1.jpg",
  linkedin: "https://www.linkedin.com/in/your-profile",
  role: "Principal Mentor",
  bio: "15+ years in software development. Specializing in full-stack architecture and team leadership.",
};

const Page = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="group w-[320px] h-[320px] bg-white rounded-[36px] p-[4px] relative shadow-[rgba(183,45,53,0.15)_0px_25px_50px_-12px] transition-all duration-700 ease-in-out hover:shadow-[rgba(183,45,53,0.25)_0px_35px_60px_-12px] hover:scale-105 hover:rounded-tl-[65px]">
        {/* Image container */}
        <div className="absolute w-[calc(100%-8px)] h-[calc(100%-8px)] top-[4px] left-[4px] rounded-[32px] z-10 border-0 overflow-hidden transition-all duration-700 ease-in-out delay-200 group-hover:w-[110px] group-hover:h-[110px] group-hover:aspect-square group-hover:top-[12px] group-hover:left-[12px] group-hover:rounded-full group-hover:z-30  group-hover:border-[#B72D35] group-hover:shadow-[rgba(183,45,53,0.3)_0px_8px_16px_0px] group-hover:delay-0">
          <div className="relative w-full h-full">
            <Image
              src={MENTOR.photo}
              alt={`${MENTOR.name} photo`}
              fill
              sizes="320px"
              className="object-cover object-center transition-all duration-700 ease-in-out group-hover:scale-110"
            />
            {/* Overlay gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#B72D35]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        </div>

        {/* Main content area */}
        <div className="absolute bottom-[4px] left-[4px] right-[4px] bg-gradient-to-br from-[#B72D35] to-[#8B2229] top-[82%] rounded-[32px] z-20 shadow-[inset_0px_8px_16px_rgba(0,0,0,0.1)] overflow-visible transition-all duration-700 ease-[cubic-bezier(0.645,0.045,0.355,1)] group-hover:top-[28%] group-hover:rounded-[90px_32px_32px_32px] group-hover:delay-200">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-20 h-20 border border-white/30 rounded-full"></div>
            <div className="absolute bottom-8 right-8 w-12 h-12 border border-white/20 rounded-full"></div>
          </div>

          {/* Content wrapper */}
          <div className="relative h-full p-6">
            {/* Name and Role (always visible) */}
            <div className="absolute bottom-20 left-6 right-6">
              <h2 className="text-xl font-bold text-white leading-tight mb-1">
                {MENTOR.name}
              </h2>
              <p className="text-sm text-white/90 font-medium">{MENTOR.role}</p>
            </div>

            {/* Bio (visible on hover) */}
            <div className="absolute top-6 left-6 right-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-300">
              <p className="text-sm text-white/95 leading-relaxed">
                {MENTOR.bio}
              </p>
            </div>

            {/* Connect button */}
            <div className="absolute bottom-4 left-6 right-6">
              <a
                href={MENTOR.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Connect on LinkedIn"
                className="inline-flex items-center justify-center gap-1.5 bg-white text-[#B72D35] border-0 rounded-full text-xs font-semibold px-3 py-1.5 shadow-[0_3px_8px_rgba(0,0,0,0.12)] hover:bg-[#B72D35] hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_5px_14px_rgba(0,0,0,0.2)]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  className="h-3.5 w-3.5 fill-current"
                >
                  <path d="M100.28 448H7.4V148.9h92.88zm-46.44-340C24.2 108 0 83.77 0 54.64A53.36 53.36 0 0 1 53.84 0c29.51 0 53.37 24.2 53.37 54.36 0 29.13-23.86 53.28-53.37 53.28zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.26-79.2-48.3 0-55.7 37.7-55.7 76.6V448h-92.7V148.9h88.9v40.8h1.3c12.4-23.5 42.7-48.2 87.9-48.2 94 0 111.3 61.9 111.3 142.3V448z" />
                </svg>
                Connect
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
