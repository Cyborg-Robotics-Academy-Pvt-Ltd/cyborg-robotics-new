"use client";

import {
  AlertCircle,
  Lightbulb,
  LayoutGrid,
  Code2,
  FlaskConical,
  Rocket,
  ChevronRight,
  Quote,
} from "lucide-react";

const FLOW = [
  { icon: AlertCircle, label: "Problem", color: "#112B63" },
  { icon: Lightbulb, label: "Idea", color: "#214BB5" },
  { icon: LayoutGrid, label: "Design", color: "#214BB5" },
  { icon: Code2, label: "Code", color: "#214BB5" },
  { icon: FlaskConical, label: "Test", color: "#112B63" },
  { icon: Rocket, label: "Product", color: "#214BB5" },
];

export default function Theme() {
  return (
    <section className="w-full bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14 lg:px-12">
        {/* LEFT: BRAND MESSAGE */}
        <div className="lg:border-r lg:border-[#112B63]/15 lg:pr-12">
          <p className="text-sm font-bold uppercase tracking-wider text-[#2874D0]">
            Theme
          </p>

          <h2 className="mt-3 max-w-md font-sans text-4xl font-extrabold leading-[1.05] tracking-tight text-[#112B63] sm:text-5xl">
            Productivity is
            <br />
            the theme.
          </h2>

          <p className="mt-7 font-sans text-2xl font-extrabold leading-[1.15] text-[#112B63] sm:text-3xl">
            Don't just write code.
            <br />
            <span className="text-[#F45B2A]">Solve work.</span>
          </p>
        </div>

        {/* RIGHT: PROCESS FLOW */}
        <div className="min-w-0">
          {/* PROCESS STEPS */}
          <div
            className="grid grid-cols-3 gap-x-2 gap-y-7 sm:flex sm:items-start sm:justify-between sm:gap-0"
            aria-label="Product development process"
          >
            {FLOW.map((step, i) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.label}
                  className="flex items-start justify-center sm:flex-1"
                >
                  <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
                    {/* ICON */}
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-full shadow-sm transition-transform duration-300 hover:scale-110"
                      style={{ backgroundColor: step.color }}
                    >
                      <Icon
                        className="text-white"
                        size={19}
                        strokeWidth={2.2}
                        aria-hidden="true"
                      />
                    </div>

                    {/* LABEL */}
                    <p className="text-center text-[10px] font-bold uppercase tracking-tight text-[#112B63] sm:text-[11px]">
                      {step.label}
                    </p>
                  </div>

                  {/* CONNECTOR */}
                  {i < FLOW.length - 1 && (
                    <ChevronRight
                      className="mt-3 hidden shrink-0 text-[#112B63]/35 sm:block"
                      size={16}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* QUOTE PANEL */}
          <div className="mt-8 flex items-start gap-3 rounded-xl bg-[#EDF5FC] p-5 sm:p-6">
            <Quote
              className="mt-0.5 shrink-0 text-[#8AF23D]"
              size={24}
              strokeWidth={2.5}
              aria-hidden="true"
            />

            <p className="text-sm leading-relaxed text-[#112B63] sm:text-[15px]">
              Every great productivity tool starts with a simple question:
              <span className="mt-1 block font-semibold">
                "How can we make this easier?"
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
