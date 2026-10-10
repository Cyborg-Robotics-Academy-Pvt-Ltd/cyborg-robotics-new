import { Trophy, Award, Medal, ArrowRight } from "lucide-react";

const WINNERS = [
  {
    icon: Trophy,
    color: "text-[#F5C518]",
    ring: "bg-[#F5C518]/10",
    label: "Technical Winner",
    name: "Nimrat Pahwa",
  },
  {
    icon: Award,
    color: "text-[#94A3B8]",
    ring: "bg-[#94A3B8]/10",
    label: "Social Winner",
    name: "Rohan Erigipally",
  },
  {
    icon: Medal,
    color: "text-[#F97316]",
    ring: "bg-[#F97316]/10",
    label: "Runner-up",
    name: "Keerat Goyal",
  },
];

export default function Winners() {
  return (
    <section id="rewards" className="scroll-mt-24 bg-[#EEF2F8] py-20">
      <div className="mx-auto max-w-[1300px] px-6 sm:px-8 lg:px-12 grid lg:grid-cols-[1.4fr_1fr] gap-8 items-stretch">
        {/* Winners showcase */}
        <div>
          <p className="text-xs font-semibold tracking-wide text-[#2563A8] uppercase">
            From the CodeFest Community
          </p>
          <h2 className="mt-3 font-extrabold text-2xl sm:text-3xl text-[#0A1F44]">
            Block-Based Edition Winn
            <span className="text-[#4ADE80]">ers</span>
          </h2>

          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {WINNERS.map((w) => (
              <div
                key={w.name}
                className="rounded-xl border border-black/[0.06] bg-white p-5 text-center shadow-[0_4px_16px_-4px_rgba(10,31,68,0.08)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_10px_24px_-6px_rgba(10,31,68,0.14)]"
              >
                <div
                  className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${w.ring}`}
                >
                  <w.icon className={w.color} size={26} strokeWidth={1.8} />
                </div>
                <p className="mt-4 text-[11px] font-semibold tracking-wide text-[#64748B] uppercase">
                  {w.label}
                </p>
                <p className="mt-1 font-bold text-[#0A1F44]">{w.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="hidden lg:flex flex-col justify-center border-l border-black/10 pl-10">
          <Trophy className="text-[#4ADE80]" size={28} strokeWidth={1.8} />
          <h3 className="mt-4 font-extrabold text-xl text-[#0A1F44] leading-snug">
            Think you&apos;ve got what it takes to be next?
          </h3>
          <p className="mt-2 text-sm text-[#64748B]">
            The next big idea could be yours.
          </p>
          <a
            href="#join"
            className="mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-[#0A1F44] px-6 py-3 text-sm font-semibold text-white hover:bg-[#12295C] transition"
          >
            Join CodeFest 2.O Python Edition <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
