"use client";

import { useState, useEffect, useMemo, useRef } from "react";

import Link from "next/link";
import OverlayMenu from "./overlay-menu";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { Button } from "../ui/button";
import { motion, AnimatePresence } from "framer-motion";
import HamburgerButton from "./hamburger-button";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import {
  Search,
  X,
  User,
  LogOut,
  User as UserProfile,
  LayoutDashboard,
} from "lucide-react";
import { enhancedCourseData } from "@/data/enhancedCourseData";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<
    Array<{
      title: string;
      slug: string;
      description: string;
      ageRange: string;
      category: string;
      imagePath: string;
    }>
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string>("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const mobileProfileMenuRef = useRef<HTMLDivElement>(null);
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
    sectionId: string,
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
        `/all-courses?search=${encodeURIComponent(searchQuery.trim())}`,
      );
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: {
    title: string;
    slug: string;
    description: string;
    ageRange: string;
    category: string;
    imagePath: string;
  }) => {
    setSearchQuery(suggestion.title);
    setShowSuggestions(false);
    searchInputRef.current?.blur();

    // Navigate directly to the course page
    router.push(`/all-courses/${suggestion.slug}`);
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
          ".search-suggestion-item",
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

  // Close search popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSearchPopup) {
        const popupElement = document.querySelector(
          '[data-search-popup="true"]',
        ); // Use a data attribute to identify popup
        if (popupElement && !popupElement.contains(event.target as Node)) {
          setShowSearchPopup(false);
          setSearchQuery("");
          setShowSuggestions(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearchPopup]);

  // Focus search input when popup opens
  useEffect(() => {
    if (showSearchPopup && searchInputRef.current) {
      // Use setTimeout to ensure DOM is updated before focusing
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [showSearchPopup]);

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
          description: course.description,
          ageRange: course.ageRange,
          category: course.category,
          imagePath: course.imagePath,
        }),
      );

      // Filter suggestions based on search query
      const filteredSuggestions = courseList
        .filter(
          (course) =>
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()),
        )
        .slice(0, 5); // Limit to 5 suggestions

      setSearchSuggestions(filteredSuggestions);
    };

    generateSuggestions();
  }, [searchQuery]);

  // Navigation items for main navbar
  const navItems = [
    {
      id: "tech-programs",
      label: "Tech Programs",
      href: "/tech-programs",
    },
    { id: "courses", label: "Courses", href: "/all-courses" },
    {
      id: "about-us",
      label: "About Us",
      href: "/about-us",
    },

    { id: "gallery", label: "Photo Hub", href: "/gallery/behind-scene" },
  ];

  // Fetch user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (user && userRole) {
        try {
          let collectionName = "";
          switch (userRole) {
            case "admin":
              collectionName = "admins";
              break;
            case "trainer":
              collectionName = "trainers";
              break;
            case "student":
              collectionName = "students";
              break;
            default:
              collectionName = "students";
          }

          const userDocRef = doc(db, collectionName, user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const data = userDoc.data();
            // Check for profile image in different possible fields
            const profileImg =
              data.profileimage || data.imageUrls?.[0] || data.imageUrl || null;
            setProfileImage(profileImg);

            // Set profile name for fallback initials
            let name = "User";
            if (data.username && data.username.trim()) {
              name = data.username.trim();
            } else if (data.name && data.name.trim()) {
              name = data.name.trim();
            } else if (user.displayName && user.displayName.trim()) {
              name = user.displayName.trim();
            } else if (user.email) {
              name = user.email.split("@")[0];
            }
            setProfileName(name);
          }
        } catch (error) {
          console.error("Error fetching profile data:", error);
        }
      }
    };

    fetchProfileData();
  }, [user, userRole]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutsideDesktopMenu =
        !profileMenuRef.current ||
        !profileMenuRef.current.contains(event.target as Node);
      const isOutsideMobileMenu =
        !mobileProfileMenuRef.current ||
        !mobileProfileMenuRef.current.contains(event.target as Node);

      if (isOutsideDesktopMenu && isOutsideMobileMenu) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
                {navItems.map((item) => {
                  // Check if this item has submenu (currently only tech-programs has submenu)
                  const hasSubmenu = item.id === "tech-programs";

                  // State for submenu visibility
                  const [isSubmenuVisible, setIsSubmenuVisible] =
                    useState(false);

                  return (
                    <div
                      key={item.id}
                      className="relative"
                      onMouseEnter={() =>
                        hasSubmenu && setIsSubmenuVisible(true)
                      }
                      onMouseLeave={() =>
                        hasSubmenu && setIsSubmenuVisible(false)
                      }
                    >
                      <motion.div
                        whileHover={{ y: -2 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link
                          href={hasSubmenu ? "#" : item.href}
                          className={`animated-underline text-sm font-medium hover:font-semibold transition-all duration-300 ${
                            activeSection === item.id
                              ? "text-red-800 font-semibold"
                              : item.id === "courses"
                                ? isHomePage && !isScrolled
                                  ? "text-white font-bold hover:text-red-300"
                                  : "text-black font-bold hover:text-red-700"
                                : item.id === "tech-programs"
                                  ? "text-blue-600 font-bold hover:text-blue-700"
                                  : item.id === "ftc-competition"
                                    ? "text-yellow-500 font-bold hover:text-yellow-600"
                                    : isHomePage && !isScrolled
                                      ? "text-white hover:text-red-300"
                                      : "text-gray-900 hover:text-red-800"
                          }`}
                          onClick={(e) => {
                            if (hasSubmenu) {
                              e.preventDefault();
                            } else if (isScrollLink(item.href)) {
                              handleNavClick(e, item.id);
                            }
                          }}
                        >
                          <span className="flex items-center gap-1">
                            {item.label}
                            {hasSubmenu && (
                              <ChevronDown
                                className={`h-4 w-4 transition-transform duration-300 ${isSubmenuVisible ? "rotate-180" : ""}`}
                              />
                            )}
                            {item.id === "tech-programs" && (
                              <span className="bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                NEW
                              </span>
                            )}
                          </span>
                        </Link>
                      </motion.div>

                      {/* Submenu for Tech Programs - appears on hover */}
                      {hasSubmenu && (
                        <AnimatePresence>
                          {isSubmenuVisible && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              className="absolute left-0 mt-3 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden"
                            >
                              <ul className="py-2">
                                <li>
                                  <Link
                                    href="/tech-programs/lego-robotics"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200"
                                    onClick={() => setIsMenuOpen(false)}
                                  >
                                    Lego Robotics
                                  </Link>
                                </li>
                                <li>
                                  <Link
                                    href="/tech-programs/3d-design-workshop"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200"
                                    onClick={() => setIsMenuOpen(false)}
                                  >
                                    3D Printing + Design
                                  </Link>
                                </li>
                                <li>
                                  <Link
                                    href="/tech-programs/drone"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200"
                                    onClick={() => setIsMenuOpen(false)}
                                  >
                                    Drone
                                  </Link>
                                </li>
                                <li>
                                  <Link
                                    href="/tech-programs/pictoblox"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200"
                                    onClick={() => setIsMenuOpen(false)}
                                  >
                                    PictoBlox
                                  </Link>
                                </li>
                                <li>
                                  <Link
                                    href="/tech-programs/google-site"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200"
                                    onClick={() => setIsMenuOpen(false)}
                                  >
                                    Google Site
                                  </Link>
                                </li>
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </div>
                  );
                })}
              </nav>

              {/* Search Bar with Suggestions */}
              <motion.button
                onClick={() => {
                  setSearchQuery("");
                  setShowSuggestions(false);
                  setShowSearchPopup(true);
                }}
                className={`p-2 rounded-full ${
                  isHomePage && !isScrolled
                    ? "text-white hover:bg-white/20"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </motion.button>
            </div>
          </div>

          {/* Profile image and menu */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-4">
              {loading ? (
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
              ) : user && userRole ? (
                <div className="relative" ref={profileMenuRef}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 rounded-full p-1 transition-opacity focus:outline-none"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center overflow-hidden ">
                      {profileImage ? (
                        <Image
                          src={profileImage}
                          alt={profileName}
                          width={36}
                          height={36}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.parentElement!.innerHTML =
                              '<svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                          }}
                        />
                      ) : (
                        <UserProfile className="h-4 w-4 text-white" />
                      )}
                    </div>
                  </motion.button>

                  {/* Profile dropdown menu */}
                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-48 md:w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
                      >
                        <div className="p-4 bg-gradient-to-r from-red-700 to-red-800 text-white">
                          <div className="flex items-center gap-3">
                            {profileImage ? (
                              <Image
                                src={profileImage}
                                className="w-10 h-10 rounded-full object-cover border-2 border-white"
                                width={40}
                                height={40}
                                alt="User Profile"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-orange-500 bg-opacity-20 flex items-center justify-center text-white font-bold text-lg">
                                {profileName
                                  ? profileName.charAt(0).toUpperCase()
                                  : userRole.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm truncate">
                                {profileName ||
                                  userRole.charAt(0).toUpperCase() +
                                    userRole.slice(1)}
                              </h3>
                              <p className="text-xs text-white text-opacity-80 truncate">
                                {userRole?.charAt(0).toUpperCase() +
                                  userRole?.slice(1) || "User"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="py-2">
                          <Link
                            href={`/${userRole}-dashboard`}
                            className="flex items-center gap-2 w-full p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            <LayoutDashboard className="h-4 w-4 text-gray-600" />
                            My Dashboard
                          </Link>
                          <Link
                            href="/user-profile"
                            className="flex items-center gap-2 w-full p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            <User className="h-4 w-4 text-gray-600" />
                            My Profile
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm text-left"
                          >
                            <LogOut className="h-4 w-4 text-gray-600" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
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
                        ? "bg-[#F59E0B] hover:bg-[#ab2623] text-white"
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
              ) : user && userRole ? (
                <div className="relative" ref={mobileProfileMenuRef}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 rounded-full p-1  transition-opacity focus:outline-none"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center overflow-hidden ">
                      {profileImage ? (
                        <Image
                          src={profileImage}
                          alt={profileName}
                          width={36}
                          height={36}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.parentElement!.innerHTML =
                              '<svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                          }}
                        />
                      ) : (
                        <UserProfile className="h-4 w-4 text-white" />
                      )}
                    </div>
                  </motion.button>

                  {/* Profile dropdown menu */}
                  <AnimatePresence>
                    {showProfileMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl  z-50 overflow-hidden"
                      >
                        <div className="p-4 bg-gradient-to-r from-red-700 to-red-800 text-white">
                          <div className="flex items-center gap-3">
                            {profileImage ? (
                              <Image
                                src={profileImage}
                                className="w-10 h-10 rounded-full object-cover "
                                width={40}
                                height={40}
                                alt="User Profile"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white font-bold text-sm">
                                {profileName
                                  ? profileName.charAt(0).toUpperCase()
                                  : userRole.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm truncate">
                                {profileName ||
                                  userRole.charAt(0).toUpperCase() +
                                    userRole.slice(1)}
                              </h3>
                              <p className="text-xs text-white text-opacity-80 truncate">
                                {userRole?.charAt(0).toUpperCase() +
                                  userRole?.slice(1) || "User"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="py-2">
                          <Link
                            href={`/${userRole}-dashboard`}
                            className="flex items-center gap-2 w-full p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            <UserProfile className="h-4 w-4 text-gray-600" />
                            My Dashboard
                          </Link>
                          <Link
                            href="/user-profile"
                            className="flex items-center gap-2 w-full p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                            onClick={() => setShowProfileMenu(false)}
                          >
                            <User className="h-4 w-4 text-gray-600" />
                            My Profile
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm text-left"
                          >
                            <LogOut className="h-4 w-4 text-gray-600" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
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

      {/* Search Popup Modal */}
      {showSearchPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            data-search-popup="true"
          >
            <div className="p-4 bg-gradient-to-r from-red-700 to-red-800 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Search Courses</h2>
                <button
                  onClick={() => {
                    setShowSearchPopup(false);
                    setSearchQuery("");
                    setShowSuggestions(false);
                  }}
                  className="p-1 rounded-full hover:bg-white/20"
                  aria-label="Close search"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-4">
              <form
                onSubmit={(e) => {
                  handleSearch(e);
                  setShowSearchPopup(false);
                }}
                className="relative"
              >
                <div className="relative">
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="w-full pl-12 pr-10 py-3 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none text-base"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </form>

              {/* Search Suggestions Dropdown */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="mt-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg shadow-lg">
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={suggestion.slug}
                      onClick={() => {
                        handleSuggestionClick(suggestion);
                        setShowSearchPopup(false);
                      }}
                      className={`search-suggestion-item p-4 hover:bg-red-50 cursor-pointer transition-colors duration-200 ${
                        index < searchSuggestions.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                          <Image
                            src={suggestion.imagePath}
                            alt={suggestion.title}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 line-clamp-1">
                            {suggestion.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {suggestion.description}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                              {suggestion.ageRange}
                            </span>
                            <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                              {suggestion.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
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
    </div>
  );
}
