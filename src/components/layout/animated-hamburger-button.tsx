"use client";

import { motion } from "framer-motion";

interface AnimatedHamburgerButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

const topVariants = {
  closed: { rotate: 0, translateY: 0 },
  open: { rotate: 45, translateY: 6 },
};

const middleVariants = {
  closed: { opacity: 1 },
  open: { opacity: 0 },
};

const bottomVariants = {
  closed: { rotate: 0, translateY: 0 },
  open: { rotate: -45, translateY: -6 },
};

export default function AnimatedHamburgerButton({
  isOpen,
  onClick,
}: AnimatedHamburgerButtonProps) {
  return (
    <div className="bg-[#b92423] shadow-md shadow-black/20 justify-center items-center px-2  rounded-[8px]">
      <button
        onClick={onClick}
        className="z-50 h-9 w-9 relative focus:outline-none  shadow-red-800 shadow-2xl flex  justify-center items-center"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <div className="w-6 h-4   flex flex-col justify-between my-auto absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className="h-0.5 w-full bg-white"
            variants={topVariants}
            initial="closed"
            animate={isOpen ? "open" : "closed"}
            transition={{ duration: 0.3 }}
          />
          <motion.div
            className="h-0.5 w-full bg-white"
            variants={middleVariants}
            initial="closed"
            animate={isOpen ? "open" : "closed"}
            transition={{ duration: 0.3 }}
          />
          <motion.div
            className="h-0.5 w-full bg-white"
            variants={bottomVariants}
            initial="closed"
            animate={isOpen ? "open" : "closed"}
            transition={{ duration: 0.3 }}
          />
        </div>
      </button>
    </div>
  );
}
