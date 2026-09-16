"use client";

import React, { useMemo, useState } from "react";
import {
  Clapperboard,
  Puzzle,
  Boxes,
  Brain,
  Bot,
  Calculator,
  Cpu,
  Settings,
  ArrowRight,
  GraduationCap,
  Code2,
  Sparkles,
  Code,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import FeatureHighlights from "./FeatureHighlights";

// ---------- Types ----------

type CourseType = "software" | "kit";
type AgeGroup = "6-7" | "7-8" | "9+" | "11+";
type Accent = "red" | "green" | "orange" | "pink" | "purple" | "blue";

interface Course {
  id: string;
  type: CourseType;
  age: AgeGroup;
  ageLabel: string;
  title: string;
  meta: string;
  icon: LucideIcon | string; // LucideIcon component or emoji fallback
  accent: Accent;
  badge: "Group / 1:1" | "Kit shipped home";
}

type FilterKey = "all" | "software" | "kit" | AgeGroup;

// ---------- Static config ----------

const ACCENT_STYLES: Record<
  Accent,
  {
    border: string;
    tagBg: string;
    tagText: string;
    iconBg: string;
    iconText: string;
    link: string;
  }
> = {
  red: {
    border: "border-l-red-400",
    tagBg: "bg-red-50",
    tagText: "text-red-600",
    iconBg: "bg-red-50",
    iconText: "text-red-500",
    link: "text-red-500",
  },
  green: {
    border: "border-l-green-400",
    tagBg: "bg-green-50",
    tagText: "text-green-600",
    iconBg: "bg-green-50",
    iconText: "text-green-600",
    link: "text-green-600",
  },
  orange: {
    border: "border-l-orange-400",
    tagBg: "bg-orange-50",
    tagText: "text-orange-600",
    iconBg: "bg-orange-50",
    iconText: "text-orange-500",
    link: "text-orange-500",
  },
  pink: {
    border: "border-l-pink-400",
    tagBg: "bg-pink-50",
    tagText: "text-pink-600",
    iconBg: "bg-pink-50",
    iconText: "text-pink-500",
    link: "text-pink-500",
  },
  purple: {
    border: "border-l-purple-400",
    tagBg: "bg-purple-50",
    tagText: "text-purple-600",
    iconBg: "bg-purple-50",
    iconText: "text-purple-500",
    link: "text-purple-500",
  },
  blue: {
    border: "border-l-blue-400",
    tagBg: "bg-blue-50",
    tagText: "text-blue-600",
    iconBg: "bg-blue-50",
    iconText: "text-blue-500",
    link: "text-blue-500",
  },
};

const FILTER_TABS: { key: FilterKey; label: string; emoji?: string }[] = [
  { key: "all", label: "All Courses" },
  { key: "software", label: "Software-Based", emoji: "💻" },
  { key: "kit", label: "Kit & Hardware-Based", emoji: "🛠️" },
  { key: "6-7", label: "Age 6–7", emoji: "😊" },
  { key: "7-8", label: "Age 7–8", emoji: "😊" },
  { key: "9+", label: "Age 9+", emoji: "🧑" },
  { key: "11+", label: "Age 11+", emoji: "🧑" },
];

const COURSES: Course[] = [
  {
    id: "animation-coding",
    type: "software",
    age: "6-7",
    ageLabel: "Age 6–7",
    title: "Animation and Coding",
    meta: "2 levels · 14 sessions each",
    icon: Clapperboard,
    accent: "red",
    badge: "Group / 1:1",
  },
  {
    id: "pictoblox-1",
    type: "software",
    age: "7-8",
    ageLabel: "Age 7–8",
    title: "Coding & AI with PictoBlox — Level 1",
    meta: "12 sessions",
    icon: Puzzle,
    accent: "green",
    badge: "Group / 1:1",
  },
  {
    id: "3d-design-1",
    type: "software",
    age: "7-8",
    ageLabel: "Age 7–8",
    title: "3D Designing — Level 1",
    meta: "16 sessions",
    icon: Boxes,
    accent: "orange",
    badge: "Group / 1:1",
  },
  {
    id: "pictoblox-2",
    type: "software",
    age: "9+",
    ageLabel: "Age 9+",
    title: "Coding & AI with PictoBlox — Level 2",
    meta: "12 sessions",
    icon: Brain,
    accent: "pink",
    badge: "Group / 1:1",
  },
  {
    id: "block-ai",
    type: "software",
    age: "9+",
    ageLabel: "Age 9+",
    title: "AI with Block Based Coding",
    meta: "14 sessions",
    icon: Bot,
    accent: "purple",
    badge: "Group / 1:1",
  },
  {
    id: "app-designing",
    type: "software",
    age: "9+",
    ageLabel: "Age 9+",
    title: "App Designing",
    meta: "4 levels · 16 sessions each",
    icon: Calculator,
    accent: "blue",
    badge: "Group / 1:1",
  },
  {
    id: "mini-electronics",
    type: "kit",
    age: "9+",
    ageLabel: "Age 9+",
    title: "Mini Electronics",
    meta: "2 levels · 16 sessions each",
    icon: Cpu,
    accent: "blue",
    badge: "Kit shipped home",
  },
  {
    id: "arduino",
    type: "kit",
    age: "9+",
    ageLabel: "Age 9+",
    title: "Arduino (Coding + Embedded)",
    meta: "3 levels · 16 sessions each",
    icon: Settings,
    accent: "purple",
    badge: "Kit shipped home",
  },
  {
    id: "3d-design-2",
    type: "software",
    age: "9+",
    ageLabel: "Age 9+",
    title: "3D Designing",
    meta: "3 levels · 16 sessions each",
    icon: Boxes,
    accent: "orange",
    badge: "Group / 1:1",
  },
  {
    id: "python-basic",
    type: "software",
    age: "11+",
    ageLabel: "Age 11+",
    title: "Python — Basic",
    meta: "3 levels · 16 sessions each",
    icon: Code,
    accent: "green",
    badge: "Group / 1:1",
  },
  {
    id: "python-advance",
    type: "software",
    age: "11+",
    ageLabel: "Age 11+",
    title: "Python — Advance",
    meta: "2 levels · 16 sessions each",
    icon: Code,
    accent: "green",
    badge: "Group / 1:1",
  },
  {
    id: "java",
    type: "software",
    age: "11+",
    ageLabel: "Age 11+",
    title: "Java",
    meta: "3 levels · 16 sessions each",
    icon: Code,
    accent: "purple",
    badge: "Group / 1:1",
  },
];

// ---------- Subcomponents ----------

const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
  const style = ACCENT_STYLES[course.accent];
  const Icon = course.icon;

  return (
    <div
      className={`flex flex-col justify-between rounded-xl border border-gray-100 border-l-4 bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${style.border}`}
    >
      <div>
        <div className="flex items-center justify-between">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
              course.type === "software"
                ? "bg-red-50 text-red-600"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            {course.type === "software" ? "Software" : "Kit-Based"}
          </span>
          <span className="text-xs text-gray-400">{course.ageLabel}</span>
        </div>

        <div
          className={`mt-3 flex h-11 w-11 items-center justify-center rounded-lg text-xl ${style.iconBg}`}
        >
          {typeof Icon === "string" ? (
            <span>{Icon}</span>
          ) : (
            <Icon className={`h-5 w-5 ${style.iconText}`} strokeWidth={2} />
          )}
        </div>

        <h3 className="mt-3 text-[15px] font-semibold leading-snug text-slate-900">
          {course.title}
        </h3>
        <p className="mt-1 text-sm text-gray-400">{course.meta}</p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          className={`flex items-center gap-1 text-sm font-medium ${style.link} hover:underline`}
        >
          View course
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
        <span className="rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-500">
          {course.badge === "Kit shipped home"
            ? "📦 Kit shipped home"
            : course.badge}
        </span>
      </div>
    </div>
  );
};

const FilterTabs: React.FC<{
  active: FilterKey;
  onChange: (key: FilterKey) => void;
}> = ({ active, onChange }) => (
  <div className="flex flex-wrap justify-center gap-2">
    {FILTER_TABS.map((tab) => {
      const isActive = active === tab.key;
      return (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            isActive
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-gray-200 bg-white text-slate-600 hover:border-gray-300"
          }`}
        >
          {tab.emoji && <span>{tab.emoji}</span>}
          {tab.label}
        </button>
      );
    })}
  </div>
);

// ---------- Main component ----------

const CoursesSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const filteredCourses = useMemo(() => {
    if (activeFilter === "all") return COURSES;
    if (activeFilter === "software" || activeFilter === "kit") {
      return COURSES.filter((c) => c.type === activeFilter);
    }
    return COURSES.filter((c) => c.age === activeFilter);
  }, [activeFilter]);

  return (
    <section className="relative overflow-hidden bg-white px-4 py-16 sm:px-8 lg:px-12">
      {/* Decorative background accents */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-pink-200/60 to-orange-200/40 blur-2xl" />
      <Code2 className="pointer-events-none absolute right-16 top-24 h-8 w-8 text-slate-200" />
      <Sparkles className="pointer-events-none absolute right-32 top-40 h-5 w-5 text-slate-200" />

      <div className="relative mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-4 py-1.5 text-xs font-semibold text-purple-600">
            <GraduationCap className="h-3.5 w-3.5" />
            OUR CURRICULUM
          </span>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            <span className="text-slate-900">Courses for </span>
            <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
              Every age & interest
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-gray-500">
            From no-code creative tools to real hardware kits and professional
            programming languages.
          </p>
        </div>

        {/* Filters */}
        <div className="mt-8">
          <FilterTabs active={activeFilter} onChange={setActiveFilter} />
        </div>

        {/* Course grid */}
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <p className="mt-10 text-center text-gray-400">
            No courses match this filter yet.
          </p>
        )}

        {/* Feature strip */}
        <div className="mt-14">
          <FeatureHighlights />
        </div>
      </div>
    </section>
  );
};

export default CoursesSection;
