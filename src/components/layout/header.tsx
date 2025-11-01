"use client";

import { useState, useEffect, useMemo } from "react";

import Link from "next/link";
import OverlayMenu from "./overlay-menu";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import HamburgerButton from "./hamburger-button";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const isAboutPage = pathname === "/about-us";
  const isHomePage = pathname === "/";

  // Handle scroll for transparent navbar on home page
  useEffect(() => {
    if (!isHomePage) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  // Track active section on home page
  useEffect(() => {
    if (!isHomePage) return;

    const sections = [
      "why-learn-robotics",
      "what-we-offer",
      "vision-mission",
      "gallery",
    ];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      // Find the current section based on scroll position
      let currentSection = "";
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const offsetTop = element.offsetTop;
          const height = element.offsetHeight;

          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + height
          ) {
            currentSection = sectionId;
            break;
          }
        }
      }

      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Call once to set initial state

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  // Track active section on about page
  useEffect(() => {
    if (!isAboutPage) return;

    const sections = ["hero", "story", "founders", "team", "awards"];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      // Find the current section based on scroll position
      let currentSection = "";
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const offsetTop = element.offsetTop;
          const height = element.offsetHeight;

          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + height
          ) {
            currentSection = sectionId;
            break;
          }
        }
      }

      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Call once to set initial state

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isAboutPage]);

  // Helper to handle scroll or navigation
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string
  ) => {
    e.preventDefault();
    if (window.location.pathname === "/") {
      const el = document.getElementById(sectionId);
      if (el) {
        // Calculate position accounting for fixed header
        const headerHeight = 80; // Approximate header height
        const elementPosition =
          el.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    } else {
      router.push(`/#${sectionId}`);
    }
  };

  // About page scroll to section function
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Calculate viewport and element dimensions for better positioning
      const viewportHeight = window.innerHeight;
      const headerHeight = 80; // Updated header height
      const elementRect = element.getBoundingClientRect();
      const elementTop = elementRect.top + window.pageYOffset;

      // Calculate optimal scroll position
      let targetPosition;
      if (elementRect.height < viewportHeight - headerHeight) {
        // Center smaller sections in viewport
        const availableSpace = viewportHeight - headerHeight;
        const centerOffset = (availableSpace - elementRect.height) / 2;
        targetPosition = elementTop - headerHeight - centerOffset;
      } else {
        // For larger sections, position at top with header offset
        targetPosition = elementTop - headerHeight;
      }

      // Ensure we don't scroll past the document bounds
      const maxScroll = document.documentElement.scrollHeight - viewportHeight;
      targetPosition = Math.max(0, Math.min(targetPosition, maxScroll));

      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      });

      // Update URL hash without triggering page jump (skip for hero section)
      if (history.pushState && sectionId !== "hero") {
        history.pushState(null, "", `#${sectionId}`);
      } else if (sectionId === "hero" && history.pushState) {
        // Clean URL for hero section
        history.pushState(null, "", "/about-us");
      }
    }
    setIsMenuOpen(false);
  };

  // Navigation items for main navbar
  const navItems = [
    {
      id: "why-learn-robotics",
      label: "Why Robotics",
      href: "#why-learn-robotics",
    },
    { id: "what-we-offer", label: "We Offer", href: "#what-we-offer" },
    { id: "vision-mission", label: "Our Vision", href: "#vision-mission" },
    { id: "gallery", label: "Photo Hub", href: "#gallery" },
  ];

  return (
    <div>
      {/* Temporary transparent navbar - always visible on home page */}
      {isHomePage && !isScrolled && (
        <header className="fixed top-0 left-0 right-0 z-40 bg-transparent">
          <div className="flex h-16 items-center w-full justify-between ">
            <Link href="/" className="flex items-center gap-2 ">
              <Image
                src="/assets/Cyborg-logo.png"
                alt="Cyborg Logo"
                width={80}
                height={80}
                className="h-12 w-auto"
                priority
              />
            </Link>

            {/* Transparent navigation */}
            <nav className="hidden lg:flex gap-8 items-center justify-center absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`animated-underline text-sm font-medium hover:font-semibold transition-colors ${
                    activeSection === item.id
                      ? "text-red-300 font-semibold"
                      : "text-white hover:text-red-300"
                  }`}
                  onClick={(e) => handleNavClick(e, item.id)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Transparent CTA buttons and menu */}
            <div className="flex items-center gap-4 absolute top-4 right-4">
              <div className="hidden lg:flex items-center gap-4">
                <Link href="/login">
                  <Button
                    size="sm"
                    className="border-2 font-semibold rounded-[7px] transition-all duration-200 shadow-sm animate-fade-in border-white text-white hover:bg-white hover:text-[#b92423]"
                  >
                    Log In
                  </Button>
                </Link>
                <Link href="https://wa.me/917028511161?text=Hello%20Cyborg,%20I%20am%20looking%20for%20some%20help!%20(Enquiry)">
                  <motion.div
                    initial={{ y: 0 }}
                    animate={{ y: [0, -6, 0, -6, 0, -6, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "easeInOut",
                      delay: 0.1,
                    }}
                  >
                    <Button
                      size="sm"
                      className="bg-[#b92423] hover:bg-[#ab2623] text-white font-normal rounded-[7px] shadow-lg animate-fade-in"
                    >
                      Book Your Free Trial
                    </Button>
                  </motion.div>
                </Link>
              </div>
              {/* Menu button - visible on all screens */}
              <div className="p-1 rounded-md bg-red-800 text-white">
                <HamburgerButton
                  isOpen={isMenuOpen}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                />
              </div>
            </div>
          </div>
        </header>
      )}

      {/* CSS styles for animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease;
        }
      `}</style>

      {/* Main navbar that slides down on scroll */}
      <header
        className={`fixed top-0 left-0 right-0 transition-all duration-700 ease-in-out overflow-hidden bg-white ${
          isHomePage
            ? isScrolled
              ? "transform translate-y-0 shadow-sm shadow-black/10"
              : "transform -translate-y-full shadow-none"
            : "transform translate-y-0 shadow-sm shadow-black/10"
        } ${isMenuOpen ? "z-30" : "z-50"}`}
      >
        <div className=" flex h-16 items-center justify-between  relative">
          <Link href="/" className="flex items-center gap-2 ">
            <Image
              src="/assets/logo.png"
              alt="Cyborg Logo"
              width={80}
              height={80}
              className="h-12 w-auto"
              priority
            />
          </Link>

          {/* Default navigation for all pages */}
          <nav className="hidden lg:flex gap-8 items-center justify-center absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`animated-underline text-sm font-medium hover:font-semibold transition-colors ${
                  activeSection === item.id
                    ? "text-red-800 font-semibold"
                    : isHomePage && !isScrolled
                      ? "text-white hover:text-red-300"
                      : "text-gray-900 hover:text-red-800"
                }`}
                onClick={(e) => handleNavClick(e, item.id)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA buttons and menu */}
          <div className="hidden lg:flex items-center gap-4 absolute top-4 right-4">
            <Link href="/login">
              <Button
                size="sm"
                className="border-2 font-semibold rounded-[7px] transition-all duration-200 shadow-sm animate-fade-in border-white text-white bg-red-800 hover:text-[#ffffff]"
              >
                Log In
              </Button>
            </Link>
            <Link href="https://wa.me/917028511161?text=Hello%20Cyborg,%20I%20am%20looking%20for%20some%20help!%20(Enquiry)">
              <motion.div
                initial={{ y: 0 }}
                animate={{ y: [0, -6, 0, -6, 0, -6, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "easeInOut",
                  delay: 0.1,
                }}
              >
                <Button
                  size="sm"
                  className="bg-[#ab2623] hover:bg-[#ab2623] text-white font-normal rounded-[7px] shadow-lg animate-fade-in"
                >
                  Book Your Free Trial
                </Button>
              </motion.div>
            </Link>
            {/* Menu button next to Enquire button */}
            <div className="p-1 rounded-md bg-red-800 text-white">
              <HamburgerButton
                isOpen={isMenuOpen}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              />
            </div>
          </div>

          {/* Mobile menu button - visible on mobile only */}
          <div className="lg:hidden absolute top-4 right-4 z-50">
            <div className="p-1 rounded-md bg-red-800 text-white">
              <HamburgerButton
                isOpen={isMenuOpen}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              />
            </div>
          </div>
        </div>
      </header>

      <OverlayMenu
        isOpen={isMenuOpen}
        setIsOpen={setIsMenuOpen}
        scrollToSection={scrollToSection}
        activeSection={activeSection}
      />
    </div>
  );
}
