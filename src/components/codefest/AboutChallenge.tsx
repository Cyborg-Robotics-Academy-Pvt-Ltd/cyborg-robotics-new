"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { Card, CardContent } from "@/components/ui/card";

const COPY = {
  badge: "Live Coding Challenge",
  heading: ["More Than", "Just a Game"],
  body: [
    "CODE FEST 1.0 is a coding challenge for school students to explore block-based coding, creativity, and problem-solving while building confidence and innovation skills.",
    "It’s not about how much you know.It’s about what you can create.",
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
        <motion.div
          className="pointer-events-none absolute right-0 top-0 h-64 w-64 bg-[radial-gradient(circle,rgba(8,44,120,0.08)_0%,transparent_70%)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />

        <CardContent className="relative z-10 flex h-full flex-col gap-3 p-5 pb-0 sm:p-6 sm:pb-0">
          <motion.div
            className="relative z-10 flex flex-col gap-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              className="mb-2 flex w-fit items-center gap-2.5 rounded-full border border-blue-900/15 bg-blue-900/5 px-3.5 py-2 backdrop-blur-sm transition-all duration-300 hover:border-blue-900/25 hover:bg-blue-900/10"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
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

            <motion.div variants={itemVariants}>
              <h2 className="max-w-[55%] text-2xl font-black uppercase leading-tight tracking-tight text-blue-900 sm:text-3xl">
                {COPY.heading[0]}
                <br />
                {COPY.heading[1]}
              </h2>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-col gap-1.5 pb-2"
            >
              <motion.div
                className="h-1 w-8 rounded-full bg-blue-900/40"
                variants={accentVariants}
                style={{ originX: 0 }}
              />

              <div className="flex max-w-[55%] flex-col gap-2">
                <p className="text-xs leading-snug text-gray-600 sm:text-sm">
                  {COPY.body[0]}
                </p>

                <p className="text-xs font-semibold text-blue-900 sm:text-sm">
                  {COPY.body[1]}
                </p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 sm:h-48 sm:w-48 lg:h-56 lg:w-56"
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
        </CardContent>
      </Card>
    </motion.div>
  );
}
