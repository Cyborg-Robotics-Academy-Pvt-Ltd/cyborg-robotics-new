"use client";

import { Dispatch, SetStateAction } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, BookOpen, Heart, Globe } from "lucide-react";
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

// About page navigation items
const aboutNavigationItems = [
  {
    id: "hero",
    label: "About Us",
    icon: Users,
  },
  {
    id: "story",
    label: "Our Story",
    icon: BookOpen,
  },
  {
    id: "founders",
    label: "Meet Our Founders",
    icon: Heart,
  },
  {
    id: "team",
    label: "Our Team",
    icon: Users,
  },
  {
    id: "global-reach",
    label: "Global Reach",
    icon: Globe,
  },
];

// Animation variants for staggered effect
const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      stiffness: 300,
      damping: 24,
    },
  },
};

const MenuList = ({
  items,
  setIsOpen,
  depth = 0,
  parentTitle,
}: {
  items: MenuItem[];
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  depth?: number;
  parentTitle?: string;
}) => {
  const handleItemClick = (item: MenuItem) => {
    if (!item.children) {
      setIsOpen(false);
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
                className={`flex w-full items-center justify-between rounded-lg ${triggerPaddingClass} transition-colors hover:bg-accent hover:no-underline`}
              >
                <div className={`flex items-center ${iconGapClass}`}>
                  {item.icon && (
                    <item.icon
                      className={`${iconSizeClass} text-muted-foreground`}
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
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
      {/* Render link items as usual */}
      {linkItems.map((item) => {
        const isOfflineCourseChild = isOfflineCourseChildrenLevel;
        const linkClass = isOfflineCourseChild
          ? `flex w-auto items-center justify-center rounded-xl my-3 ${linkPaddingClass} bg-[#b92423] text-white hover:bg-[#a51f1e]`
          : `flex items-center justify-between rounded-lg ${linkPaddingClass} transition-colors hover:bg-accent`;
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
                      className={`${iconSizeClass} text-muted-foreground`}
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
  const pathname = usePathname();
  const isAboutPage = pathname === "/about";

  const handleAboutNavClick = (sectionId: string) => {
    // Special handling for About (hero) section - navigate to /about
    if (sectionId === "hero") {
      window.location.href = "/about";
    } else if (scrollToSection) {
      scrollToSection(sectionId);
    }
    setIsOpen(false);
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40 bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="container mx-auto justify-center flex h-full max-w-4xl flex-col px-4 md:px-6">
            <header className="w-full py-4 border-b">
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
              {isAboutPage ? (
                // About page navigation
                <div className="flex flex-col w-full max-w-md space-y-4">
                  <h2 className="text-xl font-semibold text-center mb-4">
                    Navigate Sections
                  </h2>
                  {aboutNavigationItems.map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => handleAboutNavClick(item.id)}
                        className={`flex items-center gap-4 p-4 rounded-lg transition-all duration-200 ${
                          activeSection === item.id
                            ? "bg-[#b92423] text-white shadow-lg"
                            : "bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-600"
                        }`}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.1 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                        {activeSection === item.id && (
                          <motion.div
                            className="ml-auto w-2 h-2 bg-white rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </motion.button>
                    );
                  })}

                  {/* Quick links for About page */}
                  <div className="border-t pt-6 mt-6 space-y-3">
                    <h3 className="text-base font-semibold text-center">
                      Quick Links
                    </h3>
                    <div className="flex flex-col space-y-2">
                      <Link
                        href="/"
                        className="text-center p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        Back to Home
                      </Link>
                      <Link
                        href="/contact-us"
                        className="text-center p-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        Contact Us
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                // Default menu for other pages
                <div className="grid grid-cols-1 w-screen gap-32 md:grid-cols-2 items-start">
                  {/* Left: existing menu */}
                  <div className="">
                    <MenuList items={menuData.mainMenu} setIsOpen={setIsOpen} />
                  </div>

                  {/* Right: privacy/support/social */}
                  <div className="flex flex-col justify-between self-start space-y-8">
                    {/* Privacy Notice */}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      We care about your data. Read our{" "}
                      <Link
                        href="/privacy-policy"
                        className="underline font-medium hover:text-foreground hover:tracking-wide transition"
                        onClick={() => setIsOpen(false)}
                      >
                        Privacy Policy
                      </Link>
                      .
                    </p>

                    {/* Questions Section */}
                    <div className="space-y-3 border-t pt-4">
                      <h3 className="text-base font-semibold tracking-wide">
                        Questions?
                      </h3>
                      <div className="flex flex-col space-y-2">
                        <Link
                          href="/faqs"
                          className="text-sm text-muted-foreground hover:text-foreground hover:underline transition"
                          onClick={() => setIsOpen(false)}
                        >
                          FAQs
                        </Link>
                        <Link
                          href="/contact-us"
                          className="text-sm text-muted-foreground hover:text-foreground hover:underline transition"
                          onClick={() => setIsOpen(false)}
                        >
                          Contact Us
                        </Link>
                      </div>
                    </div>

                    {/* Social Media Section */}
                    <div className="space-y-3 border-t pt-4">
                      <h3 className="text-base font-semibold tracking-wide">
                        Connect with us
                      </h3>
                      <div className="flex items-center gap-4">
                        {[
                          {
                            href: "https://www.instagram.com/cyborgroboticsacademy?igsh=dmppcHR2NWh1MDJ5",
                            src: "/assets/social-icons/instagram.webp",
                            alt: "Instagram",
                          },
                          {
                            href: "https://www.facebook.com/cyborgrobotics/",
                            src: "/assets/social-icons/facebook.webp",
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
                            className="p-2 rounded-xl bg-muted hover:bg-foreground transition transform hover:scale-110"
                          >
                            <Image
                              src={src}
                              alt={alt}
                              width={32}
                              height={32}
                              className="h-8 w-8 rounded-xl object-contain"
                            />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </main>

            {/* Footer CTAs on mobile menu
            <footer className="flex flex-col gap-3 py-4 border-t mt-auto">
              <div className="flex gap-3">
                <Link href="/login" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link href="/enquire" className="flex-1">
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    Enquire Now
                  </Button>
                </Link>
              </div>
            </footer> */}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
