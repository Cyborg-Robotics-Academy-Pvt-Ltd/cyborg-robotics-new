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
  clickEffect?: boolean;
  dotDelay?: number;
}

const MouseFollowerCircleDot: React.FC<MouseFollowerCircleDotProps> = ({
  size = 40,
  dotSize = 6,
  borderColor = "rgba(142, 46, 46, 0.8)",
  dotColor = "rgba(142, 46, 46, 1)",
  borderWidth = 2,
  className = "",
  clickEffect = true,
  dotDelay = 0.15,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Motion values for smooth animations
  const outerMouseX = useMotionValue(0);
  const outerMouseY = useMotionValue(0);
  const dotMouseX = useMotionValue(0);
  const dotMouseY = useMotionValue(0);

  // Spring configurations for smooth movement
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

  // Optimized mouse position update with throttling
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

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check for mobile devices
    const checkMobile = () => {
      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isMobileUserAgent =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      const isSmallScreen = window.innerWidth < 1024;
      return isTouchDevice || isMobileUserAgent || isSmallScreen;
    };

    setIsMobile(checkMobile());

    if (checkMobile()) {
      return;
    }

    // Apply cursor styles (user preference: keep default cursor visible)
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

    const existingStyle = document.getElementById(
      "mouse-follower-cursor-style"
    );
    if (existingStyle) {
      existingStyle.remove();
    }

    document.head.appendChild(style);

    // Throttled event handlers for better performance
    let ticking = false;
    const throttledUpdateMousePosition = (e: MouseEvent) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateMousePosition(e);
          ticking = false;
        });
        ticking = true;
      }
    };

    const throttledHandleElementHover = (e: MouseEvent) => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleElementHover(e);
          ticking = false;
        });
        ticking = true;
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // Add event listeners with passive option
    document.addEventListener("mousemove", throttledUpdateMousePosition, {
      passive: true,
    });
    document.addEventListener("mouseover", throttledHandleElementHover, {
      passive: true,
    });
    document.addEventListener("mousedown", handleMouseDown, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave, {
      passive: true,
    });
    document.addEventListener("mouseenter", handleMouseEnter, {
      passive: true,
    });

    return () => {
      // Cleanup
      document.removeEventListener("mousemove", throttledUpdateMousePosition);
      document.removeEventListener("mouseover", throttledHandleElementHover);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);

      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, [updateMousePosition, handleElementHover, handleMouseDown]);

  // Don't render on mobile devices
  if (isMobile) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Outer Circle */}
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

          {/* Inner Dot */}
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
              opacity: 1,
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
