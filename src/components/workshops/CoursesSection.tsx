"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { createStaggerContainer, fadeUpVariants } from "./motion";
import type { Course } from "./types";
import Image from "next/image";

interface Props {
  courses: Course[];
}

const CourseImage = ({
  image,
  name,
  accentColor,
  bg,
}: {
  image?: string;
  name: string;
  accentColor: string;
  bg: string;
}) => (
  <div
    className="group relative h-[190px] w-full overflow-hidden"
    style={{ background: image ? undefined : bg }}
  >
    {image ? (
      <Image
        src={image}
        width={500}
        height={800}
        alt={name}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    ) : (
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${bg} 0%, ${accentColor}22 100%)`,
        }}
      />
    )}

    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
  </div>
);

const CoursesSection = ({ courses }: Props) => {
  return (
    <motion.section
      className="bg-[#FAFAFA] px-4 py-16 sm:px-6"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={createStaggerContainer(0.12)}
    >
      <div className="mx-auto max-w-[1200px]">
        <motion.div variants={fadeUpVariants} className="mb-10 text-center">
          <span className="mb-3 inline-block rounded-full border border-[rgba(141,15,17,0.15)] bg-[rgba(141,15,17,0.07)] px-4 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#8D0F11]">
            What They&apos;ll Learn
          </span>
          <h2 className="text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold leading-tight text-[#1a1a1a]">
            3 Courses. Real Skills.
            <br />
            <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
              Infinite Curiosity.
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-[480px] text-[13px] font-normal leading-[1.65] text-[#777]">
            Each module is hands-on, project-driven, and designed to spark
            real-world thinking in kids aged 6-16.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
          {courses.map((course) => (
            <motion.div
              key={course.id}
              variants={fadeUpVariants}
              className={`relative overflow-hidden rounded-2xl border bg-white transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_rgba(0,0,0,0.1)] ${
                course.highlight
                  ? "border-[rgba(141,15,17,0.25)] shadow-[0_8px_32px_rgba(141,15,17,0.08)]"
                  : "border-[rgba(0,0,0,0.07)] shadow-[0_2px_16px_rgba(0,0,0,0.04)]"
              }`}
            >
              {course.highlight && (
                <div className="absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r from-[#8D0F11] to-[#B92423]" />
              )}

              {course.highlight && (
                <div className="absolute right-3 top-4 z-10 rounded-full bg-gradient-to-br from-[#8D0F11] to-[#B92423] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wider text-white shadow-[0_4px_12px_rgba(141,15,17,0.35)]">
                  Most Popular
                </div>
              )}

              <CourseImage
                image={course.image}
                name={course.name}
                accentColor={course.color}
                bg={course.bg}
              />

              <div className="p-4 sm:p-5">
                <div className="mb-3 flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg"
                    style={{ background: course.bg }}
                  >
                    {course.icon}
                  </div>
                  <div>
                    <div className="text-[15px] font-semibold leading-tight text-[#1a1a1a]">
                      {course.name}
                    </div>
                    <div
                      className="text-[11px] font-medium"
                      style={{ color: course.color }}
                    >
                      {course.subtitle}
                    </div>
                  </div>
                </div>

                <p className="mb-4 text-[12px] font-normal leading-[1.65] text-[#777]">
                  {course.description}
                </p>

                <div className="mb-4 space-y-[5px]">
                  {course.outcomes.map((outcome) => (
                    <div
                      key={outcome}
                      className="flex items-start gap-2 text-[12px] font-normal text-[#555]"
                    >
                      <CheckCircle2
                        size={12}
                        style={{ color: course.color }}
                        className="mt-px shrink-0"
                      />
                      {outcome}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-[rgba(0,0,0,0.05)] pt-3">
                  <span className="text-[11px] font-normal text-[#aaa]">
                    {String.fromCharCode(0x23f1)} {course.duration}
                  </span>
                  <span
                    className="rounded-lg px-2.5 py-1 text-[11px] font-medium"
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
