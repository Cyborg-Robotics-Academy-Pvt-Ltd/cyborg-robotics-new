"use client";
import Header from "@/components/layout/header";
import { motion } from "framer-motion";
import HeroImage from "@/components/tech-programs/lego-robotics/HeroImage";
import OfferSection from "../../../components/tech-programs/lego-robotics/OfferSection";
import LegoPocessFlow from "@/components/tech-programs/lego-robotics/LegoPocessFlow";
import ProgramHighlights from "@/components/tech-programs/lego-robotics/ProgramHighlights";
import ProjectShowcases from "@/components/tech-programs/lego-robotics/ProjectShowcases";
import CertificateTakeway from "@/components/tech-programs/lego-robotics/CertificateTakeway";
import TestimonialSection from "@/components/tech-programs/lego-robotics/TestimonialSection";
import LegoExperience from "@/components/tech-programs/lego-robotics/LegoExperience";

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
    </div>
  );
};

export default page;
