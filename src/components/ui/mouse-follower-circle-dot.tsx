"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";

interface MouseFollowerCircleDotProps {
  size?: number;
  dotSize?: number;
  borderColor?: string;
  dotColor?: string;
  borderWidth?: number;
  className?: string;
  hoverScale?: number;
  clickEffect?: boolean;
  dotDelay?: number;
}

const MouseFollowerCircleDot: React.FC<MouseFollowerCircleDotProps> = ({
  size = 40,
  dotSize = 6,
  borderColor = "rgba(142, 46, 46, 0.8)", // #8E2E2E with opacity
  dotColor = "rgba(142, 46, 46, 1)", // #8E2E2E solid
  borderWidth = 2,
  className = "",
  clickEffect = true,
  dotDelay = 0.15,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  // const [hasOverlay, setHasOverlay] = useState(false); // Currently unused

  // Outer circle motion values (faster response)
  const outerMouseX = useMotionValue(0);
  const outerMouseY = useMotionValue(0);

  // Inner dot motion values (slower response for trailing effect)
  const dotMouseX = useMotionValue(0);
  const dotMouseY = useMotionValue(0);

  // Apply different spring configs for outer circle and inner dot
  const outerSpringX = useSpring(outerMouseX, {
    stiffness: 600,
    damping: 30,
    mass: 0.4,
  });
  const outerSpringY = useSpring(outerMouseY, {
    stiffness: 600,
    damping: 30,
    mass: 0.4,
  });

  const dotSpringX = useSpring(dotMouseX, {
    stiffness: 200,
    damping: 25,
    mass: 0.8,
  });
  const dotSpringY = useSpring(dotMouseY, {
    stiffness: 200,
    damping: 25,
    mass: 0.8,
  });

  const updateMousePosition = useCallback(
    (e: MouseEvent) => {
      // Update outer circle position immediately
      outerMouseX.set(e.clientX - size / 2);
      outerMouseY.set(e.clientY - size / 2);

      // Update dot position with delay effect
      setTimeout(() => {
        dotMouseX.set(e.clientX - dotSize / 2);
        dotMouseY.set(e.clientY - dotSize / 2);
      }, dotDelay * 100);

      if (!isVisible) {
        setIsVisible(true);
      }
    },
    [
      outerMouseX,
      outerMouseY,
      dotMouseX,
      dotMouseY,
      size,
      dotSize,
      dotDelay,
      isVisible,
    ]
  );

  const handleMouseDown = useCallback(() => {
    if (clickEffect) {
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 150);
    }
  }, [clickEffect]);

  const handleElementHover = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractive = target.closest(
      'button, a, input, textarea, select, [role="button"], [tabindex], .cursor-pointer, [href]'
    );
    setIsHovering(!!isInteractive);
  }, []);

  const checkForOverlays = useCallback(() => {
    // Check for any overlay elements with high z-index
    const overlaySelectors = [
      '[class*="z-50"]',
      '[class*="z-[50]"]',
      '[class*="z-[60]"]',
      '[class*="z-[9999]"]',
      '[class*="fixed"][class*="inset-0"]',
      ".modal",
      '[role="dialog"]',
      '[role="modal"]',
    ];

    // Check if any overlay elements are currently visible
    overlaySelectors.some((selector) => {
      const elements = document.querySelectorAll(selector);
      return Array.from(elements).some((el) => {
        const styles = window.getComputedStyle(el);
        return (
          styles.display !== "none" &&
          styles.visibility !== "hidden" &&
          styles.opacity !== "0"
        );
      });
    });

    // Overlay detection implemented but currently not affecting visibility
  }, []);

  useEffect(() => {
    // Ensure component is mounted on client side
    if (typeof window === "undefined") return;

    // Check if device is mobile/touch device
    const checkMobile = () => {
      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isMobileUserAgent =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      const isSmallScreen = window.innerWidth < 1024; // Less than lg breakpoint
      return isTouchDevice || isMobileUserAgent || isSmallScreen;
    };

    setIsMobile(checkMobile());

    // If mobile, don't show the cursor
    if (checkMobile()) {
      return;
    }

    // Check for overlays on mount and set up observer
    checkForOverlays();

    // Create a MutationObserver to watch for DOM changes
    const observer = new MutationObserver(checkForOverlays);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    // Also check on window resize and focus
    window.addEventListener("resize", checkForOverlays);
    window.addEventListener("focus", checkForOverlays);

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // Prevent text cursor on text elements
    const style = document.createElement("style");
    style.id = "mouse-follower-cursor-style";
    style.textContent = `
      * {
        cursor: default !important;
      }
      button, a, [role="button"], input[type="button"], input[type="submit"] {
        cursor: pointer !important;
      }
    `;

    // Remove existing style if present
    const existingStyle = document.getElementById(
      "mouse-follower-cursor-style"
    );
    if (existingStyle) {
      existingStyle.remove();
    }

    document.head.appendChild(style);

    window.addEventListener("mousemove", updateMousePosition, {
      passive: true,
    });
    window.addEventListener("mousemove", handleElementHover, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    if (clickEffect) {
      document.addEventListener("mousedown", handleMouseDown);
    }

    return () => {
      // Remove the style when component unmounts
      const styleToRemove = document.getElementById(
        "mouse-follower-cursor-style"
      );
      if (styleToRemove) {
        styleToRemove.remove();
      }

      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mousemove", handleElementHover);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      if (clickEffect) {
        document.removeEventListener("mousedown", handleMouseDown);
      }

      window.removeEventListener("resize", checkForOverlays);
      window.removeEventListener("focus", checkForOverlays);
      observer.disconnect();
    };
  }, [
    updateMousePosition,
    handleElementHover,
    handleMouseDown,
    clickEffect,
    checkForOverlays,
  ]);

  // Don't render anything on mobile devices
  if (isMobile) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Outer Circle - Border Only */}
          <motion.div
            className={`pointer-events-none fixed top-0 left-0 z-50 rounded-full ${className}`}
            style={{
              x: outerSpringX,
              y: outerSpringY,
              width: size,
              height: size,
              backgroundColor: "transparent",
              border: `${borderWidth}px solid ${borderColor}`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: isClicked ? 0.8 : isHovering ? 1.3 : 1,
              opacity: isHovering ? 0.9 : 1,
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 600,
              damping: 30,
              mass: 0.4,
              duration: 0.4,
            }}
          />

          {/* Inner Dot - Movable with delay */}
          <motion.div
            className="pointer-events-none fixed top-0 left-0 z-50 rounded-full"
            style={{
              x: dotSpringX,
              y: dotSpringY,
              width: dotSize,
              height: dotSize,
              backgroundColor: dotColor,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: isClicked ? 1.5 : isHovering ? 1.8 : 1,
              opacity: isHovering ? 1 : 1,
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              mass: 0.6,
              duration: 0.4,
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default MouseFollowerCircleDot;

// Smooth variant with circle and dot
export const MouseFollowerCircleDotSmooth: React.FC<
  MouseFollowerCircleDotProps
> = ({
  size = 35,
  dotSize = 4,
  borderColor = "rgba(142, 46, 46, 0.8)",
  dotColor = "rgba(142, 46, 46, 1)",
  borderWidth = 1,
  className = "",
  // hoverScale = 1.3, // Currently unused, reserved for future use
  clickEffect = true,
  dotDelay = 0.2,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasOverlay, setHasOverlay] = useState(false);

  const outerMouseX = useMotionValue(0);
  const outerMouseY = useMotionValue(0);
  const dotMouseX = useMotionValue(0);
  const dotMouseY = useMotionValue(0);

  const outerSpringX = useSpring(outerMouseX, {
    stiffness: 400,
    damping: 40,
    mass: 0.3,
  });
  const outerSpringY = useSpring(outerMouseY, {
    stiffness: 400,
    damping: 40,
    mass: 0.3,
  });
  const dotSpringX = useSpring(dotMouseX, {
    stiffness: 150,
    damping: 30,
    mass: 1,
  });
  const dotSpringY = useSpring(dotMouseY, {
    stiffness: 150,
    damping: 30,
    mass: 1,
  });

  const updateMousePosition = useCallback(
    (e: MouseEvent) => {
      outerMouseX.set(e.clientX - size / 2);
      outerMouseY.set(e.clientY - size / 2);

      setTimeout(() => {
        dotMouseX.set(e.clientX - dotSize / 2);
        dotMouseY.set(e.clientY - dotSize / 2);
      }, dotDelay * 100);

      if (!isVisible) {
        setIsVisible(true);
      }
    },
    [
      outerMouseX,
      outerMouseY,
      dotMouseX,
      dotMouseY,
      size,
      dotSize,
      dotDelay,
      isVisible,
    ]
  );

  const handleMouseDown = useCallback(() => {
    if (clickEffect) {
      setIsClicked(true);
      setTimeout(() => setIsClicked(false), 200);
    }
  }, [clickEffect]);

  const handleElementHover = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractive = target.closest(
      'button, a, input, textarea, select, [role="button"], [tabindex], .cursor-pointer, [href]'
    );
    setIsHovering(!!isInteractive);
  }, []);

  const checkForOverlays = useCallback(() => {
    // Check for any overlay elements with high z-index
    const overlaySelectors = [
      '[class*="z-50"]',
      '[class*="z-[50]"]',
      '[class*="z-[60]"]',
      '[class*="z-[9999]"]',
      '[class*="fixed"][class*="inset-0"]',
      ".modal",
      '[role="dialog"]',
      '[role="modal"]',
    ];

    const hasVisibleOverlay = overlaySelectors.some((selector) => {
      const elements = document.querySelectorAll(selector);
      return Array.from(elements).some((el) => {
        const styles = window.getComputedStyle(el);
        return (
          styles.display !== "none" &&
          styles.visibility !== "hidden" &&
          styles.opacity !== "0"
        );
      });
    });

    setHasOverlay(hasVisibleOverlay);
  }, []);

  useEffect(() => {
    // Ensure component is mounted on client side
    if (typeof window === "undefined") return;

    // Check if device is mobile/touch device
    const checkMobile = () => {
      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isMobileUserAgent =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      const isSmallScreen = window.innerWidth < 1024; // Less than lg breakpoint
      return isTouchDevice || isMobileUserAgent || isSmallScreen;
    };

    setIsMobile(checkMobile());

    // If mobile, don't show the cursor
    if (checkMobile()) {
      return;
    }

    // Check for overlays on mount and set up observer
    checkForOverlays();

    // Create a MutationObserver to watch for DOM changes
    const observer = new MutationObserver(checkForOverlays);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    // Also check on window resize and focus
    window.addEventListener("resize", checkForOverlays);
    window.addEventListener("focus", checkForOverlays);

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // Prevent text cursor on text elements
    const style = document.createElement("style");
    style.id = "mouse-follower-cursor-style-smooth";
    style.textContent = `
      * {
        cursor: default !important;
      }
      button, a, [role="button"], input[type="button"], input[type="submit"] {
        cursor: pointer !important;
      }
    `;

    // Remove existing style if present
    const existingStyle = document.getElementById(
      "mouse-follower-cursor-style-smooth"
    );
    if (existingStyle) {
      existingStyle.remove();
    }

    document.head.appendChild(style);

    window.addEventListener("mousemove", updateMousePosition, {
      passive: true,
    });
    window.addEventListener("mousemove", handleElementHover, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    if (clickEffect) {
      document.addEventListener("mousedown", handleMouseDown);
    }

    return () => {
      // Remove the style when component unmounts
      const styleToRemove = document.getElementById(
        "mouse-follower-cursor-style-smooth"
      );
      if (styleToRemove) {
        styleToRemove.remove();
      }

      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mousemove", handleElementHover);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      if (clickEffect) {
        document.removeEventListener("mousedown", handleMouseDown);
      }

      window.removeEventListener("resize", checkForOverlays);
      window.removeEventListener("focus", checkForOverlays);
      observer.disconnect();
    };
  }, [
    updateMousePosition,
    handleElementHover,
    handleMouseDown,
    clickEffect,
    checkForOverlays,
  ]);

  // Don't render anything on mobile devices
  if (isMobile) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && !hasOverlay && (
        <>
          <motion.div
            className={`pointer-events-none fixed top-0 left-0 z-50 rounded-full ${className}`}
            style={{
              x: outerSpringX,
              y: outerSpringY,
              width: size,
              height: size,
              backgroundColor: "transparent",
              border: `${borderWidth}px solid ${borderColor}`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: isClicked ? 0.7 : isHovering ? 1.2 : 1,
              opacity: isHovering ? 0.8 : 1,
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: "tween",
              ease: "easeOut",
              duration: 0.4,
            }}
          />

          <motion.div
            className="pointer-events-none fixed top-0 left-0 z-50 rounded-full"
            style={{
              x: dotSpringX,
              y: dotSpringY,
              width: dotSize,
              height: dotSize,
              backgroundColor: dotColor,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: isClicked ? 1.8 : isHovering ? 2.0 : 1,
              opacity: isHovering ? 1 : 1,
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: "tween",
              ease: "easeOut",
              duration: 0.4,
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
};
