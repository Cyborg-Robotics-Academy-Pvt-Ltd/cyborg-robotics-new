import React from "react";
import {
  ArrowRight,
  CalendarDays,
  Grid3X3,
  Trophy,
  UserPlus,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    step: "STEP 1",
    title: "REGISTER\nONLINE",
    desc: "Read the rulebook, understand the challenge, and complete your registration individually or through your school.",
    bg: "bg-[#8b1a2f]",
    icon: (
      <UserPlus
        className="h-7 w-7 sm:h-8 sm:w-8 text-white"
        strokeWidth={2.2}
      />
    ),
  },
  {
    step: "STEP 2",
    title: "BUILD YOUR PROJECT",
    desc: "Create your own maze-based or block-coded project using creativity, logic, and design thinking.",
    bg: "bg-[#082c78]",
    icon: (
      <CalendarDays
        className="h-7 w-7 sm:h-8 sm:w-8 text-white"
        strokeWidth={2.2}
      />
    ),
  },
  {
    step: "STEP 3",
    title: "JOIN LIVE EXAM",
    desc: "Participate in the live online coding challenge and showcase your problem-solving skills in real time.",
    bg: "bg-[#082c78]",
    icon: (
      <Grid3X3 className="h-7 w-7 sm:h-8 sm:w-8 text-white" strokeWidth={2.2} />
    ),
  },
  {
    step: "STEP 4",
    title: "SHARE & WAIT FOR RESULTS",
    desc: "Upload your project on social media, tag us to spread awareness about block-based coding, and wait for the final leaderboard and rewards.",
    bg: "bg-[#8b1a2f]",
    icon: (
      <Trophy className="h-7 w-7 sm:h-8 sm:w-8 text-white" strokeWidth={2.2} />
    ),
  },
];

export default function HowItWorks() {
  return (
    <Card className="border-gray-200 bg-white">
      <CardHeader className="pb-4 sm:pb-5">
        <div className="flex items-center gap-3">
          <div className="h-6 w-1 rounded-full bg-[#8b1a2f]" />

          <CardTitle className="text-xl font-black uppercase tracking-wide text-[#082c78] sm:text-2xl">
            How It Works
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        {/* Mobile Layout */}
        <div className="flex flex-col gap-6 lg:hidden">
          {steps.map((s, i) => (
            <div key={s.step} className="relative">
              <div className="flex gap-4">
                {/* Left Timeline */}
                <div className="flex flex-col items-center">
                  <div
                    className={`relative flex h-16 w-16 items-center justify-center rounded-full ${s.bg} shadow-md`}
                  >
                    {s.icon}

                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-white text-[9px] font-black text-[#082c78] shadow-sm">
                      {i + 1}
                    </span>
                  </div>

                  {i < steps.length - 1 && (
                    <div className="mt-2 h-12 w-[2px] bg-gray-200" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-2 pt-1">
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#c0392b]">
                    {s.step}
                  </span>

                  <h3 className="whitespace-pre-line text-base font-black uppercase leading-snug text-[#082c78]">
                    {s.title}
                  </h3>

                  <div className="my-2 h-px w-8 bg-gray-200" />

                  <p className="text-sm leading-relaxed text-gray-500">
                    {s.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Layout */}
        <div className="hidden items-start justify-between gap-2 lg:flex">
          {steps.map((s, i) => (
            <React.Fragment key={s.step}>
              <div className="group flex w-[140px] flex-col items-center text-center">
                <div className="relative mb-4">
                  <div
                    className={`flex h-20 w-20 items-center justify-center rounded-full ${s.bg} shadow-md transition-transform duration-300 group-hover:scale-105`}
                  >
                    {s.icon}
                  </div>

                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-gray-200 bg-white text-[9px] font-black text-[#082c78]">
                    {i + 1}
                  </span>
                </div>

                <span className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#c0392b]">
                  {s.step}
                </span>

                <p className="mb-2 whitespace-pre-line text-sm font-black uppercase leading-snug text-[#082c78]">
                  {s.title}
                </p>

                <div className="mb-2 h-px w-6 bg-gray-200" />

                <p className="text-xs leading-relaxed text-gray-400">
                  {s.desc}
                </p>
              </div>

              {i < steps.length - 1 && (
                <div className="flex flex-shrink-0 items-center px-1 pt-8">
                  <ArrowRight
                    className="h-5 w-5 text-gray-300"
                    strokeWidth={2}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
