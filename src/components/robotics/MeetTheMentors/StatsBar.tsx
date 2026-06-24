// components/MeetTheMentors/StatsBar.tsx
import { Stat } from "./types";

interface StatsBarProps {
  stats: Stat[];
}

export const StatsBar = ({ stats }: StatsBarProps) => {
  return (
    <div className="flex flex-wrap items-center justify-center bg-white rounded-2xl border border-[#f0e8e8] px-6 py-5 mb-12">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={`
            flex items-center gap-4 px-6 py-2
            ${i !== stats.length - 1 ? "border-r border-[#f0e8e8]" : ""}
          `}
        >
          <div className="w-11 h-11 bg-[#FEF0F0] rounded-xl flex items-center justify-center shrink-0">
            {stat.icon}
          </div>
          <div>
            <p className="font-syne font-extrabold text-[22px] text-[#0B1120] leading-none m-0">
              {stat.value}
            </p>
            <p className="text-[12px] text-gray-400 font-medium mt-1 m-0">
              {stat.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
