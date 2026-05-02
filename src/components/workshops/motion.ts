import { type Variants } from "framer-motion";
import { marketingEase } from "@/lib/motion";

export const heroContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.04 },
  },
};

export const heroItemVariants: Variants = {
  hidden: { y: 18, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: marketingEase },
  },
};

export const fadeUpVariants: Variants = {
  hidden: { y: 24, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.55, ease: marketingEase },
  },
};

export const createStaggerContainer = (staggerChildren: number): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren, delayChildren: 0.04 } },
});
