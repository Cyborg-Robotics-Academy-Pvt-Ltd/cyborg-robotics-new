"use client";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const MAZE = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const CELL = 16;
const COLS = MAZE[0].length;
const ROWS = MAZE.length;
const W = COLS * CELL;
const H = ROWS * CELL;

function MazeSVG({ side }: { side: "left" | "right" }) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="absolute top-0 h-full"
      style={{
        [side]: 0,
        opacity: side === "left" ? 0.22 : 0.9,
        height: "100%",
        width: "auto",
        maxWidth: side === "left" ? "38%" : "50%",
      }}
      preserveAspectRatio={side === "left" ? "xMinYMid meet" : "xMaxYMid meet"}
    >
      <defs>
        {side === "right" && (
          <>
            <radialGradient id="glow" cx="68%" cy="50%" r="45%">
              <stop offset="0%" stopColor="#f5c518" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#e8860a" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#0a2472" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="floor" cx="50%" cy="10%" r="80%">
              <stop offset="0%" stopColor="#f5c518" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f5c518" stopOpacity="0" />
            </radialGradient>
          </>
        )}
      </defs>

      {side === "right" && (
        <>
          <ellipse
            cx={W * 0.68}
            cy={H * 0.5}
            rx={W * 0.42}
            ry={H * 0.52}
            fill="url(#glow)"
          />
          <ellipse
            cx={W * 0.68}
            cy={H * 0.93}
            rx={W * 0.18}
            ry={H * 0.1}
            fill="url(#floor)"
          />
        </>
      )}

      {MAZE.map((row, r) =>
        row.map((cell, c) => {
          if (cell !== 1) return null;
          return (
            <rect
              key={`${r}-${c}`}
              x={c * CELL}
              y={r * CELL}
              width={CELL}
              height={CELL}
              fill={side === "right" ? "#1a3a8a" : "#2a4faa"}
              rx={1}
            />
          );
        }),
      )}

      {MAZE.map((row, r) =>
        row.map((cell, c) => {
          if (cell !== 0) return null;
          return (
            <rect
              key={`path-${r}-${c}`}
              x={c * CELL + 1}
              y={r * CELL + 1}
              width={CELL - 2}
              height={CELL - 2}
              fill="none"
              stroke="#3a5fc0"
              strokeWidth="0.4"
              opacity="0.5"
            />
          );
        }),
      )}

      {side === "right" &&
        (() => {
          const dx = 10 * CELL + 2;
          const dy = 1 * CELL;
          const dw = CELL - 4;
          const dh = CELL * 6;
          return (
            <g>
              <rect
                x={dx - 1}
                y={dy - 1}
                width={dw + 2}
                height={dh + 2}
                fill="#0f1a00"
                stroke="#c8790a"
                strokeWidth="1.5"
                rx="1"
              />
              <rect
                x={dx}
                y={dy}
                width={dw}
                height={dh}
                fill="#f5c518"
                opacity="0.93"
                rx="0.5"
              />
              <rect
                x={dx}
                y={dy}
                width={dw}
                height={dh}
                fill="white"
                opacity="0.25"
                rx="0.5"
              />
              <circle cx={dx + 3} cy={dy + dh * 0.52} r="1.8" fill="#b87008" />
            </g>
          );
        })()}
    </svg>
  );
}

export default function FinalCTA() {
  const scrollToRegistration = () => {
    document
      .getElementById("codefest-registration")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="mx-auto max-w-7xl px-6 pb-10">
      <Card
        className="relative overflow-hidden rounded-3xl border-none"
        style={{ background: "#0a2472", minHeight: 180 }}
      >
        <MazeSVG side="left" />
        <MazeSVG side="right" />

        <CardContent className="relative z-10 flex items-center justify-between px-10 py-10">
          <div className="max-w-xl">
            <h2
              className="font-black uppercase leading-tight"
              style={{
                fontSize: "clamp(1.4rem, 2.8vw, 2.3rem)",
                color: "#fff",
              }}
            >
              Only a few will find{" "}
              <span style={{ color: "#f5c518" }}>the exit.</span>
            </h2>
            <p className="mt-2 text-sm" style={{ color: "#93aee0" }}>
              The maze is ready. Are you?
            </p>
          </div>

          <Button
            onClick={scrollToRegistration}
            className="mr-32 h-auto whitespace-nowrap rounded-xl bg-[#f5c518] px-7 py-3.5 text-[14px] font-black uppercase tracking-[0.08em] text-[#0a0a0a] hover:bg-[#f1cd45]"
          >
            Register Now
            <ArrowRight size={16} strokeWidth={3} />
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
