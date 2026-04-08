import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Plane,
  Lightbulb,
  MapPin,
  Calendar,
  Clock,
  ChevronDown,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";

// ─── Data ───────────────────────────────────────────────────────────────────

type CourseKey = "gear" | "drone" | "founders";

type WorkshopWeek = {
  label: string;
  dates: string;
  sessionDate: string;
  course: string;
  description: string;
  tag: string | null;
  courseKey: CourseKey;
};

type WorkshopLocation = {
  id: string;
  name: string;
  schedule: string;
  duration: string;
  totalHours: string;
  ageGroups: string[];
  images: string[];
  weeks: WorkshopWeek[];
};

type CourseConfigItem = {
  icon: LucideIcon;
  accent: string;
  category: string;
};

const locations: WorkshopLocation[] = [
  {
    id: "magarpatta",
    name: "Magarpatta",
    schedule: "Every Tuesday (Holiday)",
    duration: "1 Hr per session",
    totalHours: "36 Hrs",
    ageGroups: ["Age 4+", "Age 7+", "Age 10+"],
    images: [
      "/assets/workshops/lego/image.png",
      "/assets/workshops/drone/Image.png",
      "/assets/online-course/innovation.png",
    ],
    weeks: [
      {
        label: "Week 1",
        dates: "20 Apr – 26 Apr",
        sessionDate: "21 Apr",
        course: "Gear Works: Mechanical Robotics",
        description:
          "Build working mechanical robot models using gears, motors and structures while understanding motion, power transfer and basic engineering concepts through hands-on activities.",
        tag: null,
        courseKey: "gear",
      },
      {
        label: "Week 2",
        dates: "27 Apr – 3 May",
        sessionDate: "28 Apr",
        course: "Gear Works: Mechanical Robotics",
        description:
          "Continue building advanced mechanical models and explore gears, motors and simple machines while developing problem solving and engineering thinking.",
        tag: null,
        courseKey: "gear",
      },
      {
        label: "Weeks 3 & 4",
        dates: "4 May – 17 May",
        sessionDate: "5 & 12 May",
        course: "Drone Craft",
        description:
          "Students learn drone technology, aerodynamics and flight control while assembling and practicing safe flying. Each student receives a drone kit to take home.",
        tag: "Take Away Drone Included",
        courseKey: "drone",
      },
      {
        label: "Weeks 5 & 6",
        dates: "18 May – 31 May",
        sessionDate: "19 & 26 May",
        course: "Founders Club",
        description:
          "Students explore innovation and entrepreneurship by identifying real problems, designing solutions and presenting their ideas using design thinking activities.",
        tag: null,
        courseKey: "founders",
      },
    ],
  },
  {
    id: "kalyani-nagar",
    name: "Kalyani Nagar",
    schedule: "Mon / Wed / Thu / Fri",
    duration: "1.5 Hrs per session",
    totalHours: "36 Hrs",
    ageGroups: ["Age 4+", "Age 7+", "Age 10+"],
    images: [
      "/assets/workshops/drone/Drone_1.jpeg",
      "/assets/workshops/lego/image.png",
      "/assets/workshops/drone/Drone_3.jpeg",
    ],
    weeks: [
      {
        label: "Weeks 1 & 2",
        dates: "20 Apr – 1 May",
        sessionDate: "Mon–Wed–Thu–Fri",
        course: "Drone Craft",
        description:
          "Students assemble and understand drone components, aerodynamics and safe flying while practicing guided drone control. Includes take-home drone kit.",
        tag: "Take Away Drone Included",
        courseKey: "drone",
      },
      {
        label: "Weeks 3 & 4",
        dates: "4 May – 15 May",
        sessionDate: "Mon–Wed–Thu–Fri",
        course: "Founders Club",
        description:
          "Innovation based learning where students design solutions for real problems, build concepts and present ideas like young entrepreneurs.",
        tag: null,
        courseKey: "founders",
      },
      {
        label: "Week 5",
        dates: "18 May – 22 May",
        sessionDate: "Mon–Wed–Thu–Fri",
        course: "Gear Works: Mechanical Robotics",
        description:
          "Build mechanical robots using gears, motors and structures while learning motion and engineering basics.",
        tag: null,
        courseKey: "gear",
      },
      {
        label: "Week 6",
        dates: "25 May – 29 May",
        sessionDate: "Mon–Wed–Thu–Fri",
        course: "Gear Works: Mechanical Robotics",
        description:
          "Mechanical design and robotics building challenges to strengthen STEM thinking.",
        tag: null,
        courseKey: "gear",
      },
    ],
  },
  {
    id: "kharadi",
    name: "Kharadi",
    schedule: "Every Tuesday (Holiday)",
    duration: "1 Hr per session",
    totalHours: "24 Hrs",
    ageGroups: ["Age 4+", "Age 7+", "Age 10+"],
    images: [
      "/assets/workshops/lego/image.png",
      "/assets/workshops/drone/Image.png",
      "/assets/online-course/innovation.png",
    ],
    weeks: [
      {
        label: "Week 1",
        dates: "4 May – 10 May",
        sessionDate: "5 May",
        course: "Gear Works: Mechanical Robotics",
        description:
          "Hands-on robotics building where students create mechanical machines using gears, motors and structures while learning basic engineering principles.",
        tag: null,
        courseKey: "gear",
      },
      {
        label: "Week 2",
        dates: "11 May – 17 May",
        sessionDate: "12 May",
        course: "Gear Works: Mechanical Robotics",
        description:
          "Mechanical design challenges focusing on motion, power transfer and building creative robotic models.",
        tag: null,
        courseKey: "gear",
      },
      {
        label: "Weeks 3 & 4",
        dates: "18 May – 31 May",
        sessionDate: "19 & 26 May",
        course: "Drone Craft",
        description:
          "Students explore aerodynamics, drone components and flight control while practicing guided drone flying. Includes take-home drone kit.",
        tag: "Take Away Drone Included",
        courseKey: "drone",
      },
    ],
  },
];

const courseConfig: Record<CourseKey, CourseConfigItem> = {
  gear: { icon: Settings, accent: "#0855AB", category: "Mechanical" },
  drone: { icon: Plane, accent: "#A81B1E", category: "Technology" },
  founders: { icon: Lightbulb, accent: "#062341", category: "Innovation" },
};

const tags = ["Hands-on Learning", "STEM Focused", "Certificate Included"];

// ─── Component ───────────────────────────────────────────────────────────────

const OfferSection = () => {
  const [activeLocation, setActiveLocation] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  const location = locations[activeLocation];

  useEffect(() => {
    setActiveImage(0);
  }, [activeLocation]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % location.images.length);
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [location.images.length]);

  return (
    <div className="relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        .offer-section { font-family: 'DM Sans', sans-serif; }
        .offer-heading { font-family: 'Syne', sans-serif; }

        .learn-card {
          transition: all 0.28s cubic-bezier(0.23, 1, 0.32, 1);
          cursor: pointer;
        }
        .learn-card:hover { transform: translateX(4px); }

        .video-card { transition: box-shadow 0.3s ease; }
        .video-card:hover { box-shadow: 0 28px 64px rgba(6,35,65,0.18); }

        .tag-pill {
          font-family: 'Syne', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
        }

        .section-badge {
          font-family: 'Syne', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
        }

        .category-label {
          font-family: 'Syne', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .loc-tab {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 0.04em;
          transition: all 0.22s cubic-bezier(0.23, 1, 0.32, 1);
          cursor: pointer;
        }
        .loc-tab:hover { transform: translateY(-1px); }

        .stat-chip {
          font-family: 'Syne', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
        }

        .week-card {
          transition: all 0.28s cubic-bezier(0.23, 1, 0.32, 1);
          cursor: pointer;
        }
        .week-card:hover { transform: translateX(4px); }

        .expanded-content {
          overflow: hidden;
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
          {/* ── Header ── */}
          <motion.div
            className="mb-10 md:mb-12 max-w-2xl"
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
              SUMMER CAMP 2025
            </motion.div>

            <h2 className="offer-heading text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-[#062341] mb-4 leading-[1.1] tracking-tight">
              Complete Camp
              <br />
              <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                Schedule & Syllabus
              </span>
            </h2>

            <p className="text-slate-500 text-base md:text-lg leading-relaxed font-light mt-4 max-w-xl">
              Choose your nearest location — each centre runs a curated{" "}
              <span className="text-[#062341] font-medium">
                hands-on STEM programme
              </span>{" "}
              with expert mentors and small batches.
            </p>
          </motion.div>

          {/* ── Location Tabs ── */}
          <motion.div
            className="flex gap-3 mb-10 flex-wrap"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {locations.map((loc, i) => (
              <button
                key={loc.id}
                className="loc-tab flex items-center gap-2 px-4 py-2.5 rounded-full border"
                style={{
                  background: activeLocation === i ? "#A81B1E" : "white",
                  color: activeLocation === i ? "white" : "#A81B1E",
                  borderColor:
                    activeLocation === i ? "#A81B1E" : "#A81B1E" + "20",
                  boxShadow:
                    activeLocation === i
                      ? "0 4px 16px rgba(6,35,65,0.2)"
                      : "none",
                }}
                onClick={() => {
                  setActiveLocation(i);
                  setExpandedWeek(null);
                  setHoveredIndex(null);
                }}
              >
                <MapPin
                  size={12}
                  style={{ color: activeLocation === i ? "white" : "#A81B1E" }}
                />
                {loc.name}
              </button>
            ))}
          </motion.div>

          {/* ── Two-column layout ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeLocation}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              {/* ── Image panel ── */}
              <motion.div
                className="video-card relative h-[320px] md:h-[460px] rounded-3xl overflow-hidden lg:sticky lg:top-8"
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

                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${location.id}-${activeImage}`}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.985 }}
                    transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <Image
                      fill
                      src={location.images[activeImage]}
                      alt={`Kids learning at ${location.name} - slide ${activeImage + 1}`}
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Overlay */}
                <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#062341]/95 via-[#062341]/60 to-transparent p-5 md:p-6">
                  {/* Location + schedule chip */}
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white/90 border border-white/20 backdrop-blur-sm"
                      style={{
                        fontFamily: "Syne, sans-serif",
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        background: "rgba(255,255,255,0.1)",
                      }}
                    >
                      <MapPin size={9} />
                      {location.name}
                    </span>
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-white/90 border border-white/20 backdrop-blur-sm"
                      style={{
                        fontFamily: "Syne, sans-serif",
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        background: "rgba(255,255,255,0.1)",
                      }}
                    >
                      <Clock size={9} />
                      {location.duration}
                    </span>
                  </div>

                  {/* Mini stat row */}
                  <div className="flex gap-4 mb-3">
                    {[
                      { val: location.totalHours, label: "Total" },
                      {
                        val: `${location.weeks.length} Modules`,
                        label: "Courses",
                      },
                      { val: "Age 4–16", label: "Open to" },
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
                    {location.schedule}
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

              {/* ── Week list ── */}
              <div>
                {/* Schedule label */}
                <motion.div
                  className="flex items-center gap-2 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <span className="category-label" style={{ color: "#0855AB" }}>
                    Schedule
                  </span>
                  <div
                    className="flex-1 h-px"
                    style={{
                      background:
                        "linear-gradient(90deg, #0855AB30, transparent)",
                    }}
                  />
                  <span
                    className="flex items-center gap-1 text-[#0855AB] px-2 py-0.5 rounded-full border"
                    style={{
                      fontFamily: "Syne, sans-serif",
                      fontSize: "9px",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      borderColor: "#0855AB20",
                      background: "#0855AB08",
                    }}
                  >
                    <Calendar size={8} />
                    {location.totalHours} TOTAL
                  </span>
                </motion.div>

                {/* Week cards */}
                <div className="space-y-2.5">
                  {location.weeks.map((week, i) => {
                    const cfg = courseConfig[week.courseKey];
                    const Icon = cfg.icon;
                    const isHovered = hoveredIndex === i;
                    const isExpanded = expandedWeek === i;
                    const isFirst = i === 0;

                    return (
                      <motion.div
                        key={`${location.id}-${i}`}
                        className="week-card rounded-2xl border overflow-hidden"
                        style={{
                          borderColor: isFirst
                            ? `${cfg.accent}35`
                            : isHovered
                              ? `${cfg.accent}30`
                              : `${cfg.accent}15`,
                          background: isFirst
                            ? `linear-gradient(135deg, ${cfg.accent}08 0%, #ffffff 100%)`
                            : "white",
                          boxShadow: isFirst
                            ? `0 4px 20px ${cfg.accent}12, 0 1px 4px ${cfg.accent}08`
                            : `0 2px 10px rgba(6,35,65,0.04)`,
                        }}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.45,
                          delay: i * 0.07,
                          ease: [0.23, 1, 0.32, 1],
                        }}
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() => setExpandedWeek(isExpanded ? null : i)}
                      >
                        {/* Card header */}
                        <div className="flex items-start gap-4 px-5 py-4">
                          {/* Icon */}
                          <div
                            className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center mt-0.5"
                            style={{
                              background: `${cfg.accent}12`,
                              boxShadow: `0 0 0 4px ${cfg.accent}08`,
                            }}
                          >
                            <Icon
                              size={20}
                              style={{ color: cfg.accent }}
                              strokeWidth={1.7}
                            />
                          </div>

                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className="text-slate-800 text-sm md:text-base leading-snug font-semibold"
                                style={isFirst ? { color: "#062341" } : {}}
                              >
                                {week.course}
                                {isFirst && (
                                  <span
                                    className="inline-flex items-center gap-0.5 ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full align-middle"
                                    style={{
                                      background: `${cfg.accent}15`,
                                      color: cfg.accent,
                                      fontFamily: "Syne, sans-serif",
                                      letterSpacing: "0.06em",
                                    }}
                                  >
                                    <Sparkles size={9} />
                                    STARTS FIRST
                                  </span>
                                )}
                              </p>
                              <ChevronDown
                                size={14}
                                className="shrink-0 mt-1 text-slate-400 transition-transform duration-200"
                                style={{
                                  transform: isExpanded
                                    ? "rotate(180deg)"
                                    : "rotate(0deg)",
                                }}
                              />
                            </div>

                            {/* Meta row */}
                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                              <span
                                className="inline-flex items-center gap-1 text-slate-500 text-xs"
                                style={{
                                  fontFamily: "Syne, sans-serif",
                                  fontWeight: 600,
                                }}
                              >
                                <Calendar size={9} />
                                {week.label} · {week.dates}
                              </span>
                              <span
                                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                                style={{
                                  fontFamily: "Syne, sans-serif",
                                  fontWeight: 700,
                                  fontSize: "9px",
                                  letterSpacing: "0.06em",
                                  background: `${cfg.accent}10`,
                                  color: cfg.accent,
                                }}
                              >
                                <Clock size={8} />
                                {week.sessionDate}
                              </span>
                              {week.tag && (
                                <span
                                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                                  style={{
                                    fontFamily: "Syne, sans-serif",
                                    fontWeight: 700,
                                    fontSize: "9px",
                                    letterSpacing: "0.05em",
                                    background: "#A81B1E10",
                                    color: "#A81B1E",
                                    border: "1px solid #A81B1E20",
                                  }}
                                >
                                  <Plane size={8} />
                                  {week.tag}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expandable description */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              className="expanded-content"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{
                                duration: 0.3,
                                ease: [0.23, 1, 0.32, 1],
                              }}
                            >
                              <div
                                className="px-5 pb-4 pt-0"
                                style={{
                                  borderTop: `1px solid ${cfg.accent}15`,
                                  marginTop: 0,
                                }}
                              >
                                <div
                                  className="h-px w-full mb-4"
                                  style={{
                                    background: `linear-gradient(90deg, ${cfg.accent}20, transparent)`,
                                  }}
                                />
                                <p className="text-slate-500 text-sm leading-relaxed font-light">
                                  {week.description}
                                </p>

                                {/* Age groups */}
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {location.ageGroups.map((age) => (
                                    <span
                                      key={age}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs"
                                      style={{
                                        fontFamily: "Syne, sans-serif",
                                        fontWeight: 700,
                                        fontSize: "10px",
                                        letterSpacing: "0.05em",
                                        background: "#06234108",
                                        color: "#062341",
                                        border: "1px solid #06234115",
                                      }}
                                    >
                                      <Users size={8} />
                                      {age}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Tap hint */}
                <motion.p
                  className="text-slate-400 text-xs font-light mt-4 px-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  Tap any module to view details &middot; Age 4–16 welcome
                </motion.p>

                {/* Progress dots */}
                <motion.div
                  className="flex items-center gap-1.5 mt-4 px-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.65 }}
                >
                  {location.weeks.map((week, i) => {
                    const cfg = courseConfig[week.courseKey];
                    return (
                      <div
                        key={i}
                        className="h-0.5 flex-1 rounded-full transition-all duration-300"
                        style={{
                          background: cfg.accent,
                          opacity:
                            hoveredIndex === i || expandedWeek === i
                              ? 0.7
                              : 0.2,
                        }}
                      />
                    );
                  })}
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.section>
    </div>
  );
};

export default OfferSection;
