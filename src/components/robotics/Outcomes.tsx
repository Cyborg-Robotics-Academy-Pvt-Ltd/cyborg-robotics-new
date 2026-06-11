"use client";
import React from "react";
import {
  Bot,
  Terminal,
  Pen,
  Presentation,
  Lightbulb,
  ShieldCheck,
  Users,
  Rocket,
  Brain,
  Plane,
  Printer,
  Cpu,
  ChevronRight,
} from "lucide-react";
type Outcome = {
  icon: React.ElementType;
  label: string;
  desc: string;
  featured: boolean;
  badge: string;
  index: string;
};

type Specialization = {
  icon: React.ElementType;
  name: string;
  desc: string;
  image: string;
  shortDesc: string;
};
const outcomes = [
  {
    icon: Bot,
    label: "Robotics Engineering",
    desc: "Build and program real robots.",
    featured: false,
    badge: "",
    index: "01",
  },
  {
    icon: Terminal,
    label: "Coding Logic",
    desc: "Learn programming fundamentals.",
    featured: false,
    badge: "",
    index: "02",
  },
  {
    icon: Pen,
    label: "Product Design",
    desc: "Design user-centered products.",
    featured: false,
    badge: "",
    index: "03",
  },
  {
    icon: Presentation,
    label: "Presentation Skills",
    desc: "Pitch ideas with confidence.",
    featured: true,
    badge: "Top Skill",
    index: "04",
  },
  {
    icon: Lightbulb,
    label: "Innovation Thinking",
    desc: "Solve problems creatively.",
    featured: false,
    badge: "",
    index: "05",
  },
  {
    icon: ShieldCheck,
    label: "Technical Confidence",
    desc: "Master tools and techniques.",
    featured: false,
    badge: "",
    index: "06",
  },
  {
    icon: Users,
    label: "Team Collaboration",
    desc: "Work effectively in teams.",
    featured: false,
    badge: "",
    index: "07",
  },
  {
    icon: Rocket,
    label: "Future Tech Exposure",
    desc: "Explore next-gen technologies.",
    featured: false,
    badge: "",
    index: "08",
  },
];

const specializations = [
  {
    icon: Brain,
    name: "Artificial Intelligence",
    desc: "Build intelligent systems with ML, neural networks, and automation pipelines.",
    image: "/images/ai-specialization.jpg",
    shortDesc: "Machine learning, neural networks, and intelligent automation.",
  },
  {
    icon: Plane,
    name: "Drone Technology",
    desc: "Design, program, and fly autonomous aerial vehicles for real-world missions.",
    image: "/images/drone-specialization.jpg",
    shortDesc: "Autonomous aerial vehicles for real-world missions.",
  },
];

export default function Outcomes() {
  return (
    <section className="w-full bg-white py-16 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* LEFT — Program Outcomes */}
        <div className="rounded-xl  p-7">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-red-500 mb-1.5">
            What You Gain
          </p>
          <h2 className="text-2xl font-bold text-neutral-800">
            Program Outcomes
          </h2>
          <p className="text-sm text-neutral-500 mt-1 mb-6">
            Eight skills to unlock your future in tech.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {outcomes.map(
              ({ icon: Icon, label, desc, featured, badge, index }) => (
                <div
                  key={label}
                  className={`group flex flex-col gap-2.5 rounded-xl border p-3.5 transition-all duration-200 cursor-default ${
                    featured
                      ? "border-[1.5px] border-red-500 bg-red-50 hover:bg-red-100 hover:-translate-y-1"
                      : "border-neutral-200 bg-neutral-50 hover:border-red-500 hover:bg-white hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(249,115,22,0.10)]"
                  }`}
                >
                  {/* top meta — badge or index number */}
                  {badge ? (
                    <span className="self-start text-[10px] font-medium bg-orange-500 text-white rounded px-1.5 py-0.5">
                      {badge}
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-neutral-400">
                      {index}
                    </span>
                  )}

                  {/* icon */}
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-[10px] border bg-white ${
                      featured ? "border-orange-300" : "border-neutral-200"
                    }`}
                  >
                    <Icon size={20} className="text-red-500" />
                  </div>

                  {/* text */}
                  <div>
                    <p
                      className={`text-[12.5px] font-semibold leading-snug ${featured ? "text-orange-900" : "text-neutral-800"}`}
                    >
                      {label}
                    </p>
                    <p
                      className={`text-[11px] leading-relaxed mt-0.5 ${featured ? "text-orange-700" : "text-neutral-500"}`}
                    >
                      {desc}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        {/* RIGHT — Future Tech Specialization */}

        <div className="rounded-2xl  p-7">
          <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-orange-500 mb-1.5">
            Specializations
          </p>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Future Tech Specialization
          </h2>
          <p className="text-sm text-neutral-400 mt-1 mb-6">
            Explore cutting-edge technologies shaping tomorrow.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {specializations.map(({ name, image, shortDesc }) => (
              <div
                key={name}
                className="group relative rounded-xl border border-neutral-200 bg-white overflow-hidden cursor-pointer hover:border-orange-200 hover:shadow-md transition-all duration-300"
              >
                {/* Image with overlay */}
                <div className="relative w-full h-40 overflow-hidden bg-neutral-100">
                  <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="px-3.5 pt-3 pb-3.5">
                  <p className="text-[10px] font-bold text-orange-500 tracking-[0.12em] uppercase mb-1">
                    {name}
                  </p>
                  <p className="text-[11.5px] text-neutral-500 leading-relaxed line-clamp-2">
                    {shortDesc}
                  </p>

                  {/* CTA row */}
                  <div className="flex items-center gap-1.5 mt-3">
                    <span className="text-[11px] font-semibold text-red-800 opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0 transition-all duration-200">
                      Explore
                    </span>
                    <div className="w-6 h-6 rounded-full border border-red-800 flex items-center justify-center group-hover:bg-red-800 transition-colors duration-200">
                      <ChevronRight
                        size={11}
                        className="text-red-800 group-hover:text-white transition-colors duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
