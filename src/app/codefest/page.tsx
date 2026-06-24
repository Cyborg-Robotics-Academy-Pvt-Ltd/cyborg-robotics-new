// src/app/page.tsx

import {
  HeroSection,
  FeatureBar,
  AboutChallenge,
  HowItWorks,
  Highlights,
  FAQSection,
  FinalCTA,
  Footer,
  RegistrationForm,
} from "@/components/codefest/index";
import CodefestLiveSection from "@/components/codefest/CodefestLiveSection";
import Header from "@/components/layout/header";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Codefest 1.0 | Online Coding Competitions For Students",
  description:
    "Join CodeFest 2026, a Pan-India online coding competition for school students. Win cash prizes worth ₹20,000, build coding skills, and compete nationwide. Register now for just ₹499.",
  keywords: [
    "Online Coding Competition for Students",
    "Coding Competition India",
    "Coding Contest for School Students",
    "STEM Coding Competition",
    "Scratch Coding Competition",
    "PictoBlox Coding Competition",
    "Robotics and Coding Competition",
    "Coding Challenge for Kids",
    "Online Programming Competition",
    "CodeFest 2026",
  ],
};
export default function HomePage() {
  return (
    <main id="top" className="bg-[#f8f8f8] overflow-hidden">
      <Header />
      <HeroSection />
      <FeatureBar />
      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 px-4 py-8 sm:px-6 sm:py-10 lg:grid-cols-[5fr_8fr] lg:gap-3 lg:px-6">
        <div id="about" className="scroll-mt-24 w-full">
          <AboutChallenge />
        </div>

        <div id="how-it-works" className="scroll-mt-24 w-full">
          <HowItWorks />
        </div>
      </section>

      <CodefestLiveSection />

      <Highlights />

      <section id="faq" className="scroll-mt-24">
        <FAQSection />
      </section>
      <FinalCTA />
      <RegistrationForm initiallyOpen />
      <Footer />
    </main>
  );
}
