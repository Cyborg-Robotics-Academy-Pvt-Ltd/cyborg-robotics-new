"use client";
import React, { useEffect, useState } from "react";
import Carousel from "./Carousel";
import Features from "./Features";
import VisionSection from "./VisionSection";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import FeedBack from "./FeedBack";
import GallerySection from "./GallerySection";
import Feature2 from "./Feature2";
import Footer from "./Footer";
import ScrollButton from "./ScrollButton";
import { useScrollDirection } from "../hooks/useScrollDirection";
import WhatWeOffer from "./WhatWeOffer";
// import { StickyBanner } from "./ui/sticky-banner";

const HomePage: React.FC = () => {
  const { scrollDirection } = useScrollDirection();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Refs for each section
  const featuresRef = useRef(null);
  const feature2Ref = useRef(null);
  const whatWeOfferRef = useRef(null);
  const visionSectionRef = useRef(null);
  const gallerySectionRef = useRef(null);
  const feedbackRef = useRef(null);
  const footerRef = useRef(null);

  // Animate floating buttons for smooth entrance
  const contactBtnRef = useRef(null);
  const whatsappBtnRef = useRef(null);

  const shouldShowButtons = isInitialLoad || scrollDirection === "down";

  // Check if sections are in view
  const isFeaturesInView = useInView(featuresRef, {
    once: true,
    margin: "-100px",
  });
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
  const isFooterInView = useInView(footerRef, { once: true, margin: "-100px" });

  useEffect(() => {
    // Set initial load to false after 2 seconds
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
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
        <Carousel />
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
          ref={gallerySectionRef}
          initial={{ opacity: 0, y: 60 }}
          animate={
            isGalleryInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }
          }
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <GallerySection />
        </motion.div>
        <motion.div
          ref={feedbackRef}
          initial={{ opacity: 0, y: 60 }}
          animate={
            isFeedbackInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }
          }
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <FeedBack />
        </motion.div>
        <motion.div
          ref={footerRef}
          initial={{ opacity: 0, y: 60 }}
          animate={
            isFooterInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }
          }
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Footer />
        </motion.div>
        {/* WhatsApp Floating Button */}
        {/*  */}
        <div className="fixed w-full bottom-1 right-4 items-center z-50 flex justify-between">
          {shouldShowButtons && (
            <motion.div
              ref={contactBtnRef}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Link href={"/contact-us"}>
                <div
                  className="bg-red-800 text-white h-8 shadow-xl hover:bg-white hover:text-black px-2 py-1 rounded-[8px] text-center mx-10"
                  style={{ transition: "transform 0.2s" }}
                >
                  <span className="text-center">BOOK FREE TRIAL NOW !</span>
                </div>
              </Link>
            </motion.div>
          )}

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
