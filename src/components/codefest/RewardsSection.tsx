"use client";

import { useState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PRIZES = [
  {
    icon: "🏆",
    title: "1ST PRIZE",
    amount: "₹20,000 Cash Prize",
  },
  {
    icon: "🥈",
    title: "SOCIAL MEDIA STAR AWARD",
    amount: "₹10,000 Cash Prize",
    description:
      "Awarded to the participant with the most impactful project presentation and community engagement on social media.",
  },
  {
    icon: "🎖",
    title: "TOP 10 RUNNER-UPS",
    amount: "Exclusive Scholarship Opportunities from Cyborg Online Academy",
    description:
      "Top performers will receive special scholarship benefits and learning opportunities to continue their coding journey with advanced programs and mentorship.",
  },
  {
    icon: "📜",
    title: "ALL PARTICIPANTS",
    amount: "E-Certificates & National Recognition",
  },
];

export default function RewardsSection() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <section className="w-full">
        <Card className="overflow-hidden rounded-[22px] border-[#ECE3CF] bg-[#FDF8ED] shadow-sm">
          <CardContent className="flex items-center justify-between px-7 py-7 sm:px-9">
            <div className="max-w-[360px]">
              <h2 className="whitespace-nowrap text-[32px] font-extrabold uppercase leading-none tracking-[-1.5px] text-[#082C78] sm:text-[34px]">
                Prizes & Recognition
              </h2>

              <div className="mt-5 h-[4px] w-[82px] rounded-full bg-[#D81E25]" />

              <p className="mt-7 max-w-[310px] text-[19px] font-semibold leading-[1.45] text-[#2D3F63]">
                Compete with students across the country, showcase your
                creativity, and unlock exciting rewards, recognition, and
                learning opportunities through CODE FEST 1.0.
              </p>

              <Button
                onClick={() => setOpen(true)}
                className="mt-8 h-[54px] rounded-[16px] bg-[#082C78] px-8 text-[18px] font-extrabold text-white hover:bg-[#061F59]"
              >
                EXPLORE PRIZES
              </Button>
            </div>

            <div className="flex flex-1 items-center justify-center ">
              <div className="relative h-[280px] w-[360px] ">
                <Image
                  src="/assets/winner-trophy-illustration.png"
                  alt="Rewards Trophy"
                  fill
                  priority
                  className="object-contain scale-[1.08] "
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Prizes Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col border-0">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black uppercase text-[#082C78]">
              Prizes & Recognition
            </DialogTitle>
          </DialogHeader>

          <div
            className="
              space-y-4 overflow-y-auto pr-3 max-h-[55vh]
              [&::-webkit-scrollbar]:w-[6px]
              [&::-webkit-scrollbar-track]:rounded-full
              [&::-webkit-scrollbar-track]:bg-[#E8EDF7]
              [&::-webkit-scrollbar-thumb]:rounded-full
              [&::-webkit-scrollbar-thumb]:bg-gradient-to-b
              [&::-webkit-scrollbar-thumb]:from-[#082C78]
              [&::-webkit-scrollbar-thumb]:to-[#1A4DB8]
              [&::-webkit-scrollbar-thumb]:border-[1px]
              [&::-webkit-scrollbar-thumb]:border-white
              hover:[&::-webkit-scrollbar-thumb]:from-[#061F59]
              hover:[&::-webkit-scrollbar-thumb]:to-[#082C78]
              [scrollbar-width:thin]
              [scrollbar-color:#082C78_#E8EDF7]
            "
          >
            {PRIZES.map((prize, i) => (
              <div
                key={i}
                className="rounded-lg border border-gray-200 bg-gradient-to-r from-blue-50 to-white p-5 transition-all hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{prize.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-bold uppercase tracking-wide text-[#082C78]">
                      {prize.title}
                    </h3>
                    <p className="mt-1 font-semibold text-gray-800">
                      {prize.amount}
                    </p>
                    {prize.description && (
                      <p className="mt-2 text-sm leading-relaxed text-gray-600">
                        {prize.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
