"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { db } from "@/lib/firebase";

import MiniChallenge from "./MiniChallenge";
import RegistrationForm from "./RegistrationForm";
import RewardsSection from "./RewardsSection";

type LeaderboardEntry = {
  id: string;
  name: string;
  score: number;
  time: number;
};

type PendingResult = {
  score: number;
  time: number;
};

type GameRecordData = {
  name?: unknown;
  score?: unknown;
  time?: unknown;
};

// ─── Safe formatters ─────────────────────────────────────────────────────────
const fmtTime = (v: unknown) =>
  typeof v === "number" && isFinite(v) ? v.toFixed(1) + "s" : "—";
const fmtScore = (v: unknown) =>
  typeof v === "number" && isFinite(v) ? v.toLocaleString() : "0";

// ─── Medal colors for top 3 ──────────────────────────────────────────────────
const MEDAL = [
  {
    bg: "bg-amber-50",
    border: "border-amber-400",
    text: "text-amber-600",
    badge: "🥇",
    ring: "ring-2 ring-amber-400",
  },
  {
    bg: "bg-slate-50",
    border: "border-slate-400",
    text: "text-slate-500",
    badge: "🥈",
    ring: "ring-2 ring-slate-400",
  },
  {
    bg: "bg-orange-50",
    border: "border-orange-300",
    text: "text-orange-500",
    badge: "🥉",
    ring: "ring-2 ring-orange-300",
  },
];

// ─── Inline Leaderboard ───────────────────────────────────────────────────────
function EnhancedLeaderboard({
  entries,
  loading,
  error,
}: {
  entries: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
}) {
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="flex flex-col h-full rounded-[20px] border border-[#dbe1ea] bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-[#f0f2f5]">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8B1A2B]">
          Live Rankings
        </p>
        <h2 className="mt-1 text-xl font-black text-[#082c78]">Leaderboard</h2>
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center py-10">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-[#8B1A2B] animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="flex-1 flex items-center justify-center py-10 text-sm text-red-500 px-5">
          {error}
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center py-10 gap-2">
          <span className="text-3xl">🎮</span>
          <p className="text-sm text-gray-400 font-medium">
            No scores yet. Be the first!
          </p>
        </div>
      )}

      {!loading && !error && entries.length > 0 && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Top 3 Podium */}
          <div className="px-4 pt-4 pb-2 flex flex-col gap-2">
            {top3.map((entry, idx) => {
              const m = MEDAL[idx];
              return (
                <div
                  key={entry.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${m.bg} ${m.border} ${m.ring}`}
                >
                  <span className="text-2xl leading-none">{m.badge}</span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[13px] font-bold truncate text-[#082c78]`}
                    >
                      {entry.name}
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                      {fmtTime(entry.time)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-[15px] font-black ${m.text}`}>
                      {fmtScore(entry.score)}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                      pts
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rest — scrollable */}
          {rest.length > 0 && (
            <div className="flex-1 overflow-y-auto px-4 pb-4 min-h-0 max-h-48">
              <div className="flex flex-col gap-1 mt-1">
                {rest.map((entry, idx) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gray-50 border border-[#f0f2f5] hover:bg-gray-100 transition-colors"
                  >
                    <span className="w-5 text-center text-[12px] font-bold text-gray-400">
                      {idx + 4}
                    </span>
                    <p className="flex-1 text-[13px] font-semibold text-gray-700 truncate">
                      {entry.name}
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium shrink-0">
                      {fmtTime(entry.time)}
                    </p>
                    <p className="text-[13px] font-bold text-[#082c78] shrink-0 w-20 text-right">
                      {fmtScore(entry.score)} pts
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export default function CodefestLiveSection() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [pendingResult, setPendingResult] = useState<PendingResult | null>(
    null,
  );
  const [playerName, setPlayerName] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  useEffect(() => {
    const recordsQuery = query(
      collection(db, "codefestGameRecords"),
      orderBy("score", "desc"),
      limit(10),
    );

    const unsubscribe = onSnapshot(
      recordsQuery,
      (snapshot) => {
        const entries: LeaderboardEntry[] = snapshot.docs.map((recordDoc) => {
          const data = recordDoc.data() as GameRecordData;
          return {
            id: recordDoc.id,
            name:
              typeof data.name === "string" && data.name.trim()
                ? data.name
                : "Player",
            score: typeof data.score === "number" ? data.score : 0,
            time: typeof data.time === "number" ? data.time : 0,
          };
        });

        setLeaderboard(entries);
        setLeaderboardError(null);
        setLeaderboardLoading(false);
      },
      () => {
        setLeaderboardError("Could not load game records.");
        setLeaderboardLoading(false);
      },
    );

    return unsubscribe;
  }, []);

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

      // ✅ FIX: Do NOT manually update leaderboard state here.
      // onSnapshot will fire automatically and update it correctly
      // with proper ranking. Manual update caused the duplicate.

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
      <section className="max-w-7xl mx-auto grid lg:grid-cols-[5fr_6fr] gap-3 px-6 py-6 items-stretch">
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

      <section className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-6 px-6 py-4">
        <RewardsSection />
        <EnhancedLeaderboard
          entries={leaderboard}
          loading={leaderboardLoading}
          error={leaderboardError}
        />
      </section>

      {pendingResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 py-6 sm:px-6">
          <Card className="w-full max-w-md rounded-[24px] border border-white/10 bg-white shadow-2xl sm:rounded-[28px]">
            <CardHeader className="pb-3 px-5 pt-5 sm:px-6 sm:pt-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8B1A2B] sm:text-xs sm:tracking-[0.3em]">
                Challenge Complete
              </p>
              <CardTitle className="mt-1.5 text-[1.5rem] font-black leading-tight text-[#082c78] sm:text-[1.75rem]">
                Save your score
              </CardTitle>
              <p className="text-[13px] leading-relaxed text-gray-500 sm:text-sm">
                You finished in {fmtTime(pendingResult.time)} with{" "}
                {fmtScore(pendingResult.score)} points. Enter your name to add
                this run to the live leaderboard.
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
