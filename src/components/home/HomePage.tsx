"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

import { motion, useInView } from "framer-motion";
import ScrollButton from "../widgets/ScrollButton";
import HeroSection from "./HeroSection";
import NewsLetter from "./NewsLetter";

// Lazy-load heavier sections to reduce initial bundle and TTI
const Features = dynamic(() => import("./Features"), {
  loading: () => <div className="h-40" />,
});
const Feature2 = dynamic(() => import("./Feature2"), {
  loading: () => <div className="h-40" />,
});
const WhatWeOffer = dynamic(() => import("./WhatWeOffer"), {
  loading: () => <div className="h-40" />,
});
const VisionSection = dynamic(() => import("./VisionSection"), {
  loading: () => <div className="h-40" />,
});
const GallerySection = dynamic(() => import("../gallery/GallerySection"), {
  ssr: false,
  loading: () => <div className="h-64" />,
});
const Testimonials = dynamic(() => import("./Testimonials/Testimonials"), {
  ssr: false,
  loading: () => <div className="h-64" />,
});

const HomePage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  // Refs for each section
  const featuresRef = useRef(null);
  const feature2Ref = useRef(null);
  const whatWeOfferRef = useRef(null);
  const visionSectionRef = useRef(null);
  const gallerySectionRef = useRef(null);
  const feedbackRef = useRef(null);

  // Animate floating buttons for smooth entrance
  // const whatsappBtnRef = useRef(null);
  // const shouldShowButtons = isInitialLoad || scrollDirection === "down";
  // Check if sections are in view
  const isFeaturesInView = useInView(featuresRef, {
    once: true,
    margin: "-100px",
  });
  // Check if sections are in view
  const isFeature2InView = useInView(feature2Ref, {
    once: true,
    margin: "-100px",
  });
  const isWhatWeOfferInView = useInView(whatWeOfferRef, {
    once: true,
    margin: "-100px",
  });
  const isVisionInView = useInView(visionSectionRef, {
    once: true,
    margin: "-100px",
  });
  const isGalleryInView = useInView(gallerySectionRef, {
    once: true,
    margin: "-100px",
  });
  const isFeedbackInView = useInView(feedbackRef, {
    once: true,
    margin: "-100px",
  });

  // Handle scroll detection and modal timing
  useEffect(() => {
    let modalTimerId: number | null = null;

    const handleScroll = () => {
      if (window.scrollY > 100 && !hasScrolled) {
        setHasScrolled(true);
        if (modalTimerId === null) {
          modalTimerId = window.setTimeout(() => {
            setShowModal(true);
          }, 5000);
        }
      }
    };

    // Use passive listener and only need the first trigger
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll as EventListener);
      if (modalTimerId !== null) {
        clearTimeout(modalTimerId);
      }
    };
  }, [hasScrolled]);

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      {/* Template Image Modal */}
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-md"
          onClick={closeModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 50, rotateX: -15 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 50, rotateX: 15 }}
            transition={{
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: 0.1,
            }}
            className="relative max-w-4xl max-h-[90vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 180 }}
              transition={{
                duration: 0.4,
                ease: "easeOut",
                delay: 0.4,
              }}
              whileHover={{
                scale: 1.15,
                rotate: 90,
                backgroundColor: "#f87171",
                transition: { duration: 0.2 },
              }}
              whileTap={{ scale: 0.9 }}
              onClick={closeModal}
              className="absolute -top-4 -right-4 z-10 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100"
            >
              <motion.svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                whileHover={{ stroke: "#ffffff" }}
                transition={{ duration: 0.2 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </motion.svg>
            </motion.button>

            {/* Image Container with Glow Effect */}
            <motion.div
              initial={{
                opacity: 0,
                y: 60,
                scale: 0.8,
                filter: "blur(10px)",
                rotateY: -20,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
                rotateY: 0,
              }}
              exit={{
                opacity: 0,
                y: 60,
                scale: 0.8,
                filter: "blur(10px)",
                rotateY: 20,
              }}
              transition={{
                duration: 0.8,
                ease: [0.34, 1.56, 0.64, 1],
                delay: 0.2,
              }}
              className="relative"
            >
              {/* Glow Effect */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.5, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 3,
                  delay: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0  rounded-2xl blur-xl -z-10"
              />

              {/* Image */}
              <motion.div
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.3 },
                }}
                className="relative"
              >
                <Image
                  src="/assets/Template.jpg"
                  alt="Cyborg Robotics Academy Template"
                  width={800}
                  height={600}
                  className="w-full h-auto max-h-[90vh] object-contain rounded-2xl shadow-2xl"
                  priority
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      <div className="bg-white text-black">
        {/* <StickyBanner className="bg-gradient-to-b from-blue-500 to-blue-600">
          <p className="mx-0 max-w-[90%] text-white drop-shadow-md">
            Announcing $10M seed funding from project mayhem ventures.{" "}
            <a href="#" className="transition duration-200 hover:underline">
              Read announcement
            </a>
          </p>
        </StickyBanner>
        <DummyContent /> */}
        <HeroSection />
        <motion.div
          ref={featuresRef}
          initial={{ opacity: 0, y: 60 }}
          animate={
            isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }
          }
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Features />
        </motion.div>
        <motion.div
          id="why-learn-robotics"
          className="scroll-offset"
          ref={feature2Ref}
          initial={{ opacity: 0, y: 60 }}
          animate={
            isFeature2InView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }
          }
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Feature2 />
        </motion.div>
        <motion.div
          id="what-we-offer"
          className="scroll-offset"
          ref={whatWeOfferRef}
          initial={{ opacity: 0, y: 60 }}
          animate={
            isWhatWeOfferInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }
          }
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <WhatWeOffer />
        </motion.div>
        <motion.div
          id="vision-mission"
          className="scroll-offset"
          ref={visionSectionRef}
          initial={{ opacity: 0, y: 60 }}
          animate={
            isVisionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }
          }
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <VisionSection />
        </motion.div>
        <motion.div
          ref={feedbackRef}
          initial={{ opacity: 0, y: 60 }}
          animate={
            isFeedbackInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }
          }
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Testimonials />
        </motion.div>
        <motion.div
          id="gallery"
          className="scroll-offset"
          ref={gallerySectionRef}
          initial={{ opacity: 0, y: 60 }}
          animate={
            isGalleryInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }
          }
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <GallerySection />
        </motion.div>

        <ScrollButton />
        <div className="">
          {/* newsletter */}
          <NewsLetter />
        </div>
      </div>
    </>
  );
};

// const DummyContent = () => {
//   return (
//     <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 py-8">
//       <div className="h-96 w-full animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
//       <div className="h-96 w-full animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
//       <div className="h-96 w-full animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
//     </div>
//   );
// };
export default HomePage;
