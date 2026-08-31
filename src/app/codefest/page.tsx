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
import WinnerAnnouncement from "@/components/codefest/WinnerAnnouncement";

export const metadata: Metadata = {
  title: "Codefest 1.0 | Online Coding Competitions For Students",
  description:
    "CodeFest 2026 registrations are closed. Results for the Pan-India online coding competition for school students will be declared soon.",
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
      <WinnerAnnouncement />
      <CodefestLiveSection />
      <Footer />
    </main>
  );
}
