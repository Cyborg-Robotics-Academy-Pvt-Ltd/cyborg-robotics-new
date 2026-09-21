"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import Link from "next/link";
import Image from "next/image";
import HamburgerButton from "@/components/layout/hamburger-button";
import OverlayMenu from "@/components/layout/overlay-menu";

interface NavItem {
  id: string;
  label: string;
}

interface FTCNavbarProps {
  activeSection: string;
  scrollToSection: (sectionId: string) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: Dispatch<SetStateAction<boolean>>;
  navItems: NavItem[];
}

/**
 * Floating pill navbar — detached from the viewport edge (top-4), not a
 * full-width bar. Reserved space it needs above the hero content is
 * ~top offset (16px) + pill height (~56px) + breathing room ≈ 80px total.
 * FTCHero currently reserves this via `pt-20` — if you change the pill's
 * padding/logo size here, that offset drifts and needs updating too.
 */
export default function FTCNavbar({
  activeSection,
  scrollToSection,
  isMenuOpen,
  setIsMenuOpen,
  navItems,
}: FTCNavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed inset-x-0 top-4 z-[70] flex justify-center px-4">
      <header
        className={`flex w-full max-w-5xl items-center justify-between rounded-full transition-all duration-300 ${
          scrolled
            ? "border border-white/15 px-4 py-2 shadow-lg shadow-black/40 backdrop-blur-xl"
            : "border border-transparent bg-transparent px-5 py-2.5"
        }`}
        style={
          scrolled
            ? {
                background:
                  "radial-gradient(circle at 85% 90%, rgba(185, 36, 35, 0.25) 0%, transparent 45%), radial-gradient(circle at 100% 100%, rgba(76, 20, 25, 0.35) 0%, transparent 55%), rgba(7, 9, 13, 0.9)",
              }
            : undefined
        }
      >
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/assets/Cyborg-logo.png"
            alt="Cyborg Logo"
            width={80}
            height={80}
            className={`w-auto transition-all duration-300 ${scrolled ? "h-8" : "h-9"}`}
            priority
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                aria-current={isActive ? "true" : undefined}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-white/10 font-semibold text-[#B92423]"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="rounded-full bg-[#B92423] p-1.5 text-white">
          <HamburgerButton
            isOpen={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          />
        </div>
      </header>

      <OverlayMenu
        isOpen={isMenuOpen}
        setIsOpen={setIsMenuOpen}
        activeSection={activeSection}
        scrollToSection={scrollToSection}
      />
    </div>
  );
}
