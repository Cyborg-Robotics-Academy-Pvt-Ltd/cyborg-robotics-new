"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  ClipboardList,
  Download,
  Factory,
  Users,
  Wrench,
} from "lucide-react";

export default function CyborgHero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-[80vh]">
      <section
        className="relative flex min-h-[calc(80vh-50px)] items-center overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/cyborglog__1_.png')" }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 z-0" />

        {/* Content */}
        <div className="relative z-20 flex w-full items-center justify-between px-12 pt-[60px]">
          {/* LEFT: Text */}
          <div
            className="max-w-[480px] transition-all duration-600 ease-out"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(24px)",
            }}
          >
            <h1 className="mb-4 leading-none">
              <span className="mb-1 block text-[clamp(28px,3.5vw,46px)] font-black tracking-tight text-gray-900">
                DIPLOMA IN
              </span>
              <span className="block text-[clamp(52px,7.5vw,92px)] font-black leading-[0.95] tracking-tighter text-red-600">
                ROBOTICS
              </span>
              <span className="block text-[clamp(52px,7.5vw,92px)] font-black leading-[0.95] tracking-tighter text-gray-900">
                TECHNOLOGY
              </span>
            </h1>

            <p className="my-5 max-w-sm text-sm leading-relaxed text-gray-600">
              A 52-Week Industry-Oriented Robotics &amp; Innovation Program for
              Young Creators.
            </p>

            {/* CTAs */}
            <div className="mb-11 flex flex-wrap gap-3.5">
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded bg-red-600 px-6 py-3 text-xs font-bold tracking-wide text-white transition-colors hover:bg-red-700"
              >
                <span>APPLY FOR PILOT BATCH</span>
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded border-2 border-gray-300 bg-white px-6 py-3 text-xs font-bold tracking-wide text-gray-900 transition-colors hover:border-gray-400"
              >
                <span>DOWNLOAD BROCHURE</span>
                <Download className="h-4 w-4" />
              </a>
            </div>

            {/* Stats */}
            <div className="mt-11 flex items-start gap-10 border-t border-gray-200 pt-6">
              {[
                {
                  icon: ClipboardList,
                  num: "52",
                  unit: "WEEKS",
                  label: "Comprehensive Program",
                },
                {
                  icon: Wrench,
                  num: "25+",
                  unit: "PROJECTS",
                  label: "Hands-on Learning",
                },
                {
                  icon: Users,
                  num: "4",
                  unit: "CAPSTONE",
                  label: "Showcases",
                },
                {
                  icon: Factory,
                  num: "100%",
                  unit: "PRACTICAL",
                  label: "Industry-Oriented",
                },
              ].map((s) => (
                <div key={s.unit} className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-9.5 w-9.5 flex-shrink-0 items-center justify-center rounded-full border-2 border-red-600">
                    <s.icon className="h-[18px] w-[18px] text-red-600" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-0.75">
                      <span className="text-2xl font-black leading-none text-gray-900">
                        {s.num}
                      </span>
                      <span className="text-[10px] font-extrabold tracking-widest text-red-600">
                        {s.unit}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[10px] text-gray-500">
                      {s.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Image */}
          <div
            className="flex-shrink-0 w-[clamp(340px,48%,660px)] self-end transition-opacity duration-900 ease-out"
            style={{
              opacity: mounted ? 1 : 0,
              transitionDelay: "0.2s",
            }}
          >
            <div className="flex h-[440px] max-h-[520px] w-full flex-col items-center justify-center gap-2.5">
              <img
                src="/robot-arm.png"
                alt="Robot"
                className="-mt-44 w-full max-h-[500px] object-contain object-bottom"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
