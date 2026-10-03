import { Code2, Users, ArrowRight, Check } from "lucide-react";

const TRACKS = [
  {
    icon: Code2,
    accent: "#F57B2D",
    accentSoft: "#FFE8D6",
    badge: "Rookie Coders",
    age: "11 – 15 Years",
    title: "Build: To-Do List App",
    desc: "Create a Python application that helps users manage tasks efficiently.",
    columns: [
      ["Add tasks", "Remove tasks", "Mark tasks complete"],
      ["View pending tasks", "Organise workflow"],
    ],
    cta: "Explore Rookie Challenge",
  },
  {
    icon: Users,
    accent: "#22A855",
    accentSoft: "#DCFCE3",
    badge: "Seasoned Coders",
    age: "16 – 21 Years",
    title: "Build: Team Task Manager",
    desc: "Design a productivity platform that helps teams manage tasks, responsibilities and progress.",
    columns: [
      ["Users", "Teams", "Tasks"],
      ["Deadlines", "Progress"],
    ],
    cta: "Explore Seasoned Challenge",
  },
];

export default function Challenge() {
  return (
    <section
      id="challenge"
      className="relative py-24 overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/assets/codefest/challenge-bg.png')" }}
    >
      <div className="relative flex flex-col items-center px-6">
        <div className="w-full max-w-4xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-[11px] font-bold tracking-widest text-[#6FA0FF] uppercase backdrop-blur-sm">
            The Challenge
          </span>
          <h2 className="mt-4 font-display font-extrabold text-4xl sm:text-5xl text-white tracking-tight">
            Two levels.{" "}
            <span className="bg-gradient-to-r from-[#F57B2D] to-[#22A855] bg-clip-text text-transparent">
              One goal.
            </span>
          </h2>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 gap-6 sm:gap-8 w-full max-w-4xl">
          {TRACKS.map((track) => (
            <div
              key={track.title}
              className="group relative rounded-3xl bg-white/95 backdrop-blur-xl p-8 text-left transition-all duration-300 hover:-translate-y-1.5"
              style={{
                boxShadow: `0 20px 40px -12px ${track.accent}40, 0 0 0 1px ${track.accent}30`,
              }}
            >
              {/* age badge, top-right */}
              <span
                className="absolute top-6 right-6 text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{
                  color: track.accent,
                  backgroundColor: track.accentSoft,
                }}
              >
                {track.age}
              </span>

              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3"
                style={{
                  background: `linear-gradient(135deg, ${track.accent}, ${track.accent}cc)`,
                  boxShadow: `0 8px 20px -4px ${track.accent}80`,
                }}
              >
                <track.icon
                  className="text-white"
                  size={24}
                  strokeWidth={2.25}
                />
              </div>

              <p
                className="mt-5 font-display font-bold text-sm uppercase tracking-wide"
                style={{ color: track.accent }}
              >
                {track.badge}
              </p>

              <h3 className="mt-1.5 font-display font-extrabold text-2xl text-[#0a1a33] leading-snug">
                {track.title}
              </h3>
              <p className="mt-2.5 text-sm text-ink-muted leading-relaxed">
                {track.desc}
              </p>

              <div className="mt-6 flex gap-x-8 pt-5 border-t border-black/5">
                {track.columns.map((col, ci) => (
                  <ul key={ci} className="space-y-2.5">
                    {col.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 text-sm font-medium text-ink"
                      >
                        <span
                          className="flex h-4 w-4 items-center justify-center rounded-full shrink-0"
                          style={{ backgroundColor: track.accentSoft }}
                        >
                          <Check
                            size={10}
                            style={{ color: track.accent }}
                            strokeWidth={3.5}
                          />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                ))}
              </div>

              <a
                href="#"
                className="mt-8 group/btn inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-xs font-bold uppercase tracking-wide text-white transition-all duration-300 hover:shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${track.accent}, ${track.accent}cc)`,
                  boxShadow: `0 4px 14px -2px ${track.accent}60`,
                }}
              >
                {track.cta}
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover/btn:translate-x-1"
                />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
