"use client";
import Header from "@/components/layout/header";
import HeroImage from "@/components/tech-programs/3d-design-workshop/HeroImage";
import OfferSection from "@/components/tech-programs/3d-design-workshop/OfferSection";

import ProgramHighlights from "@/components/tech-programs/3d-design-workshop/ProgramHighlights";
import ProjectShowcases from "@/components/tech-programs/3d-design-workshop/ProjectShowcases";
import TestimonialSection from "@/components/tech-programs/3d-design-workshop/TestimonialSection";
import PrintedObjectViewer from "@/components/tech-programs/3d-design-workshop/PrintedObjectViewer";
import { motion } from "framer-motion";
import { ReactNode } from "react";
import ThreeDExperience from "@/components/tech-programs/3d-design-workshop/ThreeDExperience";
import ThreeDPocessFlow from "@/components/tech-programs/3d-design-workshop/ThreeDPocessFlow";

const SectionReveal = ({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 28 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.15 }}
    transition={{ duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] }}
  >
    {children}
  </motion.div>
);

const page = () => {
  return (
    <div className="relative min-h-screen w-full overflow-y-hidden bg-gradient-to-b from-slate-50 via-white to-sky-50/40">
      <Header />
      <HeroImage />
      <SectionReveal>
        <OfferSection />
      </SectionReveal>
      <SectionReveal>
        <ThreeDExperience />
      </SectionReveal>
      <SectionReveal>
        <ThreeDPocessFlow />
      </SectionReveal>
      <SectionReveal>
        <ProgramHighlights />
      </SectionReveal>
      <SectionReveal>
        <ProjectShowcases />
      </SectionReveal>
      <SectionReveal>
        <PrintedObjectViewer />
      </SectionReveal>
      <SectionReveal>
        <TestimonialSection />
      </SectionReveal>
    </div>
  );
};

export default page;
