"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const MOBILE_QUERY = "(max-width: 767px)";

export const useMotionPreferences = () => {
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return {
    isMobile,
    reduceMotion: Boolean(prefersReducedMotion) || isMobile,
  };
};
