"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import Link from "next/link";
import Image from "next/image";
import OverlayMenu from "@/components/layout/overlay-menu";
import { Button } from "../ui/button";
import { ChevronRight } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
}

interface NavbarProps {
  activeSection: string;
  scrollToSection: (sectionId: string) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: Dispatch<SetStateAction<boolean>>;
  navItems: NavItem[];
  onBookTrial?: () => void;
}

/**
 * Floating pill navbar — detached from the viewport edge (top-4), not a
 * full-width bar. Always rendered with the frosted background (no
 * transparent/scrolled toggle). Reserved space above hero content is
 * ~top offset (16px) + pill height (~56px) + breathing room ≈ 80px total.
 * FTCHero reserves this via `pt-20` — if pill padding/logo size changes
 * here, update that offset too.
 */
export default function Navbar({
  activeSection,
  scrollToSection,
  isMenuOpen,
  setIsMenuOpen,
  navItems,
  onBookTrial,
}: NavbarProps) {
  return (
    <div className="fixed inset-x-0 top-4 z-[30] flex justify-center px-4 ">
      <header className="flex w-full max-w-5xl items-center justify-between  rounded-full border border-white/15 bg-white/80 px-4 py-4 shadow-xl shadow-black/10 backdrop-blur-xl">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/assets/Cyborg-logo.png"
            alt="Cyborg Logo"
            width={80}
            height={80}
            className="h-8 w-auto"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                  isActive
                    ? "bg-orange-100 font-semibold text-red-800"
                    : "text-black hover:bg-black/5 hover:text-red-800"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/free-trial"
            onClick={(event) => {
              if (onBookTrial) {
                event.preventDefault();
                onBookTrial();
              }
            }}
            className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <Button className="h-10 rounded-full bg-gradient-to-r from-red-600 via-red-700 to-red-800 px-3 text-[10px] font-semibold text-white shadow-[0_10px_20px_rgba(239,68,68,0.18),inset_0_1px_0_rgba(255,255,255,0.22)] transition-all duration-300 hover:shadow-[0_14px_24px_rgba(239,68,68,0.22),inset_0_1px_0_rgba(255,255,255,0.26)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:px-4 sm:text-xs xl:px-5 xl:text-sm">
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <span>Book Free Trial</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </Button>
          </Link>

          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/5 bg-white/80 text-black shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-800 focus-visible:ring-offset-2 focus-visible:ring-offset-white lg:hidden"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            <span className="flex flex-col gap-1.5">
              <span
                className={`block h-0.5 w-5 rounded-full bg-current transition-all ${
                  isMenuOpen ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 rounded-full bg-current transition-all ${
                  isMenuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`block h-0.5 w-5 rounded-full bg-current transition-all ${
                  isMenuOpen ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </header>

      <OverlayMenu
        isOpen={isMenuOpen}
        setIsOpen={setIsMenuOpen}
        activeSection={activeSection}
        scrollToSection={scrollToSection}
        navItems={navItems}
      />
    </div>
  );
}
