"use client";
import React, { useEffect, useState, useCallback, useRef } from "react";

import { motion } from "framer-motion";
import { HoveredLink, Menu, MenuItem } from "./ui/navbar-menu";
import { cn } from "@/lib/utils";
import Image from "next/image";
import logo from "../../public/assets/logo.png";
import Link from "next/link";
import { auth } from "../../firebaseConfig";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { menuItems } from "../../utils/MenuItemsData";
import NavbarMenu from "./NavbarMenu";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function NavbarDemo() {
  return (
    <div className="relative lg:h-1 w-full flex items-center justify-center ">
      <Navbar className="" />
    </div>
  );
}

const Navbar = ({
  className,
}: {
  className?: string;
  itemposition?: string;
}) => {
  const [active, setActive] = useState<string | null>(null);
  const { user, userRole } = useAuth();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [visibleItems, setVisibleItems] = useState<typeof menuItems>(menuItems);
  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Responsive logic: move overflowing items to overlay
  useEffect(() => {
    function updateMenuItems() {
      if (!navRef.current) return;
      const navWidth = navRef.current.offsetWidth;
      let usedWidth = 0;
      let lastVisibleIdx = menuItems.length - 1;
      for (let i = 0; i < menuItems.length; i++) {
        const el = itemRefs.current[i];
        if (!el) continue;
        usedWidth += el.offsetWidth;
        if (usedWidth > navWidth - 300) {
          // 300px buffer for logo, buttons
          lastVisibleIdx = i - 1;
          break;
        }
      }
      setVisibleItems(menuItems.slice(0, lastVisibleIdx + 1));
    }
    updateMenuItems();
    window.addEventListener("resize", updateMenuItems);
    return () => window.removeEventListener("resize", updateMenuItems);
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut(auth);
      router.push("/"); // This will now work with the navigation router
      localStorage.removeItem("userRole");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [router]);

  // Function to render menu items (for visible only)
  const renderMenuItems = (
    items: Array<{
      href?: string;
      label: string;
      subItems?: Array<{
        label: string;
        href?: string;
        subItems?: Array<{ label: string; href: string }>;
      }>;
    }>,
    refArray?: (HTMLDivElement | null)[]
  ) => {
    return items.map((item, index) => {
      if (item.subItems) {
        // If subItems have their own subItems, render as nested dropdown
        // const hasNested = item.subItems.some((sub) => sub.subItems); // Removed unused variable
        return (
          <motion.div
            key={`parent-${item.label}-${index}`}
            ref={(el) => {
              if (refArray) refArray[index] = el;
            }}
          >
            <MenuItem
              setActive={setActive}
              active={active}
              item={item.label}
              key={item.label}
            >
              <div className="flex flex-col space-y-2 min-w-[180px]">
                {item.subItems.map((subItem, subIndex) =>
                  subItem.subItems ? (
                    <motion.div
                      key={`nested-${subItem.label}-${subIndex}`}
                      className="group relative"
                      initial="initial"
                      whileHover="hover"
                    >
                      <span className="relative pl-3 font-semibold text-black cursor-pointer group-hover:text-[#8C2D2D]">
                        <motion.span
                          variants={{
                            initial: { x: 0, opacity: 0 },
                            hover: { x: 6, opacity: 1 },
                          }}
                          transition={{ duration: 0.2 }}
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-[#8C2D2D] rounded"
                        />
                        <motion.span
                          variants={{ initial: { x: 0 }, hover: { x: 8 } }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 24,
                          }}
                          className="inline-block"
                        >
                          {subItem.label}
                        </motion.span>
                      </span>
                      <div className="absolute left-full top-0 z-50 hidden group-hover:block bg-white rounded-xl shadow-lg border border-gray-200 min-w-[180px] p-2">
                        {subItem.subItems.map((nested, nestedIdx) => (
                          <HoveredLink
                            href={nested.href}
                            key={`nested-link-${nested.label}-${nestedIdx}`}
                          >
                            {nested.label}
                          </HoveredLink>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <HoveredLink
                      href={subItem.href!}
                      key={`sub-${subItem.label}-${subIndex}`}
                    >
                      {subItem.label}
                    </HoveredLink>
                  )
                )}
              </div>
            </MenuItem>
          </motion.div>
        );
      }
      return item.href ? (
        <Link href={item.href} key={`link-${item.label}-${index}`} className="">
          <motion.div
            ref={(el) => {
              if (refArray) refArray[index] = el;
            }}
          >
            <MenuItem setActive={setActive} active={active} item={item.label} />
          </motion.div>
        </Link>
      ) : null;
    });
  };

  return (
    <>
      {/* Desktop Navigation */}
      <motion.header
        className="w-full hidden sm:hidden md:hidden lg:block fixed"
        transition={{ type: "spring", stiffness: 300 }}
        style={{ zIndex: 1000 }}
      >
        <nav aria-label="Main Navigation" className="relative w-full">
          <div
            className={cn(
              "fixed top-0 inset-x-0 w-full z-50 xl:text-[13px] 2xl:text-[15px] lg:text-[11px] md:text-[11px] sm:text-[10px]      transition-all duration-300",
              className
            )}
            ref={navRef}
          >
            <Menu
              setActive={setActive}
              className={cn(
                "transition-all duration-300",
                isScrolled
                  ? "bg-white/60 backdrop-blur-md shadow-lg border-b border-white/30"
                  : "bg-white"
              )}
            >
              <Link href={"/"} title="Home">
                <Image
                  src={logo}
                  width={120}
                  height={120}
                  alt="logo"
                  loading="lazy"
                  quality={75}
                />
              </Link>
              {renderMenuItems(visibleItems, itemRefs.current)}
              {user ? (
                <>
                  <Link
                    href={`/${userRole}-dashboard`}
                    className=" px-3 py-1 rounded-full text-black mr-2"
                  >
                    <button
                      aria-label="Dashboard "
                      className="uppercase text-black font-medium"
                    >
                      Dashboard
                    </button>
                  </Link>
                  <div
                    className="relative group"
                    style={{ display: "inline-block" }}
                  >
                    <button
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-red-800"
                      aria-haspopup="true"
                      aria-expanded={active === "profile"}
                      onClick={() =>
                        setActive(active === "profile" ? null : "profile")
                      }
                      tabIndex={0}
                    >
                      <span className="font-semibold text-black">
                        {user.email?.split("@")[0]}
                      </span>
                      <svg
                        width="20"
                        height="20"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M7 10l5 5 5-5"
                          stroke="#222"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    {active === "profile" && (
                      <div
                        className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-200 z-50 flex flex-col py-2"
                        tabIndex={-1}
                        onMouseLeave={() => setActive(null)}
                      >
                        <div className="flex items-center">
                          <button
                            onClick={handleSignOut}
                            className="flex items-center px-4 py-2 text-red-800 rounded-md focus:outline-none font-normal"
                            aria-label="Log Out"
                          >
                            Log Out
                            <LogOut className="ml-2 text-red-800" />
                          </button>
                        </div>
                        {/* Future: <Link href="/profile" className="px-4 py-2 hover:bg-gray-100 rounded-md">Profile</Link> */}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] text-white rounded-xl shadow-lg text-sm font-semibold uppercase tracking-wide hover:scale-105 hover:shadow-xl transition-all duration-200 focus:outline-none   mr-2"
                  title="Log In"
                >
                  <button className="text-white flex items-center">
                    <svg
                      className="h-4 w-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 4v5h.582M20 20v-5h-.581M5.635 19A9 9 0 003 12c0-5 4-9 9-9s9 4 9 9a9 9 0 01-2.635 6.364M19 5l-7 7-7-7"
                      />
                    </svg>
                    Log In
                  </button>
                </Link>
              )}
            </Menu>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Navigation */}
      <NavbarMenu
        user={user}
        userRole={userRole}
        handleSignOut={handleSignOut}
        menuItems={menuItems}
        // overflowItems={overflowItems} // Remove for now, not in NavbarMenuProps
      />
    </>
  );
};

export default Navbar;
