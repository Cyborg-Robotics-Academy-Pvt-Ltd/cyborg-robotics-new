import { CountUp } from "@/components/lightswind/count-up";

type Stat = {
  value: number;
  suffix: string;
  label: string;
};

const STATS: readonly Stat[] = [
  { value: 10000, suffix: "+", label: "Students Trained*" },
  { value: 10, suffix: "+", label: "Years of Experience" },
  { value: 50, suffix: "+", label: "Competitions & Events" },
  { value: 10, suffix: "+", label: "Awards & Achievements" },
] as const;

export default function TrustStats() {
  return (
    <section
      aria-label="Our track record"
      className="border-y border-gray-200 bg-gray-50/60 py-12 md:py-14"
    >
      <dl className="mx-auto grid max-w-[1180px] grid-cols-2 gap-y-10 px-6 text-center md:grid-cols-4 md:gap-y-0 md:divide-x md:divide-gray-200">
        {STATS.map(({ value, suffix, label }) => (
          <div
            key={label}
            className="flex flex-col-reverse items-center gap-2 px-4"
          >
            <dt className="max-w-[160px] text-xs font-semibold uppercase leading-snug tracking-wider text-gray-600 md:text-sm">
              {label}
            </dt>
            <dd
              className="text-4xl font-black leading-none tabular-nums tracking-tight text-gray-900 md:text-5xl"
              aria-label={`${value.toLocaleString("en-IN")}${suffix}`}
            >
              <span aria-hidden="true">
                <CountUp value={value} duration={2} />
                <span className="text-orange-600">{suffix}</span>
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
