import {
  Lightbulb,
  PenTool,
  Code2,
  FlaskConical,
  Rocket,
  ChevronRight,
  CheckCircle2,
  Video,
  FileCode,
  MessageSquare,
  ArrowRight,
} from "lucide-react";

const STEPS = [
  {
    num: "01",
    icon: Lightbulb,
    color: "text-[#F97316]",
    ring: "ring-[#F97316]/40",
    badge: "bg-[#F97316]",
    label: "Define",
    desc: "Understand the productivity problem.",
  },
  {
    num: "02",
    icon: PenTool,
    color: "text-[#818CF8]",
    ring: "ring-[#818CF8]/40",
    badge: "bg-[#818CF8]",
    label: "Design",
    desc: "Plan your workflow and user experience.",
  },
  {
    num: "03",
    icon: Code2,
    color: "text-[#4ADE80]",
    ring: "ring-[#4ADE80]/40",
    badge: "bg-[#4ADE80]",
    label: "Code",
    desc: "Build your solution in Python.",
  },
  {
    num: "04",
    icon: FlaskConical,
    color: "text-[#38BDF8]",
    ring: "ring-[#38BDF8]/40",
    badge: "bg-[#38BDF8]",
    label: "Test",
    desc: "Find bugs. Improve. Repeat.",
  },
  {
    num: "05",
    icon: Rocket,
    color: "text-[#FB923C]",
    ring: "ring-[#FB923C]/40",
    badge: "bg-[#FB923C]",
    label: "Submit",
    desc: "Show us what you built.",
  },
];

const CHECKLIST = [
  "Application Built",
  "Code Checked",
  "Video Recorded",
  "Files Uploaded",
];

const SUBMISSION_ITEMS = [
  {
    icon: Video,
    title: "Project Video",
    desc: "Show us what your product does.",
  },
  { icon: FileCode, title: "Source Code", desc: "Submit your project files." },
  {
    icon: MessageSquare,
    title: "Product Explanation",
    desc: "Tell us the problem, approach and solution.",
  },
];

export default function Process() {
  return (
    <section id="timeline" className="scroll-mt-24 bg-[#0B1120] py-10">
      <div className="mx-auto max-w-[1300px] px-6 sm:px-8 lg:px-12 grid lg:grid-cols-[1.1fr_1fr] gap-12">
        {/* Build process */}
        <div>
          <p className="text-xs font-semibold tracking-wide text-[#38BDF8]">
            The Build Process
          </p>
          <h2 className="mt-3 font-extrabold text-3xl text-white">
            From idea &rarr; product
          </h2>

          <div className="mt-10 grid grid-cols-5 gap-x-1 sm:gap-x-2">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className="relative flex flex-col items-center text-center px-1"
              >
                {/* Icon circle with overlapping number badge */}
                <div className="relative">
                  <div
                    className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full ring-2 ${step.ring} bg-white/[0.02]`}
                  >
                    <step.icon
                      className={step.color}
                      size={20}
                      strokeWidth={1.8}
                    />
                  </div>
                  <span
                    className={`absolute -top-1.5 -right-1.5 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full ${step.badge} text-[#0B1120] text-[9px] sm:text-[10px] font-bold ring-2 ring-[#0B1120]`}
                  >
                    {step.num}
                  </span>
                </div>

                <p className="mt-3 font-bold text-xs sm:text-sm uppercase tracking-wide text-white">
                  {step.label}
                </p>
                <p className="mt-1 text-[10px] sm:text-[11px] leading-snug text-white/50">
                  {step.desc}
                </p>

                {i < STEPS.length - 1 && (
                  <ChevronRight
                    className="hidden sm:block absolute top-5 sm:top-6 -right-2 text-white/20"
                    size={14}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submission */}
        <div>
          <p className="text-xs font-semibold tracking-wide text-[#4ADE80]">
            Submission
          </p>
          <h2 className="mt-3 font-extrabold text-3xl">
            <span className="text-white">Rea</span>
            <span className="text-[#4ADE80]">dy to ship?</span>
          </h2>

          <div className="mt-6 grid grid-cols-2 gap-6">
            {/* Project Status */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>Project Status</span>
                <span className="font-semibold text-[#4ADE80]">100%</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-white/10">
                <div className="h-2 w-full rounded-full bg-[#4ADE80]" />
              </div>

              <ul className="mt-5 space-y-2">
                {CHECKLIST.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-xs text-white/80"
                  >
                    <CheckCircle2
                      size={14}
                      className="shrink-0 text-[#4ADE80]"
                    />{" "}
                    {item}
                  </li>
                ))}
              </ul>

              <p className="mt-5 flex items-center gap-2 text-xs font-semibold text-[#4ADE80]">
                <CheckCircle2 size={14} /> Status: Ready to submit
              </p>
            </div>

            {/* Submission Includes */}
            <div>
              <p className="text-xs font-semibold text-white/50">
                Submission includes
              </p>
              <ul className="mt-3 space-y-4">
                {SUBMISSION_ITEMS.map((item) => (
                  <li key={item.title} className="flex items-start gap-2">
                    <item.icon
                      className="mt-0.5 shrink-0 text-[#38BDF8]"
                      size={16}
                    />
                    <div>
                      <p className="text-xs font-semibold text-white">
                        {item.title}
                      </p>
                      <p className="text-[11px] leading-snug text-white/50">
                        {item.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <a
            href="#"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#4ADE80] px-6 py-3 text-sm font-semibold text-[#0B1120] hover:brightness-105 transition"
          >
            Submit Your Project <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
