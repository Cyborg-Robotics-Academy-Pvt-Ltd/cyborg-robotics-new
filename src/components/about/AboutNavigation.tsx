"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import HamburgerButton from "../layout/hamburger-button";
import OverlayMenu from "../layout/overlay-menu";

interface AboutNavigationProps {
  activeSection?: string;
}

const aboutNavItems = [
  { id: "hero", label: "About Us" },
  { id: "story", label: "Our Story" },
  { id: "founders", label: "Meet Our Founders" },
  { id: "team", label: "Our Team" },
  { id: "awards", label: "Awards" },
];

export default function AboutNavigation({
  activeSection: propActiveSection,
}: AboutNavigationProps) {
  const [currentActiveSection, setCurrentActiveSection] = useState(
    propActiveSection || "hero"
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Update active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = aboutNavItems
        .map((item) => ({
          id: item.id,
          element: document.getElementById(item.id),
        }))
        .filter((section) => section.element);

      if (sections.length === 0) return;

      const scrollPosition = window.scrollY + 100; // Offset for header

      // Find the current section based on scroll position
      let currentSection = sections[0].id;
      for (const section of sections) {
        if (section.element && section.element.offsetTop <= scrollPosition) {
          currentSection = section.id;
        }
      }

      setCurrentActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Call once to set initial state

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to section function
  const scrollToSection = (sectionId: string) => {
    // Special handling for "About Us" - navigate to clean /about-us URL
    if (sectionId === "hero") {
      if (history.pushState) {
        history.pushState(null, "", "/about-us");
      }
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80; // Account for fixed header
      const elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // Update URL hash without triggering page jump
      if (history.pushState) {
        history.pushState(null, "", `#${sectionId}`);
      }
    }
  };

  return (
    <header className="fixed top-0 h-16 left-0 right-0 transition-all duration-300 bg-white shadow-lg border-b border-gray-200 z-50">
      <div className="container mx-auto flex items-center justify-between px-4 md:px-1 lg:px-1 ">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/assets/logo.png"
            alt="Cyborg Logo"
            width={80}
            height={80}
            className="h-12 w-auto"
            priority
          />
        </Link>

        {/* Desktop Navigation - About specific sections */}
        <nav className="hidden lg:flex gap-6 items-center    sm:hidden md:hidden justify-center absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {aboutNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`relative px-2 py-3 text-sm font-medium transition-colors duration-200 rounded-md ${
                currentActiveSection === item.id
                  ? "text-white bg-red-800 font-semibold rounded-xl"
                  : "text-gray-700 hover:text-[#b92423] hover:bg-red-50 rounded-xl"
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

      {/* Overlay Menu */}
      <OverlayMenu
        isOpen={isMenuOpen}
        setIsOpen={setIsMenuOpen}
        activeSection={currentActiveSection}
        scrollToSection={scrollToSection}
        // Removed showAboutNavigation prop to use standard navigation overlay
      />
    </header>
  );
}
