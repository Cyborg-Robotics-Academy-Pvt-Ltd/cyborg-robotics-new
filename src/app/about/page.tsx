import React, { Suspense, useEffect } from "react";
import { motion } from "framer-motion";
import {
  HeroSection,
  InteractiveStorySection,
  FoundersSection,
  AboutNavigation,
} from "@/components/about";
import ScrollButton from "@/components/widgets/ScrollButton";
import { useInView } from "react-intersection-observer";
import AwardSection from "@/components/about/AwardSection";

// Lazy load below-the-fold components for better performance
const TeamSection = React.lazy(() => import("@/components/about/TeamSection"));

// Simple loading component with proper height to prevent layout shift
const SectionLoader = () => (
  <div className="flex items-center justify-center py-20 min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
  </div>
);

export default function AboutPage() {
  // Set up intersection observers for scroll animations
  const [heroRef, heroInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [storyRef, storyInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [foundersRef, foundersInView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

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

      <main className="bg-white text-[#a63534] relative overflow-hidden">
        {/* Changed from empty div to w-full for full container width */}
        <div className="w-full">
          {/* Hero Section - add top margin for fixed header */}
          <motion.div
            id="hero"
            className="about-section pt-20"
            ref={heroRef}
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <HeroSection />
          </motion.div>

          <motion.div
            id="story"
            className="about-section"
            ref={storyRef}
            initial={{ opacity: 0, y: 30 }}
            animate={storyInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <InteractiveStorySection />
          </motion.div>

          <motion.div
            id="founders"
            className="about-section"
            ref={foundersRef}
            initial={{ opacity: 0, y: 30 }}
            animate={foundersInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <FoundersSection />
          </motion.div>

          {/* Below-the-fold sections with lazy loading */}
          <Suspense fallback={<SectionLoader />}>
            {/* Team Section */}
            <motion.div
              id="team"
              className="about-section"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <TeamSection />
            </motion.div>
          </Suspense>

          <Suspense fallback={<SectionLoader />}>
            {/* Award  Section */}
            <motion.div
              id="global-reach"
              className="about-section"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <AwardSection />
            </motion.div>
          </Suspense>
        </div>
        {/* Floating Scroll Button with pulse animation for improved navigation */}
        <ScrollButton />
      </main>
    </>
  );
}
