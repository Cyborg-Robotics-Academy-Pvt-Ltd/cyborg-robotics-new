import {
  Wrench,
  Code2,
  FlaskConical,
  ClipboardCheck,
  Swords,
  Trophy,
} from "lucide-react";
import { motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    num: "01",
    title: "Build",
    desc: "Design and build a robot that solves the challenge.",
    Icon: Wrench,
  },
  {
    num: "02",
    title: "Program",
    desc: "Bring your robot to life with code.",
    Icon: Code2,
  },
  {
    num: "03",
    title: "Test",
    desc: "Iterate, improve and make it better.",
    Icon: FlaskConical,
  },
  {
    num: "04",
    title: "Qualify",
    desc: "Earn your spot in the next round.",
    Icon: ClipboardCheck,
  },
  {
    num: "05",
    title: "Compete",
    desc: "Show your skills in the arena.",
    Icon: Swords,
  },
  { num: "06", title: "Win", desc: "Bring home the victory.", Icon: Trophy },
];

export function Vision() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" },
    },
  };

  const lineVariants: Variants = {
    hidden: { scaleX: 0 },
    visible: { scaleX: 1, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section
      id="vision"
      className="relative w-full overflow-hidden bg-[#0A0A0A] px-6 py-20 md:py-28"
    >
      {/* ambient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-[#DC2626]/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl">
        {/* heading */}
        <div className="mb-16 md:mb-24 max-w-xl">
          <div className="mb-5 flex items-center gap-2.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#DC2626]" />
            <span className="text-xs font-medium text-[#A3A3A3]">
              The process
            </span>
          </div>
          <h2 className="text-4xl font-bold leading-[1.1] tracking-tight text-white md:text-5xl">
            How it works
          </h2>
          <motion.span
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={lineVariants}
            style={{ transformOrigin: "left" }}
            className="mt-5 block h-px w-16 bg-[#DC2626]"
          />
          <p className="mt-5 text-sm leading-relaxed text-[#A3A3A3]">
            Six stages stand between your first sketch and the winner's podium.
          </p>
        </div>

        {/* stepper */}
        <div className="relative">
          <div className="pointer-events-none absolute left-[8.3%] right-[8.3%] top-6 hidden h-px bg-gradient-to-r from-transparent via-[#27272A] to-transparent md:block" />

          <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-6 md:gap-x-3"
          >
            {steps.map((step) => (
              <motion.div
                key={step.num}
                variants={itemVariants}
                className="group flex flex-col items-center text-center"
              >
                <div
                  className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2
                    border-[#27272A] bg-[#0A0A0A] transition-all duration-300
                    group-hover:border-[#DC2626] group-hover:shadow-[0_0_20px_-2px_rgba(220,38,38,0.5)]"
                >
                  <step.Icon
                    className="h-5 w-5 text-[#DC2626]"
                    strokeWidth={2}
                  />
                </div>

                <div
                  className="mt-5 w-full rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4
                    transition-all duration-300 group-hover:border-[#DC2626]/25 group-hover:bg-white/[0.04]"
                >
                  <span className="text-[11px] font-semibold text-[#DC2626]">
                    {step.num}
                  </span>
                  <h3 className="mt-1 text-sm font-bold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#A3A3A3]">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
