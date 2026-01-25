import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import { motion } from "framer-motion";
import HeroSection from "./HeroSection";
import NewsLetter from "./NewsLetter";
import TemplateCarousel from "./TemplateCarousel";
import Footer from "./Footer";

// Immediate load - critical above the fold content
const Features = dynamic(() => import("./Features"));

// Progressive load - below the fold content with better loading states
const Feature2 = dynamic(() => import("./Feature2"));

const WhoAreWe = dynamic(() => import("./WhoAreWe"));

const VisionSection = dynamic(() => import("./VisionSection"));

// Defer heavy interactive components
const GallerySection = dynamic(() => import("../gallery/GallerySection"), {
  ssr: false,
});

const Testimonials = dynamic(() => import("./Testimonials/Testimonials"), {
  ssr: false,
});

const HomePage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  // Show modal only once when user scrolls more - optimized version
  useEffect(() => {
    let hasTriggered = false;
    let timeoutId: NodeJS.Timeout;
    let ticking = false;

    const handleScroll = () => {
      if (hasTriggered || ticking) return;

      ticking = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollPercentage =
          (scrollY / (documentHeight - windowHeight)) * 100;

        // Trigger when user scrolls more than 20% of the page or 400px, whichever comes first
        if (scrollY > 1000 || scrollPercentage > 40) {
          hasTriggered = true;
          // Add a small delay to make it feel more natural
          timeoutId = setTimeout(() => {
            setShowModal(true);
          }, 800);
          window.removeEventListener("scroll", handleScroll);
        }
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const closeModal = () => setShowModal(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (showModal) {
      // Prevent background scrolling
      document.body.style.overflow = "hidden";
      // Store original style to restore later
      const originalStyle = window.getComputedStyle(document.body).overflow;

      return () => {
        // Restore original overflow style when modal closes
        document.body.style.overflow = originalStyle;
      };
    }
  }, [showModal]);

  return (
    <>
      <Head>
        {/* Performance optimizations */}
        <title>
          Robotics & Coding Classes For Kids | STEM & Coding Academy
        </title>
        <meta
          name="description"
          content="Discover engaging robotics and coding courses for kids. Build STEM skills, innovate and learn through hands-on projects in a fun environment."
        />
        <meta
          name="keywords"
          content="robotics academy for kids, kids robotics classes, robotics classes in Pune / your city, STEM classes for kids, coding classes for kids, robotics training for children, kids technology academy, robotics and coding for kids, STEM education for kids, child robotics workshops"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://assets.aceternity.com" />

        {/* App icons and meta */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/assets/logo.png" />
        <meta name="theme-color" content="#dc2626" />

        {/* Performance meta tags */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1"
        />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      </Head>

      {/* Template Image Modal */}
      {/* <TemplateCarousel showModal={showModal} closeModal={closeModal} /> */}

      {/* Page Content */}
      <div className="bg-white text-black">
        <HeroSection />
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Features />
        </motion.div>
        <motion.div
          id="why-learn-robotics"
          className="scroll-offset"
          initial={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Feature2 />
        </motion.div>
        <motion.div
          id="what-we-offer"
          className="scroll-offset"
          initial={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <WhoAreWe />
        </motion.div>
        <motion.div
          id="vision-mission"
          className="scroll-offset"
          initial={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <VisionSection />
        </motion.div>
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Testimonials />
        </motion.div>
        <motion.div
          id="gallery"
          className="scroll-offset"
          initial={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <GallerySection />
        </motion.div>

        <NewsLetter />
        <Footer />
      </div>
    </>
  );
};

export default HomePage;
