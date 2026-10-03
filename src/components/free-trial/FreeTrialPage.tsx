"use client";

import { useEffect, useState } from "react";
import HeroSection from "../LandingPage/HeroSection";
import Navbar from "../LandingPage/Navbar";
import Footer from "../home/Footer";
import TrustStats from "../LandingPage/TrustStats";
import WhyRobotics from "../LandingPage/WhyRobotics";
import LearningJourney from "../LandingPage/LearningJourney";
import ProgramsSection from "../LandingPage/ProgramsSection";
import LearningModes from "../LandingPage/LearningModes";
import StudentStories from "../LandingPage/StudentStories";
import Achievements from "../LandingPage/Achievements";
import FoundersSection from "../about/FoundersSection";
import TrialProcess from "../LandingPage/TrialProcess";
import TrialCTA from "../LandingPage/TrialCTA";
import FAQ from "../LandingPage/FAQ";

const navItems = [
  { id: "why", label: "Why Robotics" },
  { id: "programs", label: "Programs" },
  { id: "stories", label: "Success Stories" },
  { id: "faq", label: "FAQ" },
];

const FreeTrialPage = () => {
  const [activeSection, setActiveSection] = useState(navItems[0].id);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [trialModalRequest, setTrialModalRequest] = useState(0);

  useEffect(() => {
    const sectionIds = navItems.map((item) => item.id);

    const handleScroll = () => {
      const offset = window.innerHeight * 0.35;
      let currentSection = sectionIds[0];

      for (const sectionId of sectionIds) {
        const element = document.getElementById(sectionId);
        if (!element) {
          continue;
        }

        const top = element.getBoundingClientRect().top;
        if (top <= offset) {
          currentSection = sectionId;
        }
      }

      setActiveSection(currentSection);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (!element) {
      return;
    }

    const top = element.getBoundingClientRect().top + window.scrollY - 110;
    window.scrollTo({ top, behavior: "smooth" });
    setActiveSection(sectionId);
  };

  return (
    <div>
      <Navbar
        activeSection={activeSection}
        scrollToSection={scrollToSection}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        navItems={navItems}
        onBookTrial={() => {
          setTrialModalRequest((count) => count + 1);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
      <HeroSection openRequest={trialModalRequest} />
      <TrustStats />
      <WhyRobotics />
      <LearningJourney />
      <ProgramsSection />
      <LearningModes />
      <StudentStories />
      <Achievements />
      <FoundersSection />
      <TrialProcess />
      <TrialCTA />
      <FAQ />
      <Footer />
    </div>
  );
};

export default FreeTrialPage;
