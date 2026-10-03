"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Building2, Check, MonitorPlay, type LucideIcon } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils";

type ModeId = "offline" | "online";

interface Mode {
  readonly id: ModeId;
  readonly tab: string;
  readonly title: string;
  readonly features: readonly string[];
  readonly icon: LucideIcon;
}

const CONTENT = {
  kicker: "Flexible learning",
  title: "Online or Offline.",
  highlight: "Offline",
  description: "The learning journey stays Cyborg.",
} as const;

const MODES: readonly Mode[] = [
  {
    id: "offline",
    tab: "Offline",
    title: "Offline at Cyborg",
    features: [
      "Hands-on robotics kits",
      "Trainer interaction",
      "Physical building and testing",
      "Peer learning and classroom environment",
    ],
    icon: Building2,
  },
  {
    id: "online",
    tab: "Online",
    title: "Online with Cyborg",
    features: [
      "Live instructor-led classes",
      "Structured curriculum",
      "Robotics and coding projects",
      "Anywhere across the globe",
    ],
    icon: MonitorPlay,
  },
];

export default function LearningModes() {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState<ModeId>("offline");
  const tabRefs = useRef<Record<ModeId, HTMLButtonElement | null>>({
    offline: null,
    online: null,
  });

  const mode = MODES.find((m) => m.id === active) ?? MODES[0];
  const Icon = mode.icon;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const next: ModeId =
      e.key === "Home"
        ? "offline"
        : e.key === "End"
          ? "online"
          : active === "offline"
            ? "online"
            : "offline";
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section
      id="learning-modes"
      aria-labelledby="modes-heading"
      className="relative scroll-mt-28 overflow-hidden bg-zinc-50 py-16 lg:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/4 size-96 rounded-full bg-[#ff5a36]/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-[1180px] px-6">
        <SectionHeader id="modes-heading" {...CONTENT} />

        {/* Sliding toggle */}
        <div
          role="tablist"
          aria-label="Learning mode"
          onKeyDown={onKeyDown}
          className="relative mx-auto mb-8 flex w-fit rounded-full border border-zinc-200 bg-white p-1.5 shadow-sm"
        >
          {MODES.map((m) => {
            const isActive = m.id === active;
            const TabIcon = m.icon;
            return (
              <button
                key={m.id}
                ref={(el) => {
                  tabRefs.current[m.id] = el;
                }}
                type="button"
                role="tab"
                id={`mode-tab-${m.id}`}
                aria-selected={isActive}
                aria-controls="mode-panel"
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActive(m.id)}
                className={cn(
                  "relative flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d63a17] focus-visible:ring-offset-2",
                  isActive ? "text-white" : "text-zinc-600 hover:text-zinc-900",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="mode-pill"
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-[#d63a17] to-[#e8431f] shadow-md shadow-[#ff5a36]/30"
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 400, damping: 32 }
                    }
                  />
                )}
                <TabIcon aria-hidden="true" className="relative size-4" />
                <span className="relative">{m.tab}</span>
              </button>
            );
          })}
        </div>

        {/* Panel */}
        <div
          role="tabpanel"
          id="mode-panel"
          aria-labelledby={`mode-tab-${active}`}
          tabIndex={0}
          className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d63a17]"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
              transition={{
                duration: reduceMotion ? 0 : 0.25,
                ease: "easeOut",
              }}
              className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
            >
              <div className="relative overflow-hidden bg-gradient-to-br from-[#d63a17] to-[#e8431f] p-8 text-white sm:p-10">
                <Icon
                  aria-hidden="true"
                  strokeWidth={1}
                  className="pointer-events-none absolute -bottom-10 -right-10 size-56 text-white/15"
                />
                <span
                  aria-hidden="true"
                  className="grid size-14 place-items-center rounded-2xl bg-white/20"
                >
                  <Icon className="size-7" />
                </span>
                <h3 className="relative mt-6 text-balance text-3xl font-extrabold leading-tight tracking-tight">
                  {mode.title}
                </h3>
              </div>

              <ul role="list" className="grid content-center gap-4 p-8 sm:p-10">
                {mode.features.map((feature, i) => (
                  <motion.li
                    key={feature}
                    initial={{ opacity: 0, x: reduceMotion ? 0 : 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.3,
                      delay: reduceMotion ? 0 : 0.08 * i,
                    }}
                    className="flex items-start gap-3 text-base font-medium text-zinc-800"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-[#ff5a36]/10 text-[#d63a17]"
                    >
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                    {feature}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
