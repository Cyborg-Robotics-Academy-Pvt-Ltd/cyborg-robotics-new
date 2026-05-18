"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";

const COPY = {
  badge: "Live Coding Challenge",
  heading: ["More Than", "Just a Game"],
  body: [
    "CODE FEST 1.0 is a coding challenge for school students to explore block-based coding, creativity, and problem-solving while building confidence and innovation skills.",
    "It’s not about how much you know. It’s about what you can create.",
  ],
  logoAlt: "Cyborg Robotics logo",
  imageAlt: "Student at laptop illustration",
};

export default function AboutChallenge() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.6, delay: 0.3 },
    },
  };

  const accentVariants = {
    hidden: { scaleX: 0 },
    visible: {
      scaleX: 1,
      transition: { duration: 0.6, delay: 0.2 },
    },
  };

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -4 }}
    >
      <Card className="relative h-full overflow-hidden rounded-2xl border border-gray-200/60 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md lg:rounded-3xl">
        {/* Background Glow */}
        <motion.div
          className="pointer-events-none absolute right-0 top-0 h-48 w-48 bg-[radial-gradient(circle,rgba(8,44,120,0.08)_0%,transparent_70%)] sm:h-64 sm:w-64"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />

        <CardContent className="relative z-10 flex h-full flex-col p-4 sm:p-6">
          {/* Mobile Layout */}
          <div className="flex flex-col gap-6 lg:hidden">
            {/* Badge */}
            <motion.div
              className="flex w-fit items-center gap-2 rounded-full border border-blue-900/15 bg-blue-900/5 px-3 py-2 backdrop-blur-sm"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <Image
                src="/cyborglogo.png"
                alt={COPY.logoAlt}
                width={20}
                height={20}
                className="h-5 w-5 rounded-full object-cover"
                priority
              />

              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-900 sm:text-xs">
                {COPY.badge}
              </span>
            </motion.div>

            {/* Content */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-4"
            >
              <motion.h2
                variants={itemVariants}
                className="text-3xl font-black uppercase leading-tight tracking-tight text-blue-900 sm:text-4xl"
              >
                {COPY.heading[0]}
                <br />
                {COPY.heading[1]}
              </motion.h2>

              <motion.div
                variants={itemVariants}
                className="flex flex-col gap-3"
              >
                <motion.div
                  className="h-1 w-10 rounded-full bg-blue-900/40"
                  variants={accentVariants}
                  style={{ originX: 0 }}
                />

                <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                  {COPY.body[0]}
                </p>

                <p className="text-sm font-semibold leading-relaxed text-blue-900 sm:text-base">
                  {COPY.body[1]}
                </p>
              </motion.div>
            </motion.div>

            {/* Mobile Image */}
            <motion.div
              className="relative mx-auto h-52 w-full max-w-[260px] sm:h-64 sm:max-w-[320px]"
              variants={imageVariants}
              initial="hidden"
              animate="visible"
            >
              <Image
                src="/assets/coding-boy-illustration.png"
                alt={COPY.imageAlt}
                fill
                className="object-contain"
                quality={90}
                priority
              />
            </motion.div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden h-full lg:flex lg:min-h-[420px]">
            {/* Left Content */}
            <motion.div
              className="flex max-w-[58%] flex-col gap-4 py-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                className="mb-2 flex w-fit items-center gap-2.5 rounded-full border border-blue-900/15 bg-blue-900/5 px-3.5 py-2 backdrop-blur-sm"
                variants={itemVariants}
              >
                <Image
                  src="/cyborglogo.png"
                  alt={COPY.logoAlt}
                  width={20}
                  height={20}
                  className="h-5 w-5 rounded-full object-cover"
                  priority
                />

                <span className="text-xs font-bold uppercase tracking-[0.15em] text-blue-900">
                  {COPY.badge}
                </span>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h2 className="text-4xl font-black uppercase leading-tight tracking-tight text-blue-900">
                  {COPY.heading[0]}
                  <br />
                  {COPY.heading[1]}
                </h2>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex flex-col gap-3"
              >
                <motion.div
                  className="h-1 w-10 rounded-full bg-blue-900/40"
                  variants={accentVariants}
                  style={{ originX: 0 }}
                />

                <div className="flex flex-col gap-3">
                  <p className="text-sm leading-relaxed text-gray-600">
                    {COPY.body[0]}
                  </p>

                  <p className="text-sm font-semibold text-blue-900">
                    {COPY.body[1]}
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Desktop Image */}
            <motion.div
              className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 xl:h-72 xl:w-72"
              variants={imageVariants}
              initial="hidden"
              animate="visible"
            >
              <Image
                src="/assets/coding-boy-illustration.png"
                alt={COPY.imageAlt}
                fill
                className="object-contain object-bottom"
                quality={90}
                priority
              />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
