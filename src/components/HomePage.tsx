"use client";
import React, { useEffect, useState } from "react";
import VisionSection from "./VisionSection";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Testimonials from "./Testimonials/Testimonials";
import GallerySection from "./GallerySection";
import Feature2 from "./Feature2";
import ScrollButton from "./ScrollButton";
import { useScrollDirection } from "../hooks/useScrollDirection";
import WhatWeOffer from "./WhatWeOffer";
import HeroSection from "../components/HeroSection";

const HomePage: React.FC = () => {
  const { scrollDirection } = useScrollDirection();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  // Refs for each section
  const feature2Ref = useRef(null);
  const whatWeOfferRef = useRef(null);
  const visionSectionRef = useRef(null);
  const gallerySectionRef = useRef(null);
  const feedbackRef = useRef(null);

  // Animate floating buttons for smooth entrance
  const whatsappBtnRef = useRef(null);

  const shouldShowButtons = isInitialLoad || scrollDirection === "down";

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

  useEffect(() => {
    // Set initial load to false after 2 seconds
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Handle scroll detection and modal timing
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100 && !hasScrolled) {
        setHasScrolled(true);

        // Show modal 10 seconds after user scrolls
        const modalTimer = setTimeout(() => {
          setShowModal(true);
        }, 5000);

        return () => clearTimeout(modalTimer);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
                className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 rounded-2xl blur-xl -z-10"
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
        {/* <motion.div
          ref={featuresRef}
          initial={{ opacity: 0, y: 60 }}
          animate={
            isFeaturesInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }
          }
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Features />
        </motion.div> */}
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

        {/* WhatsApp Floating Button */}
        {/*  */}
        <div className="fixed w-full bottom-2 right-4 items-center z-50 flex justify-end">
          {shouldShowButtons && (
            <motion.div
              className="md:mr-28 mr-8"
              ref={whatsappBtnRef}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            >
              <Link
                href="https://wa.me/917028511161?text=Hello%20Cyborg,%20I%20am%20looking%20for%20some%20help!%20(Enquiry)"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div>
                  <Image
                    src="/assets/whatsapp.png"
                    alt="WhatsApp Logo"
                    width={60}
                    height={60}
                    loading="lazy"
                    className="transition-opacity duration-300"
                  />
                </div>
              </Link>
            </motion.div>
          )}

          <ScrollButton />
          <div className="fixed bottom-0 -right-2 p-4">
            <Link
              href="https://www.linkedin.com/in/shrikant11/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/mylogo.png"
                alt="Company Logo"
                width={20}
                height={20}
                loading="lazy"
                quality={75}
                className="opacity-20"
              />
            </Link>
          </div>
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
