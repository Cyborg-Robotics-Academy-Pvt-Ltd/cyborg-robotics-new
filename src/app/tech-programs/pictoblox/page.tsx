"use client";
import Header from "@/components/layout/header";
import HeroImage from "@/components/tech-programs/pictoblox/HeroImage";
import PictobloxPocessFlow from "@/components/tech-programs/pictoblox/PictobloxPocessFlow";

import OfferSection from "@/components/tech-programs/pictoblox/OfferSection";
import PictoBloxCurriculum from "@/components/tech-programs/pictoblox/PictoBloxCurriculum";
import ProgramHighlights from "@/components/tech-programs/pictoblox/ProgramHighlights";
import ProjectShowcases from "@/components/tech-programs/pictoblox/ProjectShowcases";
import TestimonialSection from "@/components/tech-programs/pictoblox/TestimonialSection";

const page = () => {
  return (
    <div className="min-h-screen w-full overflow-y-hidden bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <HeroImage />
      <OfferSection />
      <PictoBloxCurriculum />
      <PictobloxPocessFlow />
      <ProgramHighlights />
      <ProjectShowcases />
      <TestimonialSection />
    </div>
  );
};

export default page;
