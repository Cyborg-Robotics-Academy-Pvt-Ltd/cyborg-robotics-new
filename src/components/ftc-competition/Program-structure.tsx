import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  Sparkles,
  Calendar,
  Users,
  Wrench,
  Brain,
  Trophy,
} from "lucide-react";
import { useRef } from "react";

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

export function ProgramStructure() {
  const ref = useRef(null);

  return (
    <section
      id="program-structure"
      className="w-full  bg-white relative overflow-hidden"
    >
      <div className="container px-4 md:px-6 space-y-20">
        {/* Header */}
        <div ref={ref} className="text-center space-y-6">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full bg-red-500/10 px-6 py-3 text-sm font-bold text-red-800 border border-red-200 shadow-lg backdrop-blur-sm">
              <Sparkles className="h-5 w-5" />
              <span>Program Journey</span>
            </div>
          </div>

          <h2 className="font-headline text-5xl sm:text-6xl md:text-7xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-700">
            Program Structure
          </h2>

          <p className="max-w-3xl mx-auto text-lg md:text-xl text-zinc-600 leading-relaxed">
            A year-long immersive journey combining{" "}
            <strong className="text-red-800">technical mastery</strong> and{" "}
            <strong className="text-red-800">professional growth</strong> —
            designed to transform students into future-ready innovators.
          </p>
        </div>

        {/* Program Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
          {[
            { label: "Age Group", value: "12–18 Years", icon: Users },
            { label: "Team Size", value: "15–25 Members", icon: Users },
            { label: "Frequency", value: "Weekly Sessions", icon: Calendar },
            { label: "Mentorship", value: "Industry Experts", icon: Brain },
            { label: "Season", value: "Oct – Apr", icon: Trophy },
          ].map((stat, i) => (
            <div
              key={i}
              className="group relative p-6 rounded-2xl bg-white/80 backdrop-blur-md border border-zinc-200 shadow-xl transition-all duration-500 text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 transition-opacity" />
              <stat.icon className="h-8 w-8 mx-auto mb-3 text-red-800 transition-transform" />
              <p className="text-sm font-medium text-zinc-600">{stat.label}</p>
              <p className="text-lg font-bold text-zinc-800 mt-1">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Technical & Non-Technical Tracks */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Technical Track */}
          <div className="group relative perspective-1000">
            <Card className="h-full rounded-2xl bg-gradient-to-br from-zinc-50 to-white border-2 border-zinc-200 shadow-xl transition-all duration-700 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-red-500/10 to-transparent opacity-0 transition-opacity duration-700" />
              <CardHeader className="relative z-10 p-4">
                <CardTitle className="font-headline text-2xl font-bold text-zinc-800 flex items-center gap-2">
                  <Wrench className="h-6 w-6 text-red-800" />
                  Technical Track
                </CardTitle>
                <p className="text-zinc-600 text-sm mt-1">
                  Master robot engineering & competition strategy
                </p>
              </CardHeader>
              <CardContent className="space-y-2 relative z-10 p-4">
                {technicalTrack.map((skill, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2 rounded-lg bg-white/70 backdrop-blur hover:bg-red-50 transition-all duration-300"
                  >
                    <CheckCircle2 className="h-5 w-5 text-red-800 flex-shrink-0" />
                    <span className="font-medium text-zinc-700 text-sm">
                      {skill}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Non-Technical Track */}
          <div className="group relative perspective-1000">
            <Card className="h-full rounded-2xl bg-gradient-to-br from-zinc-50 to-white border-2 border-zinc-200 shadow-xl transition-all duration-700 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-red-500/10 to-transparent opacity-0 transition-opacity duration-700" />
              <CardHeader className="relative z-10 p-4">
                <CardTitle className="font-headline text-2xl font-bold text-zinc-800 flex items-center gap-2">
                  <Users className="h-6 w-6 text-red-800" />
                  Non-Technical Track
                </CardTitle>
                <p className="text-zinc-600 text-sm mt-1">
                  Leadership, outreach & professional skills
                </p>
              </CardHeader>
              <CardContent className="space-y-2 relative z-10 p-4">
                {nonTechnicalTrack.map((skill, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2 rounded-lg bg-white/70 backdrop-blur hover:bg-red-50 transition-all duration-300"
                  >
                    <CheckCircle2 className="h-5 w-5 text-red-800 flex-shrink-0" />
                    <span className="font-medium text-zinc-700 text-sm">
                      {skill}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Annual Roadmap Timeline */}
        <div className="text-center">
          <h3 className="text-center font-headline text-4xl sm:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-700 mb-16">
            Annual Roadmap
          </h3>

          {/* Desktop Horizontal Timeline */}
          <div className="hidden md:grid grid-cols-5 gap-4 relative mx-auto max-w-5xl">
            <div className="absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-red-400 via-red-500 to-red-600 rounded-full shadow-lg shadow-red-500/30">
              <div className=" bg-gray-300 rounded-full h-[2px]" />
            </div>

            {roadmap.map((item, i) => (
              <div
                key={i}
                className="relative flex flex-col items-center text-center group"
              >
                <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-white border-2 border-red-700 shadow-md transition-all duration-500">
                  <div className="absolute inset-0 rounded-full bg-red-500/20 blur-lg transition-all" />
                  <item.icon className="h-10 w-10 text-red-800 relative z-10" />
                  <span className="absolute -top-3 -right-3 bg-red-800 text-white text-xs font-bold rounded-full h-8 w-8 flex items-center justify-center shadow-lg">
                    {item.step}
                  </span>
                </div>
                <h4 className="mt-6 font-bold text-lg text-zinc-800">
                  {item.title}
                </h4>
                <p className="mt-2 text-sm text-zinc-600 max-w-32">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Mobile Vertical Timeline */}
          <div className="md:hidden space-y-8 max-w-2xl mx-auto">
            {roadmap.map((item, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-red-800 text-white flex items-center justify-center font-bold text-xl shadow-lg">
                  {item.step}
                </div>
                <div className="flex-1 bg-white/80  rounded-2xl p-5 shadow-lg border border-zinc-200 text-left">
                  <h4 className="font-bold text-lg">{item.title}</h4>
                  <p className="text-zinc-600 mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
