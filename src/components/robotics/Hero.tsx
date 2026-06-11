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

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-[80vh]">
      <section
        className="
          relative
          flex
          min-h-[calc(80vh-50px)]
          items-center
          overflow-hidden
          bg-cover
          bg-center
          bg-no-repeat
          mt-12
        "
        style={{ backgroundImage: "url('/bg1.png')" }}
      >
        {/* MOBILE OVERLAY */}
        <div className="absolute inset-0 bg-white/65 lg:hidden" />

        {/* CONTENT */}
        <div
          className="
            relative
            z-20
            flex
            w-full
            flex-col
            px-4
            pt-8
            pb-10
            lg:flex-row
            lg:items-center
            lg:justify-between
            lg:px-12
            lg:pt-[60px]
          "
        >
          {/* LEFT */}
          <div
            className="
              w-full
              max-w-[480px]
              transition-all
              duration-700
              ease-out
            "
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(24px)",
            }}
          >
            <h1 className="leading-[0.9] lg:leading-none">
              <span
                className="
                  mb-1
                  block
                  text-[20px]
                  font-bold
                  tracking-tight
                  text-gray-900
                  sm:text-[24px]
                  lg:text-[clamp(28px,3.5vw,46px)]
                "
              >
                DIPLOMA IN
              </span>

              <span
                className="
                  block
                  bg-gradient-to-r
                  from-red-600
                  to-red-800
                  bg-clip-text
                  text-[58px]
                  font-bold
                  tracking-tighter
                  text-transparent
                  sm:text-[74px]
                  lg:text-[clamp(52px,7.5vw,92px)]
                "
              >
                ROBOTICS
              </span>

              <span
                className="
                  block
                  text-[44px]
                  font-bold
                  tracking-tighter
                  text-gray-900
                  sm:text-[58px]
                  lg:text-[clamp(52px,7.5vw,92px)]
                "
              >
                TECHNOLOGY
              </span>
            </h1>

            <p
              className="
                my-5
                max-w-sm
                text-[15px]
                leading-relaxed
                text-gray-700
                lg:text-sm
                lg:text-gray-600
              "
            >
              A 52-Week Industry-Oriented Robotics &amp; Innovation Program for
              Young Creators.
            </p>

            {/* CTA */}
            <div
              className="
                mb-1
                flex
                flex-col
                gap-3
                sm:flex-row
                sm:flex-wrap
                lg:flex-row
              "
            >
              <a
                href="/registration/new"
                className="
                  inline-flex
                  h-[56px]
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  bg-red-600
                  px-6
                  text-xs
                  font-bold
                  tracking-wide
                  text-white
                  transition-all
                  hover:bg-red-700
                "
              >
                <span>APPLY FOR PILOT BATCH</span>
                <ArrowRight className="h-4 w-4" />
              </a>

              <a
                href="/robotics-diploma.png"
                download
                className="
                  inline-flex
                  h-[56px]
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  border
                  border-gray-300
                  bg-white/90
                  px-6
                  text-xs
                  font-bold
                  tracking-wide
                  text-gray-900
                  shadow-sm
                  transition-all
                  hover:border-gray-400
                "
              >
                <span>DOWNLOAD BROCHURE</span>
                <Download className="h-4 w-4" />
              </a>
            </div>

            {/* DESKTOP STATS */}
            <div
              className="
                hidden
                lg:mt-4
                lg:flex
                lg:items-start
                lg:gap-10
                lg:border-t
                lg:border-gray-200
                lg:pt-3
              "
            >
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
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-2xl font-bold leading-none text-gray-900">
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

          {/* RIGHT IMAGE */}
          <div
            className="
              relative
              z-10
              mt-2
              flex
              w-full
              justify-center
              self-end
              transition-opacity
              duration-1000
              ease-out
              lg:mt-0
              lg:w-[clamp(340px,48%,660px)]
            "
            style={{
              opacity: mounted ? 1 : 0,
              transitionDelay: "0.2s",
            }}
          >
            <div
              className="
                flex
                w-full
                flex-col
                items-center
                justify-center
                lg:h-[440px]
                lg:max-h-[520px]
              "
            >
              <img
                src="/robot-arm.png"
                alt="Robot"
                className="
                  -mt-6
                  w-full
                  max-w-[380px]
                  object-contain
                  object-bottom
                  sm:max-w-[450px]
                  lg:-mt-20
                  lg:max-h-[450px]
                  lg:max-w-full
                "
              />
            </div>
          </div>

          {/* MOBILE STATS */}
          <div
            className="
              mt-2
              grid
              w-full
              grid-cols-2
              gap-x-3
              gap-y-5
              border-t
              border-gray-200
              pt-5
              lg:hidden
            "
          >
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
              <div key={s.unit} className="flex items-start gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    flex-shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border-2
                    border-red-500
                    bg-white
                  "
                >
                  <s.icon className="h-4 w-4 text-red-500" />
                </div>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[30px] font-bold leading-none text-gray-900">
                      {s.num}
                    </span>

                    <span className="text-[10px] font-bold tracking-[0.18em] text-red-500">
                      {s.unit}
                    </span>
                  </div>

                  <div className="mt-1 text-[11px] leading-snug text-gray-500">
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// "use client";
// import Image from "next/image";
// import React from "react";

// const Hero = () => {
//   return (
//     <div className="min-h-[80vh] flex items-center mt-20 justify-center bg-white">
//       <Image
//         src="/robotics-diploma.png"
//         alt="Cyborg Logo"
//         width={1280}
//         height={600}
//       />
//     </div>
//   );
// };

// export default Hero;
