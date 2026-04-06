"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { AGE_GROUPS } from "./constants";
import { createStaggerContainer, fadeUpVariants } from "./motion";
import type { AgeGroup, CampLocation, LocationId } from "./types";

interface Props {
  locations: CampLocation[];
  activeLocationId: LocationId;
  selectedAge: AgeGroup;
  onSelectLocation: (id: LocationId) => void;
}

const PricingSection = ({
  locations,
  activeLocationId,
  selectedAge,
  onSelectLocation,
}: Props) => {
  return (
    <motion.section
      className="bg-white px-4 py-16 sm:px-6"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={createStaggerContainer(0.1)}
    >
      <div className="mx-auto max-w-[1200px]">
        {/* Header */}
        <motion.div variants={fadeUpVariants} className="mb-10 text-center">
          {/* Badge — was font-bold */}
          <span className="mb-3 inline-block rounded-full border border-[rgba(141,15,17,0.15)] bg-[rgba(141,15,17,0.07)] px-4 py-1 text-[11px] font-semibold uppercase tracking-widest text-[#8D0F11]">
            Pricing
          </span>
          <h2 className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-[clamp(1.8rem,3.5vw,2.6rem)] font-black leading-tight text-transparent">
            Invest In Their Future
          </h2>
          <p className="mx-auto mt-3 max-w-[400px] text-[13px] font-normal leading-[1.65] text-[#888]">
            Early bird pricing available for a limited time. Pick your nearest
            center.
          </p>
        </motion.div>

        {/* Location cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {locations.map((location) => {
            // Starting price = min early bird across all age groups
            const startingPrice = Math.min(
              ...AGE_GROUPS.map((age) => location.fullPackage.earlyBird[age]),
            );
            const originalPrice = Math.min(
              ...AGE_GROUPS.map((age) => location.fullPackage.prices[age]),
            );
            const isActive = location.id === activeLocationId;

            return (
              <motion.div
                key={location.id}
                variants={fadeUpVariants}
                className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                  isActive
                    ? "border-[#8D0F11] shadow-[0_12px_48px_rgba(141,15,17,0.15)]"
                    : "border-[rgba(0,0,0,0.08)] shadow-[0_2px_16px_rgba(0,0,0,0.04)]"
                }`}
              >
                {/* Dark header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-red-700 to-red-900   p-5">
                  <div className="absolute -right-8 -top-8 h-[120px] w-[120px] rounded-full bg-[rgba(199,62,29,0.2)] blur-[24px]" />
                  <div className="relative z-10">
                    {/* Location name — was font-black text-20, semibold text-18 */}
                    <div className="text-[17px] font-semibold text-white">
                      {location.name}
                    </div>
                    {/* Meta — was no explicit weight */}
                    <div className="mt-1 text-[11px] font-normal text-white/80">
                      {location.packageDates} · {location.days}
                    </div>
                    <div className="mt-0.5 text-[11px] font-normal text-white/80">
                      {location.totalHours} of learning
                    </div>
                  </div>
                </div>

                {/* White body */}
                <div className="bg-white p-5">
                  {/* ── Marketing price block — starting from only ── */}
                  <div
                    className={`mb-5 rounded-xl border p-4 text-center ${
                      isActive
                        ? "border-[rgba(141,15,17,0.2)] bg-[rgba(141,15,17,0.04)]"
                        : "border-[rgba(0,0,0,0.06)] bg-[#FAFAFA]"
                    }`}
                  >
                    <div className="mb-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-[#8D0F11]">
                      Early Bird — Starting From
                    </div>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-[13px] font-normal text-[#bbb] line-through">
                        ₹{originalPrice.toLocaleString("en-IN")}
                      </span>
                      <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent font-bold text-2xl">
                        ₹{startingPrice.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] font-normal text-[#aaa]">
                      Price varies by age group · contact us to confirm
                    </p>
                  </div>

                  {/* Included note */}
                  <div className="mb-4 flex items-center gap-2 rounded-xl border border-[rgba(141,15,17,0.1)] bg-[rgba(141,15,17,0.04)] px-3 py-2">
                    <Trophy size={12} className="shrink-0 text-[#8D0F11]" />
                    {/* was font-semibold */}
                    <span className="text-[11px] font-normal text-[#666]">
                      Full package includes all courses + certificate
                    </span>
                  </div>

                  {/* CTA — was font-bold, semibold */}
                  <button
                    onClick={() => onSelectLocation(location.id)}
                    className={`w-full cursor-pointer rounded-xl border-0 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-br from-[#8D0F11] to-[#B92423] text-white shadow-[0_6px_20px_rgba(141,15,17,0.3)] hover:-translate-y-0.5"
                        : "bg-[#f5f5f5] text-[#555] hover:bg-[rgba(141,15,17,0.06)] hover:text-[#8D0F11]"
                    }`}
                  >
                    {isActive ? "Book Now →" : `Choose ${location.name}`}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
};

export default PricingSection;
