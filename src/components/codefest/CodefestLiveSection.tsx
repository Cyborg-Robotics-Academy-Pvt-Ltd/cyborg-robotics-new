"use client";

import { FormEvent, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Gift, MapPin, Megaphone, Star, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebase";

import MiniChallenge from "./MiniChallenge";
import RegistrationForm from "./RegistrationForm";
import RewardsSection from "./RewardsSection";
import Image from "next/image";

type PendingResult = {
  score: number;
  time: number;
};

type TopParticipant = {
  name: string;
  state: string;
  initials: string;
};

const TOP_5: TopParticipant[] = [
  { name: "Ankush Mensi", state: "Karnataka", initials: "AM" },
  { name: "Ansh Arpit Agrawal", state: "Maharashtra", initials: "AA" },
  { name: "Viaan Soni", state: "Gujarat", initials: "VS" },
  { name: "Keerat Goyal", state: "Haryana", initials: "KG" },
  { name: "Nimrat Pahwa", state: "Maharashtra", initials: "NP" },
];
const AVATAR_GRADIENTS = [
  "from-[#C81E1E] to-[#E24B4A]", // AM — deep red → coral
  "from-[#1E3A8A] to-[#1E40AF]", // AA — royal navy
  "from-[#C81E1E] to-[#E24B4A]", // VS — deep red → coral
  "from-[#1D4ED8] to-[#2563EB]", // KG — brighter blue, distinct from AA
  "from-[#6D28D9] to-[#BE185D]", // NP — purple → magenta/pink
];
const CONFETTI_COLORS = ["#FAC775", "#F0997B", "#AFA9EC", "#85B7EB"];

// Loose client-side sanity bounds. This does NOT make the leaderboard
// tamper-proof (client score is still trusted) — it only blocks obviously
// broken/garbage writes before they hit "final review". Real integrity
// needs a Firestore security rule + manual/server verification.
const MAX_PLAUSIBLE_SCORE = 100_000;
const MIN_PLAUSIBLE_TIME = 0.1;

const fmtTime = (v: unknown) =>
  typeof v === "number" && isFinite(v) ? v.toFixed(1) + "s" : "-";
const fmtScore = (v: unknown) =>
  typeof v === "number" && isFinite(v) ? v.toLocaleString() : "0";

function Confetti({ seed, className }: { seed: number; className?: string }) {
  const dots = [
    { top: "10%", left: "15%", size: 5 },
    { top: "55%", left: "0%", size: 4 },
    { top: "25%", left: "70%", size: 4 },
    { top: "70%", left: "60%", size: 5 },
    { top: "5%", left: "50%", size: 3 },
  ];
  return (
    <div className={`pointer-events-none absolute inset-0 ${className ?? ""}`}>
      {dots.map((d, i) => (
        <span
          key={i}
          className="confetti-dot absolute rounded-full"
          style={{
            top: d.top,
            left: d.left,
            width: d.size,
            height: d.size,
            backgroundColor:
              CONFETTI_COLORS[(i + seed) % CONFETTI_COLORS.length],
            opacity: 0.75,
            animationDelay: `${(i + seed) * 0.35}s`,
          }}
        />
      ))}
    </div>
  );
}

function TrophyIllustration() {
  return (
    <div className="relative hidden h-[150px] w-[180px] shrink-0 items-center justify-center sm:flex">
      <Confetti seed={0} className="scale-125" />

      <div className="trophy-float relative z-[1] h-full w-full">
        <Image
          src="/assets/codefest/trophy-illustration.png"
          alt="Trophy illustration"
          fill
          className="object-contain"
          priority
        />
      </div>

      <style jsx>{`
        .trophy-float {
          animation: trophyFloat 3.2s ease-in-out infinite;
        }
        @keyframes trophyFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        :global(.confetti-dot) {
          animation: confettiDrift 2.6s ease-in-out infinite;
        }
        @keyframes confettiDrift {
          0%,
          100% {
            transform: translateY(0) scale(1);
            opacity: 0.4;
          }
          50% {
            transform: translateY(-4px) scale(1.15);
            opacity: 0.85;
          }
        }
      `}</style>
    </div>
  );
}

function ResultAnnouncement() {
  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col overflow-hidden rounded-[24px] border border-[#e3ecfa] bg-white shadow-[0_8px_30px_rgba(8,44,120,0.08)]">
      {/* HERO HEADER — compact, smaller type */}
      <div className="relative flex flex-col gap-3 overflow-hidden bg-gradient-to-br from-white to-[#f2f7ff] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(rgba(8,44,120,0.05) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative min-w-0">
          <span className="inline-flex items-center rounded-full bg-[#e6f1fb] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#082c78]">
            Result
          </span>

          <h2 className="mt-2 text-xl font-extrabold leading-tight text-[#082c78] sm:text-2xl">
            Top 5 Participants
          </h2>

          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#e6f1fb] py-1 pl-1.5 pr-3 ring-1 ring-[#cfe0f7]">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0855AB]">
              <Megaphone className="h-3 w-3 text-white" strokeWidth={2.25} />
            </span>
            <p className="text-xs font-semibold text-[#0c447c]">
              Final results will be announced soon
            </p>
          </div>
        </div>
      </div>

      {/* PARTICIPANT LIST — tighter rows, no decorative icons */}
      <div className="flex flex-col gap-2 px-6 py-3 sm:px-8">
        {TOP_5.map((p, i) => (
          <div
            key={p.name}
            className="participant-row flex items-center gap-3 rounded-[16px] border border-[#eef1f6] bg-white px-4 py-2.5 shadow-[0_2px_10px_rgba(8,44,120,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#cfe0f7] hover:shadow-[0_10px_24px_rgba(8,44,120,0.09)] sm:gap-4 sm:px-6 w-auto"
            style={{ animationDelay: `${i * 90}ms` }}
          >
            {/* rank number instead of star badge */}
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f2f7ff] text-xs font-bold text-[#0855AB]">
              {i + 1}
            </div>

            {/* avatar — smaller */}
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-sm font-black text-white shadow-sm ring-2 ring-white sm:h-10 sm:w-10 ${AVATAR_GRADIENTS[i]}`}
            >
              {p.initials}
            </div>

            {/* name + state */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-[#0a2664] sm:text-base">
                {p.name}
              </p>
              <div className="mt-0.5 flex items-center gap-1">
                <MapPin className="h-3 w-3 shrink-0 text-[#5f6b85]" />
                <p className="truncate text-xs font-medium text-[#5f6b85]">
                  {p.state}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="flex items-center gap-2.5 border-t border-[#eef1f6] bg-[#f2f7ff] px-6 py-3 sm:px-8">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e6f1fb]">
          <Gift className="h-[14px] w-[14px] text-[#0855AB]" />
        </span>
        <p className="text-xs font-medium text-[#0c447c]">
          Winners&apos; certificates and prizes to be shared after final review
        </p>
      </div>

      <style jsx>{`
        .participant-row {
          animation: rowFadeUp 0.5s ease both;
        }
        @keyframes rowFadeUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .participant-row {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
export default function CodefestLiveSection() {
  const [pendingResult, setPendingResult] = useState<PendingResult | null>(
    null,
  );
  const [playerName, setPlayerName] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleScoreSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!pendingResult) return;

    const trimmedName = playerName.trim();
    if (!trimmedName) {
      setSaveError("Please enter your name to save your score.");
      return;
    }

    // Loose client-side guard against garbage/broken values. This is NOT
    // anti-cheat — the score/time are still fully client-controlled and a
    // motivated user can spoof them via devtools. Real protection needs a
    // Firestore security rule bounding these fields server-side, and/or
    // computing the score from a server-verified move log.
    if (
      pendingResult.score < 0 ||
      pendingResult.score > MAX_PLAUSIBLE_SCORE ||
      pendingResult.time < MIN_PLAUSIBLE_TIME
    ) {
      setSaveError("Something looks off with your result. Please try again.");
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      await addDoc(collection(db, "codefestGameRecords"), {
        name: trimmedName,
        score: pendingResult.score,
        time: pendingResult.time,
        game: "escape-the-maze",
        verified: false, // flip to true during manual/admin review before prize decisions
        createdAt: serverTimestamp(),
      });

      setPendingResult(null);
      setPlayerName("");
    } catch (err) {
      console.error("Failed to save CodeFest score:", err);
      setSaveError("Could not save your score. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <section className="mx-auto h-auto grid w-full items-stretch gap-3 px-6 py-1 lg:grid-cols-[5fr_6fr]">
        <MiniChallenge
          onFinish={(score, elapsed) => {
            setPendingResult({ score, time: elapsed });
            setSaveError(null);
          }}
        />
        <div id="codefest-registration" className="scroll-mt-28">
          <ResultAnnouncement />
        </div>
      </section>

      {pendingResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6 sm:px-6">
          <Card className="w-full max-w-md rounded-[24px] border border-white/10 bg-white shadow-2xl sm:rounded-[28px]">
            <CardHeader className="px-5 pb-3 pt-5 sm:px-6 sm:pt-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8B1A2B] sm:text-xs sm:tracking-[0.3em]">
                Challenge Complete
              </p>
              <CardTitle className="mt-1.5 text-[1.5rem] font-black leading-tight text-[#082c78] sm:text-[1.75rem]">
                Save your score
              </CardTitle>
              <p className="text-[13px] leading-relaxed text-gray-500 sm:text-sm">
                You finished in {fmtTime(pendingResult.time)} with{" "}
                {fmtScore(pendingResult.score)} points. Enter your name to save
                this run for CodeFest review.
              </p>
            </CardHeader>

            <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
              <form onSubmit={handleScoreSubmit} className="space-y-3">
                <Input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Your name"
                  maxLength={40}
                  className="h-11 rounded-2xl border border-[#dbe1ea] px-4 text-[14px] font-medium shadow-none focus-visible:ring-1 focus-visible:ring-[#082c78] sm:h-12 sm:text-[15px]"
                />

                {saveError && (
                  <p className="text-sm font-medium text-red-600">
                    {saveError}
                  </p>
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setPendingResult(null);
                      setPlayerName("");
                      setSaveError(null);
                    }}
                    className="h-11 flex-1 rounded-2xl border-[#dbe1ea] font-bold text-[#082c78] hover:bg-slate-50 sm:h-12"
                  >
                    Skip
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="h-11 flex-1 rounded-2xl bg-[#8B1A2B] font-bold text-white hover:bg-[#741625] sm:h-12"
                  >
                    {isSaving ? "Saving..." : "Save Score"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
