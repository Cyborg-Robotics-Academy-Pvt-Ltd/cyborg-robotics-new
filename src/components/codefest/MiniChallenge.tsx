// src/features/codefest/components/MiniChallenge.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const COLS = 18;
const ROWS = 12;
const PLAYER_SIZE = 0.28;
const MAZE_ATTEMPTS = 18;
const BASE_SCORE = 15000;
const SCORE_DECAY_PER_SECOND = 140;

type Cell = {
  c: number;
  r: number;
  walls: { N: boolean; E: boolean; S: boolean; W: boolean };
  visited: boolean;
};

function generateMaze(): Cell[] {
  const grid: Cell[] = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      grid.push({
        c,
        r,
        walls: { N: true, E: true, S: true, W: true },
        visited: false,
      });
    }
  }

  const idx = (c: number, r: number) => r * COLS + c;
  const opp = { N: "S", S: "N", E: "W", W: "E" } as const;

  let stack: Cell[] = [];
  let cur = grid[0];
  cur.visited = true;
  let count = 1;

  while (count < grid.length) {
    const { c, r } = cur;
    const neighbors: { cell: Cell; dir: keyof typeof opp }[] = [];

    if (r > 0 && !grid[idx(c, r - 1)].visited)
      neighbors.push({ cell: grid[idx(c, r - 1)], dir: "N" });
    if (c < COLS - 1 && !grid[idx(c + 1, r)].visited)
      neighbors.push({ cell: grid[idx(c + 1, r)], dir: "E" });
    if (r < ROWS - 1 && !grid[idx(c, r + 1)].visited)
      neighbors.push({ cell: grid[idx(c, r + 1)], dir: "S" });
    if (c > 0 && !grid[idx(c - 1, r)].visited)
      neighbors.push({ cell: grid[idx(c - 1, r)], dir: "W" });

    if (neighbors.length) {
      const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
      stack.push(cur);
      cur.walls[pick.dir] = false;
      pick.cell.walls[opp[pick.dir]] = false;
      cur = pick.cell;
      cur.visited = true;
      count++;
    } else if (stack.length) {
      cur = stack.pop()!;
    } else {
      break;
    }
  }

  grid[idx(0, 0)].walls.W = false;
  grid[idx(COLS - 1, ROWS - 1)].walls.E = false;
  return grid;
}

function getShortestPathLength(grid: Cell[]) {
  const idx = (c: number, r: number) => r * COLS + c;
  const visited = new Set<number>([0]);
  const queue: Array<{ c: number; r: number; distance: number }> = [
    { c: 0, r: 0, distance: 0 },
  ];

  while (queue.length) {
    const current = queue.shift()!;
    if (current.c === COLS - 1 && current.r === ROWS - 1)
      return current.distance;

    const cell = grid[idx(current.c, current.r)];
    const neighbors = [
      { blocked: cell.walls.N, c: current.c, r: current.r - 1 },
      { blocked: cell.walls.E, c: current.c + 1, r: current.r },
      { blocked: cell.walls.S, c: current.c, r: current.r + 1 },
      { blocked: cell.walls.W, c: current.c - 1, r: current.r },
    ];

    for (const neighbor of neighbors) {
      if (
        neighbor.blocked ||
        neighbor.c < 0 ||
        neighbor.c >= COLS ||
        neighbor.r < 0 ||
        neighbor.r >= ROWS
      )
        continue;
      const neighborIndex = idx(neighbor.c, neighbor.r);
      if (visited.has(neighborIndex)) continue;
      visited.add(neighborIndex);
      queue.push({
        c: neighbor.c,
        r: neighbor.r,
        distance: current.distance + 1,
      });
    }
  }
  return -1;
}

function buildMaze(): Cell[] {
  let bestMaze = generateMaze();
  let bestDistance = getShortestPathLength(bestMaze);

  for (let attempt = 1; attempt < MAZE_ATTEMPTS; attempt++) {
    const candidate = generateMaze();
    const candidateDistance = getShortestPathLength(candidate);
    if (candidateDistance > bestDistance) {
      bestMaze = candidate;
      bestDistance = candidateDistance;
    }
  }
  return bestMaze;
}

function getLiveScore(elapsed: number) {
  return Math.max(
    1000,
    Math.round(BASE_SCORE - elapsed * SCORE_DECAY_PER_SECOND),
  );
}

// ── Draws a dashed curved arrow pointing to (tipX, tipY) ──
function drawStartArrow(
  ctx: CanvasRenderingContext2D,
  tipX: number,
  tipY: number,
) {
  // Arrow tip points to player start cell
  // Curve starts from further away (top-left offset)
  const startX = tipX - 60;
  const startY = tipY - 55;
  const cp1X = tipX - 50;
  const cp1Y = tipY - 10;
  const cp2X = tipX - 20;
  const cp2Y = tipY - 5;

  ctx.save();
  ctx.setLineDash([5, 4]);
  ctx.strokeStyle = "#8B1A2B";
  ctx.lineWidth = 2;
  ctx.shadowColor = "rgba(139,26,43,0.25)";
  ctx.shadowBlur = 4;

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, tipX, tipY);
  ctx.stroke();

  // Reset dash for arrowhead
  ctx.setLineDash([]);

  // Draw filled arrowhead at tip
  // Compute tangent direction at end of bezier
  const t = 0.98;
  const ax =
    3 * (1 - t) * (1 - t) * (cp1X - startX) +
    6 * (1 - t) * t * (cp2X - cp1X) +
    3 * t * t * (tipX - cp2X);
  const ay =
    3 * (1 - t) * (1 - t) * (cp1Y - startY) +
    6 * (1 - t) * t * (cp2Y - cp1Y) +
    3 * t * t * (tipY - cp2Y);
  const angle = Math.atan2(ay, ax);
  const headLen = 10;

  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(
    tipX - headLen * Math.cos(angle - Math.PI / 6),
    tipY - headLen * Math.sin(angle - Math.PI / 6),
  );
  ctx.lineTo(
    tipX - headLen * Math.cos(angle + Math.PI / 6),
    tipY - headLen * Math.sin(angle + Math.PI / 6),
  );
  ctx.closePath();
  ctx.fillStyle = "#8B1A2B";
  ctx.fill();

  // "Start here" label at arrow origin
  ctx.shadowBlur = 0;
  ctx.setLineDash([]);
  ctx.font = "bold 11px sans-serif";
  ctx.fillStyle = "#8B1A2B";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText("Start here", startX + 5, startY - 4);

  ctx.restore();
}

type MiniChallengeProps = {
  onScoreChange?: (score: number) => void;
  onFinish?: (score: number, elapsed: number) => void;
};

export default function MiniChallenge({
  onScoreChange,
  onFinish,
}: MiniChallengeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerLogoRef = useRef<HTMLImageElement | null>(null);

  const [gameState, setGameState] = useState<"idle" | "playing" | "won">(
    "idle",
  );
  const [elapsed, setElapsed] = useState(0);
  const [score, setScore] = useState(BASE_SCORE);

  const grid = useRef<Cell[]>([]);
  const player = useRef({ c: 0, r: 0 });
  const startTime = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameStateRef = useRef<"idle" | "playing" | "won">("idle");

  // Keep ref in sync so draw() can read latest state without stale closure
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const CW = canvas.width / COLS;
    const CH = canvas.height / ROWS;

    // ── Background ──
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ── Subtle warm cell fill ──
    for (const cell of grid.current) {
      const x = cell.c * CW;
      const y = cell.r * CH;
      ctx.fillStyle = "#FAF8F5";
      ctx.fillRect(x + 1, y + 1, CW - 1, CH - 1);
    }

    // ── Maze walls ──
    ctx.strokeStyle = "#8B1A2B";
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(139,26,43,0.12)";
    ctx.shadowBlur = 2;

    for (const cell of grid.current) {
      const x = cell.c * CW;
      const y = cell.r * CH;

      if (cell.walls.N) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + CW, y);
        ctx.stroke();
      }
      if (cell.walls.E) {
        ctx.beginPath();
        ctx.moveTo(x + CW, y);
        ctx.lineTo(x + CW, y + CH);
        ctx.stroke();
      }
      if (cell.walls.S) {
        ctx.beginPath();
        ctx.moveTo(x, y + CH);
        ctx.lineTo(x + CW, y + CH);
        ctx.stroke();
      }
      if (cell.walls.W) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + CH);
        ctx.stroke();
      }
    }

    ctx.shadowBlur = 0;

    // ── Exit ──
    const ex = (COLS - 1) * CW;
    const ey = (ROWS - 1) * CH;

    ctx.shadowColor = "#16a34a";
    ctx.shadowBlur = 12;
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(ex + 4, ey + 4, CW - 8, CH - 8);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("EXIT", ex + CW / 2, ey + CH / 2);

    // ── Dashed curved "Start here" arrow — only on idle ──
    if (gameStateRef.current === "idle") {
      const tipX = 0 * CW + CW / 2; // player start cell center
      const tipY = 0 * CH + CH / 2;
      drawStartArrow(ctx, tipX, tipY);
    }

    // ── Player ──
    const centerX = player.current.c * CW + CW / 2;
    const centerY = player.current.r * CH + CH / 2;
    const radius = Math.min(CW, CH) * PLAYER_SIZE;
    const logo = playerLogoRef.current;

    ctx.shadowColor = "#8B1A2B";
    ctx.shadowBlur = 14;

    if (logo) {
      ctx.save();

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 3, 0, Math.PI * 2);
      ctx.fillStyle = "#8B1A2B";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 1, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(
        logo,
        centerX - radius,
        centerY - radius,
        radius * 2,
        radius * 2,
      );

      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.fillStyle = "#8B1A2B";
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.fillStyle = "#F5C518";
      ctx.arc(centerX, centerY, radius * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
  }, []);

  const startGame = useCallback(() => {
    grid.current = buildMaze();
    player.current = { c: 0, r: 0 };
    startTime.current = Date.now();

    setElapsed(0);
    setScore(BASE_SCORE);
    onScoreChange?.(BASE_SCORE);
    setGameState("playing");
    gameStateRef.current = "playing";

    if (timerRef.current !== null) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      const nextElapsed = parseFloat(
        ((Date.now() - startTime.current) / 1000).toFixed(1),
      );
      const nextScore = getLiveScore(nextElapsed);

      setElapsed(nextElapsed);
      setScore(nextScore);
      onScoreChange?.(nextScore);
    }, 100);

    setTimeout(draw, 0);
  }, [draw, onScoreChange]);

  const move = useCallback(
    (dc: number, dr: number) => {
      if (gameStateRef.current !== "playing") return;

      const { c, r } = player.current;
      const idx = (col: number, row: number) => row * COLS + col;
      const cell = grid.current[idx(c, r)];

      if (dc === 1 && !cell.walls.E && c < COLS - 1)
        player.current = { c: c + 1, r };
      else if (dc === -1 && !cell.walls.W && c > 0)
        player.current = { c: c - 1, r };
      else if (dr === 1 && !cell.walls.S && r < ROWS - 1)
        player.current = { c, r: r + 1 };
      else if (dr === -1 && !cell.walls.N && r > 0)
        player.current = { c, r: r - 1 };

      draw();

      if (player.current.c === COLS - 1 && player.current.r === ROWS - 1) {
        if (timerRef.current !== null) clearInterval(timerRef.current);
        setGameState("won");
        gameStateRef.current = "won";
        const finalElapsed = parseFloat(
          ((Date.now() - startTime.current) / 1000).toFixed(1),
        );
        const finalScore = getLiveScore(finalElapsed) + 500;
        setElapsed(finalElapsed);
        setScore(finalScore);
        onScoreChange?.(finalScore);
        onFinish?.(finalScore, finalElapsed);
      }
    },
    [draw, onFinish, onScoreChange],
  );

  useEffect(() => {
    const logo = new window.Image();
    logo.src = "/cyborglogo.png";
    logo.onload = () => {
      playerLogoRef.current = logo;
      draw();
    };
    return () => {
      playerLogoRef.current = null;
    };
  }, [draw]);

  useEffect(() => {
    grid.current = buildMaze();
    draw();
  }, [draw]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      const isTypingTarget =
        tagName === "input" ||
        tagName === "textarea" ||
        tagName === "select" ||
        target?.isContentEditable;

      if (isTypingTarget) {
        return;
      }

      const map: Record<string, [number, number]> = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        w: [0, -1],
        s: [0, 1],
        a: [-1, 0],
        d: [1, 0],
      };
      if (map[e.key]) {
        e.preventDefault();
        move(...map[e.key]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#8B1A2B] p-6 text-white shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
      <div className="absolute top-0 right-0 h-52 w-52 rounded-full bg-[#F5C518]/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-44 w-44 rounded-full bg-white/5 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.35em] text-yellow-300">
              Mini Challenge
            </p>
            <h2 className="text-4xl font-black tracking-tight">
              Escape The Maze
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
              Use arrow keys or WASD to navigate through the maze and reach the
              glowing exit as quickly as possible.
            </p>
          </div>

          <div className="grid min-w-[180px] grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-md">
              <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-white/50">
                Timer
              </p>
              <p className="tabular-nums text-md  text-yellow-300">
                {elapsed.toFixed(1)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-md">
              <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-white/50">
                Score
              </p>
              <p className="tabular-nums text-md  text-white">
                {score.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Maze */}
        <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/5 p-3 backdrop-blur-xl">
          <canvas
            ref={canvasRef}
            width={700}
            height={420}
            className="w-full rounded-2xl border-2 border-[#8B1A2B]/30 bg-white"
          />
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <kbd className="rounded-lg border border-white/10 bg-black/20 px-2 py-1">
              WASD
            </kbd>
            <span>or</span>
            <kbd className="rounded-lg border border-white/10 bg-black/20 px-2 py-1">
              ↑ ↓ ← →
            </kbd>
          </div>

          <div className="flex items-center gap-3">
            {gameState === "won" && (
              <div className="rounded-2xl border border-green-400/20 bg-green-500/15 px-4 py-2 text-sm font-bold text-green-300">
                Escaped in {elapsed.toFixed(1)}s with {score.toLocaleString()}{" "}
                points
              </div>
            )}
            <button
              onClick={startGame}
              className="rounded-2xl bg-yellow-400 px-5 py-3 font-black text-black shadow-lg shadow-yellow-500/20 transition-all duration-300 hover:scale-105 hover:bg-yellow-300 active:scale-95"
            >
              {gameState === "playing"
                ? "Restart"
                : gameState === "won"
                  ? "Play Again"
                  : "Start Challenge"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
