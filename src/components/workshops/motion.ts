import { cubicBezier, type Variants } from "framer-motion";

const springEase = cubicBezier(0.22, 1, 0.36, 1);

export const heroContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export const heroItemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: springEase },
  },
};

export const fadeUpVariants: Variants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.6, ease: springEase },
  },
};

export const createStaggerContainer = (staggerChildren: number): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren } },
});
