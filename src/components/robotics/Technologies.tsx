"use client";
import Link from "next/link";
import { motion } from "framer-motion";

const TECHNOLOGIES = [
  {
    name: "LEGO\nSpike Prime",
    logo: "/assets/year-long-course/logos/spike-prime.png",
    href: "/all-courses/spike-prime",
  },
  {
    name: "EV3",
    logo: "/assets/year-long-course/logos/ev3.png",
    href: "/all-courses/robotics-ev3",
  },
  {
    name: "Arduino",
    logo: "/assets/year-long-course/logos/arduino.png",
    href: "/all-courses/arduino",
  },
  {
    name: "Python",
    logo: "/assets/year-long-course/logos/python.png",
    href: "/all-courses/python-language",
  },
  {
    name: "Quarky",
    logo: "/assets/year-long-course/logos/quarky.png",
    href: "/all-courses/robotics-with-quarky",
  },
  {
    name: "Tinkercad",
    logo: "/assets/year-long-course/logos/tinkercad.png",
    href: "/all-courses/3d-printing",
  },
  {
    name: "PictoBlox",
    logo: "/assets/year-long-course/logos/pictoblox.png",
    href: "/all-courses/coding-ai-pictoblox",
  },
  {
    name: "Meta Quest",
    logo: "/assets/year-long-course/logos/meta-quest.png",
    href: "#",
  },
  {
    name: "Drone\nSystems",
    logo: "/assets/year-long-course/logos/drone.png",
    href: "/all-courses/drone",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

const Technologies = () => {
  return (
    <section className="py-5 px-2">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-[10px] font-semibold tracking-[0.22em] text-gray-400 uppercase mb-2">
          What We Teach
        </p>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Tools &amp; <span className="text-red-600">Technologies</span>
        </h2>
        <div className="flex items-center justify-center gap-1.5">
          <div className="h-0.5 w-10 bg-red-600 rounded" />
          <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
          <div className="h-0.5 w-10 bg-red-600 rounded" />
        </div>
      </div>

      {/* Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2.5 max-w-5xl mx-auto"
      >
        {TECHNOLOGIES.map((tech) => (
          <motion.div key={tech.name} variants={item}>
            <Link
              href={tech.href}
              aria-label={`Explore ${tech.name.replace("\n", " ")} course`}
              className="
                group flex flex-col items-center gap-2 p-3.5
                bg-white border-[1.5px] border-gray-100 rounded-[18px]
                hover:border-red-500
                hover:-translate-y-1 hover:scale-[1.04]
                hover:shadow-[0_8px_28px_rgba(199,62,29,0.13),0_2px_8px_rgba(0,0,0,0.06)]
                transition-all duration-200 ease-out
                relative overflow-hidden
              "
            >
              {/* Red glow on hover */}
              <span
                className="
                absolute inset-0 rounded-[18px]
                bg-[radial-gradient(circle_at_50%_0%,rgba(199,62,29,0.07)_0%,transparent_70%)]
                opacity-0 group-hover:opacity-100 transition-opacity duration-200
              "
              />

              <div
                className="
                w-10 h-10 flex items-center justify-center rounded-[10px]
                bg-gray-50 group-hover:bg-red-50
                transition-colors duration-200
              "
              >
                <img
                  src={tech.logo}
                  alt={tech.name.replace("\n", " ")}
                  className="w-7 h-7 object-contain"
                />
              </div>

              <span
                className="
                text-[10px] font-medium text-gray-500
                group-hover:text-red-600
                text-center leading-tight whitespace-pre-line
                transition-colors duration-200
              "
              >
                {tech.name}
              </span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Technologies;
