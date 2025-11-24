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
    {
      icon: Target,
      title: "Official Training",
      desc: "Certified FTC training program",
    },
  ];

  return (
    <section
      id="about-ftc"
      className="w-full py-12 lg:py-4 bg-white to-white overflow-hidden"
    >
      <div className="container px-4 md:px-6">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid gap-8 lg:gap-12 lg:grid-cols-2 items-center"
        >
          {/* Left Content */}
          <motion.div
            id="about-ftc"
            className="space-y-4"
            variants={itemVariants}
          >
            <motion.div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 px-4 py-1 text-xs font-bold text-white border border-red-200 shadow-lg ">
              <Sparkles className="h-5 w-5 " />
              <span>official training partner of FTC</span>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="font-headline text-2xl sm:text-xl md:text-3xl font-black tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-700"
            >
              What is FTC?
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="max-w-2xl text-base md:text-lg text-zinc-600 leading-relaxed"
            >
              The{" "}
              <strong className="text-zinc-800">
                FIRST Tech Challenge (FTC)
              </strong>{" "}
              is a hands-on robotics program for students aged{" "}
              <strong className="text-red-600">12–18 (grades 6–12)</strong>. As
              an{" "}
              <span className="font-bold text-red-600">
                official training partner of FTC
              </span>
              , Cyborg Robotics helps teams design, build and program robots to
              compete in a dynamic annual game. Students learn STEM concepts,
              problem-solving, teamwork, engineering workflow and real-world
              innovation skills.
            </motion.p>

            {/* Feature Grid */}
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="group relative p-1.5 rounded-xl bg-white border border-zinc-200 shadow-md hover:shadow-lg hover:border-red-200 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 flex items-start gap-4">
                    <div className="rounded-lg bg-red-100 p-2 group-hover:bg-red-800 group-hover:scale-105 transition-all duration-200">
                      <feature.icon className="h-5 w-5 text-red-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-zinc-800 mb-0.5">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-zinc-600">{feature.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div variants={itemVariants} className="pt-4">
              <Button
                asChild
                size="default"
                className="group relative overflow-hidden bg-gradient-to-r from-red-800 to-red-700 hover:from-red-900 hover:to-red-700 text-white font-bold px-6 py-4 rounded-xl hover:shadow-red-500/30 transform hover:scale-105 transition-all duration-300"
              >
                <Link
                  href="https://docs.google.com/forms/d/e/1FAIpQLScsyPIaYIeznyzY48p_wquf1T4TLym5snO6xn3Iz_Epq63gjw/viewform"
                  className="flex items-center"
                >
                  <span className="relative z-10 flex items-center">
                    Apply Now
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                  <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-white/20" />
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
              className="relative group cursor-pointer w-full max-w-2xl"
            >
              <Card className="overflow-hidden rounded-3xl mt-10 shadow-xl bg-gradient-to-br from-zinc-100 to-zinc-200">
                <CardContent className="p-0 relative">
                  {/* Replaced GIF with YouTube embed */}
                  <div className="relative w-full md:h-[20rem] h-[14rem] rounded-3xl overflow-hidden">
                    <iframe
                      src="https://www.youtube.com/embed/K_PuWjr7qcM"
                      title="FTC Competition"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>

                  <div className="absolute bottom-12 left-4 bg-white/20 backdrop-blur-lg rounded-xl px-3 py-2 border border-white/30 shadow-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="text-white font-bold text-xs">
                          Annual Competition
                        </p>
                        <p className="text-white/80 text-[0.6rem]">
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
