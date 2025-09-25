"use client";

import React, { Suspense } from "react";
import {
  HeroSection,
  InteractiveStorySection,
  FoundersSection,
} from "@/components/about";

// Lazy load below-the-fold components for better performance
const TeamSection = React.lazy(() => import("@/components/about/TeamSection"));
const GlobalReachSection = React.lazy(
  () => import("@/components/about/GlobalReachSection")
);

// Simple loading component with proper height to prevent layout shift
const SectionLoader = () => (
  <div className="flex items-center justify-center py-20 min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
  </div>
);

export default function AboutPage() {
  return (
    <main className="bg-white text-[#8C2D2D] relative overflow-hidden">
      <div className="px-6 md:px-20 py-4">
        {/* Above-the-fold content - loads immediately */}
        <HeroSection />
        <InteractiveStorySection />
        <FoundersSection />

        {/* Below-the-fold sections with lazy loading */}
        <Suspense fallback={<SectionLoader />}>
          {/* Team Section */}
          <TeamSection />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          {/* Global Reach Section */}
          <GlobalReachSection />
        </Suspense>
      </div>
    </main>
  );
}
