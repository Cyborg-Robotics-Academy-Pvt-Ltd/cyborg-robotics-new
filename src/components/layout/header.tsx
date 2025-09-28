"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import OverlayMenu from "./overlay-menu";
import AnimatedHamburgerButton from "./animated-hamburger-button";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "../ui/button";
import { motion } from "framer-motion";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isAboutPage = pathname === "/about";
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

  // Don't render header and hamburger menu on about page
  if (isAboutPage) {
    return null;
  }

  // Helper to handle scroll or navigation
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string
  ) => {
    e.preventDefault();
    if (window.location.pathname === "/") {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
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
      const headerHeight = 20;
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
        history.pushState(null, "", "/about");
      }
    }
    setIsMenuOpen(false);
  };

  // Don't render header and hamburger menu on about page
  if (isAboutPage) {
    return null;
  }

  return (
    <div>
      {/* Temporary transparent navbar - always visible on home page */}
      {isHomePage && !isScrolled && (
        <header className="fixed top-0 left-0 right-0 z-40 bg-transparent">
          <div className="container mx-auto flex h-16 items-center justify-between px-2 md:px-2 relative">
            <Link href="/" className="flex items-center gap-2 ml-10">
              <Image
                src="/assets/logo.png"
                alt="Cyborg Logo"
                width={80}
                height={80}
                className="h-12 w-auto"
                priority
              />
            </Link>

            {/* Transparent navigation */}
            <nav className="hidden lg:flex gap-8 items-center justify-center absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Link
                href="#why-learn-robotics"
                className="animated-underline text-sm font-medium hover:font-semibold transition-colors text-white hover:text-red-300"
                onClick={(e) => handleNavClick(e, "why-learn-robotics")}
              >
                Why Robotics
              </Link>
              <Link
                href="#what-we-offer"
                className="animated-underline text-sm font-medium hover:font-semibold transition-colors text-white hover:text-red-300"
                onClick={(e) => handleNavClick(e, "what-we-offer")}
              >
                We Offer
              </Link>
              <Link
                href="#vision-mission"
                className="animated-underline text-sm font-medium hover:font-semibold transition-colors text-white hover:text-red-300"
                onClick={(e) => handleNavClick(e, "vision-mission")}
              >
                Our Vision
              </Link>
              <Link
                href="#gallery"
                className="animated-underline text-sm font-medium hover:font-semibold transition-colors text-white hover:text-red-300"
                onClick={(e) => handleNavClick(e, "gallery")}
              >
                Photo Hub
              </Link>
            </nav>

            {/* Transparent CTA buttons */}
            <div className="hidden md:flex items-center gap-4 absolute lg:right-2 md:right-4 xl:right-2 max-md: 2xl:right-14 top-1/2 -translate-y-1/2">
              <Link href="/login">
                <Button
                  size="sm"
                  className="border-2 font-semibold rounded-[7px] transition-all duration-200 shadow-sm animate-fade-in border-white text-white hover:bg-white hover:text-[#b92423]"
                >
                  Login
                </Button>
              </Link>
              <Link href="/enquire">
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
                  className="mr-10"
                >
                  <Button
                    size="sm"
                    className="bg-[#b92423] hover:bg-[#ab2623] text-white font-bold rounded-[7px] shadow-lg animate-fade-in"
                  >
                    Enquire Now
                  </Button>
                </motion.div>
              </Link>
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
        <div className="container mx-auto flex h-16 items-center justify-between px-2 md:px-2 relative">
          <Link href="/" className="flex items-center gap-2 ml-10">
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
            <Link
              href="#why-learn-robotics"
              className={`animated-underline text-sm font-medium hover:font-semibold transition-colors ${
                isHomePage && !isScrolled
                  ? "text-white hover:text-red-300"
                  : "text-gray-900 hover:text-red-800"
              }`}
              onClick={(e) => handleNavClick(e, "why-learn-robotics")}
            >
              Why Robotics
            </Link>
            <Link
              href="#what-we-offer"
              className={`animated-underline text-sm font-medium hover:font-semibold transition-colors ${
                isHomePage && !isScrolled
                  ? "text-white hover:text-red-300"
                  : "text-gray-900 hover:text-red-800"
              }`}
              onClick={(e) => handleNavClick(e, "what-we-offer")}
            >
              We Offer
            </Link>
            <Link
              href="#vision-mission"
              className={`animated-underline text-sm font-medium hover:font-semibold transition-colors ${
                isHomePage && !isScrolled
                  ? "text-white hover:text-red-300"
                  : "text-gray-900 hover:text-red-800"
              }`}
              onClick={(e) => handleNavClick(e, "vision-mission")}
            >
              Our Vision
            </Link>
            <Link
              href="#gallery"
              className={`animated-underline text-sm font-medium hover:font-semibold transition-colors ${
                isHomePage && !isScrolled
                  ? "text-white hover:text-red-300"
                  : "text-gray-900 hover:text-red-800"
              }`}
              onClick={(e) => handleNavClick(e, "gallery")}
            >
              Photo Hub
            </Link>
          </nav>

          {/* Desktop CTA buttons */}
          <div className="hidden md:flex items-center gap-4 absolute lg:right-2 md:right-4 xl:right-2 max-md: 2xl:right-14 top-1/2 -translate-y-1/2">
            <Link href="/login">
              <Button
                size="sm"
                className={`border-2 font-semibold rounded-[7px] transition-all duration-200 shadow-sm animate-fade-in ${
                  isHomePage && !isScrolled
                    ? "border-white text-white hover:bg-white hover:text-[#b92423]"
                    : "border-[#b92423] text-[#b92423] hover:bg-[#b92423] hover:text-white"
                }`}
              >
                Login
              </Button>
            </Link>
            <Link href="/enquire">
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
                className="mr-10"
              >
                <Button
                  size="sm"
                  className="bg-[#b92423] hover:bg-[#ab2623] text-white font-bold rounded-[7px] shadow-lg animate-fade-in"
                >
                  Enquire Now
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </header>

      {/* Button is positioned absolutely to stay on top */}
      <div className="fixed top-4 right-4 sm:right md:right-10 lg:right-4 xl:right-6  2xl:right-7 z-50    ">
        <AnimatedHamburgerButton
          isOpen={isMenuOpen}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        />
      </div>

      <OverlayMenu
        isOpen={isMenuOpen}
        setIsOpen={setIsMenuOpen}
        scrollToSection={scrollToSection}
      />
    </div>
  );
}
