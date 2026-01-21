"use client";
import Footer from "@/components/home/Footer";
import React, { useState, useMemo } from "react";
import Image from "next/image";
import Header from "@/components/layout/header";
import Testimonials from "@/components/home/Testimonials/Testimonials";
import { motion } from "framer-motion";
import HeroImage from "@/components/lego-robotics/HeroImage";
import OfferSection from "../../../components/lego-robotics/OfferSection";
import LegoPocessFlow from "@/components/lego-robotics/LegoPocessFlow";
import ProgramHighlights from "@/components/lego-robotics/ProgramHighlights";
import ProjectShowcases from "@/components/lego-robotics/ProjectShowcases";
import CertificateTakeway from "@/components/lego-robotics/CertificateTakeway";
import TestimonialSection from "@/components/lego-robotics/TestimonialSection";
import LegoExperience from "@/components/lego-robotics/LegoExperience";

const page = () => {
  return (
    <div className="min-h-screen w-full overflow-y-hidden bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <HeroImage />
      <OfferSection />
      <LegoExperience />
      <LegoPocessFlow />
      <ProgramHighlights />
      <ProjectShowcases />
      <CertificateTakeway />
      <TestimonialSection />
      {/* Enhanced Sticky CTA Section */}
      <motion.section
        className="py-8 md:py-12 bg-gradient-to-r from-[#A81B1E] to-[#C73E1D]"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Book Your Child's LEGO Experience?
          </h2>
          <p className="text-lg md:text-xl text-white mb-6">
            Limited seats available - Reserve your spot today!
          </p>
          <button className="bg-white text-[#A81B1E] hover:bg-gray-100 font-bold py-4 px-10 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl text-xl">
            Book LEGO Experience – ₹499
          </button>
        </div>
      </motion.section>
    </div>
  );
};

export default page;
