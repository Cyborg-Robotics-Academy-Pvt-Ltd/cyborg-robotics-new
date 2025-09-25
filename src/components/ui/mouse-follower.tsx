"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";

interface MouseFollowerProps {
  size?: number;
  color?: string;
  blur?: boolean;
  delay?: number;
  opacity?: number;
  borderColor?: string;
  borderWidth?: number;
  className?: string;
  hoverScale?: number;
  clickEffect?: boolean;
}

const MouseFollower: React.FC<MouseFollowerProps> = ({
  size = 40,
  color = "rgba(59, 130, 246, 0.3)", // blue-500 with opacity
  blur = true,
  opacity = 0.8,
  borderColor = "rgba(59, 130, 246, 0.8)",
  borderWidth = 2,
  className = "",
  hoverScale = 1.5,
  clickEffect = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Use Framer Motion's motion values for smooth performance
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Apply spring animation to motion values
  const springX = useSpring(mouseX, { stiffness: 600, damping: 30, mass: 0.4 });
  const springY = useSpring(mouseY, { stiffness: 600, damping: 30, mass: 0.4 });

  const updateMousePosition = useCallback(
    (e: MouseEvent) => {
      mouseX.set(e.clientX - size / 2);
      mouseY.set(e.clientY - size / 2);
      if (!isVisible) {
        setIsVisible(true);
      }
    },
    [mouseX, mouseY, size, isVisible]
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
      'button, a, input, textarea, select, [role="button"], [tabindex]'
    );
    setIsHovering(!!isInteractive);
  }, []);

  useEffect(() => {
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mousemove", handleElementHover);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    if (clickEffect) {
      document.addEventListener("mousedown", handleMouseDown);
    }

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mousemove", handleElementHover);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      if (clickEffect) {
        document.removeEventListener("mousedown", handleMouseDown);
      }
    };
  }, [updateMousePosition, handleElementHover, handleMouseDown, clickEffect]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`pointer-events-none fixed top-0 left-0 z-50 rounded-full ${className}`}
          style={{
            x: springX,
            y: springY,
            width: size,
            height: size,
            backgroundColor: color,
            border: `${borderWidth}px solid ${borderColor}`,
            filter: blur ? "blur(1px)" : "none",
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: isClicked ? 0.8 : isHovering ? hoverScale : 1,
            opacity: opacity,
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
      )}
    </AnimatePresence>
  );
};

export default MouseFollower;

// Enhanced smooth version with better Framer Motion implementation
export const MouseFollowerSmooth: React.FC<MouseFollowerProps> = ({
  size = 20,
  blur = false,
  opacity = 0.9,
  borderColor = "rgba(147, 51, 234, 1)",
  borderWidth = 1,
  className = "",
  hoverScale = 1.3,
  clickEffect = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smoother spring configuration
  const springX = useSpring(mouseX, { stiffness: 400, damping: 40, mass: 0.3 });
  const springY = useSpring(mouseY, { stiffness: 400, damping: 40, mass: 0.3 });

  const updateMousePosition = useCallback(
    (e: MouseEvent) => {
      mouseX.set(e.clientX - size / 2);
      mouseY.set(e.clientY - size / 2);
      if (!isVisible) {
        setIsVisible(true);
      }
    },
    [mouseX, mouseY, size, isVisible]
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
      'button, a, input, textarea, select, [role="button"], [tabindex]'
    );
    setIsHovering(!!isInteractive);
  }, []);

  useEffect(() => {
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mousemove", handleElementHover);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    if (clickEffect) {
      document.addEventListener("mousedown", handleMouseDown);
    }

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mousemove", handleElementHover);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      if (clickEffect) {
        document.removeEventListener("mousedown", handleMouseDown);
      }
    };
  }, [updateMousePosition, handleElementHover, handleMouseDown, clickEffect]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`pointer-events-none fixed top-0 left-0 z-50 rounded-full ${className}`}
          style={{
            x: springX,
            y: springY,
            width: size,
            height: size,
            border: `${borderWidth}px solid ${borderColor}`,
            filter: blur ? "blur(1px)" : "none",
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: isClicked ? 0.7 : isHovering ? hoverScale : 1,
            opacity: opacity,
          }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{
            type: "tween",
            ease: "easeOut",
            duration: 0.4,
          }}
        />
      )}
    </AnimatePresence>
  );
};

// Pulsing version with optimized animations
export const MouseFollowerPulse: React.FC<MouseFollowerProps> = ({
  size = 30,
  color = "rgba(239, 68, 68, 0.3)", // red-500 with opacity
  blur = true,
  opacity = 0.7,
  borderColor = "rgba(239, 68, 68, 1)",
  borderWidth = 2,
  className = "",
  hoverScale = 1.4,
  clickEffect = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 500, damping: 35, mass: 0.4 });
  const springY = useSpring(mouseY, { stiffness: 500, damping: 35, mass: 0.4 });

  const updateMousePosition = useCallback(
    (e: MouseEvent) => {
      mouseX.set(e.clientX - size / 2);
      mouseY.set(e.clientY - size / 2);
      if (!isVisible) {
        setIsVisible(true);
      }
    },
    [mouseX, mouseY, size, isVisible]
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
      'button, a, input, textarea, select, [role="button"], [tabindex]'
    );
    setIsHovering(!!isInteractive);
  }, []);

  useEffect(() => {
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mousemove", handleElementHover);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    if (clickEffect) {
      document.addEventListener("mousedown", handleMouseDown);
    }

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mousemove", handleElementHover);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      if (clickEffect) {
        document.removeEventListener("mousedown", handleMouseDown);
      }
    };
  }, [updateMousePosition, handleElementHover, handleMouseDown, clickEffect]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`pointer-events-none fixed top-0 left-0 z-50 rounded-full ${className}`}
          style={{
            x: springX,
            y: springY,
            width: size,
            height: size,
            backgroundColor: color,
            border: `${borderWidth}px solid ${borderColor}`,
            filter: blur ? "blur(1px)" : "none",
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: isClicked ? 0.6 : isHovering ? hoverScale : [1, 1.2, 1],
            opacity: opacity,
          }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{
            scale: {
              duration: isHovering || isClicked ? 0.4 : 1.2,
              repeat: isHovering || isClicked ? 0 : Infinity,
              ease: "easeOut",
            },
            opacity: { duration: 0.3, ease: "easeOut" },
          }}
        />
      )}
    </AnimatePresence>
  );
};
