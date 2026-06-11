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
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="absolute top-0 h-full"
      style={{
        [side]: 0,
        opacity: side === "left" ? 0.18 : 0.88,
        height: "100%",
        width: "auto",
        maxWidth: side === "left" ? "42%" : "58%",
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
    window.dispatchEvent(new Event("open-codefest-registration"));
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 sm:pb-10">
      <Card
        className="
          relative overflow-hidden
          rounded-[28px]
          border-none

          sm:rounded-3xl
        "
        style={{
          background: "#0a2472",
          minHeight: 180,
        }}
      >
        {/* Background Mazes */}
        <MazeSVG side="left" />
        <MazeSVG side="right" />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#071a56]/85 via-[#0a2472]/70 to-transparent" />

        <CardContent
          className="
            relative z-10
            flex flex-col items-start gap-7
            px-5 py-8

            sm:px-8 sm:py-10
            lg:flex-row lg:items-center lg:justify-between
            lg:px-10
          "
        >
          {/* Content */}
          <div className="max-w-xl">
            <div
              className="
                inline-flex items-center gap-2
                rounded-full
                border border-white/10
                bg-white/5
                px-3 py-1.5
                backdrop-blur-sm
              "
            >
              <span className="h-2 w-2 rounded-full bg-[#f5c518]" />

              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-500">
                Final Challenge
              </span>
            </div>

            <h2
              className="
                mt-5
                text-[2rem] font-font uppercase
                leading-[0.95]
                tracking-[-1.5px]
                text-white

                sm:text-[2.6rem]
                lg:text-[2.8rem]
              "
            >
              Only a few will
              <br />
              find <span className="text-[#f5c518]">the exit.</span>
            </h2>

            <p
              className="
                mt-4
                max-w-md
                text-[14px] leading-relaxed
                text-white

                sm:text-[15px]
              "
            >
              The maze is ready. Are you prepared to solve the challenge,
              compete against top participants, and secure your place on the
              leaderboard?
            </p>
          </div>

          {/* CTA */}
          <div className="w-full sm:w-auto">
            <Button
              onClick={scrollToRegistration}
              className="
                h-[54px] w-full
                rounded-2xl
                bg-[#f5c518]
                px-7

                text-[13px] font-black uppercase
                tracking-[0.08em]
                text-[#0a0a0a]

                transition-all duration-300

                hover:scale-[1.02]
                hover:bg-[#f1cd45]

                sm:w-auto
              "
            >
              Register Now
              <ArrowRight size={16} strokeWidth={3} className="ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
