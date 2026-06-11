import Image from "next/image";
import { Bot, Cpu, ScanEye, Radio, Plane, Printer } from "lucide-react";

const specializations = [
  { icon: Bot, title: "PROTOTYPE SHOWCASE" },
  { icon: Cpu, title: "LIVE DEMONSTRATIONS" },
  { icon: ScanEye, title: "PARENT INTERACTION" },
  { icon: Radio, title: "STUDENT PRESENTATIONS" },
  { icon: Plane, title: "CERTIICATION CEREMONY" },
];

export default function FutureTech() {
  return (
    <section className="w-full py-6">
      <div className="mx-auto max-w-7xl px-4">
        <div className="overflow-hidden rounded-3xl border border-orange-200 bg-white">
          <div className="flex flex-col lg:grid lg:grid-cols-[40%_60%_60%] lg:h-[280px]">
            {/* IMAGE — top on mobile, right on desktop */}
            <div className="relative h-48 lg:h-full lg:order-2">
              <Image
                src="/assets/robotics-expo-stage.png"
                alt="Future Tech Specialization"
                fill
                className="object-cover"
                priority
              />
              {/* Mobile: fade bottom-to-white */}
              <div
                className="absolute inset-0 lg:hidden"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent 40%, white 100%)",
                }}
              />
              {/* Desktop: fade left-to-white */}
              <div
                className="absolute inset-0 hidden lg:block"
                style={{
                  background:
                    "linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0.98) 2%, rgba(255,255,255,0.85) 25%, rgba(255,255,255,0) 35%)",
                }}
              />
            </div>

            {/* LEFT / BOTTOM */}
            <div className="flex flex-col justify-center p-5 lg:p-6 lg:order-1">
              <h2 className="text-2xl font-bold leading-tight text-neutral-900 md:text-3xl">
                FUTURE TECH
                <br />
                SPECIALIZATION
              </h2>

              <div className="mt-2 h-[2px] w-12 bg-orange-500" />

              {/* Mobile: 3-col wrap grid | Desktop: single row */}
              <div className="mt-5 grid grid-cols-3 gap-x-3 gap-y-4 lg:flex lg:justify-between lg:gap-2">
                {specializations.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="flex flex-col items-center text-center"
                    >
                      <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 lg:h-auto lg:w-auto lg:rounded-none lg:border-0 lg:bg-transparent">
                        <Icon
                          size={28}
                          className="text-red-600"
                          strokeWidth={1.8}
                        />
                      </div>
                      <span className="max-w-[72px] whitespace-pre-line text-[10px] font-bold uppercase leading-tight text-neutral-800 lg:max-w-[80px]">
                        {item.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
