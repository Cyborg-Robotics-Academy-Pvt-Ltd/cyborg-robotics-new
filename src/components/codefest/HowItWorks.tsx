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
    icon: <UserPlus className="h-8 w-8 text-white" strokeWidth={2.2} />,
  },
  {
    step: "STEP 2",
    title: "BUILD YOUR PROJECT",
    desc: "Create your own maze-based or block-coded project using creativity, logic, and design thinking.",
    bg: "bg-[#082c78]",
    icon: <CalendarDays className="h-8 w-8 text-white" strokeWidth={2.2} />,
  },
  {
    step: "STEP 3",
    title: "JOIN LIVE EXAM",
    desc: "Participate in the live online coding challenge and showcase your problem-solving skills in real time.",
    bg: "bg-[#082c78]",
    icon: <Grid3X3 className="h-8 w-8 text-white" strokeWidth={2.2} />,
  },
  {
    step: "STEP 4",
    title: "SHARE & WAIT FOR RESULTS",
    desc: "Upload your project on social media, tag us to spread awareness about block-based coding, and wait for the final leaderboard and rewards. ",
    bg: "bg-[#8b1a2f]",
    icon: <Trophy className="h-8 w-8 text-white" strokeWidth={2.2} />,
  },
];

export default function HowItWorks() {
  return (
    <Card className="min-h-[340px] border-gray-200 bg-white">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="h-6 w-1 rounded-full bg-[#8b1a2f]" />
          <CardTitle className="text-2xl font-black uppercase tracking-wide text-[#082c78]">
            How It Works
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-start justify-between">
          {steps.map((s, i) => (
            <React.Fragment key={s.step}>
              <div className="group flex w-[120px] flex-col items-center text-center">
                <div className="relative mb-4">
                  <div
                    className={`flex h-20 w-20 items-center justify-center rounded-full ${s.bg} shadow-md`}
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
