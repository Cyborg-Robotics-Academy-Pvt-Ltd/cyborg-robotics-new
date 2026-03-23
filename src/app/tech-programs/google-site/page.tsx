"use client";
import Header from "@/components/layout/header";
import GoogleSitePocessFlow from "@/components/tech-programs/google-site/GoogleSitePocessFlow";
import HeroImage from "@/components/tech-programs/google-site/HeroImage";
import OfferSection from "@/components/tech-programs/google-site/OfferSection";
import ProgramHighlights from "@/components/tech-programs/google-site/ProgramHighlights";
import ProjectShowcases from "@/components/tech-programs/google-site/ProjectShowcases";
import TestimonialSection from "@/components/tech-programs/google-site/TestimonialSection";
import { motion } from "framer-motion";

const page = () => {
  return (
    <div className="min-h-screen w-full overflow-y-hidden bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <HeroImage />
      <OfferSection />
      <GoogleSitePocessFlow />
      <ProgramHighlights />
      <ProjectShowcases />
      <TestimonialSection />
    </div>
  );
};

export default page;
