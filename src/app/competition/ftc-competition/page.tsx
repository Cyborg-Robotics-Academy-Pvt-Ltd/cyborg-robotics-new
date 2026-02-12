"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
// Added imports for hamburger menu
import HamburgerButton from "@/components/layout/hamburger-button";
import OverlayMenu from "@/components/layout/overlay-menu";
import { Hero } from "@/components/ftc-competition/Hero";
import { About } from "@/components/ftc-competition/About";
import { Vision } from "@/components/ftc-competition/Vision";
import { ProgramStructure } from "@/components/ftc-competition/Program-structure";
import { WhyChooseUs } from "@/components/ftc-competition/why-choose-us";
import { OfficialPartnerBadge } from "@/components/ftc-competition/OfficialPartnerBadge";
import FtcFooter from "@/components/ftc-competition/Ftc-footer";

export default function FTCPcompetitionPage() {
  const [activeSection, setActiveSection] = useState("about");
  // Added state for mobile menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "about",
        "vision",
        "structure",
        "onboarding",
        "why-choose",
        "mentors",
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
    // Close mobile menu when a section is selected
    setIsMenuOpen(false);
  };

  const navItems = [
    { id: "about-ftc", label: "About FTC" },
    { id: "vision", label: "Vision" },
    { id: "program-structure", label: "Program Structure" },
    { id: "why-us", label: "Why Choose Us" },
  ];

  return (
    <>
      <OfficialPartnerBadge />
      {/* Navigation */}
      <header className="fixed top-0 h-16 left-0 right-0 transition-all duration-300 bg-white/95 shadow-lg border-b border-transparent z-50">
        <div className="container mx-auto flex items-center justify-between px-4 md:px-1 lg:px-1 h-full">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/assets/Cyborg-logo.png"
              alt="Cyborg Logo"
              width={80}
              height={80}
              className="h-12 w-auto"
              priority
            />
          </Link>

          <nav className="hidden lg:flex gap-6 items-center">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`px-4 py-2 text-sm font-medium transition rounded-xl ${
                  activeSection === item.id
                    ? "text-[#b92423] bg-red-50 font-semibold"
                    : "text-gray-700 hover:text-[#b92423] hover:bg-red-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Hamburger menu button - visible on all screens now */}
          <div className="p-1 rounded-md bg-red-800 text-white">
            <HamburgerButton
              isOpen={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            />
          </div>
        </div>

        {/* Overlay Menu - using standard global menu */}
        <OverlayMenu
          isOpen={isMenuOpen}
          setIsOpen={setIsMenuOpen}
          activeSection={activeSection}
          scrollToSection={scrollToSection}
        />
      </header>

      <Hero />
      <About />
      <Vision />
      <ProgramStructure />
      <WhyChooseUs />
      <FtcFooter />
    </>
  );
}
