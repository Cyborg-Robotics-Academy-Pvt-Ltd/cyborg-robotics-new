"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ChevronUp, ChevronDown, AlignRight, X } from "lucide-react";
import { User } from "firebase/auth";
import styles from "./NavbarMenu.module.css";
import { MenuItem } from "./ui/navbar-menu";

// Define types for menu items
interface SubItem {
  href: string;
  label: string;
}

interface MenuItem {
  href?: string;
  label: string;
  subItems?: SubItem[];
}

interface NavbarMenuProps {
  user: User | null;
  userRole: string | null;
  handleSignOut: () => Promise<void>;
  menuItems: Array<{
    href?: string;
    label: string;
    subItems?: Array<{ href: string; label: string }>;
  }>;
}

const NavbarMenu: React.FC<NavbarMenuProps> = ({
  user,
  userRole,
  handleSignOut,
  menuItems,
}) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Effect to handle body overflow
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  // Handler for menu toggle
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="relative block md:block lg:hidden">
      <div
        className={
          `fixed top-0 left-0 z-50 w-screen items-center h-16 py-1 flex justify-between px-4 transition-all duration-300 shadow-xl ` +
          (isScrolled
            ? "bg-white/40 backdrop-blur-xl border-b border-white/30"
            : "bg-white/30 backdrop-blur-md border-b border-white/10")
        }
        style={{ height: "60px" }}
      >
        <div className="flex items-center">
          <button
            onClick={toggleMenu}
            className="focus:outline-none focus:ring-2 focus:ring-red-800 focus:ring-opacity-50 rounded-md"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <AlignRight size={28} />
          </button>
          <Link href={"/"}>
            <Image
              alt="Company Logo"
              src={"/assets/logo.png"}
              height={110}
              width={110}
              className="p-1"
              priority={true}
            />
          </Link>
        </div>

        {user && userRole ? (
          <Link
            href={`/${userRole}-dashboard`}
            className="bg-red-800 px-3 py-1 rounded-full text-white"
          >
            <button aria-label="Dashboard">Dashboard</button>
          </Link>
        ) : (
          <Link
            href="/login"
            className="bg-red-800 px-4 py-2 rounded-full"
            title="Log In"
          >
            <button className="text-white">Log In</button>
          </Link>
        )}
      </div>

      {/* Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40"
            style={{
              background: "rgba(30, 30, 40, 0.35)",
              backdropFilter: "blur(12px) brightness(1.08)",
              WebkitBackdropFilter: "blur(12px) brightness(1.08)",
              border: "1px solid rgba(255,255,255,0.18)",
            }}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            style={{
              borderTopRightRadius: 18,
              borderBottomRightRadius: 18,
              background: "rgba(255,255,255,0.22)",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.25)",
              backdropFilter: "blur(18px) saturate(1.2)",
              WebkitBackdropFilter: "blur(18px) saturate(1.2)",
              border: "1px solid rgba(255,255,255,0.18)",
            }}
            className="fixed top-0 left-0 w-72 h-screen z-50 overflow-y-scroll p-2 hide-scrollbar"
            role="navigation"
            aria-label="Main Navigation"
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
          >
            <Link href={"/"} className="">
              <Image
                src={"/assets/logo.png"}
                width={130}
                height={130}
                alt="Company Logo"
                loading="eager"
                quality={75}
                className="mx-auto p-1 mt-5 drop-shadow-lg"
              />
            </Link>
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute right-2 top-2 bg-white shadow-xl p-1 rounded-full shadow-gray-300 hover:bg-red-100 active:scale-95 transition-all"
              aria-label="Close menu"
            >
              <X size={28} />
            </button>

            {/* Regular menu items with optimized animations */}
            {menuItems.map((item: MenuItem, idx) => (
              <motion.div
                key={item.label}
                className={`mx-3 my-1 rounded-xl ${styles.menuItem} ${styles.menuItemAnimated} group`}
                style={{
                  animationDelay: `${0.05 + idx * 0.03}s`,
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
              >
                {item.href ? (
                  <Link
                    href={item.href}
                    className="block p-2 text-black font-semibold rounded-lg transition-all duration-150 hover:bg-red-50 active:bg-red-100 hover:pl-4"
                    onClick={() => setMenuOpen(false)}
                    aria-label={`Navigate to ${item.label}`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <div className="block p-2 text-black">
                    <button
                      onClick={() => {
                        setActiveSubMenu(
                          activeSubMenu === item.label ? null : item.label
                        );
                      }}
                      className={`w-full text-left flex justify-between items-center rounded-lg transition-all duration-150 hover:bg-red-50 active:bg-red-100 ${activeSubMenu === item.label ? "border-l-4 border-red-700 pl-2 bg-red-50" : ""}`}
                      aria-label={`Toggle submenu for ${item.label}`}
                      aria-expanded={activeSubMenu === item.label}
                    >
                      <span className="font-semibold">{item.label}</span>
                      {activeSubMenu === item.label ? (
                        <ChevronUp size={20} className="ml-2" />
                      ) : (
                        <ChevronDown size={20} className="ml-2" />
                      )}
                    </button>
                    <AnimatePresence>
                      {activeSubMenu === item.label && item.subItems && (
                        <motion.div
                          className="ml-4 overflow-hidden bg-red-50/70 rounded-xl mt-1 styled-scrollbar overflow-y-auto"
                          style={{ maxHeight: 240 }}
                          initial={{
                            height: 0,
                            opacity: 0,
                            paddingTop: 0,
                            paddingBottom: 0,
                          }}
                          animate={{
                            height: "auto",
                            opacity: 1,
                            paddingTop: 8,
                            paddingBottom: 8,
                          }}
                          exit={{
                            height: 0,
                            opacity: 0,
                            paddingTop: 0,
                            paddingBottom: 0,
                          }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                        >
                          {item.subItems.map((subItem, index) => (
                            <motion.div
                              key={subItem.label}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{
                                duration: 0.38,
                                ease: "easeInOut",
                                delay: 0.08 + index * 0.09,
                              }}
                            >
                              <Link
                                href={subItem.href}
                                className="block p-2 text-black rounded-md transition-all duration-150 hover:bg-red-100 active:bg-red-200 ml-2"
                                onClick={() => setMenuOpen(false)}
                                aria-label={`Navigate to ${subItem.label}`}
                              >
                                {subItem.label}
                              </Link>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            ))}

            <motion.div
              className="mx-3 mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {user && (
                <button
                  onClick={() => {
                    handleSignOut();
                    setMenuOpen(false);
                  }}
                  className="w-[60%] mx-auto bg-gradient-to-r from-red-700 to-red-500 px-4 py-2 rounded-full text-white shadow-lg hover:scale-105 active:scale-95 transition-all"
                  aria-label="Log Out"
                >
                  Log Out
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default NavbarMenu;
