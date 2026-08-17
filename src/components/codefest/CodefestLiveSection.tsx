"use client";

import { FormEvent, useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Trophy } from "lucide-react";

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

const fmtTime = (v: unknown) =>
  typeof v === "number" && isFinite(v) ? v.toFixed(1) + "s" : "-";
const fmtScore = (v: unknown) =>
  typeof v === "number" && isFinite(v) ? v.toLocaleString() : "0";

function ResultAnnouncement() {
  return (
    <div className="flex h-full min-h-[320px] flex-col overflow-hidden rounded-[20px] border border-[#dbe1ea] bg-white shadow-sm">
      <div className="border-b border-[#f0f2f5] px-5 pb-3 pt-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8B1A2B]">
          Result
        </p>
        <h2 className="mt-1 text-xl font-black text-[#082c78]">
          Results Coming Soon
        </h2>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#8B1A2B]/10 text-3xl">
          <Trophy className="h-8 w-8 text-[#8B1A2B]" />
        </div>
        <p className="text-lg font-black text-[#082c78]">
          We will declare the result soon.
        </p>
        <p className="max-w-md text-sm leading-relaxed text-gray-500">
          Thank you to everyone who participated in CodeFest 1.0. Final results
          are being reviewed and will be announced here.
        </p>
      </div>
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

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-4 lg:grid-cols-2">
        <RewardsSection />
        <ResultAnnouncement />
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
