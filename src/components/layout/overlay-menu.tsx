"use client";

import {
  Dispatch,
  SetStateAction,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  AnimatePresence,
  motion,
  type Variants,
  type Transition,
} from "framer-motion";
import Link from "next/link";
import {
  X,
  Shield,
  HelpCircle,
  ChevronRight,
  Users,
  LogOut,
  Search,
} from "lucide-react";
// Social icons now use images from public/assets/social-icons

import { menuData, type MenuItem } from "./menu-data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { enhancedCourseData } from "@/data/enhancedCourseData";

interface OverlayMenuProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  activeSection?: string;
  scrollToSection?: (sectionId: string) => void;
  menuData?: { mainMenu: MenuItem[] }; // Added optional menuData prop
}

// Animation variants for staggered effect
const listVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
    } as Transition,
  },
};

// New animation variants for the overlay sliding down from top
const overlayVariants: Variants = {
  hidden: {
    y: "-50%", // Start above the viewport
    opacity: 0,
  },
  visible: {
    y: 0, // End at the top of the viewport
    opacity: 1,
    transition: {
      type: "spring" as const,
      damping: 25,
      stiffness: 300,
    } as Transition,
  },
  exit: {
    y: "-50%", // Exit above the viewport
    opacity: 0,
    transition: {
      duration: 0.2,
    } as Transition,
  },
};

const MenuList = ({
  items,
  setIsOpen,
  depth = 0,
  parentTitle,
  activeSection,
  scrollToSection,
  router,
}: {
  items: MenuItem[];
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  depth?: number;
  parentTitle?: string;
  activeSection?: string;
  scrollToSection?: (sectionId: string) => void;
  router: ReturnType<typeof useRouter>;
}) => {
  const handleItemClick = (item: MenuItem) => {
    if (!item.children) {
      setIsOpen(false);
      // If we have a scrollToSection function and the item has an href that starts with #
      if (scrollToSection && item.href && item.href.startsWith("#")) {
        const sectionId = item.href.substring(1); // Remove the # prefix
        scrollToSection(sectionId);
      }
      // Also check if the item has an id for direct section matching
      else if (scrollToSection && item.id) {
        scrollToSection(item.id);
      }
      // Handle navigation to gallery with tab parameter
      else if (item.href && item.href.includes("/gallery/behind-scene")) {
        // Extract tab from URL if present
        const url = new URL(item.href, window.location.origin);
        const tab = url.searchParams.get("tab");
        if (tab) {
          // Navigate to the gallery page with the tab parameter using Next.js router
          router.push(`/gallery/behind-scene?tab=${tab}`);
        } else {
          // Navigate to the gallery page with default tab
          router.push(`/gallery/behind-scene?tab=certificates`);
        }
      }
    }
  };

  // Separate items with children (accordion) and without (links)
  const accordionItems = items.filter((item) => item.children);
  const linkItems = items.filter((item) => !item.children);

  const isRootLevel = depth === 0;
  const containerSpacingClass = isRootLevel ? "space-y-2" : "space-y-1";
  const triggerPaddingClass = isRootLevel ? "p-3 text-lg" : "p-2 text-base";
  const linkPaddingClass = isRootLevel ? "p-3 text-lg" : "p-2 text-base";
  const iconSizeClass = isRootLevel ? "h-5 w-5" : "h-4 w-4";
  const iconGapClass = isRootLevel ? "gap-3" : "gap-2";
  const isOfflineCourseChildrenLevel =
    parentTitle === "Offline Course" && depth >= 1;
  const containerClass = isOfflineCourseChildrenLevel
    ? "flex flex-row gap-2 "
    : `flex flex-col ${containerSpacingClass}`;

  return (
    <motion.div
      className={containerClass}
      variants={listVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      {/* Render all accordion items inside a single Accordion */}
      {accordionItems.length > 0 && (
        <Accordion type="single" collapsible>
          {accordionItems.map((item) => (
            <AccordionItem
              value={item.title}
              className="border border-gray-200 rounded-3xl overflow-hidden  mb-1 shadow-sm hover:shadow-md transition-all duration-300"
              key={item.title}
            >
              <AccordionTrigger
                className={`flex w-full items-center justify-between bg-white  ${triggerPaddingClass} transition-all duration-300 hover:bg-gray-50 hover:no-underline ${
                  activeSection === item.id ? "bg-red-800 text-white" : ""
                }`}
              >
                <div className={`flex items-center ${iconGapClass}`}>
                  {item.icon && (
                    <item.icon
                      className={`${iconSizeClass} ${
                        activeSection === item.id
                          ? "text-white"
                          : "text-red-700"
                      }`}
                    />
                  )}
                  <span className="font-semibold">{item.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-1 pl-4 pr-3 pt-2 bg-gray-50 rounded-b-xl">
                <div className="pb-0">
                  <MenuList
                    items={item.children!}
                    setIsOpen={setIsOpen}
                    depth={depth + 1}
                    parentTitle={item.title}
                    activeSection={activeSection}
                    scrollToSection={scrollToSection}
                    router={router}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
      {/* Render link items as usual */}
      {linkItems.map((item) => {
        // Check if this item should be considered active
        const isActive =
          // Direct match with activeSection
          activeSection === item.id ||
          // Match based on href fragment
          (activeSection &&
            item.href &&
            item.href.includes(`#${activeSection}`)) ||
          // Special case for homepage sections
          (activeSection === "hero" && item.href === "/about-us") ||
          // Match based on current pathname for top-level pages
          (typeof window !== "undefined" &&
            item.href &&
            window.location.pathname === item.href) ||
          // Special handling for blog pages
          (typeof window !== "undefined" &&
            window.location.pathname.startsWith("/blogs") &&
            item.href === "/blogs");

        // Check if this is the latest competition item
        const isLatestCompetition = item.id === "latest-competition";

        const isOfflineCourseChild = isOfflineCourseChildrenLevel;
        const linkClass = isOfflineCourseChild
          ? `flex w-auto items-center  justify-center rounded-lg my-1 ${linkPaddingClass} font-semibold transition-all duration-300 ${
              isActive
                ? "bg-[#8a1a19] text-white shadow-md"
                : "bg-[#b92423] text-white hover:bg-[#a51f1e] shadow-sm hover:shadow-md"
            }`
          : `flex items-center justify-between  rounded-lg ${linkPaddingClass} transition-all duration-300 ${
              isActive
                ? "bg-red-800 text-white shadow-md"
                : "bg-white  text-foreground hover:bg-gray-100 shadow-sm hover:shadow-md"
            }`;
        return (
          <motion.div
            key={item.title}
            variants={itemVariants}
            className={isOfflineCourseChild ? undefined : ""}
          >
            <Link
              href={item.href || "#"}
              onClick={() => handleItemClick(item)}
              className={linkClass}
            >
              {isOfflineCourseChild ? (
                <span>{item.title}</span>
              ) : (
                <div className={`flex items-center ${iconGapClass}`}>
                  {item.icon && (
                    <item.icon
                      className={`${iconSizeClass} ${
                        isActive ? "text-white" : "text-red-700"
                      }`}
                    />
                  )}
                  <span className="font-semibold">{item.title}</span>
                  {isLatestCompetition && (
                    <span className="ml-2 px-2 py-1 text-xs font-bold bg-yellow-400 text-yellow-900 rounded-full">
                      NEW
                    </span>
                  )}
                </div>
              )}
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default function OverlayMenu({
  isOpen,
  setIsOpen,
  activeSection,
  scrollToSection,
  menuData: customMenuData,
}: OverlayMenuProps) {
  const { user, userRole } = useAuth();
  const router = useRouter();

  // Search functionality states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<
    Array<{ title: string; slug: string }>
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Use custom menu data if provided, otherwise use default
  const menuItems = customMenuData?.mainMenu || menuData.mainMenu;

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      setIsOpen(false);
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
    setIsOpen(false);

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

  const handleSignOut = useCallback(async () => {
    try {
      await signOut(auth);
      setIsOpen(false);
      router.push("/");
      localStorage.removeItem("userRole");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [router, setIsOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-white"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-1 z-50 p-2 rounded-full bg-red-800  transition-colors"
            aria-label="Close menu"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          <div className="container mx-auto justify-center flex h-full max-w-6xl flex-col px-4 md:px-6">
            <header className="w-full py-4 border-b border-transparent">
              <div className="flex items-center">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="flex mx-auto"
                >
                  <Image
                    src="/assets/Cyborg-logo.png"
                    alt="Cyborg Robotics Academy"
                    width={200}
                    height={32}
                    className="h-14 w-44"
                  />
                </Link>
              </div>

              {/* Search Bar with Suggestions - Only visible on mobile/small screens */}
              <div className="mt-4 relative max-w-md mx-auto lg:hidden">
                <form onSubmit={handleSearch} className="relative">
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
                    className="w-full pl-9 pr-3 py-2 rounded-2xl focus:ring-2 focus:ring-red-500 transition-all text-sm bg-white text-gray-900 placeholder:text-gray-500 border border-gray-300"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
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
                        className={`search-suggestion-item px-3 py-2 text-sm hover:bg-red-50 hover:text-red-700 cursor-pointer transition-colors duration-200 ${
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
            </header>

            <main className="flex-1 overflow-y-auto no-scrollbar flex mt-6 justify-center">
              <div className="grid grid-cols-1 w-screen gap-16 md:grid-cols-2 items-start">
                {/* Left: existing menu - ENHANCED UI */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-2xl shadow-lg border border-gray-200 w-full max-w-2xl">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      Navigation
                    </h2>
                    <div className="w-12 h-1 bg-red-700 rounded-full"></div>
                  </div>

                  <MenuList
                    items={menuItems}
                    setIsOpen={setIsOpen}
                    activeSection={activeSection}
                    scrollToSection={scrollToSection}
                    router={router}
                  />
                  {/* Authentication Section */}
                  {user && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center justify-center w-full rounded-xl py-2 px-3 text-base font-medium transition-all duration-300 bg-gradient-to-r from-red-700 to-red-800 text-white hover:from-red-800 hover:to-red-900 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      >
                        <LogOut className="h-5 w-5 mr-2" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Right: privacy/support/social/FAQs */}
                <div className="flex flex-col justify-between self-start space-y-3 max-w-xl">
                  {/* Privacy Notice */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 p-3 rounded-xl border border-red-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-start space-x-2">
                      <div className="mt-1 p-1.5 bg-red-100 rounded-lg">
                        <Shield className="h-4 w-4 text-red-800" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-foreground mb-1">
                          Privacy Notice
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          We care about your data. Read our{" "}
                          <Link
                            href="/privacy-policy"
                            className="underline font-medium text-red-700 hover:text-red-900 hover:tracking-wide transition"
                            onClick={() => setIsOpen(false)}
                          >
                            Privacy Policy
                          </Link>{" "}
                          to learn how we protect your information.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* FAQ Section */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <HelpCircle className="h-5 w-5 text-red-700" />
                      <h3 className="text-lg font-semibold tracking-wide text-foreground">
                        Frequently Asked Questions
                      </h3>
                    </div>
                    <div className="ml-6 space-y-2">
                      <Accordion
                        type="single"
                        collapsible
                        className="w-full space-y-2"
                      >
                        <AccordionItem
                          value="item-1"
                          className="border border-gray-200 rounded-lg px-3 hover:border-[#8D0F11] transition-colors"
                        >
                          <AccordionTrigger className="py-2 text-left text-sm font-medium text-gray-800 hover:no-underline">
                            What age groups do you cater to?
                          </AccordionTrigger>
                          <AccordionContent className="pb-2 text-sm text-gray-600">
                            Our robotics courses are designed for children aged
                            4-25 years with specialized programs for different
                            age groups.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem
                          value="item-2"
                          className="border border-gray-200 rounded-lg px-3 hover:border-[#8D0F11] transition-colors"
                        >
                          <AccordionTrigger className="py-2 text-left text-sm font-medium text-gray-800 hover:no-underline">
                            Do you offer online classes?
                          </AccordionTrigger>
                          <AccordionContent className="pb-2 text-sm text-gray-600">
                            Yes, we offer both online and offline classes to
                            accommodate different preferences and needs.
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem
                          value="item-3"
                          className="border border-gray-200 rounded-lg px-3 hover:border-[#8D0F11] transition-colors"
                        >
                          <AccordionTrigger className="py-2 text-left text-sm font-medium text-gray-800 hover:no-underline">
                            What certifications do you provide?
                          </AccordionTrigger>
                          <AccordionContent className="pb-2 text-sm text-gray-600">
                            Students receive internationally recognized
                            certification from our partners and our own Cyborg
                            Robotics Academy certificates.
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                      <Link
                        href="/faqs"
                        className="inline-flex items-center text-sm text-red-700 hover:text-red-900 hover:underline transition"
                        onClick={() => setIsOpen(false)}
                      >
                        View all FAQs
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  </div>

                  {/* Social Media Section */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-red-700" />
                      <h3 className="text-lg font-semibold tracking-wide text-foreground">
                        Connect with us
                      </h3>
                    </div>
                    <div className="flex items-center space-x-3 ml-6">
                      {[
                        {
                          href: "https://www.linkedin.com/company/cyborg-robotics-academy-pvt-ltd/",
                          src: "/assets/social-icons/Linkedin.png",
                          alt: "LinkedIn",
                        },
                        {
                          href: "https://www.instagram.com/cyborgroboticsacademy?igsh=dmppcHR2NWh1MDJ5",
                          src: "/assets/social-icons/instagram.webp",
                          alt: "Instagram",
                        },
                        {
                          href: "https://www.facebook.com/cyborgrobotics/",
                          src: "/assets/social-icons/Facebook.webp",
                          alt: "Facebook",
                        },
                        {
                          href: "https://youtube.com/@cyborgroboticsacademy?si=Pf503uam_Awlea8Q",
                          src: "/assets/social-icons/youtube.png",
                          alt: "YouTube",
                        },
                      ].map(({ href, src, alt }, i) => (
                        <Link
                          key={i}
                          href={href}
                          aria-label={alt}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-red-50 hover:bg-red-100 transition-all duration-300 transform hover:scale-110 group"
                          onClick={() => setIsOpen(false)}
                        >
                          <Image
                            src={src}
                            alt={alt}
                            width={32}
                            height={32}
                            className="h-8 w-8 rounded-xl object-contain group-hover:opacity-90"
                          />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
