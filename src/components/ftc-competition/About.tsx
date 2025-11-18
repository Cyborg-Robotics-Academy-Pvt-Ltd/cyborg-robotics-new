import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Zap,
  Globe,
  Users,
  Trophy,
  Calendar,
  Target,
  Sparkles,
} from "lucide-react";
// Removed unused ftcImage import
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  } as const;

  const features = [
    {
      icon: Brain,
      title: "STEM Learning",
      desc: "Hands-on engineering experience",
    },
    { icon: Users, title: "Teamwork", desc: "Collaborative problem solving" },
    {
      icon: Globe,
      title: "Global Network",
      desc: "Connect with teams worldwide",
    },
    { icon: Zap, title: "Innovation", desc: "Cutting-edge technology skills" },
  ];

  return (
    <section
      id="about-ftc"
      className="w-full py-20 lg:py-4 bg-white to-white overflow-hidden"
    >
      <div className="container px-4 md:px-6">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid gap-12 lg:gap-20 lg:grid-cols-2 items-center"
        >
          {/* Left Content */}
          <motion.div className="space-y-4" variants={itemVariants}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-flex items-center gap-3 rounded-full bg-red-500/10 px-5 py-1 text-sm font-bold text-red-600 border border-red-200 shadow-md backdrop-blur-sm"
            >
              <Sparkles className="h-5 w-5 animate-pulse" />
              <span>FIRST Tech Challenge</span>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="font-headline text-3xl sm:text-2xl md:text-4xl font-black tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-700"
            >
              What is FTC?
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="max-w-2xl text-lg md:text-xl text-zinc-600 leading-relaxed"
            >
              The{" "}
              <strong className="text-zinc-800">
                FIRST Tech Challenge (FTC)
              </strong>{" "}
              is a hands-on robotics program for students aged{" "}
              <strong className="text-red-600">12–18 (grades 6–12)</strong>.
              Teams design, build, and program robots to compete in a dynamic
              annual game. Students learn STEM concepts, problem-solving,
              teamwork, engineering workflow, and real-world innovation skills.
            </motion.p>

            {/* Feature Grid */}
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group relative p-2 rounded-2xl bg-white border border-zinc-200 shadow-lg hover:shadow-2xl hover:border-red-200 transition-all duration-500 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 flex items-start gap-4">
                    <div className="rounded-xl bg-red-100 p-3 group-hover:bg-red-800 group-hover:scale-110 transition-all duration-300">
                      <feature.icon className="h-7 w-7 text-red-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-zinc-800 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-zinc-600">{feature.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div variants={itemVariants} className="pt-6">
              <Button
                asChild
                size="lg"
                className="group relative overflow-hidden bg-gradient-to-r from-red-800 to-red-700 hover:from-red-900 hover:to-red-700 text-white font-bold text-lg px-10 py-7 rounded-2xl  hover:shadow-red-500/30 transform hover:scale-105 transition-all duration-300"
              >
                <Link href="/registration/new" className="flex items-center">
                  <span className="relative z-10 flex items-center">
                    Join Our Team Now
                    <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                  <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <Sparkles className="absolute -top-2 -right-2 h-10 w-10 text-white/20" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 100, rotateY: 15 }}
            animate={isInView ? { opacity: 1, x: 0, rotateY: 0 } : {}}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="relative flex justify-center perspective-1000"
          >
            {/* Removed redundant ftcImage check */}
            <motion.div
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative group cursor-pointer"
            >
              <Card className="overflow-hidden rounded-3xl shadow-2xl border-0 bg-gradient-to-br from-zinc-100 to-zinc-200">
                <CardContent className="p-0 relative">
                  <Image
                    src="/assets/events/ftc-robot.png"
                    alt="FTC Competition"
                    width={500}
                    height={300}
                    className="w-full h-auto object-cover rounded-3xl"
                    data-ai-hint="FTC Competition"
                  />
                  {/* Overlay Effects */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                  {/* Floating Badges */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 4,
                      ease: "easeOut",
                    }}
                    className="absolute top-6 right-6 bg-white/20 backdrop-blur-lg rounded-full p-4 border border-white/30 shadow-xl"
                  >
                    <Trophy className="h-10 w-10 text-yellow-400 drop-shadow-lg" />
                  </motion.div>

                  <div className="absolute bottom-6 left-6 bg-white/20 backdrop-blur-lg rounded-2xl px-5 py-3 border border-white/30 shadow-xl">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-6 w-6 text-red-500" />
                      <div>
                        <p className="text-white font-bold text-sm">
                          Annual Competition
                        </p>
                        <p className="text-white/80 text-xs">
                          2025-2026 Season
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Subtle Corner Accent */}
                  <div className="absolute top-0 left-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -z-10" />
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
