import React from "react";
import Image from "next/image";
import Link from "next/link";

const CTASection = () => {
  return (
    <section className="w-[90%] mx-auto mb-12">
      <div className="relative overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-white via-orange-50/40 to-red-50 p-6 md:p-8 shadow-[0_15px_50px_-15px_rgba(0,0,0,0.12)]">
        {/* Background Glow */}
        <div className="absolute -left-16 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute -right-16 top-0 h-40 w-40 rounded-full bg-red-200/20 blur-3xl" />

        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left Section */}
          <div className="flex flex-col md:flex-row items-center gap-5">
            {/* Robot */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 scale-125 rounded-full bg-orange-300/20 blur-2xl" />
              <Image
                src="/assets/robot.png"
                alt="Cyborg Robot"
                width={220}
                height={220}
                className="relative object-contain drop-shadow-lg"
              />
            </div>

            {/* Content */}
            <div className="text-center md:text-left">
              <div className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[10px] font-semibold tracking-widest text-orange-700 uppercase">
                Limited Pilot Batch Open
              </div>

              <h2 className="mt-3 text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight text-neutral-900">
                BUILD THE FUTURE{" "}
                <span className="bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
                  WITH CYBORG
                </span>
              </h2>

              <p className="mt-2 max-w-xl text-sm md:text-base text-neutral-600">
                Learn Robotics, AI, IoT, Coding, and Future Technologies through
                hands-on projects and industry mentorship.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <Link
            href="/registration/new"
            className="group flex items-center gap-2"
          >
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button className="group flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-red-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
                APPLY FOR PILOT BATCH
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
