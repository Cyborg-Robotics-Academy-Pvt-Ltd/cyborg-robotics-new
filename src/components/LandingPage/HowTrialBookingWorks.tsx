"use client";

import React from "react";
import { motion } from "motion/react";
import {
  Mail,
  Bot,
  Bot as RoboticsArm,
  ArrowRight,
  CalendarDaysIcon,
  ClipboardListIcon,
} from "lucide-react";

const steps = [
  {
    number: "1",
    icon: ClipboardListIcon,
    title: "FILL DETAILS",
    description:
      "Share student details — we'll suggest HQ or Online based on your location.",
  },
  {
    number: "2",
    icon: CalendarDaysIcon,
    title: "CHOOSE DATE & TIME",
    description: "Pick a preferred slot for your trial class.",
  },
  {
    number: "3",
    icon: Mail,
    title: "GET CONFIRMED",
    description:
      "Receive an instant confirmation email with your trial details.",
  },
  {
    number: "4",
    icon: Bot,
    title: "START EXPLORING",
    description: "Attend the trial class and experience the Cyborg difference!",
  },
];

const HowTrialBookingWorks = () => {
  return (
    <section className="relative overflow-hidden bg-white pt-20 sm:pt-24 lg:pt-2 pb-4">
      {/* =========================================================
          TECHNICAL BACKGROUND DECORATIONS
      ========================================================== */}

      {/* Top-left dots */}
      <div className="pointer-events-none absolute left-0 top-0 opacity-70">
        <div
          className="h-24 w-36"
          style={{
            backgroundImage:
              "radial-gradient(#d9e5f8 1.5px, transparent 1.5px)",
            backgroundSize: "18px 18px",
          }}
        />
      </div>

      {/* Top-right circuit pattern */}
      <div className="pointer-events-none absolute right-0 top-10 hidden opacity-60 lg:block">
        <svg
          width="340"
          height="180"
          viewBox="0 0 340 180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M340 30H225L195 60H110" stroke="#DCE7F8" strokeWidth="1.5" />
          <path
            d="M340 90H250L220 120H135"
            stroke="#DCE7F8"
            strokeWidth="1.5"
          />
          <path
            d="M340 150H270L245 175H160"
            stroke="#DCE7F8"
            strokeWidth="1.5"
          />

          <circle cx="225" cy="30" r="4.5" fill="#DCE7F8" />
          <circle cx="110" cy="60" r="4.5" fill="#DCE7F8" />
          <circle cx="250" cy="90" r="4.5" fill="#DCE7F8" />
          <circle cx="135" cy="120" r="4.5" fill="#DCE7F8" />
          <circle cx="270" cy="150" r="4.5" fill="#DCE7F8" />
        </svg>
      </div>

      {/* Bottom-right dots */}
      <div className="pointer-events-none absolute bottom-0 right-0 opacity-60">
        <div
          className="h-48 w-56"
          style={{
            backgroundImage:
              "radial-gradient(#dce7f8 1.5px, transparent 1.5px)",
            backgroundSize: "18px 18px",
          }}
        />
      </div>

      {/* =========================================================
          CONTENT
      ========================================================== */}

      <div className="relative mx-auto w-full max-w-[1400px] px-5 sm:px-8 lg:px-10">
        {/* =======================================================
            HEADER
        ======================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-16 max-w-4xl text-center lg:mb-10"
        >
          {/* Heading */}
          <h2 className="text-[34px] font-extrabold leading-[1.08] tracking-[-0.025em] text-[#111827] sm:text-[34px] md:text-[44px] lg:text-[44px]">
            HOW TRIAL{" "}
            <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
              BOOKING
            </span>{" "}
            WORKS
          </h2>

          {/* Subtitle */}
          <p className="mt-5 text-base font-medium text-[#475569] sm:text-lg lg:text-xl">
            Get started in just a few simple steps
          </p>
        </motion.div>

        {/* =======================================================
            BOOKING STEPS
        ======================================================== */}

        <div className="relative">
          {/* Desktop connecting line */}
          <div className="pointer-events-none absolute left-[10.5%] right-[12.5%] top-[50px] hidden items-center lg:flex">
            <div className="h-px flex-1 border-t-2 border-dashed border-[#EF2027]" />

            <ArrowRight
              size={28}
              strokeWidth={1.8}
              className="shrink-0 text-[#EF2027]"
            />

            <div className="h-px flex-1 border-t-2 border-dashed border-[#EF2027]" />

            <ArrowRight
              size={28}
              strokeWidth={1.8}
              className="shrink-0 text-[#EF2027]"
            />

            <div className="h-px flex-1 border-t-2 border-dashed border-[#EF2027]" />

            <ArrowRight
              size={24}
              strokeWidth={1.8}
              className="shrink-0 text-[#EF2027]"
            />

            <div className="h-px flex-1 border-t-2 border-dashed border-[#EF2027]" />
          </div>

          <div className="grid grid-cols-1 gap-14 lg:grid-cols-4 lg:gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{
                    duration: 0.55,
                    delay: index * 0.12,
                  }}
                  className="group relative flex flex-col items-center text-center"
                >
                  {/* Mobile timeline */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-1/2 top-[154px] h-[70px] -translate-x-1/2 border-l-2 border-dashed border-[#EF2027] lg:hidden" />
                  )}

                  {/* Icon wrapper */}
                  <div className="relative z-10 mb-7">
                    {/* Outer glow */}
                    <div className="absolute -inset-2 rounded-full bg-[#F8FAFC]" />

                    {/* Main circle */}
                    <div className="relative flex h-[150px] w-[150px] items-center justify-center rounded-full border border-[#E6EBF3] bg-white shadow-[0_8px_28px_rgba(15,23,42,0.08)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_14px_36px_rgba(15,23,42,0.12)] sm:h-[115px] sm:w-[115px]">
                      {/* Partial red arc */}
                      <div
                        className="absolute inset-[-2px] rounded-full"
                        style={{
                          background:
                            "conic-gradient(from 275deg, #EF2027 0deg, #EF2027 92deg, transparent 92deg, transparent 360deg)",
                          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                          maskComposite: "exclude",
                          padding: "2px",
                        }}
                      />

                      {/* Inner subtle circle */}
                      <div className="absolute inset-3 rounded-full border border-[#F3F5F8]" />

                      <Icon
                        size={50}
                        strokeWidth={1.3}
                        className="relative z-10 text-[#a71217]"
                      />

                      {/* Number */}
                      <div className="absolute -bottom-1 -left-3 flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-white bg-[#EF2027] text-lg font-extrabold text-white shadow-[0_5px_14px_rgba(239,32,39,0.28)]">
                        {step.number}
                      </div>
                    </div>
                  </div>

                  {/* Step title */}
                  <h3 className="relative z-10 text-[18px] font-bold tracking-[-0.01em] bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent sm:text-[19px]">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-4 max-w-[245px] text-[16px] font-medium leading-5 text-[#475569] sm:text-[17px]">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowTrialBookingWorks;
