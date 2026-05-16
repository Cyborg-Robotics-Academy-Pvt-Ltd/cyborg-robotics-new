"use client";
import React from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import { Building2, MapPin } from "lucide-react";
import HeroSection from "./HeroSection";
import NewsLetter from "./NewsLetter";

import Footer from "./Footer";
import Features from "./Features";
import Feature2 from "./Feature2";
import WhoAreWe from "./WhoAreWe";
import VisionSection from "./VisionSection";
import BranchCenter from "./BranchCenter";

const GallerySection = dynamic(() => import("../gallery/GallerySection"), {
  ssr: false,
});

const Testimonials = dynamic(() => import("./Testimonials/Testimonials"), {
  ssr: false,
});

const HomePage: React.FC = () => {
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
        <div>
          <Features />
        </div>
        <div className="">
          <BranchCenter />
        </div>
        <div id="why-learn-robotics" className="scroll-offset">
          <Feature2 />
        </div>
        <div id="what-we-offer" className="scroll-offset">
          <WhoAreWe />
        </div>
        <div id="vision-mission" className="scroll-offset">
          <VisionSection />
        </div>
        <div>
          <Testimonials />
        </div>
        <div id="gallery" className="scroll-offset">
          <GallerySection />
        </div>

        <NewsLetter />
        <Footer />
      </div>
    </>
  );
};

export default HomePage;
