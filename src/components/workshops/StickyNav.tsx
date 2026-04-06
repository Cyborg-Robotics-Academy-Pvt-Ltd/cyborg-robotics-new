"use client";

import { AGE_GROUPS } from "./constants";
import type { AgeGroup, CampLocation, LocationId } from "./types";
import Header from "../layout/header";

interface Props {
  locations: CampLocation[];
  activeLocationId: LocationId;
  onLocationChange: (id: LocationId) => void;
  selectedAge: AgeGroup;
  onAgeChange: (age: AgeGroup) => void;
}

const StickyNav = ({
  locations,
  activeLocationId,
  onLocationChange,
  selectedAge,
  onAgeChange,
}: Props) => {
  return (
    <>
      <div className="mb-18">
        <Header />
      </div>
      <div className="fixed bottom-[104px] left-3 right-3 z-40 rounded-[20px] border border-[rgba(141,15,17,0.12)] bg-white/94 px-3 py-3 shadow-[0_12px_34px_rgba(141,15,17,0.12)] backdrop-blur-md sm:bottom-[88px] sm:left-4 sm:right-4 lg:bottom-6 lg:left-1/2 lg:right-auto lg:w-[min(1120px,calc(100vw-3rem))] lg:-translate-x-1/2">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar lg:flex-1">
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-[#999]">
              Location
            </span>
            {locations.map((location) => (
              <button
                key={location.id}
                onClick={() => onLocationChange(location.id)}
                className={`shrink-0 inline-flex items-center gap-[6px] rounded-xl border px-3 py-[7px] text-[12px] font-bold transition-all duration-200 cursor-pointer ${
                  activeLocationId === location.id
                    ? "border-[#8D0F11] bg-[#8D0F11] text-white shadow-[0_4px_14px_rgba(141,15,17,0.35)]"
                    : "border-[rgba(141,15,17,0.15)] bg-transparent text-[#666] hover:border-[#8D0F11] hover:text-[#8D0F11]"
                }`}
              >
                {location.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar lg:ml-auto lg:shrink-0">
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-[#999]">
              Age
            </span>
            {AGE_GROUPS.map((age) => (
              <button
                key={age}
                onClick={() => onAgeChange(age)}
                className={`shrink-0 rounded-lg border px-2.5 py-[6px] text-[11px] font-bold transition-all duration-200 cursor-pointer ${
                  selectedAge === age
                    ? "border-[#8D0F11] bg-[#8D0F11] text-white shadow-[0_3px_10px_rgba(141,15,17,0.3)]"
                    : "border-[rgba(141,15,17,0.15)] bg-transparent text-[#666] hover:border-[#8D0F11] hover:text-[#8D0F11]"
                }`}
              >
                {age}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default StickyNav;
