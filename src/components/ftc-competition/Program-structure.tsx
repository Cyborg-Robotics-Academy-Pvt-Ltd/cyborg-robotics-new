"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  Sparkles,
  Calendar,
  Users,
  Wrench,
  Brain,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";

const technicalTrack = [
  "Mechanical Design",
  "Electronics & Wiring",
  "CAD & Prototyping",
  "Programming (Java / Blocks)",
  "Strategy & Game Analysis",
];

const nonTechnicalTrack = [
  "Public Speaking",
  "Team Management",
  "Outreach & Branding",
  "Documentation & Engineering Notebook",
  "Event Management",
];

const stats = [
  { label: "Age Group", value: "12–18 Years", icon: Users },
  { label: "Team Size", value: "15–25 Members", icon: Users },
  { label: "Frequency", value: "Weekly Sessions", icon: Calendar },
  { label: "Mentorship", value: "Industry Experts", icon: Brain },
  { label: "Season", value: "Oct – Apr", icon: Trophy },
];

const roadmap = [
  {
    step: "1",
    title: "Application",
    description: "Submit your interest",
    icon: Calendar,
  },
  {
    step: "2",
    title: "Screening + Interview",
    description: "Evaluation process",
    icon: Users,
  },
  {
    step: "3",
    title: "Enrollment",
    description: "Official team registration",
    icon: CheckCircle2,
  },
  {
    step: "4",
    title: "Preparation",
    description: "Training & skill development",
    icon: Wrench,
  },
  {
    step: "5",
    title: "Participation",
    description: "Active competition season",
    icon: Trophy,
  },
];

interface TrackCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  skills: string[];
  index: number;
}

function TrackCard({
  icon: Icon,
  title,
  subtitle,
  skills,
  index,
}: TrackCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative [perspective:1000px]"
    >
      <Card className="h-full rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 shadow-lg transition-all duration-500 overflow-hidden hover:shadow-2xl hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-t from-[#B92423]/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <CardHeader className="relative z-10 p-4">
          <div className="inline-flex items-center mx-auto md:mx-0 justify-center w-10 h-10 rounded-lg bg-[#B92423]/10 mb-2 group-hover:bg-[#B92423]/20 transition-colors duration-300">
            <Icon className="h-5 w-5 text-red-400 transition-transform group-hover:scale-110" />
          </div>
          <CardTitle className="font-headline text-lg font-bold text-white flex items-center gap-2">
            {title}
          </CardTitle>
          <p className="text-zinc-400 text-xs mt-1">{subtitle}</p>
        </CardHeader>
        <CardContent className="space-y-2 relative z-10 px-4 pb-4">
          {skills.map((skill, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.03] backdrop-blur hover:bg-[#B92423]/10 transition-all duration-300 border border-white/10 hover:border-[#B92423]/40"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-md bg-[#B92423]/10 flex items-center justify-center group-hover:bg-[#B92423]/20 transition-colors">
                <CheckCircle2 className="h-3.5 w-3.5 text-red-400" />
              </div>
              <span className="text-sm font-medium text-zinc-300 group-hover:text-red-400 transition-colors">
                {skill}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function ProgramStructure() {
  return (
    <section
      id="program-structure"
      className="w-full bg-[#07090D] relative overflow-hidden py-16 md:py-24 px-6"
    >
      {/* ambient glow accents */}
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-[#B92423]/15 blur-[130px]" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#B92423]/10 blur-[130px]" />

      <div className="container px-4 md:px-6 space-y-16 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-3 rounded-full bg-[#B92423]/10 px-6 py-3 text-sm font-bold text-red-400 border border-[#B92423]/30 backdrop-blur-sm hover:bg-[#B92423]/20 transition-all duration-300">
            <Sparkles className="h-5 w-5 animate-pulse" />
            <span>Program Journey</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="bg-gradient-to-r from-red-500 to-red-300 bg-clip-text text-transparent">
              Program
            </span>{" "}
            <span className="text-white">Structure</span>
          </h1>

          <p className="max-w-3xl mx-auto text-lg md:text-xl text-zinc-400 leading-relaxed">
            A focused program blending{" "}
            <strong className="text-red-400 font-semibold">
              technical mastery
            </strong>{" "}
            and{" "}
            <strong className="text-red-400 font-semibold">
              professional growth
            </strong>{" "}
            to shape future-ready innovators.
          </p>
        </motion.div>

        {/* Program Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-4xl mx-auto">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative p-3 rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/10 shadow-lg hover:shadow-[#B92423]/10 hover:shadow-lg transition-all duration-300 text-center hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#B92423]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#B92423]/10 mb-2 group-hover:bg-[#B92423]/20 transition-colors duration-300">
                  <stat.icon className="h-5 w-5 text-red-400 transition-transform group-hover:scale-110" />
                </div>
                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">
                  {stat.label}
                </p>
                <p className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                  {stat.value}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Technical & Non-Technical Tracks */}
        <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          <TrackCard
            icon={Wrench}
            title="Technical Track"
            subtitle="Master robot engineering & competition strategy"
            skills={technicalTrack}
            index={0}
          />
          <TrackCard
            icon={Users}
            title="Non-Technical Track"
            subtitle="Leadership, outreach & professional skills"
            skills={nonTechnicalTrack}
            index={1}
          />
        </div>

        {/* Annual Roadmap Timeline */}
        <div className="text-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold mb-10 bg-gradient-to-r from-red-500 to-red-300 bg-clip-text text-transparent"
          >
            Roadmap
          </motion.h2>

          {/* Desktop Horizontal Timeline */}
          <div className="hidden md:grid grid-cols-5 gap-3 relative mx-auto max-w-3xl">
            <div className="absolute top-8 left-0 right-0 h-[2px] bg-gradient-to-r from-red-700 via-[#B92423] to-red-700 rounded-full shadow-lg shadow-[#B92423]/30" />

            {roadmap.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative flex flex-col items-center text-center group"
              >
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-[#0d0f16] border border-white/10 shadow-lg transition-all duration-500 group-hover:border-[#B92423]/50 group-hover:scale-105">
                  <div className="absolute inset-0 rounded-full bg-[#B92423]/10 blur-lg" />
                  <item.icon className="h-5 w-5 text-red-400 relative z-10" />
                  <span className="absolute -top-2 -right-1.5 bg-[#B92423] text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg group-hover:bg-red-700 transition-colors">
                    {item.step}
                  </span>
                </div>
                <h4 className="mt-3 font-bold text-sm text-white group-hover:text-red-400 transition-colors">
                  {item.title}
                </h4>
                <p className="mt-1 text-xs text-zinc-500 max-w-28 group-hover:text-zinc-300 transition-colors">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Mobile Vertical Timeline */}
          <div className="md:hidden space-y-8 max-w-2xl mx-auto relative">
            <div className="absolute left-1 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#B92423] via-red-700 to-red-900 ml-8" />

            {roadmap.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex gap-6 items-start group relative"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[#B92423] text-white flex items-center justify-center font-bold text-xl shadow-lg transition-all group-hover:bg-red-700 group-hover:scale-105 z-10">
                  {item.step}
                </div>
                <div className="flex-1 bg-white/[0.03] rounded-3xl p-5 shadow-lg border border-white/10 text-left transition-all group-hover:shadow-lg group-hover:border-[#B92423]/40">
                  <h4 className="font-bold text-lg text-white group-hover:text-red-400 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-zinc-400 mt-1 group-hover:text-zinc-300 transition-colors">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
