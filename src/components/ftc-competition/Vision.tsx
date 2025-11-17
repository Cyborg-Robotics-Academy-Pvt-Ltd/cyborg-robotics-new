import { Lightbulb, Wrench, Users, Sparkles } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const pillars = [
  {
    icon: <Lightbulb className="h-10 w-10 text-red-500" />,
    title: "Innovation",
    description: "Creative ideas, strategy, design thinking",
  },
  {
    icon: <Wrench className="h-10 w-10 text-red-500" />,
    title: "Engineering Excellence",
    description: "Quality builds, robust mechanisms",
  },
  {
    icon: <Users className="h-10 w-10 text-red-500" />,
    title: "Professionalism",
    description: "Teamwork, communication, leadership",
  },
];

export function Vision() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <section id="vision" className="w-full  bg-white relative overflow-hidden">
      <div className="container px-4 md:px-6">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col items-center justify-center space-y-6 text-center"
        >
          {/* Header Section */}
          <motion.div className="space-y-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 rounded-full bg-red-500/10 px-6 py-3 text-sm font-bold text-red-600 border border-red-200 shadow-md backdrop-blur-sm"
            >
              <Sparkles className="h-5 w-5 animate-pulse" />
              <span>Our Vision</span>
            </motion.div>

            <motion.h2 className="font-headline text-4xl sm:text-5xl md:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-700">
              Our Team Vision
            </motion.h2>

            <motion.p className="max-w-3xl text-lg md:text-xl text-zinc-600 leading-relaxed">
              At <strong className="text-zinc-800">Cyborg Robotics</strong>, we
              empower students to become confident innovators and future tech
              leaders. Through FTC, we nurture creativity, collaboration and a
              growth mindset — building not just robots, but character.
            </motion.p>

            <motion.p className="max-w-xl text-base md:text-lg text-zinc-500 italic">
              Aligned with our academy mission: <br />
              <strong className="text-red-600">
                “Unlock potential through practical, engaging learning.”
              </strong>
            </motion.p>
          </motion.div>

          {/* Pillars Grid */}
          <motion.div
            variants={containerVariants}
            className="mx-auto grid max-w-5xl items-start gap-8 py-8 sm:grid-cols-2 md:grid-cols-3"
          >
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                whileHover={{
                  y: -10,
                  scale: 1.05,
                  transition: { duration: 0.3 },
                }}
                className="group relative"
              >
                <Card className="relative text-center rounded-3xl bg-white/80 backdrop-blur-md border border-zinc-200 shadow-xl group-hover:shadow-2xl  transition-all duration-500 overflow-hidden">
                  {/* Hover Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-100/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <CardHeader className="items-center relative z-10">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 5 }}
                      className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100/50  transition-colors duration-300"
                    >
                      {pillar.icon}
                    </motion.div>
                    <CardTitle className="font-headline text-xl md:text-2xl font-bold text-zinc-800 pt-6">
                      {pillar.title}
                    </CardTitle>
                    <CardDescription className="text-base text-zinc-600 leading-relaxed">
                      {pillar.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
