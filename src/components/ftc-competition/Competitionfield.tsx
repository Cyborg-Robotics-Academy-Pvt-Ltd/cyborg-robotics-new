import React from "react";
import { Crosshair, Target, Zap, Users } from "lucide-react";
import Image from "next/image";

const FEATURES = [
  { icon: Target, label: "STRATEGY" },
  { icon: Crosshair, label: "PRECISION" },
  { icon: Zap, label: "SPEED" },
  { icon: Users, label: "TEAMWORK" },
];

const CompetitionField = () => {
  return (
    <section
      id="competition-field"
      className="relative w-full overflow-hidden bg-[#07090E] text-white"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr]">
        {/* LEFT — copy */}
        <div className="relative z-10 flex flex-col justify-center gap-5 px-6 py-14 sm:px-10 lg:py-20">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-[#B8272A]">
            <span className="h-px w-6 bg-[#B8272A]" />
            <span>ENTER THE ARENA</span>
          </div>

          <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-gray-100 sm:text-4xl lg:text-5xl">
            THE COMPETITION FIELD
          </h2>

          <p className="max-w-sm text-sm leading-relaxed text-[#B8B8BE] sm:text-base">
            Work as a team to score points, solve challenges and outthink your
            opponents in a fast-paced match environment.
          </p>

          <div className="mt-4 flex flex-wrap gap-x-8 gap-y-6">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-start gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#B8272A]/40 bg-[#B8272A]/10">
                  <Icon size={16} className="text-[#B8272A]" />
                </div>
                <span className="text-[11px] font-semibold tracking-[0.15em] text-[#B8B8BE]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — field image with red glow blending into left panel */}
        <div className="relative min-h-[280px] w-full sm:min-h-[360px] lg:min-h-[480px]">
          {/* dummy image placeholder — swap src for the real field render */}
          <Image
            src="https://res.cloudinary.com/dqiarwxml/image/upload/v1789971343/ChatGPT_Image_Sep_21_2026_11_43_28_AM_i7rulz.png"
            alt="The competition field"
            fill
            sizes="(min-width: 1024px) 58vw, 100vw"
            quality={75}
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* red glow ring inset around the field — matches sampled arena red */}
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_20px_rgba(184,39,42,0.25)]" />

          {/* blend left edge of image into the base background */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#07090E] via-[#07090E]/70 to-transparent lg:w-1/4" />

          {/* subtle top/bottom fade for a contained, framed feel */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#07090E]/60 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#07090E]/60 to-transparent" />
        </div>
      </div>
    </section>
  );
};

export default CompetitionField;
