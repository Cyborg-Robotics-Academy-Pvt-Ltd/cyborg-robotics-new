"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Search,
  User,
  User as UserProfile,
  X,
} from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

import OverlayMenu from "./overlay-menu";
import HamburgerButton from "./hamburger-button";
import { Button } from "../ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { auth, db } from "@/lib/firebase";
import { enhancedCourseData } from "@/data/enhancedCourseData";

type SearchSuggestion = {
  title: string;
  slug: string;
  description: string;
  ageRange: string;
  category: string;
  imagePath: string;
};

type NavItem = {
  id: string;
  label: string;
  href: string;
  badge?: string;
};

const navItems: NavItem[] = [
  { id: "codefest", label: "Codefest", href: "/codefest", badge: "New" },
  // {
  //   id: "tech-programs",
  //   label: "Tech Programs",
  //   href: "/tech-programs",
  //   badge: "New",
  // },
  {
    id: "robotics-diploma",
    label: "Robotics Diploma",
    href: "/robotics-diploma",
  },
  { id: "courses", label: "Courses", href: "/all-courses" },
  { id: "gallery", label: "Photo Hub", href: "/gallery/behind-scene" },
];

const techProgramsItems = [
  { label: "Lego Robotics", href: "/tech-programs/lego-robotics" },
  { label: "3D Printing + Design", href: "/tech-programs/3d-design-workshop" },
  { label: "Drone", href: "/tech-programs/drone" },
  { label: "PictoBlox", href: "/tech-programs/pictoblox" },
  { label: "Google Site", href: "/tech-programs/google-site" },
] as const;

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [activeSection, setActiveSection] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [openDesktopSubmenu, setOpenDesktopSubmenu] = useState<string | null>(
    null,
  );
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("Account");

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchPopupRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const mobileProfileMenuRef = useRef<HTMLDivElement>(null);
  const lastScrollYRef = useRef(0);
  const router = useRouter();
  const pathname = usePathname();
  const isAboutPage = pathname === "/about-us";
  const isHomePage = pathname === "/";
  const { user, userRole, loading } = useAuth();

  const isTransparentMode = isHomePage && !isScrolled;
  const searchSuggestions = useMemo<SearchSuggestion[]>(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    return Object.entries(enhancedCourseData)
      .map(([slug, course]) => ({
        slug,
        title: course.title,
        description: course.description,
        ageRange: course.ageRange,
        category: course.category,
        imagePath: course.imagePath,
      }))
      .filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .slice(0, 5);
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const lastScrollY = lastScrollYRef.current;

      setIsScrolled(isHomePage ? currentScrollY > 24 : true);

      if (currentScrollY <= 24) {
        setIsHeaderVisible(true);
      } else {
        setIsHeaderVisible(currentScrollY < lastScrollY);
      }

      lastScrollYRef.current = currentScrollY;
    };

    lastScrollYRef.current = window.scrollY;

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage, pathname]);

  useEffect(() => {
    if (!isHomePage) {
      return;
    }

    const sections = [
      "why-learn-robotics",
      "what-we-offer",
      "vision-mission",
      "gallery",
    ];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      let currentSection = "";

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (!element) {
          continue;
        }

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

      setActiveSection(currentSection);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  useEffect(() => {
    if (!isAboutPage) {
      return;
    }

    const sections = ["hero", "story", "founders", "team", "awards"];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      let currentSection = "";

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (!element) {
          continue;
        }

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

      setActiveSection(currentSection);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isAboutPage]);

  useEffect(() => {
    setIsMenuOpen(false);
    setShowProfileMenu(false);
    setOpenDesktopSubmenu(null);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedOutsideDesktopMenu =
        !profileMenuRef.current || !profileMenuRef.current.contains(target);
      const clickedOutsideMobileMenu =
        !mobileProfileMenuRef.current ||
        !mobileProfileMenuRef.current.contains(target);

      if (clickedOutsideDesktopMenu && clickedOutsideMobileMenu) {
        setShowProfileMenu(false);
      }

      if (searchPopupRef.current && !searchPopupRef.current.contains(target)) {
        setShowSearchPopup(false);
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!showSearchPopup) {
      return;
    }

    const timer = window.setTimeout(() => searchInputRef.current?.focus(), 20);
    return () => window.clearTimeout(timer);
  }, [showSearchPopup]);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user || !userRole) {
        setProfileImage(null);
        setProfileName("Account");
        return;
      }

      try {
        const collectionName =
          userRole === "admin"
            ? "admins"
            : userRole === "trainer"
              ? "trainers"
              : "students";

        const userDocRef = doc(db, collectionName, user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          return;
        }

        const data = userDoc.data();
        const profileImg =
          data.profileimage || data.imageUrls?.[0] || data.imageUrl || null;

        const resolvedName =
          (typeof data.username === "string" && data.username.trim()) ||
          (typeof data.name === "string" && data.name.trim()) ||
          user.displayName ||
          user.email?.split("@")[0] ||
          "Account";

        setProfileImage(profileImg);
        setProfileName(resolvedName);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, [user, userRole]);

  const closeSearchPopup = () => {
    setShowSearchPopup(false);
    setShowSuggestions(false);
    setSearchQuery("");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      return;
    }

    setShowSuggestions(false);
    setShowSearchPopup(false);
    router.push(
      `/all-courses?search=${encodeURIComponent(searchQuery.trim())}`,
    );
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.title);
    setShowSuggestions(false);
    setShowSearchPopup(false);
    router.push(`/all-courses/${suggestion.slug}`);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("userRole");
      setShowProfileMenu(false);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (!element) {
      setIsMenuOpen(false);
      return;
    }

    const viewportHeight = window.innerHeight;
    const headerHeight = 88;
    const elementRect = element.getBoundingClientRect();
    const elementTop = elementRect.top + window.pageYOffset;

    let targetPosition = elementTop - headerHeight;

    if (elementRect.height < viewportHeight - headerHeight) {
      const availableSpace = viewportHeight - headerHeight;
      const centerOffset = (availableSpace - elementRect.height) / 2;
      targetPosition = elementTop - headerHeight - centerOffset;
    }

    const maxScroll = document.documentElement.scrollHeight - viewportHeight;
    targetPosition = Math.max(0, Math.min(targetPosition, maxScroll));

    requestAnimationFrame(() => {
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    });

    if (history.pushState && sectionId !== "hero") {
      history.pushState(null, "", `#${sectionId}`);
    } else if (history.pushState) {
      history.pushState(null, "", "/about-us");
    }

    setIsMenuOpen(false);
  };

  const isNavItemActive = (href: string, id: string) => {
    if (pathname === href || pathname.startsWith(`${href}/`)) {
      return true;
    }

    if (isAboutPage && href === "/about-us" && activeSection) {
      return true;
    }

    return activeSection === id;
  };

  const renderAuthMenu = (isMobile = false) => {
    if (loading) {
      return (
        <div className="h-9 w-24 animate-pulse rounded-full bg-gray-200" />
      );
    }

    if (!user || !userRole) {
      return (
        <Link href="/login">
          <Button
            size="sm"
            className={`h-10 rounded-full border px-4 text-sm font-semibold shadow-sm transition-all duration-300 focus-visible:ring-2 focus-visible:ring-red-500 ${
              isTransparentMode
                ? "border-white/35 bg-white/10 text-white hover:bg-white hover:text-[#8f1518]"
                : "border-red-100 bg-white text-[#1a1a1a] hover:border-red-200 hover:bg-red-50"
            }`}
          >
            Log In
          </Button>
        </Link>
      );
    }

    const menuRef = isMobile ? mobileProfileMenuRef : profileMenuRef;
    const shortProfileLabel = profileName.split(" ")[0] || profileName;

    return (
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setShowProfileMenu((current) => !current)}
          className={`group flex h-10 items-center gap-2 rounded-full border px-1.5 pr-3 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
            isTransparentMode
              ? "border-white/20 bg-white/12 text-white hover:bg-white/18"
              : "border-black/5 bg-white/85 text-[#1a1a1a] shadow-[0_8px_24px_rgba(15,23,42,0.08)] hover:border-red-100"
          }`}
          aria-label="Open account menu"
          aria-expanded={showProfileMenu}
          title={profileName}
        >
          <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-red-600 via-red-700 to-orange-500 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
            {profileImage ? (
              <Image
                src={profileImage}
                alt={profileName}
                width={28}
                height={28}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs font-semibold">
                {profileName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          {!isMobile && (
            <span className="max-w-20 text-xs font-semibold">
              {shortProfileLabel}
            </span>
          )}
        </button>

        <AnimatePresence>
          {showProfileMenu && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute right-0 z-50 mt-3 w-56 overflow-hidden rounded-3xl border border-red-100 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.14)]"
            >
              <div className="border-b border-red-50 bg-[linear-gradient(135deg,#991b1b,#dc2626,#f97316)] p-4 text-white">
                <p className="truncate text-sm font-semibold">{profileName}</p>
                <p className="mt-1 text-xs text-white/80">
                  {(userRole?.charAt(0).toUpperCase() || "U") +
                    (userRole?.slice(1) || "ser")}
                </p>
              </div>
              <div className="p-2">
                <Link
                  href={`/${userRole}-dashboard`}
                  className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-[#1a1a1a] transition hover:bg-red-50"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <LayoutDashboard className="h-4 w-4 text-red-700" />
                  My Dashboard
                </Link>
                <Link
                  href="/user-profile"
                  className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-[#1a1a1a] transition hover:bg-red-50"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <User className="h-4 w-4 text-red-700" />
                  My Profile
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-[#1a1a1a] transition hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 text-red-700" />
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div>
      <motion.header
        initial={{ y: -96, opacity: 0 }}
        animate={{
          y: isHeaderVisible ? 0 : -140,
          opacity: isHeaderVisible ? 1 : 0,
        }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 lg:px-6"
      >
        <motion.div
          animate={{
            scale: isScrolled ? 0.992 : 1,
            y: isScrolled ? -1 : 0,
          }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className={`mx-auto flex max-w-[1440px] items-center justify-between rounded-[26px] pl-5 pr-4 sm:pl-6 sm:pr-5 lg:pl-7 lg:pr-6 ${
            isTransparentMode
              ? "bg-black/80 text-white shadow-md backdrop-blur-xl"
              : isScrolled
                ? "bg-white/95 text-[#1a1a1a] shadow-[0_14px_34px_rgba(15,23,42,0.08)] backdrop-blur-md"
                : "bg-white text-[#1a1a1a] shadow-[0_10px_26px_rgba(15,23,42,0.05)]"
          } ${isScrolled ? "py-1.5" : "py-2"}`}
        >
          <Link
            href="/"
            className="flex items-center"
            aria-label="Cyborg Robotics Academy home"
          >
            <Image
              src="/assets/Cyborg-logo.png"
              alt="Cyborg Robotics Academy"
              width={156}
              height={52}
              className={`w-auto transition-all duration-300 ${
                isScrolled ? "h-8 sm:h-9" : "h-9 sm:h-10"
              }`}
              priority
            />
          </Link>

          <div className="hidden flex-1 items-center justify-center xl:flex">
            <nav className="flex items-center gap-9 2xl:gap-10 ">
              {navItems.map((item) => {
                const hasSubmenu = item.id === "tech-programs";
                const isActive = isNavItemActive(item.href, item.id);
                const isOpen = openDesktopSubmenu === item.id;

                return (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() =>
                      hasSubmenu && setOpenDesktopSubmenu(item.id)
                    }
                    onMouseLeave={() =>
                      hasSubmenu && setOpenDesktopSubmenu(null)
                    }
                  >
                    <Link
                      href={hasSubmenu ? item.href : item.href}
                      className={`group relative flex items-center gap-1.5 rounded-full px-1 py-1.5 text-[0.88rem] 2xl:text-[0.93rem] font-medium transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                        isTransparentMode
                          ? "text-white/88 hover:text-white"
                          : "text-[#1a1a1a] hover:text-red-800"
                      } ${isActive ? "bg-red-50/80 font-semibold text-red-800" : ""}`}
                    >
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="rounded-full bg-gradient-to-r from-[#ff7a18] via-[#ff5b1f] to-[#ff3131] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white shadow-sm">
                          {item.badge}
                        </span>
                      )}
                      {hasSubmenu && (
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-200 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      )}
                      <span
                        className={`absolute inset-x-1 -bottom-1 h-[2px] origin-left rounded-full bg-gradient-to-r from-red-700 to-orange-500 transition-transform duration-300 ${
                          isActive
                            ? "scale-x-100"
                            : "scale-x-0 group-hover:scale-x-100"
                        }`}
                      />
                    </Link>

                    <AnimatePresence>
                      {hasSubmenu && isOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.98 }}
                          transition={{
                            duration: 0.24,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="absolute left-0 top-full z-50 mt-4 w-64 overflow-hidden rounded-3xl border border-black/5 bg-white/96 p-2 text-[#1a1a1a] shadow-[0_18px_40px_rgba(15,23,42,0.10)] backdrop-blur-xl"
                        >
                          {techProgramsItems.map((program) => (
                            <Link
                              key={program.href}
                              href={program.href}
                              className="flex items-center rounded-2xl px-3 py-2.5 text-sm font-medium transition duration-200 hover:bg-red-50/70 hover:text-red-700"
                              onClick={() => setOpenDesktopSubmenu(null)}
                            >
                              {program.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 lg:flex">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setShowSuggestions(false);
                  setShowSearchPopup(true);
                }}
                className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                  isTransparentMode
                    ? "border-white/20 bg-white/10 text-white hover:bg-white/16"
                    : "border-red-100/70 bg-white/78 text-[#1a1a1a] shadow-[0_4px_14px_rgba(15,23,42,0.04)] hover:border-red-100 hover:bg-red-50/70"
                }`}
                aria-label="Open course search"
              >
                <Search className="h-4 w-4" />
              </button>

              {renderAuthMenu()}

              <Link href="https://wa.me/917028511161?text=Hello%20Cyborg,%20I%20am%20looking%20for%20some%20help!%20(Enquiry)">
                <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.99 }}>
                  <Button className="h-10 rounded-full border border-white/20 bg-gradient-to-r from-[#ff7a18] via-[#ff5b1f] to-[#ff3131] px-4 xl:px-5 text-xs xl:text-sm font-semibold text-white shadow-[0_10px_20px_rgba(239,68,68,0.18),inset_0_1px_0_rgba(255,255,255,0.22)] transition-all duration-300 hover:shadow-[0_14px_24px_rgba(239,68,68,0.22),inset_0_1px_0_rgba(255,255,255,0.26)]">
                    <span className="flex items-center gap-1.5">
                      <span className="xl:hidden">Free Trial</span>
                      <span className="hidden xl:inline">
                        Book Your Free Trial
                      </span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </Button>
                </motion.div>
              </Link>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              {renderAuthMenu(true)}
              <div
                className={`rounded-2xl border p-0.5 shadow-sm transition-all duration-300 ${
                  isTransparentMode
                    ? "border-white/20 bg-white/10 text-white"
                    : "border-red-100/70 bg-white/82 text-red-800 shadow-[0_5px_14px_rgba(15,23,42,0.05)]"
                }`}
              >
                <HamburgerButton
                  isOpen={isMenuOpen}
                  onClick={() => setIsMenuOpen((current) => !current)}
                />
              </div>
            </div>

            <div className="hidden lg:block">
              <div
                className={`rounded-[10px] border p-0.5 shadow-sm transition-all duration-300 ${
                  isTransparentMode
                    ? "border-red-700 border-1 bg-red-800/20 text-white"
                    : "border-red-100/70 bg-white/82 text-red-800 shadow-[0_5px_14px_rgba(15,23,42,0.05)]"
                }`}
              >
                <HamburgerButton
                  isOpen={isMenuOpen}
                  onClick={() => setIsMenuOpen((current) => !current)}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.header>

      <OverlayMenu
        isOpen={isMenuOpen}
        setIsOpen={setIsMenuOpen}
        scrollToSection={scrollToSection}
        activeSection={activeSection}
      />

      <AnimatePresence>
        {showSearchPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/25 p-4 backdrop-blur-sm"
          >
            <motion.div
              ref={searchPopupRef}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-2xl overflow-hidden rounded-[32px] border border-black/5 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.14)]"
              data-search-popup="true"
            >
              <div className="bg-[linear-gradient(135deg,#fff8f5,#ffffff)] px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-[#1a1a1a]">
                      Search Courses
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Find programs, tools, and age-specific learning tracks.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeSearchPopup}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-red-100 text-gray-500 transition hover:bg-red-50 hover:text-red-700"
                    aria-label="Close search"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              <div className="p-5">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search robotics, coding, design, drones..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    className="h-14 rounded-2xl border-red-100 pl-12 pr-12 text-base text-[#1a1a1a] shadow-none placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-red-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-red-700"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </form>

                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="mt-3 overflow-hidden rounded-3xl border border-red-100">
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={suggestion.slug}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`search-suggestion-item flex w-full gap-3 bg-white p-4 text-left transition hover:bg-red-50 ${
                          index < searchSuggestions.length - 1
                            ? "border-b border-red-50"
                            : ""
                        }`}
                      >
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl">
                          <Image
                            src={suggestion.imagePath}
                            alt={suggestion.title}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="line-clamp-1 text-sm font-semibold text-[#1a1a1a]">
                            {suggestion.title}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                            {suggestion.description}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                              {suggestion.ageRange}
                            </span>
                            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                              {suggestion.category}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
