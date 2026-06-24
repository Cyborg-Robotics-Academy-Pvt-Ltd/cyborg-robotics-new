"use client";
import { Cpu, Package, SquareDashedBottomCode, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";
import { roadmapPhases } from "@/data/roadmap";

const BRAND = "#B82D33";

const RobotIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 512 512"
  >
    <path d="M0 0h512v512H0z" fill="none" />
    <path
      fill="currentColor"
      d="m283.016 48.38l-139.713 83.54a59.9 59.9 0 0 0-17.585-2.632C91.632 129.288 64 157.904 64 193.204c0 14.546 4.692 27.957 12.594 38.699a64 64 0 0 1-2.918-4.325l75.413 135.295l-.137.557a88.3 88.3 0 0 0-2.439 20.679l.013 42.607l-41.158.004v42.611h257.299v-42.667l-51.559.052l-.012-42.607c0-34.106-19.346-63.533-47.294-77.153l-4.438-1.999l-60.217-108.02l105.111-62.851l45.841 82.325c-1.918 7.072-1.495 14.819 1.621 21.884l1.363 2.739c2.069 3.709 4.747 6.828 7.828 9.296l.028 43.648l-.037.164l39.743 11.029l5.325-20.58l-24.457-6.802l.002-20.818c4.685-.265 9.382-1.644 13.723-4.24c4.593-2.746 8.247-6.531 10.844-10.903l18.013 10.779l-6.488 25.161l19.872 5.514L448 242.357l-.046-.005l.034-.067l-37.749-22.591a32.7 32.7 0 0 0-3.706-10.619c-4.794-8.599-12.864-14.018-21.635-15.542l-47.13-84.511c8.451-13.07 9.561-30.503 1.454-45.045c-11.362-20.38-36.526-27.364-56.206-15.597m-54.211 293.118c21.691 0 39.462 17.383 41.032 39.431l.113 3.18v42.611h-82.291v-42.611c0-22.464 16.785-40.867 38.075-42.494zm-58.397-104.21l2.278-2.616l37.087 66.506l.785-.188c-12.526 2.936-23.968 8.832-33.605 16.939l-3.588 3.2l-36.294-65.087l-.561.105c13.232-2.417 25.01-9.199 33.898-18.859m-44.69-65.389c11.362 0 20.573 9.539 20.573 21.305s-9.211 21.306-20.573 21.306s-20.572-9.539-20.572-21.306c0-11.766 9.21-21.305 20.572-21.305m175.35-96.784c5.681 0 10.286 4.77 10.286 10.653s-4.605 10.653-10.286 10.653s-10.286-4.77-10.286-10.653s4.605-10.653 10.286-10.653"
    />
  </svg>
);

const DroneIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="40"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M9.846 15q-1.502 0-2.561 1.023q-1.06 1.023-1.237 2.477q-.048.214-.192.357T5.499 19t-.353-.146t-.104-.354q.16-1.473 1.033-2.616q.873-1.142 2.196-1.601l-.423-3.667h-2.06q-.343 0-.575-.233t-.232-.575V6H2.519q-.212 0-.356-.144t-.144-.357t.144-.356T2.519 5h5.923q.213 0 .357.144t.143.357t-.143.356T8.442 6H5.981v3.616h1.738l-.017-.208q-.05-.324.17-.558t.536-.234h7.165q.316 0 .536.234t.17.558l-.017.208h1.719V6h-2.462q-.212 0-.356-.144t-.144-.357t.144-.356t.356-.143h5.948q.213 0 .356.144t.144.357t-.144.356t-.356.143h-2.461v3.808q0 .343-.233.575t-.575.233h-2.04l-.424 3.667q1.324.46 2.197 1.602t1.032 2.615q.037.208-.107.354t-.357.146t-.356-.143t-.191-.357q-.177-1.473-1.249-2.486T14.131 15zm-.605-1h5.5l.496-4.384H8.719z" />
  </svg>
);

const ICON_MAP: Record<string, React.ReactNode> = {
  Bot: <RobotIcon />,
  Cpu: <Cpu size={28} />,
  Box: <Package size={28} />,
  Code2: <SquareDashedBottomCode size={28} />,
  Plane: <DroneIcon />,
  Trophy: <Trophy size={28} />,
};

const phases = roadmapPhases.map((p) => ({
  ...p,
  phase: p.label,
  name: p.title,
  icon: ICON_MAP[p.icon] ?? <Cpu size={28} />,
}));

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

const LearningJourney = () => {
  return (
    <section className="py-6 px-4 font-sans">
      {/* Header */}
      <div className="text-center mb-10">
        <p className="text-[10px] font-semibold tracking-[0.22em] text-gray-400 uppercase mb-2">
          Curriculum Roadmap
        </p>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Your <span className="text-red-600">Learning Journey</span>
        </h2>
        <div className="flex items-center justify-center gap-1.5">
          <div className="h-0.5 w-10 bg-red-600 rounded" />
          <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
          <div className="h-0.5 w-10 bg-red-600 rounded" />
        </div>
      </div>

      {/* Mobile: vertical timeline */}
      <div className="flex flex-col gap-0 md:hidden">
        {phases.map((p, i) => (
          <div key={p.id} className="flex items-start gap-4 relative pb-6">
            {/* Icon column */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center border-[1.5px]"
                style={{
                  borderColor: BRAND,
                  backgroundColor: p.isFinal ? BRAND : "white",
                  color: p.isFinal ? "white" : BRAND,
                }}
              >
                {p.icon}
              </div>
              {i < phases.length - 1 && (
                <div
                  className="w-0.5 flex-1 mt-1 min-h-[20px]"
                  style={{ backgroundColor: BRAND, opacity: 0.25 }}
                />
              )}
            </div>

            {/* Content column */}
            <div className="pt-2 flex-1">
              <span
                className="text-[9px] font-semibold tracking-[0.16em] uppercase px-2 py-0.5 rounded-full border inline-block"
                style={{
                  color: BRAND,
                  background: "rgba(184,45,51,0.08)",
                  borderColor: "rgba(184,45,51,0.2)",
                }}
              >
                {p.phase}
              </span>
              <p className="mt-1 text-sm font-medium text-gray-800 leading-snug">
                {p.name}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: horizontal timeline */}
      <div className="hidden md:block">
        <div className="flex items-start justify-between relative gap-1">
          <div
            className="absolute top-7 left-[8%] right-[8%] border-t-2 border-dashed z-0"
            style={{ borderColor: BRAND, opacity: 0.3 }}
          />
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="flex items-start justify-between w-full relative"
          >
            {phases.map((p) => (
              <div
                key={p.id}
                className="flex flex-col items-center flex-1 z-10 relative"
              >
                <motion.div
                  variants={item}
                  className="flex flex-col items-center"
                >
                  <motion.div
                    whileHover={{ y: -4, scale: 1.07 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    className="w-14 h-14 rounded-full flex items-center justify-center border-[1.5px]"
                    style={{
                      borderColor: BRAND,
                      backgroundColor: p.isFinal ? BRAND : "white",
                      color: p.isFinal ? "white" : BRAND,
                    }}
                  >
                    {p.icon}
                  </motion.div>
                  <span
                    className="mt-2.5 text-[9px] font-semibold tracking-[0.16em] uppercase px-2 py-0.5 rounded-full border"
                    style={{
                      color: BRAND,
                      background: "rgba(184,45,51,0.08)",
                      borderColor: "rgba(184,45,51,0.2)",
                    }}
                  >
                    {p.phase}
                  </span>
                  <p className="mt-1 text-[11px] font-medium text-gray-800 text-center leading-snug max-w-[76px]">
                    {p.name}
                  </p>
                </motion.div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LearningJourney;
