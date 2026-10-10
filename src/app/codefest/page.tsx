import {
  FeatureBar,
  AboutChallenge,
  HowItWorks,
  Highlights,
  FAQSection,
  FinalCTA,
  RegistrationForm,
} from "@/components/codefest/codefest-maz/index";
import CodefestLiveSection from "@/components/codefest/codefest-maz/CodefestLiveSection";

import type { Metadata } from "next";
import WinnerAnnouncement from "@/components/codefest/codefest-maz/WinnerAnnouncement";
import HeroSection from "@/components/codefest/codefest-python/HeroSection";
import CodefestNavbar from "@/components/codefest/codefest-python/Navbar";
import About from "@/components/codefest/codefest-python/About";
import Challenge from "@/components/codefest/codefest-python/Challenge";
import Evaluation from "@/components/codefest/codefest-python/Evaluation";
import Process from "@/components/codefest/codefest-python/Process";
import Theme from "@/components/codefest/codefest-python/Theme";
import Winners from "@/components/codefest/codefest-python/Winners";
import Footer from "@/components/codefest/codefest-python/Footer";

export const metadata: Metadata = {
  title:
    "CodeFest 2.O Python Edition | Online Coding Competitions For Students",
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
    <main id="top" className="bg-[#f8f8f8] overflow-x-clip">
      <CodefestNavbar />
      <HeroSection />
      <RegistrationForm showTrigger={false} />
      <About />
      <Challenge />
      <Theme />
      <Evaluation />
      <Process />
      <Winners />
      <Footer />
    </main>
  );
}
