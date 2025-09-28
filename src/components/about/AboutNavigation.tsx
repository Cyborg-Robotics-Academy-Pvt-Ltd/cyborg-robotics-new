"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import AnimatedHamburgerButton from "../layout/animated-hamburger-button";
import OverlayMenu from "../layout/overlay-menu";

interface AboutNavigationProps {
  activeSection?: string;
}

const aboutNavItems = [
  { id: "hero", label: "About Us" },
  { id: "story", label: "Our Story" },
  { id: "founders", label: "Meet Founders" },
  { id: "team", label: "Our Team" },
  { id: "global-reach", label: "Global Reach" },
];

export default function AboutNavigation({
  activeSection,
}: AboutNavigationProps) {
  const [currentActiveSection, setCurrentActiveSection] = useState(
    activeSection || "hero"
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
    // Special handling for "About Us" - navigate to clean /about URL
    if (sectionId === "hero") {
      if (history.pushState) {
        history.pushState(null, "", "/about");
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
    <header className="fixed top-0 left-0 right-0 transition-all duration-300 bg-white shadow-lg border-b border-gray-200 z-50">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
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
        <nav className="hidden lg:flex gap-6 items-center justify-center absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {aboutNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-md ${
                currentActiveSection === item.id
                  ? "text-white bg-[#b92423] font-semibold rounded-xl"
                  : "text-gray-700 hover:text-[#b92423] hover:bg-red-50 rounded-xl"
              }`}
            >
              {item.label}
              {/* Active indicator */}
              {currentActiveSection === item.id && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                  layoutId="activeIndicator"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}
            </button>
          ))}
        </nav>

        {/* Desktop CTA buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/">
            <Button
              size="sm"
              variant="outline"
              className="border-2 border-[#b92423] text-[#b92423] hover:bg-[#b92423] hover:text-white font-semibold rounded-[7px] transition-all duration-200"
            >
              Back to Home
            </Button>
          </Link>
          <Link href="/contact-us">
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: [0, -3, 0, -3, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "loop",
                ease: "easeInOut",
              }}
            >
              <Button
                size="sm"
                className="bg-[#b92423] hover:bg-[#ab2623] text-white font-bold rounded-[7px] shadow-lg"
              >
                Contact Us
              </Button>
            </motion.div>
          </Link>
        </div>

        {/* Mobile Navigation - Hamburger menu only */}
        <div className="lg:hidden">{/* Empty space to maintain layout */}</div>
      </div>

      {/* Mobile Hamburger Button */}
      <div className="fixed top-4 right-4 z-50 lg:hidden">
        <AnimatedHamburgerButton
          isOpen={isMenuOpen}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        />
      </div>

      {/* Overlay Menu for Mobile */}
      <OverlayMenu
        isOpen={isMenuOpen}
        setIsOpen={setIsMenuOpen}
        activeSection={currentActiveSection}
        scrollToSection={scrollToSection}
      />
    </header>
  );
}
