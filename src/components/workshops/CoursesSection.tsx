"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { Course } from "./types";

interface Props {
  courses: Course[];
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

const CheckIcon = ({ color }: { color: string }) => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 13 13"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mt-px shrink-0"
    aria-hidden="true"
  >
    <circle cx="6.5" cy="6.5" r="6.5" fill={color} fillOpacity={0.12} />
    <path
      d="M3.5 6.5l2 2 4-4"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ClockIcon = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CourseImage = ({
  image,
  name,
  bg,
  highlight,
}: {
  image?: string;
  name: string;
  bg: string;
  highlight?: boolean;
}) => (
  <div
    className="relative h-[185px] w-full overflow-hidden"
    style={{ background: image ? undefined : bg }}
  >
    {image ? (
      <Image
        src={image}
        width={600}
        height={370}
        alt={name}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    ) : (
      <div className="absolute inset-0" style={{ background: bg }} />
    )}

    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

    {highlight && (
      <span className="absolute right-3 top-3 z-10 rounded-full bg-gradient-to-br from-[#8D0F11] to-[#B92423] px-3 py-1 text-[9px] font-semibold uppercase tracking-wider text-white shadow-md">
        Most Popular
      </span>
    )}
  </div>
);

const CoursesSection = ({ courses }: Props) => {
  return (
    <motion.section
      className="bg-[#F7F7F7] px-4 py-16 sm:px-6"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.08 }}
      variants={staggerContainer}
    >
      <div className="mx-auto max-w-[1160px]">
        <motion.div variants={fadeUp} className="mb-10 text-center">
          <span className="mb-3 inline-block rounded-full border border-[rgba(141,15,17,0.15)] bg-[rgba(141,15,17,0.07)] px-4 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#8D0F11]">
            What They&apos;ll Learn
          </span>
          <h2 className="text-[clamp(1.75rem,3.5vw,2.4rem)] font-bold leading-tight text-[#1a1a1a]">
            3 Courses. Real Skills.
            <br />
            <span className="bg-gradient-to-r from-red-600 to-red-900 bg-clip-text text-transparent">
              Infinite Curiosity.
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-[460px] text-[13px] leading-[1.7] text-[#888]">
            Each module is hands-on, project-driven, and designed to spark
            real-world thinking in kids aged 6-16.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {courses.map((course) => (
            <motion.div
              key={course.id}
              variants={fadeUp}
              className={[
                "group relative flex flex-col overflow-hidden rounded-2xl bg-white",
                "transition-all duration-300 hover:-translate-y-[6px] hover:shadow-[0_24px_64px_rgba(0,0,0,0.09)]",
                course.highlight
                  ? "border border-[rgba(141,15,17,0.22)] shadow-[0_6px_28px_rgba(141,15,17,0.07)]"
                  : "border border-[rgba(0,0,0,0.06)] shadow-[0_2px_12px_rgba(0,0,0,0.04)]",
              ].join(" ")}
            >
              <div
                className="h-[3px] w-full shrink-0"
                style={{
                  background: `linear-gradient(90deg, ${course.border}, ${course.color})`,
                }}
              />

              <CourseImage
                image={course.image}
                name={course.name}
                bg={course.bg}
                highlight={course.highlight}
              />

              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg leading-none"
                    style={{ background: course.bg }}
                    aria-hidden="true"
                  >
                    {course.icon}
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold leading-tight text-[#1a1a1a]">
                      {course.name}
                    </p>
                    <p
                      className="mt-0.5 text-[11px] font-medium"
                      style={{ color: course.color }}
                    >
                      {course.subtitle}
                    </p>
                  </div>
                </div>

                <p className="mb-4 text-[12px] leading-[1.7] text-[#888]">
                  {course.description}
                </p>

                <ul className="mb-5 space-y-[6px]">
                  {course.outcomes.map((outcome) => (
                    <li
                      key={outcome}
                      className="flex items-start gap-2 text-[12px] font-medium leading-[1.6] text-[#555]"
                    >
                      <CheckIcon color={course.color} />
                      {outcome}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex items-center justify-between border-t border-[rgba(0,0,0,0.05)] pt-3">
                  <span className="flex items-center gap-1.5 text-[11px] text-[#bbb]">
                    <ClockIcon />
                    {course.duration}
                  </span>
                  <span
                    className="rounded-full px-3 py-1 text-[11px] font-medium"
                    style={{ background: course.bg, color: course.color }}
                  >
                    {course.ageGroup}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default CoursesSection;
