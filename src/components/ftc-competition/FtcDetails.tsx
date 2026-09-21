import React from "react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

const FtcDetails = () => {
  return (
    <section
      id="about-ftc"
      className="relative w-full overflow-hidden bg-black text-white"
    >
      {/* top status bar */}
      <div className="flex items-center gap-2 border-b border-red-600/30 bg-black px-4 py-2 text-[10px] tracking-[0.2em] text-red-500 sm:px-8">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
        <span>SYSTEM ONLINE</span>
        <span className="ml-2 h-px flex-1 bg-red-600/30" />
      </div>

      <div className="grid grid-cols-1 gap-8 px-4 py-10 sm:px-8 lg:grid-cols-[1fr_1.4fr_1fr] lg:items-center lg:gap-6 lg:py-14">
        {/* LEFT — The Season */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-red-500">
            <span>→</span>
            <span>THE SEASON</span>
          </div>
          <h2 className="text-4xl font-extrabold leading-none tracking-tight sm:text-5xl">
            2026&nbsp;&ndash;&nbsp;27
          </h2>
          <p className="text-sm font-semibold tracking-wide text-gray-200">
            A NEW GAME. A NEW CHALLENGE.
          </p>
          <p className="max-w-xs text-sm leading-relaxed text-gray-400">
            The 2026&ndash;27 season brings a fresh game, new opportunities and
            bigger challenges. Are you ready?
          </p>
        </div>

        {/* CENTER — BioBuzz banner */}
        <div className="relative h-56 w-full overflow-hidden rounded-3xl sm:h-64 lg:h-80">
          {/* dummy image placeholder — swap src when real asset is ready */}
          <Image
            src="https://res.cloudinary.com/dqiarwxml/image/upload/v1789972269/ChatGPT_Image_Sep_21_2026_12_00_03_PM_z0acvu.png"
            alt="BioBuzz — presented by RTX"
            fill
            sizes="(min-width: 1024px) 47vw, 100vw"
            quality={75}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        {/* RIGHT — What is FTC */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-red-500">
            <span>→</span>
            <span>WHAT IS FTC?</span>
          </div>
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            MORE THAN JUST A ROBOT.
          </h2>
          <p className="max-w-xs text-sm leading-relaxed text-gray-400">
            FTC is a global robotics competition where students design, build,
            program and compete with real robots. It&apos;s about innovation,
            teamwork and solving real-world problems.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FtcDetails;
