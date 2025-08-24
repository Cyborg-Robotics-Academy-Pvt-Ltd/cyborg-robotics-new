"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export const MenuItem = ({
  setActive,
  active,
  item,
  children,
}: {
  setActive: (item: string | null) => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
}) => {
  const hasChildren = Boolean(children);
  const isActive = active === item;
  return (
    <div onMouseEnter={() => setActive(item)} className="relative group">
      <motion.p
        transition={{ duration: 0.3 }}
        className="cursor-pointer text-black text-md font-medium hover:text-red-800 flex items-center"
      >
        <span>{item}</span>
        {hasChildren && (
          <ChevronDown
            aria-hidden
            className={cn(
              "ml-1 h-4 w-4 inline-block transition-transform duration-200 opacity-100",
              isActive && "rotate-180"
            )}
          />
        )}
      </motion.p>
      <AnimatePresence>
        {active === item && children && (
          <div className="absolute top-[calc(100%_+_0.5rem)] left-1/2 transform -translate-x-1/2 pt-1">
            <motion.div
              className="bg-white backdrop-blur-sm rounded-2xl overflow-hidden border border-black/[0.2] dark:border-white/[0.2] shadow-lg "
              onClick={() => setActive(null)}
            >
              <motion.div
                className="w-max h-full p-4 overflow-hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.12, ease: "easeInOut" }}
                style={{ willChange: "height, opacity" }}
              >
                {children}
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Menu = ({
  setActive,
  children,
  className,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)} // resets the state
      className={cn(
        "fixed border border-transparent bg-white  dark:border-white/[0.2] shadow-xl shadow-gray-500/10 flex justify-center items-center md:space-x-6 sm:space-x-4 lg:space-x-5  h-16 w-full",
        className
      )}
    >
      {children}
    </nav>
  );
};

export const ProductItem = ({
  title,
  description,
  href,
  src,
}: {
  title: string;
  description: string;
  href: string;
  src: string;
}) => {
  return (
    <Link href={href} className="flex space-x-2">
      <Image
        src={src}
        width={170}
        height={70}
        alt={title}
        className="flex-shrink-0 rounded-md shadow-2xl"
        priority // Added priority attribute for optimization
      />
      <div>
        <h4 className="text-xl font-bold mb-1 text-black  ">{title}</h4>
        <p className=" text-sm max-w-[20rem] text-black">{description}</p>
      </div>
    </Link>
  );
};

export const HoveredLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      className={cn(
        "relative pl-2 transition-colors duration-200 text-sm flex items-center",
        isHovered ? "text-[#8C2D2D] font-semibold" : "text-black"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.span
        initial={{ x: 0, opacity: 0 }}
        animate={isHovered ? { x: 6, opacity: 1 } : { x: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute left-0 top-1 -translate-y-1/2 w-[3px] h-3.5 bg-[#8C2D2D] rounded"
      />
      <motion.span
        animate={isHovered ? { x: 8 } : { x: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 24 }}
        className="inline-block"
      >
        {children}
      </motion.span>
    </Link>
  );
};
