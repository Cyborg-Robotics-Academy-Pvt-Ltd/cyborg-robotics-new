"use client";
import { motion, type Variants } from "motion/react";
import {
  Monitor,
  Code2,
  Printer,
  Plane,
  Glasses,
  type LucideIcon,
} from "lucide-react";

const experiences = [
  {
    icon: "Monitor",
    label: "Innovative Classrooms",
    desc: "Learn in a future-ready robotics lab environment.",
    img: "/images/classrooms.jpg",
    num: "01",
  },
  {
    icon: "Code2",
    label: "Coding & AI Labs",
    desc: "Build, code and create intelligent applications.",
    img: "/images/coding-labs.jpg",
    num: "02",
  },
  {
    icon: "Printer",
    label: "3D Printing Studio",
    desc: "Design and prototype your ideas into reality.",
    img: "/images/3d-printing.jpg",
    num: "03",
  },
  {
    icon: "Plane",
    label: "Drone Test Arena",
    desc: "Test, fly and innovate with real-world drone systems.",
    img: "/images/drone-arena.jpg",
    num: "04",
  },
  {
    icon: "Glasses",
    label: "VR / AR Innovation Lab",
    desc: "Explore immersive future technologies.",
    img: "/images/vr-lab.jpg",
    num: "05",
  },
];

const iconMap: Record<string, LucideIcon> = {
  Monitor,
  Code2,
  Printer,
  Plane,
  Glasses,
};

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Experience() {
  return (
    <section className="py-12 px-4 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-10">
          {/* Pill tag */}
          <span className="inline-flex items-center gap-1.5 bg-red-50 text-[#A81B1E] text-[10px] font-bold tracking-[0.18em] uppercase px-3 py-1.5 rounded-full border border-red-200 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A81B1E] animate-pulse" />
            What Awaits You
          </span>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
            Inside The <span className="text-[#A81B1E]">Experience</span>
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-3">
            <div className="h-0.5 w-9 bg-[#A81B1E] rounded" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#A81B1E]" />
            <div className="h-0.5 w-9 bg-[#A81B1E] rounded" />
          </div>
        </div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {experiences.map(({ icon, label, desc, img, num }) => {
            const Icon = iconMap[icon];
            return (
              <motion.div
                key={label}
                variants={cardVariants}
                whileHover={{
                  y: -7,
                  transition: { type: "spring", stiffness: 280, damping: 18 },
                }}
                className="
                  bg-white border border-[#EEEAE5] rounded-2xl overflow-hidden
                  relative group cursor-pointer
                  hover:shadow-[0_18px_36px_-10px_rgba(168,27,30,0.15),0_6px_16px_-4px_rgba(0,0,0,0.07)]
                  transition-shadow duration-300
                "
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden bg-[#E8E4DF]">
                  <img
                    src={img}
                    alt={label}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.08]"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                  {/* Number badge */}
                  <span
                    className="
                    absolute top-2.5 right-2.5
                    text-[10px] font-bold tracking-wide text-white/75
                    bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full
                  "
                  >
                    {num}
                  </span>

                  {/* Icon badge */}
                  <motion.div
                    className="absolute bottom-2.5 left-2.5 w-9 h-9 bg-[#A81B1E] rounded-[9px] flex items-center justify-center shadow-[0_4px_12px_rgba(168,27,30,0.45)]"
                    whileHover={{ scale: 1.1, rotate: -4 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <Icon size={16} className="text-white" />
                  </motion.div>
                </div>

                {/* Body */}
                <div className="px-3.5 py-3.5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-900 leading-tight mb-1.5">
                    {label}
                  </p>
                  <p className="text-[12px] text-gray-500 leading-relaxed">
                    {desc}
                  </p>
                </div>

                {/* Red accent bar */}
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#A81B1E] scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] rounded-b-[14px]" />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
