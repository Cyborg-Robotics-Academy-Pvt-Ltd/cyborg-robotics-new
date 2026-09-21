// components/HeroOverlays.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";

interface OverlayStage {
  range: [number, number]; // scroll progress range 0–1
  align: "left" | "right" | "center";
  eyebrow?: string;
  sub?: string;
  cta?: string;
}

interface MechanismLabel {
  range: [number, number];
  name: string;
  detail: string;
  position: string;
  line: string;
}

const MECHANISM_LABELS: MechanismLabel[] = [
  {
    range: [0.18, 0.38],
    name: "Metallics Body",
    detail:
      "The complete robot chassis made from high-strength aluminum and steel",
    position: "left-[5%] top-[19%] md:left-[10%]",
    line: "left-full top-1/2 ml-3 h-px w-12 origin-left md:w-24",
  },
  {
    range: [0.32, 0.55],
    name: "High Torque Motors",
    detail: "Precision motors for agile movement and powerful lifts",
    position: "right-[5%] top-[39%] text-right md:right-[10%]",
    line: "right-full top-1/2 mr-3 h-px w-12 origin-right md:w-24",
  },
  {
    range: [0.5, 0.73],
    name: "Mecanum Wheels",
    detail: "Omnidirectional wheels for smooth and versatile movement",
    position: "left-[5%] top-[54%] md:left-[10%]",
    line: "left-full top-1/2 ml-3 h-px w-12 origin-left md:w-24",
  },
  {
    range: [0.68, 0.9],
    name: "Gyroscopic stabilizer",
    detail: "Advanced sensors for precise orientation and balance",
    position: "right-[5%] top-[66%] text-right md:right-[10%]",
    line: "right-full top-1/2 mr-3 h-px w-12 origin-right md:w-24",
  },
];

const EASE = [0.22, 1, 0.36, 1] as const; // slow, custom cubic-bezier

// Fade window at the edges of each stage's range, in progress units
const FADE_WINDOW = 0.03;

function opacityFor(progress: number, stage: Pick<OverlayStage, "range">) {
  const [start, end] = stage.range;
  if (progress < start - FADE_WINDOW || progress > end + FADE_WINDOW) return 0;
  if (progress < start + FADE_WINDOW) {
    return Math.min(1, (progress - (start - FADE_WINDOW)) / (2 * FADE_WINDOW));
  }
  if (progress > end - FADE_WINDOW) {
    return Math.max(0, (end + FADE_WINDOW - progress) / (2 * FADE_WINDOW));
  }
  return 1;
}

const alignClasses: Record<OverlayStage["align"], string> = {
  left: "items-start text-left left-8 md:left-16",
  right: "items-end text-right right-8 md:right-16",
  center: "items-center text-center inset-x-0",
};

export function HeroOverlays({
  progress,
  static: isStatic = false,
}: {
  progress: number;
  static?: boolean;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center">
      {!isStatic &&
        MECHANISM_LABELS.map((label) => {
          const labelOpacity = opacityFor(progress, label);
          if (labelOpacity <= 0.01) return null;

          return (
            <motion.div
              key={label.name}
              className={`absolute ${label.position}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: labelOpacity, y: 0 }}
              transition={{ duration: 0.55, ease: EASE }}
            >
              <span
                className={`absolute bg-[#C9A05C] ${label.line}`}
                style={{ opacity: 0.7 }}
              />
              <p className="label" style={{ color: "rgba(201,160,92,0.95)" }}>
                {label.name}
              </p>
              <p
                className="mt-1 text-xs"
                style={{ color: "rgba(237,232,224,0.58)" }}
              >
                {label.detail}
              </p>
            </motion.div>
          );
        })}
    </div>
  );
}
