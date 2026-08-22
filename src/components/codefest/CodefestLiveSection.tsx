"use client";

import { FormEvent, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Gift, MapPin, Megaphone, Star, Trophy, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebase";

import MiniChallenge from "./MiniChallenge";
import RegistrationForm from "./RegistrationForm";
import RewardsSection from "./RewardsSection";

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

// red/coral, royal blue, red/coral, blue, purple — per spec
const AVATAR_GRADIENTS = [
  "from-[#E24B4A] to-[#F0997B]",
  "from-[#0855AB] to-[#062341]",
  "from-[#E24B4A] to-[#F0997B]",
  "from-[#378ADD] to-[#0855AB]",
  "from-[#7F77DD] to-[#534AB7]",
];

const CONFETTI_COLORS = ["#FAC775", "#F0997B", "#AFA9EC", "#85B7EB"];

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
    <div className="relative hidden h-[150px] w-[160px] shrink-0 items-end justify-center sm:flex">
      <Confetti seed={0} className="scale-125" />

      {/* soft ambient glow */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-[#FAC775]/25 blur-2xl" />

      {/* laurel leaves */}
      <svg
        viewBox="0 0 150 140"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <path
          d="M75 118 C 45 108, 28 82, 34 52 C 40 62, 48 74, 60 84"
          fill="none"
          stroke="#85B7EB"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.55"
        />
        <path
          d="M75 118 C 33 104, 30 78, 40 58 C 43 68, 48 76, 55 82"
          fill="none"
          stroke="#B5D4F4"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.4"
        />
        <path
          d="M75 118 C 105 108, 122 82, 116 52 C 110 62, 102 74, 90 84"
          fill="none"
          stroke="#85B7EB"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.55"
        />
        <path
          d="M75 118 C 117 104, 120 78, 110 58 C 107 68, 102 76, 95 82"
          fill="none"
          stroke="#B5D4F4"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.4"
        />
      </svg>

      {/* podium — two-step base for a touch more dimension */}
      <div className="relative z-[1] flex flex-col items-center">
        <div className="h-3 w-24 rounded-t-md bg-gradient-to-r from-[#9AA5E8] to-[#0855AB]" />
        <div className="h-7 w-20 rounded-t-lg bg-gradient-to-br from-[#7F77DD] to-[#0855AB] shadow-sm" />
      </div>

      {/* trophy badge */}
      <div className="trophy-float absolute bottom-9 z-[2] flex h-[70px] w-[70px] items-center justify-center rounded-full bg-gradient-to-br from-[#FFE7A8] to-[#FAC775] shadow-[0_6px_16px_rgba(133,95,10,0.25)] ring-4 ring-white">
        <Trophy className="h-8 w-8 text-[#854F0B]" strokeWidth={2} />
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
    <div className="mx-auto flex w-full max-w-[1280px] flex-col overflow-hidden rounded-[30px] border border-[#e3ecfa] bg-white shadow-[0_8px_30px_rgba(8,44,120,0.08)]">
      {/* HERO HEADER — ~25% of card height */}
      <div className="relative flex flex-col gap-6 overflow-hidden bg-gradient-to-br from-white to-[#f2f7ff] px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(rgba(8,44,120,0.05) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative min-w-0">
          <span className="inline-flex items-center rounded-full bg-[#e6f1fb] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#082c78]">
            Result
          </span>

          <h2 className="mt-3 text-3xl font-extrabold leading-tight text-[#082c78] sm:text-[3rem]">
            Top 5 Participants
          </h2>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#e6f1fb] py-2 pl-2 pr-4 ring-1 ring-[#cfe0f7]">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0855AB]">
              <Megaphone
                className="h-3.5 w-3.5 text-white"
                strokeWidth={2.25}
              />
            </span>
            <p className="text-sm font-semibold text-[#0c447c]">
              Final results will be announced soon
            </p>
          </div>
        </div>

        <div className="relative">
          <TrophyIllustration />
        </div>
      </div>

      {/* PARTICIPANT LIST */}
      <div className="flex flex-col gap-4 px-6 py-8 sm:px-10">
        {TOP_5.map((p, i) => (
          <div
            key={p.name}
            className="participant-row flex min-h-[100px] items-center gap-4 rounded-[20px] border border-[#eef1f6] bg-white px-5 py-4 shadow-[0_2px_10px_rgba(8,44,120,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#cfe0f7] hover:shadow-[0_10px_24px_rgba(8,44,120,0.09)] sm:gap-6 sm:px-8 sm:py-5"
            style={{ animationDelay: `${i * 90}ms` }}
          >
            {/* star badge */}
            <div className="relative hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#fdf3e3] sm:flex">
              <Confetti seed={i} />
              <Star className="h-5 w-5 fill-[#FAC775] text-[#FAC775]" />
            </div>

            {/* avatar */}
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-base font-black text-white shadow-sm ring-4 ring-white transition-transform duration-300 sm:h-16 sm:w-16 sm:text-lg ${AVATAR_GRADIENTS[i]}`}
            >
              {p.initials}
            </div>

            {/* name + state */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-bold text-[#082c78] sm:text-2xl">
                {p.name}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0 text-[#5f6b85]" />
                <p className="truncate text-sm font-medium text-[#5f6b85] sm:text-base">
                  {p.state}
                </p>
              </div>
            </div>

            {/* right decoration */}
            <div className="relative hidden h-10 w-10 shrink-0 items-center justify-center sm:flex">
              <Confetti seed={i + 2} />
              <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#fbeaf0]">
                <Users className="h-5 w-5 text-[#993556]" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="flex items-center gap-3 border-t border-[#eef1f6] bg-[#f2f7ff] px-6 py-4 sm:px-10">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e6f1fb]">
          <Gift className="h-4.5 w-4.5 text-[#0855AB]" />
        </span>
        <p className="text-sm font-medium text-[#0c447c]">
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
            transform: translateY(10px);
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

    try {
      setIsSaving(true);
      setSaveError(null);

      await addDoc(collection(db, "codefestGameRecords"), {
        name: trimmedName,
        score: pendingResult.score,
        time: pendingResult.time,
        game: "escape-the-maze",
        createdAt: serverTimestamp(),
      });

      setPendingResult(null);
      setPlayerName("");
    } catch {
      setSaveError("Could not save your score. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <section className="mx-auto grid max-w-7xl items-stretch gap-3 px-6 py-6 lg:grid-cols-[5fr_6fr]">
        <MiniChallenge
          onFinish={(score, elapsed) => {
            setPendingResult({ score, time: elapsed });
            setSaveError(null);
          }}
        />
        <div id="codefest-registration" className="scroll-mt-28">
          <RegistrationForm />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-4">
        <ResultAnnouncement />
      </section>

      <section className="mx-auto max-w-7xl px-6 py-4">
        <RewardsSection />
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
