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
    <section className="mx-auto max-w-7xl px-6">
      <Card className="rounded-[20px] border-none bg-[#0a2f82] text-white shadow-sm">
        <CardContent className="grid px-8 py-5 lg:grid-cols-4">
          {items.map((item, i) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className={`flex items-center gap-4 py-2 ${i !== 0 ? "pl-5" : ""} ${
                  i !== items.length - 1 ? "border-r border-white/20 pr-5" : ""
                }`}
              >
                <div
                  className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full ${iconStyles[item.iconColor]}`}
                >
                  <Icon className="h-6 w-6" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold uppercase leading-tight tracking-wide">
                    {item.title}
                  </h3>
                  <p className="text-[13px] text-white/70">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </section>
  );
}
