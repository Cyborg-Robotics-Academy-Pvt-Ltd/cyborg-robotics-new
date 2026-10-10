import { Lightbulb, Code2, Play, ChevronRight } from "lucide-react";

const STEPS = [
  {
    icon: Lightbulb,
    label: "Think",
    desc: "Turn a real-world problem into a solution.",
    bg: "#F57B2D",
  },
  {
    icon: Code2,
    label: "Build",
    desc: "Write functional Python code.",
    bg: "#3B5EE0",
  },
  {
    icon: Play,
    label: "Show",
    desc: "Present your product and explain your decisions.",
    bg: "#3FB65A",
  },
];

export default function About() {
  return (
    <section
      id="about"
      className="scroll-mt-24 bg-[#eef3fb] py-10 sm:py-10"
    >
      <div className="flex justify-center px-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-0">
          {/* Text column */}
          <div className="lg:pr-14 lg:max-w-md shrink-0">
            <p className="text-[#3B5EE0] font-bold tracking-wide text-xs uppercase">
              About
            </p>
            <h2 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl leading-tight text-ink">
              This isn&apos;t just a coding contest.
            </h2>
            <p className="mt-2 font-display font-bold text-xl sm:text-2xl text-[#F57B2D]">
              It&apos;s a product-building challenge.
            </p>
            <p className="mt-4 text-sm sm:text-base text-ink-muted leading-relaxed">
              Participants identify a{" "}
              <span className="font-semibold text-ink">
                productivity problem
              </span>
              , design a solution, write the code and present something that
              actually works.
            </p>
          </div>

          {/* Vertical divider */}
          <div className="hidden lg:block self-stretch w-px bg-black/15" />

          {/* Steps row */}
          <div className="flex items-start gap-6 sm:gap-10 lg:pl-14 flex-wrap justify-center lg:justify-start">
            {STEPS.map((step, i) => (
              <div
                key={step.label}
                className="flex items-start gap-6 sm:gap-10"
              >
                <div className="flex flex-col items-start w-32">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full shrink-0"
                    style={{ backgroundColor: step.bg }}
                  >
                    <step.icon
                      className="text-white"
                      size={22}
                      strokeWidth={2.25}
                    />
                  </div>
                  <p className="mt-4 font-display font-bold text-sm text-ink">
                    {step.label}
                  </p>
                  <p className="mt-1 text-xs text-ink-muted leading-snug">
                    {step.desc}
                  </p>
                </div>
                {i < STEPS.length - 1 && (
                  <ChevronRight
                    className="shrink-0 text-black/25 mt-4"
                    size={18}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
