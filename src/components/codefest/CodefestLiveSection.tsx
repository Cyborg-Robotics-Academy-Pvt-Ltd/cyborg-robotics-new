"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import Leaderboard from "./Leaderboard";
import MiniChallenge from "./MiniChallenge";
import RegistrationForm from "./RegistrationForm";
import RewardsSection from "./RewardsSection";

type RegistrationEntry = {
  id: string;
  name: string;
  state: string;
  school: string;
  registeredAt: string;
};

type PendingResult = {
  score: number;
  time: number;
};

export default function CodefestLiveSection() {
  const [leaderboard, setLeaderboard] = useState<RegistrationEntry[]>([]);
  const [pendingResult, setPendingResult] = useState<PendingResult | null>(
    null,
  );
  const [playerName, setPlayerName] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function handleScoreSubmit(e: FormEvent<HTMLFormElement>) {
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

      const nextEntry: RegistrationEntry = {
        id: `demo-${Date.now()}`,
        name: trimmedName,
        state: "—",
        school: "—",
        registeredAt: "Just now",
      };

      setLeaderboard((current) => [nextEntry, ...current].slice(0, 10));

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
        <Leaderboard
          entries={leaderboard}
          loading={false}
          error={null}
          totalCount={1000}
          stateCount={24}
          schoolCount={180}
        />
      </section>

      {pendingResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-6">
          <Card className="w-full max-w-md rounded-[28px] border border-white/10 bg-white shadow-2xl">
            <CardHeader className="pb-3">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#8B1A2B]">
                Challenge Complete
              </p>
              <CardTitle className="mt-1.5 text-[1.75rem] font-black text-[#082c78]">
                Save your score
              </CardTitle>
              <p className="text-sm leading-relaxed text-gray-500">
                You finished in {pendingResult.time.toFixed(1)}s with{" "}
                {pendingResult.score.toLocaleString()} points. Enter your name
                to add this run to the live leaderboard.
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleScoreSubmit} className="space-y-3">
                <Input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Your name"
                  maxLength={40}
                  className="h-12 rounded-2xl border border-[#dbe1ea] px-4 text-[15px] font-medium shadow-none focus-visible:ring-1 focus-visible:ring-[#082c78]"
                />

                {saveError && (
                  <p className="text-sm font-medium text-red-600">
                    {saveError}
                  </p>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setPendingResult(null);
                      setPlayerName("");
                      setSaveError(null);
                    }}
                    className="h-12 flex-1 rounded-2xl border-[#dbe1ea] font-bold text-[#082c78] hover:bg-slate-50"
                  >
                    Skip
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="h-12 flex-1 rounded-2xl bg-[#8B1A2B] font-bold text-white hover:bg-[#741625]"
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
