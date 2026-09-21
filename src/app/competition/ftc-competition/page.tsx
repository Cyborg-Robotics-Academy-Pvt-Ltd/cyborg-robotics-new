"use client";

import React, { useState, useEffect } from "react";

import { Vision } from "@/components/ftc-competition/Vision";
import { ProgramStructure } from "@/components/ftc-competition/Program-structure";
import { OfficialPartnerBadge } from "@/components/ftc-competition/OfficialPartnerBadge";
import FtcFooter from "@/components/ftc-competition/Ftc-footer";
import FTCHero from "@/components/ftc-competition/Hero";
import FTCNavbar from "@/components/ftc-competition/FTCNavbar";
import { HeroCanvas } from "@/components/ftc-competition/HeroCanvas";
import About from "@/components/ftc-competition/About";
import FtcDetails from "@/components/ftc-competition/FtcDetails";
import CompetitionField from "@/components/ftc-competition/Competitionfield";
import MeetTheMentors from "@/components/ftc-competition/MeetTheMentors";
import VideoIntroModal from "@/components/ftc-competition/Videointromodal";
import FtcGallery from "@/components/ftc-competition/FtcGallery";

export default function FTCPcompetitionPage() {
  const [activeSection, setActiveSection] = useState("about-ftc");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "about-ftc",
        "vision",
        "competition-field",
        "mentors",
        "program-structure",
        "gallery",
      ];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(section);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80;
      const elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      if (history.pushState) {
        history.pushState(null, "", `#${sectionId}`);
      }
    }
    setIsMenuOpen(false);
  };

  const navItems = [
    { id: "about-ftc", label: "About FTC" },
    { id: "vision", label: "Vision" },
    { id: "competition-field", label: "Competition Field" },
    { id: "mentors", label: "Mentors" },
    { id: "program-structure", label: "Program Structure" },
    { id: "gallery", label: "Gallery" },
  ];

  return (
    <>
      {/* Shows every time someone lands on this page.
          Swap videoSrc for your real 9:16 video file's path. */}

      <VideoIntroModal
        videoSrc="https://res.cloudinary.com/dqiarwxml/video/upload/v1789996372/IMG_0338_1_soaccj.mov"
        alwaysShow
        autoPlayDelayMs={5000}
        unmuteDelayMs={4000}
      />
      <OfficialPartnerBadge />

      <FTCNavbar
        activeSection={activeSection}
        scrollToSection={scrollToSection}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        navItems={navItems}
      />

      <FTCHero />
      <FtcDetails />
      <HeroCanvas />
      <About />
      {/* <HowItWorks /> */}
      <Vision />
      <CompetitionField />
      <MeetTheMentors />
      <ProgramStructure />
      <FtcGallery />
      <FtcFooter />
    </>
  );
}
