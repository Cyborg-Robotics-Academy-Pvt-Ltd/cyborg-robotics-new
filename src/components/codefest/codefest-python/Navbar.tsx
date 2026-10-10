"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Categories", href: "#categories" },
  { label: "Scoring", href: "#scoring" },
  { label: "Timeline", href: "#timeline" },
  { label: "Rewards", href: "#rewards" },
];

function openRegistration() {
  window.dispatchEvent(new Event("open-codefest-registration"));
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed left-1/2 top-3 z-50 w-[calc(100%-2rem)] max-w-[1000px] -translate-x-1/2 rounded-full border bg-white/90 backdrop-blur-xl transition-all duration-300 ${
          scrolled
            ? "border-gray-200/90 shadow-[0_14px_45px_-24px_rgba(15,23,42,0.35)]"
            : "border-gray-200/70 shadow-[0_8px_30px_-25px_rgba(15,23,42,0.28)]"
        }`}
      >
        <nav className="flex items-center justify-between px-4 py-3.5 sm:px-5 lg:px-7">
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

          <ul className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="relative py-2 text-[14px] font-semibold text-[#475569] transition hover:text-[#0F172A] after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-gradient-to-r after:from-[#dc2626] after:to-[#f97316] after:transition-all hover:after:w-full"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden lg:block">
            <button
              type="button"
              onClick={openRegistration}
              className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-[#b91c1c] to-[#dc2626] px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_-12px_rgba(185,28,28,0.8)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-12px_rgba(185,28,28,0.9)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dc2626]"
            >
              Register now
              <span className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={openRegistration}
            className="group flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#b91c1c] to-[#dc2626] px-3 py-2 text-xs font-bold text-white shadow-[0_8px_18px_-10px_rgba(185,28,28,0.8)] transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dc2626] sm:px-4 sm:text-sm lg:hidden"
          >
            Register now
            <span className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </button>
        </nav>
      </header>
      <div aria-hidden="true" className="h-[86px]" />
    </>
  );
}
