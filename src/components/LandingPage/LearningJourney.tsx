"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  Sparkles,
  Hammer,
  Puzzle,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils";

type Tone = "amber" | "teal" | "violet" | "brand";

interface Step {
  readonly id: string;
  readonly number: string;
  readonly stage: string;
  readonly quote: string;
  readonly description: string;
  readonly skills: readonly string[];
  readonly icon: LucideIcon;
  readonly tone: Tone;
}

interface ToneStyles {
  readonly accent: string;
  readonly badge: string;
  readonly badgeShadow: string;
  readonly tabActive: string;
  readonly bar: string;
  readonly panel: string;
  readonly chip: string;
  readonly glow: string;
  readonly stroke: string;
  readonly spot: string;
}

// Static class strings so Tailwind can detect them.
const TONES: Record<Tone, ToneStyles> = {
  amber: {
    accent: "text-amber-700",
    badge: "bg-amber-700",
    badgeShadow: "shadow-amber-500/30",
    tabActive: "border-amber-400/60",
    bar: "bg-amber-500",
    panel: "from-white to-amber-50",
    chip: "border-amber-200 bg-amber-50/80 text-amber-900",
    glow: "bg-amber-400/20",
    stroke: "rgb(245 158 11 / 0.22)",
    spot: "[--spot:rgba(245,158,11,0.14)]",
  },
  teal: {
    accent: "text-teal-700",
    badge: "bg-teal-700",
    badgeShadow: "shadow-teal-500/30",
    tabActive: "border-teal-400/60",
    bar: "bg-teal-500",
    panel: "from-white to-teal-50",
    chip: "border-teal-200 bg-teal-50/80 text-teal-900",
    glow: "bg-teal-400/20",
    stroke: "rgb(20 184 166 / 0.22)",
    spot: "[--spot:rgba(20,184,166,0.14)]",
  },
  violet: {
    accent: "text-violet-700",
    badge: "bg-violet-600",
    badgeShadow: "shadow-violet-500/30",
    tabActive: "border-violet-400/60",
    bar: "bg-violet-500",
    panel: "from-white to-violet-50",
    chip: "border-violet-200 bg-violet-50/80 text-violet-900",
    glow: "bg-violet-400/20",
    stroke: "rgb(139 92 246 / 0.22)",
    spot: "[--spot:rgba(139,92,246,0.14)]",
  },
  brand: {
    accent: "text-[#d63a17]",
    badge: "bg-[#d63a17]",
    badgeShadow: "shadow-[#ff5a36]/30",
    tabActive: "border-[#ff5a36]/50",
    bar: "bg-[#ff5a36]",
    panel: "from-white to-orange-50",
    chip: "border-orange-200 bg-orange-50/80 text-orange-900",
    glow: "bg-[#ff5a36]/20",
    stroke: "rgb(255 90 54 / 0.22)",
    spot: "[--spot:rgba(255,90,54,0.14)]",
  },
};

const CONTENT = {
  kicker: "Learning by doing",
  title: "What happens when a child learns by creating?",
  description:
    "At Cyborg, students don't just watch. They build, code, test, troubleshoot and improve.",
} as const;

const AUTOPLAY_MS = 6000;

const STEPS: readonly Step[] = [
  {
    id: "discover",
    number: "01",
    stage: "Discover",
    quote: "My first robot!",
    description: "Curiosity turns into a hands-on experience.",
    skills: ["Curiosity", "Hands-on start"],
    icon: Sparkles,
    tone: "amber",
  },
  {
    id: "build",
    number: "02",
    stage: "Build",
    quote: "I can make this.",
    description: "Students learn through construction and experimentation.",
    skills: ["Construction", "Experimentation"],
    icon: Hammer,
    tone: "teal",
  },
  {
    id: "solve",
    number: "03",
    stage: "Solve",
    quote: "Why isn't it working?",
    description: "They debug, adapt and learn from what went wrong.",
    skills: ["Debugging", "Adapting"],
    icon: Puzzle,
    tone: "violet",
  },
  {
    id: "create",
    number: "04",
    stage: "Create",
    quote: "What can I build?",
    description: "Skills become confidence and independent creation.",
    skills: ["Confidence", "Independent projects"],
    icon: Rocket,
    tone: "brand",
  },
];

export default function LearningJourney() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const inView = useInView(sectionRef, { amount: 0.3 });

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const autoplay = !reduceMotion && !paused && inView;

  useEffect(() => {
    if (!autoplay) return;
    const t = setTimeout(
      () => setActive((i) => (i + 1) % STEPS.length),
      AUTOPLAY_MS,
    );
    return () => clearTimeout(t);
  }, [active, autoplay]);

  // Keep the active tab visible in the mobile horizontal strip.
  // Scrolls the strip only, never the page.
  useEffect(() => {
    const list = listRef.current;
    const wrapper = tabRefs.current[active]?.parentElement;
    if (!list || !wrapper || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({
      left: wrapper.offsetLeft - (list.clientWidth - wrapper.offsetWidth) / 2,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [active, reduceMotion]);

  const select = useCallback((index: number, focus = false) => {
    setActive(index);
    if (focus) tabRefs.current[index]?.focus();
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = STEPS.length - 1;
    const map: Record<string, number> = {
      ArrowDown: active === last ? 0 : active + 1,
      ArrowRight: active === last ? 0 : active + 1,
      ArrowUp: active === 0 ? last : active - 1,
      ArrowLeft: active === 0 ? last : active - 1,
      Home: 0,
      End: last,
    };
    if (e.key in map) {
      e.preventDefault();
      select(map[e.key], true);
    }
  };

  // Writes CSS vars directly: no React re-render on pointer move.
  const onPanelPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (reduceMotion || e.pointerType !== "mouse") return;
    const el = e.currentTarget;
    const { left, top } = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - left}px`);
    el.style.setProperty("--my", `${e.clientY - top}px`);
  };

  const step = STEPS[active];
  const t = TONES[step.tone];
  const Icon = step.icon;

  const content: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduceMotion ? 0 : 0.07 } },
    exit: {
      opacity: 0,
      y: reduceMotion ? 0 : -8,
      transition: { duration: 0.2 },
    },
  };
  const child: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 14 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduceMotion ? 0 : 0.35, ease: "easeOut" },
    },
  };

  return (
    <section
      ref={sectionRef}
      id="journey"
      aria-labelledby="journey-heading"
      className="relative scroll-mt-28 overflow-hidden bg-zinc-50 py-16 lg:py-24"
    >
      {/* Background: dot grid + tone-reactive glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background-image:radial-gradient(#d4d4d8_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -right-32 top-1/3 size-96 rounded-full blur-3xl transition-colors duration-700",
          t.glow,
        )}
      />

      <div className="relative mx-auto max-w-[1180px] px-6">
        <SectionHeader id="journey-heading" {...CONTENT} />

        <div
          className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          {/* Tabs */}
          <div
            ref={listRef}
            role="tablist"
            aria-label="Learning journey steps"
            aria-orientation="vertical"
            onKeyDown={onKeyDown}
            className="relative -mx-6 flex snap-x gap-3 overflow-x-auto px-6 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0"
          >
            {STEPS.map((s, i) => {
              const isActive = i === active;
              const st = TONES[s.tone];
              const isLast = i === STEPS.length - 1;
              return (
                <div
                  key={s.id}
                  role="presentation"
                  className="relative min-w-[15rem] shrink-0 snap-start lg:min-w-0"
                >
                  <button
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`journey-tab-${s.id}`}
                    aria-selected={isActive}
                    aria-controls="journey-panel"
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => select(i)}
                    className={cn(
                      "relative w-full overflow-hidden rounded-2xl border p-4 text-left",
                      "transition-[background-color,box-shadow,border-color,transform] duration-300",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d63a17] focus-visible:ring-offset-2",
                      isActive
                        ? cn(
                            "bg-white shadow-lg lg:translate-x-1.5",
                            st.tabActive,
                          )
                        : "border-zinc-200 bg-white/60 hover:bg-white",
                    )}
                  >
                    <span className="flex items-center gap-4">
                      <span
                        className={cn(
                          "grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors",
                          isActive
                            ? cn(st.badge, "text-white")
                            : i < active
                              ? cn(st.badge, "text-white/90 opacity-70")
                              : "bg-zinc-100 text-zinc-600",
                        )}
                      >
                        {s.number}
                      </span>
                      <span>
                        <span
                          className={cn(
                            "block text-xs font-bold uppercase tracking-widest",
                            st.accent,
                          )}
                        >
                          {s.stage}
                        </span>
                        <span className="block text-base font-bold tracking-tight text-zinc-900">
                          {s.quote}
                        </span>
                      </span>
                    </span>

                    {/* Progress bar: animates while autoplaying, static when paused */}
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 h-1 bg-zinc-100"
                      >
                        <motion.span
                          key={`${active}-${autoplay}`}
                          className={cn(
                            "block h-full origin-left",
                            st.bar,
                            !autoplay && "opacity-40",
                          )}
                          initial={{ scaleX: autoplay ? 0 : 1 }}
                          animate={{ scaleX: 1 }}
                          transition={{
                            duration: autoplay ? AUTOPLAY_MS / 1000 : 0,
                            ease: "linear",
                          }}
                        />
                      </span>
                    )}
                  </button>

                  {/* Connector to next step (desktop) */}
                  {!isLast && (
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute -bottom-3 left-9 hidden h-3 w-0.5 transition-colors duration-500 lg:block",
                        i < active ? st.bar : "bg-zinc-200",
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Detail panel */}
          <div
            role="tabpanel"
            id="journey-panel"
            aria-labelledby={`journey-tab-${step.id}`}
            tabIndex={0}
            onPointerMove={onPanelPointerMove}
            className={cn(
              "group/panel relative min-h-[24rem] overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br p-8 shadow-xl transition-colors duration-500 sm:p-10",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d63a17]",
              t.panel,
              t.spot,
            )}
          >
            {/* Cursor spotlight */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/panel:opacity-100 motion-reduce:hidden [background:radial-gradient(320px_circle_at_var(--mx,50%)_var(--my,50%),var(--spot),transparent_70%)]"
            />

            {/* Watermark numeral */}
            <AnimatePresence mode="wait">
              <motion.span
                key={`num-${step.id}`}
                aria-hidden="true"
                initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.3 }}
                style={{ WebkitTextStroke: `2px ${t.stroke}` }}
                className="pointer-events-none absolute -bottom-6 right-4 hidden select-none text-[7rem] font-black leading-none text-transparent sm:block sm:text-[9rem]"
              >
                {step.number}
              </motion.span>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                variants={content}
                initial="hidden"
                animate="show"
                exit="exit"
                className="relative flex h-full flex-col sm:max-w-[68%]"
              >
                <motion.span
                  variants={child}
                  aria-hidden="true"
                  className={cn(
                    "grid size-14 place-items-center rounded-2xl text-white shadow-lg",
                    t.badge,
                    t.badgeShadow,
                  )}
                >
                  <motion.span
                    className="grid place-items-center"
                    animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Icon className="size-7" />
                  </motion.span>
                </motion.span>

                <motion.p
                  variants={child}
                  className={cn(
                    "mt-6 text-sm font-bold uppercase tracking-widest",
                    t.accent,
                  )}
                >
                  Step {step.number} · {step.stage}
                </motion.p>
                <motion.h3
                  variants={child}
                  className="mt-2 text-balance text-[clamp(1.75rem,3vw,2.5rem)] font-extrabold leading-tight tracking-tight text-zinc-900"
                >
                  {step.quote}
                </motion.h3>
                <motion.p
                  variants={child}
                  className="mt-3 max-w-[40ch] text-pretty text-lg text-zinc-600"
                >
                  {step.description}
                </motion.p>

                <motion.ul
                  variants={child}
                  role="list"
                  className="mt-6 flex flex-wrap gap-2"
                >
                  {step.skills.map((skill) => (
                    <li
                      key={skill}
                      className={cn(
                        "rounded-full border px-3 py-1 text-sm font-medium backdrop-blur",
                        t.chip,
                      )}
                    >
                      {skill}
                    </li>
                  ))}
                </motion.ul>
              </motion.div>
            </AnimatePresence>

            {/* Step dots */}
            <div
              aria-hidden="true"
              className="absolute bottom-6 left-8 flex gap-1.5 sm:left-10"
            >
              {STEPS.map((s, i) => (
                <span
                  key={s.id}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === active ? cn("w-6", t.bar) : "w-1.5 bg-zinc-300",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
