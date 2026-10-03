import {
  Brain,
  Lightbulb,
  Wrench,
  RotateCcw,
  Target,
  Rocket,
  type LucideIcon,
} from "lucide-react";

import {
  BentoGrid,
  BentoGridItem,
  type BentoTone,
} from "@/components/ui/bento-grid";

interface Pillar {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly icon: LucideIcon;
  readonly tone: BentoTone;
  readonly className?: string;
}

const CONTENT = {
  kicker: "The real outcome",
  title: "Robotics is more than building robots.",
  description:
    "The robot is the tool. The real outcome is the child behind it.",
} as const;

const PILLARS: readonly Pillar[] = [
  {
    id: "logical-thinking",
    label: "Logical Thinking",
    description: "Breaking big problems into clear, ordered steps.",
    icon: Brain,
    tone: "brand",
    className: "md:col-span-2",
  },
  {
    id: "problem-solving",
    label: "Problem Solving",
    description: "Finding a way when the first idea fails.",
    icon: Lightbulb,
    tone: "amber",
  },
  {
    id: "build-experiment",
    label: "Build & Experiment",
    description: "Hands-on making, testing, improving.",
    icon: Wrench,
    tone: "teal",
  },
  {
    id: "learn-from-failure",
    label: "Learn from Failure",
    description: "Every bug is feedback, not a setback.",
    icon: RotateCcw,
    tone: "rose",
    className: "md:col-span-2",
  },
  {
    id: "focus-perseverance",
    label: "Focus & Perseverance",
    description: "Staying with a challenge until it works.",
    icon: Target,
    tone: "violet",
    className: "md:col-span-2",
  },
  {
    id: "creativity-confidence",
    label: "Creativity & Confidence",
    description: "Turning ideas into things they can show off.",
    icon: Rocket,
    tone: "orange",
  },
];

export default function WhyRobotics() {
  return (
    <section
      id="why"
      aria-labelledby="why-heading"
      className="scroll-mt-28 bg-white bg-[radial-gradient(60%_45%_at_50%_0%,#fff1ec,transparent)] py-16 lg:py-24"
    >
      <div className="mx-auto max-w-[1180px] px-6">
        <SectionHeader id="why-heading" {...CONTENT} />

        <BentoGrid>
          {PILLARS.map(
            ({ id, label, description, icon, tone, className }, index) => (
              <BentoGridItem
                key={id}
                index={index}
                title={label}
                description={description}
                icon={icon}
                tone={tone}
                className={className}
              />
            ),
          )}
        </BentoGrid>
      </div>
    </section>
  );
}

function SectionHeader({
  id,
  kicker,
  title,
  description,
}: {
  id?: string;
  kicker: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto mb-12 max-w-3xl text-center">
      <p className="inline-flex items-center rounded-full border border-[#ffd9cf] bg-[#fff1ec] px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#b8330e]">
        {kicker}
      </p>

      <h2
        id={id}
        className="mt-4 text-balance text-[clamp(1.875rem,4vw,3rem)] font-extrabold leading-[1.1] tracking-tight text-zinc-900"
      >
        {title}
      </h2>

      {description && (
        <p className="mx-auto mt-4 max-w-[65ch] text-pretty text-lg text-zinc-600">
          {description}
        </p>
      )}
    </div>
  );
}
