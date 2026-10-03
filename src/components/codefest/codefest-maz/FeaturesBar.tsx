import { BrainCircuit, Clock3, Globe2, Trophy } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const items = [
  {
    title: "120 MINUTES",
    desc: "Live Coding Challenge",
    iconColor: "yellow" as const,
    icon: Clock3,
  },
  {
    title: "SKILL BASED",
    desc: "Logic • Creativity • UI Design",
    iconColor: "red" as const,
    icon: BrainCircuit,
  },
  {
    title: "ONLINE MODE",
    desc: "Pan India Competition",
    iconColor: "yellow" as const,
    icon: Globe2,
  },
  {
    title: "EXCITING REWARDS",
    desc: "For Top Performers",
    iconColor: "red" as const,
    icon: Trophy,
  },
];

const iconStyles = {
  yellow: "bg-[#f5c518] text-[#1a1a1a]",
  red: "bg-[#7b1a2a] text-white",
};

export default function FeatureBar() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 mt-4">
      <Card className="overflow-hidden rounded-2xl border-none bg-[#0a2f82] text-white shadow-sm">
        <CardContent className="grid grid-cols-1 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className={`
                  flex items-center gap-4 px-5 py-5
                  
                  ${
                    i !== items.length - 1
                      ? "border-b border-white/15 sm:border-b-0"
                      : ""
                  }

                  ${i % 2 === 0 ? "sm:border-r sm:border-white/15" : ""}

                  ${i < 3 ? "lg:border-r lg:border-b-0 lg:border-white/15" : ""}
                `}
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:h-[52px] sm:w-[52px] ${iconStyles[item.iconColor]}`}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-bold uppercase leading-tight tracking-wide sm:text-[15px]">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-xs leading-relaxed text-white/70 sm:text-[13px]">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </section>
  );
}
