"use client";
import Header from "@/components/layout/header";
import CertificateTakeway from "@/components/tech-programs/drone/CertificateTakeway";
import DroneExperience from "@/components/tech-programs/drone/Drone-Experience";
import DronePocessFlow from "@/components/tech-programs/drone/DronePocessFlow";
import HeroImage from "@/components/tech-programs/drone/HeroImage";
import OfferSection from "@/components/tech-programs/drone/OfferSection";
import ProgramHighlights from "@/components/tech-programs/drone/ProgramHighlights";

import TestimonialSection from "@/components/tech-programs/drone/TestimonialSection";

const page = () => {
  return (
    <div className="min-h-screen w-full overflow-y-hidden bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <HeroImage />
      <OfferSection />
      <DroneExperience />
      <DronePocessFlow />
      <ProgramHighlights />
      <TestimonialSection />
    </div>
  );
};

export default page;
