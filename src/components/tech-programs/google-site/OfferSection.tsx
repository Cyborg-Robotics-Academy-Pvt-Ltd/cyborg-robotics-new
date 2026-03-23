import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  LayoutTemplate,
  ImagePlus,
  Share2,
  BadgeCheck,
  Brain,
  ArrowRight,
  Zap,
  Sparkles,
} from "lucide-react";

const GoogleSitesOfferSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const whyLearn = [
    {
      text: "Create a real website using Google Sites",
      subtext:
        "No code, no complexity — a beginner-friendly platform used by students worldwide",
      icon: Globe,
      accent: "#0855AB",
      category: "Skills",
    },
    {
      text: "Organize projects & achievements professionally",
      subtext:
        "Structure an About Me page, project showcase, and certificates section",
      icon: LayoutTemplate,
      accent: "#A81B1E",
      category: "Skills",
    },
    {
      text: "Add images, content & format like a pro",
      subtext:
        "Learn digital presentation skills used in real-world portfolios",
      icon: ImagePlus,
      accent: "#0855AB",
      category: "Skills",
    },
    {
      text: "Publish & share your website online",
      subtext:
        "Walk away with a live website link you can update and share anytime",
      icon: Share2,
      accent: "#A81B1E",
      category: "Experience",
    },
    {
      text: "Build your digital identity early",
      subtext:
        "Students who showcase work online stand out — start that habit now",
      icon: BadgeCheck,
      accent: "#0855AB",
      category: "Experience",
    },
    {
      text: "Develop digital confidence & creative thinking",
      subtext:
        "Skills that transfer to academics, competitions, and future career profiles",
      icon: Brain,
      accent: "#A81B1E",
      category: "Experience",
    },
  ];

  const tags = ["No Coding Needed", "Live Website", "Digital Skills"];

  return (
    <div className="relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        .offer-section { font-family: 'DM Sans', sans-serif; }
        .offer-heading { font-family: 'Syne', sans-serif; }

        .learn-card {
          transition: all 0.28s cubic-bezier(0.23, 1, 0.32, 1);
          cursor: default;
        }
        .learn-card:hover { transform: translateX(4px); }

        .video-card { transition: box-shadow 0.3s ease; }
        .video-card:hover { box-shadow: 0 28px 64px rgba(6,35,65,0.18); }

        .tag-pill {
          font-family: 'Syne', sans-serif;
          font-size: 10px; font-weight: 700; letter-spacing: 0.08em;
        }
        .section-badge {
          font-family: 'Syne', sans-serif;
          font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
        }
        .category-label {
          font-family: 'Syne', sans-serif;
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
        }
        .cta-btn {
          font-family: 'Syne', sans-serif;
          font-weight: 700; letter-spacing: 0.04em;
          transition: all 0.25s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .cta-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(168,27,30,0.35);
        }
        .cta-btn:hover .arrow-icon { transform: translateX(3px); }
        .arrow-icon { transition: transform 0.25s ease; }

        .first-card {
          background: linear-gradient(135deg, #f0f6ff 0%, #ffffff 100%) !important;
        }
        .stat-chip {
          font-family: 'Syne', sans-serif;
          font-size: 10px; font-weight: 700; letter-spacing: 0.06em;
        }
      `}</style>

      <motion.section
        className="offer-section relative py-4 md:py-4 overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, #ffffff 0%, #f5f8fc 45%, #f0f5fb 70%, #ffffff 100%)",
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.022]"
          style={{
            backgroundImage:
              "linear-gradient(#062341 1px, transparent 1px), linear-gradient(90deg, #062341 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        {/* Ambient orbs */}
        <div className="pointer-events-none absolute -left-40 top-10 h-[400px] w-[400px] rounded-full bg-[#0855AB]/6 blur-[100px]" />
        <div className="pointer-events-none absolute -right-40 bottom-10 h-[400px] w-[400px] rounded-full bg-[#A81B1E]/6 blur-[100px]" />

        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6">
          {/* Header */}
          <motion.div
            className="mb-12 md:mb-16 max-w-2xl"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 bg-[#A81B1E] rounded-full text-white px-4 py-2 mb-5 shadow-sm section-badge"
              initial={{ opacity: 0, scale: 0.88 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              WHY THIS WORKSHOP MATTERS
            </motion.div>

            <h2 className="offer-heading text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-[#062341] mb-4 leading-[1.1] tracking-tight">
              Why Every Student Needs{" "}
              <span className="gradient-text">a Portfolio</span>
              <br />
              <span className="gradient-text">Website?</span>
            </h2>

            <p className="text-slate-500 text-base md:text-lg leading-relaxed font-light mt-4 max-w-xl">
              Today students aren't just learning skills — they're showing their
              work online. In this workshop, students don't just watch — they{" "}
              <span className="text-[#062341] font-medium">
                build, publish, and walk away
              </span>{" "}
              with a live personal website ready to share.
            </p>
          </motion.div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">
            {/* Media panel */}
            <motion.div
              className="video-card relative h-[320px] md:h-[440px] rounded-3xl overflow-hidden lg:sticky lg:top-8"
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, ease: [0.23, 1, 0.32, 1] }}
              style={{
                boxShadow:
                  "0 8px 40px rgba(6,35,65,0.12), 0 2px 8px rgba(6,35,65,0.06)",
              }}
            >
              {/* Border frame */}
              <div
                className="absolute inset-0 rounded-3xl z-10 pointer-events-none"
                style={{
                  border: "1.5px solid transparent",
                  background:
                    "linear-gradient(transparent, transparent) padding-box, linear-gradient(135deg, #A81B1E40, #0855AB40) border-box",
                }}
              />

              {/* TODO: Replace with actual Google Sites workshop video */}
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                poster="/assets/google-sites/workshop.jpg"
                className="w-full h-full object-cover"
              >
                <source
                  src="/assets/google-sites/workshop.mp4"
                  type="video/mp4"
                />
              </video>

              {/* Overlay */}
              <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#062341]/95 via-[#062341]/60 to-transparent p-5 md:p-6">
                <div className="flex gap-3 mb-3">
                  {[
                    { val: "10–16", label: "Age group" },
                    { val: "2 hrs", label: "Session" },
                    { val: "₹99", label: "Only" },
                  ].map(({ val, label }) => (
                    <div key={label} className="flex flex-col">
                      <span className="offer-heading text-white text-sm font-bold leading-none">
                        {val}
                      </span>
                      <span className="stat-chip text-white/55 mt-0.5">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="offer-heading text-white text-sm md:text-base font-semibold mb-3 leading-snug">
                  From blank page to live portfolio website.
                </p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="tag-pill rounded-full bg-white/15 backdrop-blur-sm border border-white/25 px-3 py-1 text-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Why-learn list */}
            <div>
              {["Skills", "Experience"].map((cat, catIdx) => (
                <div key={cat} className={catIdx > 0 ? "mt-1" : ""}>
                  <motion.div
                    className="flex items-center gap-2 mb-1"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: catIdx * 0.15 }}
                  >
                    <span
                      className="category-label"
                      style={{ color: catIdx === 0 ? "#0855AB" : "#A81B1E" }}
                    >
                      {cat}
                    </span>
                    <div
                      className="flex-1 h-px"
                      style={{
                        background: `linear-gradient(90deg, ${catIdx === 0 ? "#0855AB" : "#A81B1E"}30, transparent)`,
                      }}
                    />
                  </motion.div>

                  <div className="space-y-2">
                    {whyLearn
                      .map((item, originalIndex) => ({
                        ...item,
                        originalIndex,
                      }))
                      .filter((item) => item.category === cat)
                      .map(
                        ({
                          text,
                          subtext,
                          icon: ItemIcon,
                          accent,
                          originalIndex,
                        }) => {
                          const isFirst = originalIndex === 0;
                          const isHovered = hoveredIndex === originalIndex;
                          return (
                            <motion.div
                              key={text}
                              className={`learn-card flex items-start gap-4 rounded-2xl border px-5 py-4 ${isFirst ? "first-card" : "bg-white"}`}
                              style={{
                                borderColor: isFirst
                                  ? `${accent}35`
                                  : isHovered
                                    ? `${accent}30`
                                    : `${accent}15`,
                                boxShadow: isFirst
                                  ? `0 4px 20px ${accent}12, 0 1px 4px ${accent}08`
                                  : `0 2px 10px rgba(6,35,65,0.04)`,
                              }}
                              initial={{ opacity: 0, x: 20 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{
                                duration: 0.45,
                                delay: originalIndex * 0.08,
                                ease: [0.23, 1, 0.32, 1],
                              }}
                              onMouseEnter={() =>
                                setHoveredIndex(originalIndex)
                              }
                              onMouseLeave={() => setHoveredIndex(null)}
                            >
                              <div
                                className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center mt-0.5"
                                style={{
                                  background: `${accent}12`,
                                  boxShadow: `0 0 0 4px ${accent}08`,
                                }}
                              >
                                <ItemIcon
                                  size={20}
                                  style={{ color: accent }}
                                  strokeWidth={1.7}
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <p
                                  className="text-slate-800 text-sm md:text-base leading-snug font-semibold"
                                  style={isFirst ? { color: "#062341" } : {}}
                                >
                                  {text}
                                  {isFirst && (
                                    <span
                                      className="inline-flex items-center gap-0.5 ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full align-middle"
                                      style={{
                                        background: `${accent}15`,
                                        color: accent,
                                        fontFamily: "Syne, sans-serif",
                                        letterSpacing: "0.06em",
                                      }}
                                    >
                                      <Sparkles size={9} />
                                      START HERE
                                    </span>
                                  )}
                                </p>
                                <p className="text-slate-400 text-xs md:text-sm mt-1 leading-relaxed font-light">
                                  {subtext}
                                </p>
                              </div>
                            </motion.div>
                          );
                        },
                      )}
                  </div>
                </div>
              ))}

              {/* CTA */}
              <motion.div
                className="mt-7 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.55, duration: 0.45 }}
              >
                <button className="cta-btn inline-flex items-center gap-2 bg-[#A81B1E] text-white text-sm px-6 py-3 rounded-xl shadow-md">
                  <Zap size={15} strokeWidth={2.2} />
                  Secure Your Seat – ₹99
                  <ArrowRight size={14} className="arrow-icon" />
                </button>
                <p className="text-slate-400 text-xs font-light leading-snug">
                  No coding needed &middot; Age 10–16
                  <br />
                  <span className="text-[#0855AB] font-medium">
                    2 May 2026 · Live on Zoom
                  </span>
                </p>
              </motion.div>

              {/* Progress dots */}
              <motion.div
                className="flex items-center gap-1.5 mt-6 px-1"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.65 }}
              >
                {whyLearn.map((item, i) => (
                  <div
                    key={i}
                    className="h-0.5 flex-1 rounded-full transition-all duration-300"
                    style={{
                      background: item.accent,
                      opacity: hoveredIndex === i ? 0.7 : 0.2,
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default GoogleSitesOfferSection;
