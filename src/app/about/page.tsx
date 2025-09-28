"use client";

import React, { Suspense, useEffect } from "react";
import {
  HeroSection,
  InteractiveStorySection,
  FoundersSection,
  AboutNavigation,
} from "@/components/about";
import ScrollButton from "@/components/widgets/ScrollButton";

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
  useEffect(() => {
    // Add about-page class for smooth scrolling
    document.documentElement.classList.add("about-page");

    return () => {
      // Clean up when leaving the page
      document.documentElement.classList.remove("about-page");
    };
  }, []);
  return (
    <>
      {/* About-specific navigation */}
      <AboutNavigation />

      <main className="bg-white text-[#8C2D2D] relative overflow-hidden">
        <div className="px-4 sm:px-6 md:px-12 lg:px-20">
          {/* Hero Section - add top margin for fixed header */}
          <div id="hero" className="about-section pt-20">
            <HeroSection />
          </div>
          <div id="story" className="about-section">
            <InteractiveStorySection />
          </div>
          <div id="founders" className="about-section">
            <FoundersSection />
          </div>

          {/* Below-the-fold sections with lazy loading */}
          <Suspense fallback={<SectionLoader />}>
            {/* Team Section */}
            <div id="team" className="about-section">
              <TeamSection />
            </div>
          </Suspense>

          <Suspense fallback={<SectionLoader />}>
            {/* Global Reach Section */}
            <div id="global-reach" className="about-section">
              <GlobalReachSection />
            </div>
          </Suspense>
        </div>

        {/* Floating Scroll Button with pulse animation for improved navigation */}
        <ScrollButton />
      </main>
    </>
  );
}
