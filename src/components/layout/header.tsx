"use client";

import { useState } from "react";

import Link from "next/link";
import OverlayMenu from "./overlay-menu";
import AnimatedHamburgerButton from "./animated-hamburger-button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

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

  return (
    <div>
      <header
        className={`fixed top-0 left-0 right-0 bg-white shadow-md transition-all duration-300 ${isMenuOpen ? "z-30" : "z-50"}`}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-2 md:px-2 relative">
          <Link href="/" className="flex items-center gap-2 ml-10">
            <Image
              src="/assets/logo.png"
              alt="Cyborg Logo"
              width={80}
              height={80}
              className="h-12 w-auto "
              priority
            />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex gap-8 items-center justify-center absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Link
              href="#why-learn-robotics"
              className="animated-underline text-sm font-medium  hover:font-semibold hover:text-red-800 transition-colors"
              onClick={(e) => handleNavClick(e, "why-learn-robotics")}
            >
              Why Robotics
            </Link>
            <Link
              href="#what-we-offer"
              className="animated-underline text-sm font-medium hover:font-semibold hover:text-red-800 transition-colors"
              onClick={(e) => handleNavClick(e, "what-we-offer")}
            >
              We Offer
            </Link>
            <Link
              href="#vision-mission"
              className="animated-underline text-sm font-medium hover:font-semibold hover:text-red-800 transition-colors"
              onClick={(e) => handleNavClick(e, "vision-mission")}
            >
              Our Vision
            </Link>
            <Link
              href="#gallery"
              className="animated-underline text-sm font-medium hover:font-semibold hover:text-red-800 transition-colors"
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
                className="border-2 border-[#b92423] text-[#b92423] hover:bg-[#b92423] hover:text-white font-semibold rounded-[7px] transition-all duration-200 shadow-md animate-fade-in"
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

      <OverlayMenu isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
    </div>
  );
}
