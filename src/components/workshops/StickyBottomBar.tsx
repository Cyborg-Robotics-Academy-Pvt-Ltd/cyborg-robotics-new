"use client";

import { Sparkles } from "lucide-react";
import type { CampLocation } from "./types";

interface Props {
  activeLocation: CampLocation;
  earlyBirdPrice: number;
  onRegister: () => void;
}

const StickyBottomBar = ({
  activeLocation,
  earlyBirdPrice,
  onRegister,
}: Props) => {
  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[rgba(141,15,17,0.12)] bg-white/95 px-3 py-3 shadow-[0_-4px_24px_rgba(141,15,17,0.1)] backdrop-blur-sm sm:px-4 lg:hidden">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[rgba(141,15,17,0.08)] text-base">
              🤖
            </div>
            <div className="min-w-0">
              <div className="text-[12px] font-black text-[#1a1a1a]">
                {activeLocation.name}
              </div>
              <div className="text-[11px] text-[#999]">
                {activeLocation.packageDates} · {activeLocation.days}
              </div>
            </div>
          </div>
          <div className="flex items-end justify-between gap-3 sm:items-center">
            <div className="shrink-0">
              <div className="text-[10px] font-medium text-[#999]">
                Early Bird Price
              </div>
              <div className="text-[18px] font-black text-[#8D0F11]">
                ₹{earlyBirdPrice.toLocaleString("en-IN")}
              </div>
            </div>
            <button
              onClick={onRegister}
              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-gradient-to-br from-[#8D0F11] to-[#B92423] px-5 py-[10px] text-[13px] font-bold text-white shadow-[0_4px_16px_rgba(141,15,17,0.35)] transition-all duration-200 hover:-translate-y-0.5 sm:flex-none"
            >
              <Sparkles size={12} /> Book Now
            </button>
          </div>
        </div>
      </div>
      <div className="h-[152px] sm:h-[96px] lg:hidden" />
    </>
  );
};

export default StickyBottomBar;
