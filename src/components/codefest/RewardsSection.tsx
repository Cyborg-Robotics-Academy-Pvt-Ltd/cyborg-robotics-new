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
          <CardContent
            className="
              flex flex-col-reverse items-center gap-10
              px-5 py-6
              sm:px-7 sm:py-7
              lg:flex-row lg:items-center lg:justify-between lg:px-9
            "
          >
            {/* Left Content */}
            <div className="w-full max-w-[520px] text-center lg:text-left">
              <h2
                className="
                  text-[26px] font-extrabold uppercase leading-tight tracking-[-1px]
                  text-[#082C78]
                  sm:text-[32px]
                  md:text-[34px]
                "
              >
                Prizes & Recognition
              </h2>

              <div className="mx-auto mt-4 h-[4px] w-[82px] rounded-full bg-[#D81E25] lg:mx-0" />

              <p
                className="
                  mt-6 text-[15px] font-semibold leading-[1.7] text-[#2D3F63]
                  sm:text-[17px]
                  md:text-[18px]
                "
              >
                Compete with students across the country, showcase your
                creativity, and unlock exciting rewards, recognition, and
                learning opportunities through CODE FEST 1.0.
              </p>

              <Button
                onClick={() => setOpen(true)}
                className="
                  mt-7 h-[50px] w-full rounded-[16px]
                  bg-[#082C78] px-8 text-[16px] font-extrabold text-white
                  hover:bg-[#061F59]
                  sm:w-auto sm:text-[17px]
                "
              >
                EXPLORE PRIZES
              </Button>
            </div>

            {/* Trophy Image */}
            <div className="flex w-full flex-1 items-center justify-center">
              <div
                className="
                  relative
                  h-[220px] w-[240px]
                  sm:h-[260px] sm:w-[300px]
                  md:h-[300px] md:w-[360px]
                "
              >
                <Image
                  src="/assets/codefest/winner-trophy-illustration.png"
                  alt="Rewards Trophy"
                  fill
                  priority
                  className="object-contain"
                  sizes="(max-width: 768px) 90vw, 45vw"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="
            max-h-[85vh] overflow-hidden
            border-0
            p-4 sm:p-6
            sm:max-w-2xl
          "
        >
          <DialogHeader>
            <DialogTitle
              className="
                text-center text-2xl font-black uppercase text-[#082C78]
                sm:text-left sm:text-3xl
              "
            >
              Prizes & Recognition
            </DialogTitle>
          </DialogHeader>

          <div
            className="
              mt-2 space-y-4 overflow-y-auto pr-1 sm:pr-3 
              max-h-[65vh]

              [&::-webkit-scrollbar]:w-[6px]
              [&::-webkit-scrollbar-track]:rounded-full
              [&::-webkit-scrollbar-track]:bg-[#E8EDF7]
              [&::-webkit-scrollbar-thumb]:rounded-full
              [&::-webkit-scrollbar-thumb]:bg-gradient-to-b
              [&::-webkit-scrollbar-thumb]:from-[#082C78]
              [&::-webkit-scrollbar-thumb]:to-[#1A4DB8]

              [scrollbar-width:thin]
              [scrollbar-color:#082C78_#E8EDF7]
            "
          >
            {PRIZES.map((prize, i) => (
              <div
                key={i}
                className="
                  rounded-xl border border-gray-200
                  bg-gradient-to-r from-blue-50 to-white
                  p-4 sm:p-5
                  transition-all hover:border-blue-300 hover:shadow-md
                "
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                  <span className="text-4xl">{prize.icon}</span>

                  <div className="flex-1">
                    <h3
                      className="
                        text-sm font-bold uppercase tracking-wide text-[#082C78]
                        sm:text-base
                      "
                    >
                      {prize.title}
                    </h3>

                    <p
                      className="
                        mt-1 text-sm font-semibold text-gray-800
                        sm:text-base
                      "
                    >
                      {prize.amount}
                    </p>

                    {prize.description && (
                      <p
                        className="
                          mt-2 text-sm leading-relaxed text-gray-600
                        "
                      >
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
