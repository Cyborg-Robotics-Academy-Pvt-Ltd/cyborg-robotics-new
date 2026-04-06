"use client";

import { motion } from "framer-motion";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { heroItemVariants } from "./motion";
import type { CampLocation, LocationId } from "./types";

interface Props {
  activeLocation: CampLocation;
  locations: CampLocation[];
  activeLocationId: LocationId;
  onLocationChange: (id: LocationId) => void;
}

const getStartingPrice = (location: CampLocation) => {
  return Math.min(
    ...location.schedule.flatMap((week) => Object.values(week.prices)),
  );
};

const HeroSection = ({
  activeLocation,
  locations,
  activeLocationId,
  onLocationChange,
}: Props) => {
  return (
    <section className="relative flex min-h-[auto] items-center overflow-hidden bg-white px-4 pb-8 pt-2 sm:px-6 sm:pb-16 sm:pt-16 lg:-mt-2 lg:min-h-[90vh] lg:py-0 before:pointer-events-none before:absolute before:inset-0 before:content-[''] before:[background:radial-gradient(ellipse_55%_50%_at_5%_60%,rgba(141,15,17,0.07)_0%,transparent_65%),radial-gradient(ellipse_45%_55%_at_95%_25%,rgba(141,15,17,0.06)_0%,transparent_65%)]">
      <div className="absolute inset-0 pointer-events-none opacity-30 [background-image:radial-gradient(circle,rgba(141,15,17,0.1)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_30%,transparent_100%)]" />
      <div className="pointer-events-none absolute -left-[90px] -top-[40px] h-[220px] w-[220px] rounded-full bg-[#8D0F11] opacity-10 blur-[70px] animate-[blobFloat_9s_ease-in-out_infinite_alternate] sm:-left-[120px] sm:-top-[100px] sm:h-[400px] sm:w-[400px] sm:blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-[40px] -right-[40px] h-[200px] w-[200px] rounded-full bg-[#B92423] opacity-10 blur-[70px] animate-[blobFloat_9s_ease-in-out_infinite_alternate] [animation-delay:1.5s] sm:-bottom-[80px] sm:-right-[60px] sm:h-[300px] sm:w-[300px] sm:blur-[80px]" />

      <div className="relative z-10 mx-auto w-full max-w-[1200px]">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={heroItemVariants}
          className="max-w-[720px]"
        >
          {/* Badge */}
          <motion.div variants={heroItemVariants} className="mb-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(141,15,17,0.16)] bg-[rgba(141,15,17,0.07)] px-3 py-1 sm:gap-2 sm:px-[14px]">
              <span className="relative h-2 w-2 shrink-0 rounded-full bg-[#8D0F11] after:absolute after:-inset-[3px] after:rounded-full after:bg-[#8D0F11] after:opacity-50 after:content-[''] after:animate-ping" />
              {/* was: font-bold uppercase tracking-[0.06em] → semibold is enough for a badge */}
              <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#8D0F11] sm:text-[11px]">
                Cyborg Robotics Academy · Summer 2026
              </span>
            </div>
          </motion.div>

          {/* H1 — keep font-black, it's the hero headline */}
          <motion.h1
            variants={heroItemVariants}
            className="m-0 text-[clamp(2rem,4vw,3.2rem)]  leading-[1.06] tracking-[-0.03em] text-[#1a1a1a] font-bold"
          >
            Build. Fly.{" "}
            <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
              Innovate.
            </span>
          </motion.h1>

          <div className="my-2 h-[3px] w-10 rounded-sm bg-gradient-to-r from-[#8D0F11] to-[#B92423]" />

          {/* H2 — was font-bold, reduced to font-semibold; subheadings don't need max weight */}
          <motion.h2
            variants={heroItemVariants}
            className="m-0 mb-2 text-[clamp(0.9rem,1.6vw,1.1rem)] font-semibold leading-[1.4] text-[#8D0F11]"
          >
            Robotics Summer Camp 2026 —{" "}
            <span className="bg-gradient-to-br from-[#8D0F11] to-[#B92423] bg-clip-text text-transparent">
              Kharadi · Kalyani Nagar · Magarpatta
            </span>
          </motion.h2>

          {/* Body copy — was no explicit weight (inherits bold from parent chain), set explicitly to normal */}
          <motion.p
            variants={heroItemVariants}
            className="m-0 mb-5 text-[13px] font-normal leading-[1.65] text-[#666] sm:max-w-[560px]"
          >
            Kids build mechanical robots, assemble and fly drones, and pitch
            startup ideas through hands-on STEM learning. Choose your preferred
            center from Kharadi, Kalyani Nagar, or Magarpatta.
          </motion.p>
        </motion.div>

        {/* Location Picker */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={heroItemVariants}
          className="mb-4"
        >
          {/* Section label — was font-bold, reduced to font-medium; all-caps + tracking already creates emphasis */}
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-[#8D0F11]">
            Choose Location
          </p>
          <div className="flex max-w-[760px] flex-wrap gap-2">
            {locations.map((location) => {
              const isActive = location.id === activeLocationId;
              const startingPrice = getStartingPrice(location);

              return (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => onLocationChange(location.id)}
                  className={`inline-flex min-w-[180px] items-center gap-3 rounded-full border px-3 py-2 text-left transition-all duration-200 ${
                    isActive
                      ? "border-[#8D0F11] bg-gradient-to-r from-[#8D0F11] to-[#B92423] text-white shadow-[0_8px_20px_rgba(141,15,17,0.16)]"
                      : "border-[rgba(141,15,17,0.12)] bg-white/90 text-[#4a4a4a] shadow-[0_3px_12px_rgba(141,15,17,0.05)] hover:-translate-y-0.5 hover:border-[#8D0F11] hover:text-[#8D0F11] hover:shadow-[0_8px_20px_rgba(141,15,17,0.08)]"
                  }`}
                >
                  <span
                    className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      isActive
                        ? "bg-white/14 text-white"
                        : "bg-[rgba(141,15,17,0.08)] text-[#8D0F11]"
                    }`}
                  >
                    <MapPin size={14} />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    {/* Location name — was font-black, semibold is enough for a pill label */}
                    <span className="text-[12px] font-semibold leading-none">
                      {location.name}
                    </span>
                    {/* Date range — was font-medium, dropped to font-normal; pure metadata */}
                    <span
                      className={`mt-1 text-[9px] font-normal leading-[1.35] ${
                        isActive ? "text-white/70" : "text-[#888]"
                      }`}
                    >
                      {location.packageDates}
                    </span>
                  </span>
                  <span className="ml-auto flex shrink-0 flex-col items-end">
                    {/* Hours badge — was font-bold, semibold suffices */}
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.08em] ${
                        isActive
                          ? "bg-white/14 text-white"
                          : "bg-[rgba(141,15,17,0.08)] text-[#8D0F11]"
                      }`}
                    >
                      {location.totalHours}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Soft feature tags — was font-medium, dropped to font-normal */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={heroItemVariants}
          className="mb-[14px] flex flex-wrap gap-[6px]"
        >
          {["Expert Mentors", "STEM Learning", "Project Based"].map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-[5px] rounded-full border border-[rgba(141,15,17,0.1)] bg-[rgba(141,15,17,0.04)] px-[10px] py-[3px] text-[11px] font-normal text-[#777]"
            >
              {item}
            </span>
          ))}
        </motion.div>

        {/* Highlight chips — was font-semibold, keep; these are differentiators worth emphasizing */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={heroItemVariants}
          className="mb-[14px] flex flex-wrap gap-[6px]"
        >
          {[
            "🎓 Certificate",
            "🚁 Drone Included",
            "🔬 Hands-on STEM",
            "💡 Entrepreneurship",
          ].map((text) => (
            <div
              key={text}
              className="inline-flex items-center gap-[6px] rounded-lg border border-[rgba(141,15,17,0.14)] bg-[rgba(141,15,17,0.06)] px-[10px] py-[5px] text-[11px] font-medium text-[#8D0F11] transition-all duration-200 hover:-translate-y-px hover:bg-[rgba(141,15,17,0.1)]"
            >
              {text}
            </div>
          ))}
        </motion.div>

        {/* Info cards */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={heroItemVariants}
          className="grid grid-cols-1 gap-2 sm:grid-cols-3"
        >
          {[
            {
              label: "Duration",
              value: activeLocation.totalHours,
              icon: <Clock size={10} />,
            },
            {
              label: "Schedule",
              value: activeLocation.days,
              icon: <CalendarDays size={10} />,
            },
            {
              label: "Locations",
              value: "Kharadi · Kalyani Nagar · Magarpatta",
              icon: <MapPin size={10} />,
            },
          ].map(({ label, value, icon }) => (
            <div
              key={label}
              className="rounded-xl border border-[rgba(141,15,17,0.1)] bg-white/90 px-3 py-[10px] shadow-[0_2px_10px_rgba(141,15,17,0.05)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(141,15,17,0.1)]"
            >
              {/* Card label — was no weight set, explicit normal */}
              <p className="m-0 mb-[2px] flex items-center gap-[3px] text-[10px] font-normal text-[#aaa]">
                {icon} {label}
              </p>
              {/* Card value — was font-bold, semibold is enough at this size */}
              <p className="m-0 truncate text-[12px] font-semibold text-[#8D0F11]">
                {value}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
