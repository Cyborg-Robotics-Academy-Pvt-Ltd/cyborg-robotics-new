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
      <div className="container px-4 md:px-6 space-y-10">
        {/* Header */}
        <div ref={ref} className="text-center space-y-4">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-3 rounded-full bg-red-500/10 px-6 py-3 text-sm font-bold text-red-800 border border-red-200 shadow-lg backdrop-blur-sm hover:bg-red-500/20 transition-all duration-300">
              <Sparkles className="h-5 w-5 animate-pulse" />
              <span>Program Journey</span>
            </div>
          </div>

          <h1 className="text-center">
            <span className="text-4xl md:text-5xl font-bold gradient-text">
              Program
            </span>
            <span className="text-4xl md:text-5xl font-bold text-black">
              {" "}
              Structure
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-lg md:text-xl text-zinc-600 leading-relaxed animate-fade-in-up">
            A focused program blending{" "}
            <strong className="text-red-800">technical mastery</strong> and{" "}
            <strong className="text-red-800">professional growth</strong> to
            shape future-ready innovators.
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
              className="group relative p-4 rounded-3xl bg-white/80 backdrop-blur-md border border-zinc-200 shadow-lg hover:shadow-xl transition-all duration-500 text-center hover:-translate-y-2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl" />
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-100 mb-4 group-hover:bg-red-200 transition-colors duration-300">
                  <stat.icon className="h-8 w-8 text-red-800 transition-transform group-hover:scale-110" />
                </div>
                <p className="text-sm font-semibold text-zinc-600 uppercase tracking-wider mb-1">
                  {stat.label}
                </p>
                <p className="text-lg font-bold text-zinc-800 mt-1 group-hover:text-red-800 transition-colors">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Technical & Non-Technical Tracks */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Technical Track */}
          <div className="group relative perspective-1000">
            <Card className="h-full rounded-2xl bg-gradient-to-br from-zinc-50 to-white border-1 border-zinc-100 shadow-xl transition-all duration-700 overflow-hidden hover:shadow-2xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-t from-red-500/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              <CardHeader className="relative z-10 p-6">
                <div className="inline-flex items-center mx-auto md:mx-0 justify-center w-14 h-14 rounded-xl bg-red-100 mb-4 group-hover:bg-red-200 transition-colors duration-300">
                  <Wrench className="h-7 w-7 text-red-800 transition-transform group-hover:rotate-12" />
                </div>
                <CardTitle className="font-headline text-2xl font-bold text-zinc-800 flex items-center gap-2">
                  Technical Track
                </CardTitle>
                <p className="text-zinc-600 text-sm mt-2">
                  Master robot engineering & competition strategy
                </p>
              </CardHeader>
              <CardContent className="space-y-3 relative z-10 px-6 pb-6">
                {technicalTrack.map((skill, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-xl bg-white/70 backdrop-blur hover:bg-red-50 transition-all duration-300 border border-zinc-100 hover:border-red-200"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                      <CheckCircle2 className="h-5 w-5 text-red-800" />
                    </div>
                    <span className="font-medium text-zinc-700 group-hover:text-red-800 transition-colors">
                      {skill}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Non-Technical Track */}
          <div className="group relative perspective-1000">
            <Card className="h-full rounded-2xl bg-gradient-to-br from-zinc-50 to-white border-1 border-zinc-100 shadow-xl transition-all duration-700 overflow-hidden hover:shadow-2xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-t from-red-500/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              <CardHeader className="relative z-10 p-6">
                <div className="inline-flex items-center mx-auto md:mx-0 justify-center w-14 h-14 rounded-xl bg-red-100 mb-4 group-hover:bg-red-200 transition-colors duration-300">
                  <Users className="h-7  w-7 text-red-800 transition-transform group-hover:scale-110" />
                </div>
                <CardTitle className="font-headline text-2xl font-bold text-zinc-800 flex items-center gap-2">
                  Non-Technical Track
                </CardTitle>
                <p className="text-zinc-600 text-sm mt-2">
                  Leadership, outreach & professional skills
                </p>
              </CardHeader>
              <CardContent className="space-y-3 relative z-10 px-6 pb-6">
                {nonTechnicalTrack.map((skill, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-xl bg-white/70 backdrop-blur hover:bg-red-50 transition-all duration-300 border border-zinc-100 hover:border-red-200"
                  >
                    <div className="flex-shrink-0  w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                      <CheckCircle2 className="h-5 w-5 text-red-800" />
                    </div>
                    <span className="font-medium text-zinc-700 group-hover:text-red-800 transition-colors">
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
          <h1 className="text-center mb-10">
            <span className="text-3xl font-bold gradient-text">Roadmap</span>
          </h1>

          {/* Desktop Horizontal Timeline */}
          <div className="hidden md:grid grid-cols-5 gap-4 relative mx-auto max-w-5xl">
            <div className="absolute top-12 left-0 right-0 h-[2px] bg-gradient-to-r from-red-400 via-red-500 to-red-600 rounded-full shadow-lg shadow-red-500/30"></div>

            {roadmap.map((item, i) => (
              <div
                key={i}
                className="relative flex flex-col items-center text-center group"
              >
                <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl duration-500">
                  <div className="absolute inset-0 rounded-full bg-white blur-lg " />
                  <item.icon className="h-8 w-8 text-red-800 relative z-10 " />
                  <span className="absolute -top-3 -right-2 bg-red-800 text-white text-xs font-bold rounded-full h-8 w-8 flex items-center justify-center shadow-lg group-hover:bg-red-900">
                    {item.step}
                  </span>
                </div>
                <h4 className="mt-6 font-bold text-lg text-zinc-800 group-hover:text-red-800 transition-colors">
                  {item.title}
                </h4>
                <p className="mt-2 text-sm text-zinc-600 max-w-32 group-hover:text-zinc-800 transition-colors">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Mobile Vertical Timeline */}
          <div className="md:hidden space-y-8 max-w-2xl mx-auto relative">
            {/* Vertical line */}
            <div className="absolute left-1 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-600 via-red-700 to-red-800 ml-8"></div>

            {roadmap.map((item, i) => (
              <div key={i} className="flex gap-6 items-start group relative">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-red-800 text-white flex items-center justify-center font-bold text-xl shadow-lg transition-all group-hover:bg-red-900 group-hover:scale-105 z-10">
                  {item.step}
                </div>
                <div className="flex-1 bg-white/80 rounded-3xl p-5 shadow-lg border border-zinc-200 text-left transition-all group-hover:shadow-xl group-hover:border-red-300">
                  <h4 className="font-bold text-lg text-zinc-800 group-hover:text-red-800 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-zinc-600 mt-1 group-hover:text-zinc-800 transition-colors">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
