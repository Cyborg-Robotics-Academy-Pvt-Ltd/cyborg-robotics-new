import { cubicBezier, type Transition, type Variants } from "framer-motion";

export const marketingEase = cubicBezier(0.22, 1, 0.36, 1);

export const heroContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.04,
    },
  },
};

export const heroItemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: marketingEase },
  },
};

export const sectionContainerVariants = (staggerChildren = 0.1): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren,
      delayChildren: 0.04,
    },
  },
});

export const sectionItemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: marketingEase },
  },
};

export const cardHoverProps = {
  y: -6,
  scale: 1.02,
  transition: { duration: 0.24, ease: marketingEase } satisfies Transition,
};

export const heroFloatAnimation = { y: [0, -10, 0] };

export const heroFloatTransition: Transition = {
  duration: 3.2,
  repeat: Infinity,
  ease: "easeInOut",
};

export const ctaArrowAnimation = { x: [0, 5, 0] };

export const ctaArrowTransition: Transition = {
  duration: 1,
  repeat: Infinity,
  ease: "easeInOut",
};
