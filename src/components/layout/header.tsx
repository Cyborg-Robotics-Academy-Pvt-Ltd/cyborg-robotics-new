"use client";

import { useState, useEffect, useMemo, useRef } from "react";

import Link from "next/link";
import OverlayMenu from "./overlay-menu";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import HamburgerButton from "./hamburger-button";
import { useAuth } from "@/lib/auth-context";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { enhancedCourseData } from "@/data/enhancedCourseData";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<
    Array<{ title: string; slug: string }>
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const isAboutPage = pathname === "/about-us";
  const isHomePage = pathname === "/";
  const { user, userRole, loading } = useAuth();

  // Handle scroll for transparent navbar on home page
  useEffect(() => {
    if (!isHomePage) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 0);
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

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
      localStorage.removeItem("userRole");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(
        `/all-courses?search=${encodeURIComponent(searchQuery.trim())}`
      );
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: {
    title: string;
    slug: string;
  }) => {
    setSearchQuery(suggestion.title);
    setShowSuggestions(false);
    searchInputRef.current?.blur();

    // Navigate immediately
    router.push(`/all-courses?search=${encodeURIComponent(suggestion.title)}`);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the click is outside the search container
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        // Check if the click is not on a suggestion item
        const suggestionElements = document.querySelectorAll(
          ".search-suggestion-item"
        );
        let clickedOnSuggestion = false;
        suggestionElements.forEach((el) => {
          if (el.contains(event.target as Node)) {
            clickedOnSuggestion = true;
          }
        });

        if (!clickedOnSuggestion) {
          setShowSuggestions(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Generate search suggestions based on course data
  useEffect(() => {
    const generateSuggestions = () => {
      if (!searchQuery.trim()) {
        setSearchSuggestions([]);
        return;
      }

      // Convert enhancedCourseData to array and filter based on search query
      const courseList = Object.entries(enhancedCourseData).map(
        ([slug, course]) => ({
          slug,
          title: course.title,
        })
      );

      // Filter suggestions based on search query
      const filteredSuggestions = courseList
        .filter((course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5); // Limit to 5 suggestions

      setSearchSuggestions(filteredSuggestions);
    };

    generateSuggestions();
  }, [searchQuery]);

  // Navigation items for main navbar
  const navItems = [
    { id: "courses", label: "Courses", href: "/all-courses" },
    {
      id: "about-us",
      label: "About Us",
      href: "/about-us",
    },

    { id: "gallery", label: "Photo Hub", href: "/gallery/photos" },
    {
      id: "ftc-competition",
      label: "FTC Competition",
      href: "/competition/ftc-competition",
    },
  ];

  // Determine if a nav item is a scroll link (starts with #)
  const isScrollLink = (href: string) => href.startsWith("#");

  return (
    <div>
      {/* Single header that slides down from above and is transparent at scroll position zero on home page */}
      <motion.header
        initial={{ y: -100 }} // Start above the viewport
        animate={{
          y: 0, // Slide down to normal position
          backgroundColor:
            isHomePage && !isScrolled ? "rgba(0,0,0,0)" : "rgba(255,255,255,1)",
          boxShadow:
            isHomePage && !isScrolled
              ? "none"
              : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
          borderBottom:
            isHomePage && !isScrolled
              ? "1px solid transparent"
              : "1px solid rgba(0, 0, 0, 0.1)",
        }}
        transition={{
          y: { type: "spring", stiffness: 300, damping: 30 }, // Smooth spring animation for sliding
          backgroundColor: { duration: 0.3, ease: "easeInOut" }, // Color transition
          boxShadow: { duration: 0.3, ease: "easeInOut" }, // Shadow transition
          borderBottom: { duration: 0.3, ease: "easeInOut" }, // Border transition
        }}
        className={`fixed top-0 left-0 right-0 z-50 `}
      >
        <div className="flex h-16 items-center w-full justify-between px-4">
          <motion.div
            animate={{
              scale: isHomePage && !isScrolled ? 1 : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/assets/Cyborg-logo.png"
                alt="Cyborg Logo"
                width={80}
                height={80}
                className={`w-auto transition-all duration-300 ${
                  isHomePage && !isScrolled ? "h-9 md:h-12" : "h-12"
                }`}
                priority
              />
            </Link>
          </motion.div>

          {/* Desktop Navigation with Search - Hidden on mobile, centered on desktop */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            <div className="flex items-center justify-center gap-5 max-w-3xl w-full">
              {/* Navigation */}
              <nav className="flex gap-5 items-center">
                {navItems.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href={item.href}
                      className={`animated-underline text-sm font-medium hover:font-semibold transition-all duration-300 ${
                        activeSection === item.id
                          ? "text-red-800 font-semibold"
                          : item.id === "courses"
                            ? isHomePage && !isScrolled
                              ? "text-white font-bold hover:text-red-300"
                              : "text-black font-bold hover:text-red-700"
                            : item.id === "ftc-competition"
                              ? "text-yellow-500 font-bold hover:text-yellow-600"
                              : isHomePage && !isScrolled
                                ? "text-white hover:text-red-300"
                                : "text-gray-900 hover:text-red-800"
                      }`}
                      onClick={(e) =>
                        isScrollLink(item.href) && handleNavClick(e, item.id)
                      }
                    >
                      <span className="flex items-center gap-1">
                        {item.label}
                        {item.id === "ftc-competition" && (
                          <span className="bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                            NEW
                          </span>
                        )}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Search Bar with Suggestions */}
              <div className="flex-1 max-w-[160px] ml-4 relative">
                <form
                  onSubmit={handleSearch}
                  className="relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search Courses"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className={`w-full pl-7 pr-3 py-1 rounded-2xl focus:ring-2 focus:ring-red-500 transition-all text-xs ${
                      isHomePage && !isScrolled
                        ? "bg-white/20 text-white placeholder:text-white/70 border-0"
                        : "bg-white text-gray-900 placeholder:text-gray-500 border-0"
                    }`}
                  />
                  <Search
                    className={`absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 ${
                      isHomePage && !isScrolled ? "text-white" : "text-gray-400"
                    }`}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </form>

                {/* Search Suggestions Dropdown */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    {searchSuggestions.map((suggestion, index) => (
                      <div
                        key={suggestion.slug}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`search-suggestion-item px-3 py-2 text-xs hover:bg-red-50 hover:text-red-700 cursor-pointer transition-colors duration-200 ${
                          index < searchSuggestions.length - 1
                            ? "border-b border-gray-100"
                            : ""
                        }`}
                      >
                        <span className="font-medium">{suggestion.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CTA buttons and menu */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-4">
              {loading ? (
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              ) : user ? (
                <Link href={`/${userRole}-dashboard`}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="sm"
                      className={`font-semibold rounded-[7px] transition-all duration-300 shadow-sm ${
                        isHomePage && !isScrolled
                          ? "text-white    hover:text-[#ffffff]"
                          : "text-white bg-red-800 hover:text-[#ffffff]"
                      }`}
                    >
                      Dashboard
                    </Button>
                  </motion.div>
                </Link>
              ) : (
                <Link href="/login">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="sm"
                      className={`border-2 font-semibold rounded-[7px] transition-all duration-300 shadow-sm ${
                        isHomePage && !isScrolled
                          ? "border-white text-white hover:bg-white hover:text-[#b92423]"
                          : "border-white text-white bg-red-800 hover:text-[#ffffff]"
                      }`}
                    >
                      Log In
                    </Button>
                  </motion.div>
                </Link>
              )}
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
                  whileHover={{ scale: 1.05 }}
                >
                  <Button
                    size="sm"
                    className={`font-normal rounded-[7px] shadow-lg transition-all duration-300 ${
                      isHomePage && !isScrolled
                        ? "bg-[#b92423] hover:bg-[#ab2623] text-white"
                        : "bg-[#ab2623] hover:bg-[#ab2623] text-white"
                    }`}
                  >
                    Book Your Free Trial
                  </Button>
                </motion.div>
              </Link>
            </div>
            {/* Menu button - visible on all screens */}
            <div className="lg:hidden flex items-center gap-2">
              {loading ? (
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              ) : user ? (
                <Link href={`/${userRole}-dashboard`}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="sm"
                      className="font-semibold rounded-[7px] transition-all duration-300 shadow-sm text-white bg-orange-500 hover:text-[#ffffff]"
                    >
                      Dashboard
                    </Button>
                  </motion.div>
                </Link>
              ) : (
                <Link href="/login">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="sm"
                      className="border-2 font-semibold rounded-[7px] transition-all duration-300 shadow-sm border-white text-white bg-red-800 hover:text-[#ffffff]"
                    >
                      Log In
                    </Button>
                  </motion.div>
                </Link>
              )}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1 rounded-md bg-red-800 text-white"
              >
                <HamburgerButton
                  isOpen={isMenuOpen}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                />
              </motion.div>
            </div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="hidden lg:flex p-1 rounded-md bg-red-800 text-white"
            >
              <HamburgerButton
                isOpen={isMenuOpen}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              />
            </motion.div>
          </div>
        </div>
      </motion.header>

      <OverlayMenu
        isOpen={isMenuOpen}
        setIsOpen={setIsMenuOpen}
        scrollToSection={scrollToSection}
        activeSection={activeSection}
      />

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
    </div>
  );
}
