import React from "react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

const Footer = () => {
  return (
    <div className="relative w-full overflow-hidden bg-[#0A1128] py-10 px-6 sm:px-10">
      {/* Main content */}
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
        <p className="mb-3 text-xs font-semibold tracking-widest sm:text-sm">
          <span className="text-white">CodeFest 2.O Python Edition</span>
          <span className="mx-2 text-white/40">•</span>
        </p>

        <h1 className="text-2xl font-extrabold uppercase leading-tight tracking-tight sm:text-3xl md:text-4xl">
          <span className="block text-white">Your next product</span>
          <span className="block text-[#FF7A00]">starts with one idea.</span>
        </h1>

        <p className="mt-3 text-sm font-medium text-white/80 sm:text-base">
          Code it. Test it. Improve it. Ship it.
        </p>

        <button
          type="button"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#A8FF00] px-6 py-3 text-sm font-bold text-[#0A1128] transition-transform hover:scale-105 active:scale-95"
        >
          JOIN CodeFest 2.O Python Edition
          <ArrowRight className="h-4 w-4" strokeWidth={3} />
        </button>
      </div>

      {/* Footer row */}
      <div className="relative z-10 mx-auto mt-8 flex max-w-5xl items-center justify-between border-t border-white/10 pt-6">
        <div className="flex flex-col leading-none">
          <div className="flex">
            <div className="mb-4 flex items-center gap-3">
              <Image
                src="/cyborglogo.png"
                alt="Maze Challenge logo"
                width={42}
                height={42}
                className="h-[42px] w-[42px] rounded-full object-cover"
              />
              <span className="text-lg font-extrabold tracking-tight text-white sm:text-xl">
                CYB
                <span className="text-[#FF7A00]">O</span>
                RG
              </span>
            </div>
          </div>
          <span className="mt-1 text-[10px] font-medium tracking-[0.2em] text-white/50">
            ROBOTICS ACADEMY
          </span>
        </div>

        <span className="text-xs font-semibold italic text-white/70 sm:text-sm">
          Learning by Doing
        </span>
      </div>
    </div>
  );
};

export default Footer;
