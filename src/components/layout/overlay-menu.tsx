"use client";

import { Dispatch, SetStateAction } from "react";
import {
  AnimatePresence,
  motion,
  type Variants,
  type Transition,
} from "framer-motion";
import Link from "next/link";
import { X, Shield, HelpCircle, ChevronRight, Users } from "lucide-react";
// Social icons now use images from public/assets/social-icons

import { menuData, type MenuItem } from "./menu-data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";

interface OverlayMenuProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  activeSection?: string;
  scrollToSection?: (sectionId: string) => void;
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
}: {
  items: MenuItem[];
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  depth?: number;
  parentTitle?: string;
  activeSection?: string;
  scrollToSection?: (sectionId: string) => void;
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
    }
  };

  // Separate items with children (accordion) and without (links)
  const accordionItems = items.filter((item) => item.children);
  const linkItems = items.filter((item) => !item.children);

  const isRootLevel = depth === 0;
  const containerSpacingClass = isRootLevel ? "space-y-2" : "space-y-1";
  const triggerPaddingClass = isRootLevel ? "p-4 text-lg" : "p-3 text-base";
  const linkPaddingClass = isRootLevel ? "p-4 text-lg" : "p-2 text-base";
  const iconSizeClass = isRootLevel ? "h-5 w-5" : "h-4 w-4";
  const iconGapClass = isRootLevel ? "gap-4" : "gap-3";
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
              className="border-b-0"
              key={item.title}
            >
              <AccordionTrigger
                className={`flex w-full items-center justify-between rounded-lg ${triggerPaddingClass} transition-colors hover:bg-accent hover:no-underline ${
                  activeSection === item.id ? "bg-red-800 text-white" : ""
                }`}
              >
                <div className={`flex items-center ${iconGapClass}`}>
                  {item.icon && (
                    <item.icon
                      className={`${iconSizeClass} ${
                        activeSection === item.id
                          ? "text-white"
                          : "text-muted-foreground"
                      }`}
                    />
                  )}
                  <span>{item.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-0 pl-8">
                <MenuList
                  items={item.children!}
                  setIsOpen={setIsOpen}
                  depth={depth + 1}
                  parentTitle={item.title}
                  activeSection={activeSection}
                  scrollToSection={scrollToSection}
                />
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

        const isOfflineCourseChild = isOfflineCourseChildrenLevel;
        const linkClass = isOfflineCourseChild
          ? `flex w-auto items-center justify-center rounded-xl my-3 ${linkPaddingClass} ${
              isActive
                ? "bg-[#8a1a19] text-white"
                : "bg-[#b92423] text-white hover:bg-[#a51f1e]"
            }`
          : `flex items-center justify-between rounded-lg ${linkPaddingClass} transition-colors ${
              isActive
                ? "bg-red-800 text-white"
                : "hover:bg-accent text-foreground"
            }`;
        return (
          <motion.div
            key={item.title}
            variants={itemVariants}
            className={isOfflineCourseChild ? undefined : undefined}
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
                        isActive ? "text-white" : "text-muted-foreground"
                      }`}
                    />
                  )}
                  <span>{item.title}</span>
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
}: OverlayMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40 bg-white"
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

          <div className="container mx-auto justify-center flex h-full max-w-4xl flex-col px-4 md:px-6">
            <header className="w-full py-4 border-b border-border/50 border-b-gray-300">
              <div className="flex items-center">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="flex mx-auto"
                >
                  <Image
                    src="/assets/logo.png"
                    alt="Cyborg Robotics Academy"
                    width={200}
                    height={32}
                    className="h-14 w-44"
                  />
                </Link>
              </div>
            </header>
            <main className="flex-1 overflow-y-auto  no-scrollbar flex mt-14 justify-center">
              <div className="grid grid-cols-1 w-screen gap-32 md:grid-cols-2 items-start">
                {/* Left: existing menu */}
                <div className="">
                  <MenuList
                    items={menuData.mainMenu}
                    setIsOpen={setIsOpen}
                    activeSection={activeSection}
                    scrollToSection={scrollToSection}
                  />
                </div>

                {/* Right: privacy/support/social/FAQs */}
                <div className="flex flex-col justify-between self-start space-y-2">
                  {/* Privacy Notice */}
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-xl border border-red-100 shadow-sm hover:shadow-md transition-shadow duration-300">
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
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <HelpCircle className="h-5 w-5 text-red-700" />
                      <h3 className="text-lg font-semibold tracking-wide text-foreground">
                        Frequently Asked Questions
                      </h3>
                    </div>
                    <div className="ml-8 space-y-3">
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
                            5-18 years with specialized programs for different
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
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-red-700" />
                      <h3 className="text-lg font-semibold tracking-wide text-foreground">
                        Connect with us
                      </h3>
                    </div>
                    <div className="flex items-center space-x-4 ml-8">
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
                          href: "https://youtube.com/@cyborgroboticsacademy2270?si=aQjTThVhESGN_bQ9",
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
                          className="p-3 rounded-xl bg-red-50 hover:bg-red-100 transition-all duration-300 transform hover:scale-110 group"
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
