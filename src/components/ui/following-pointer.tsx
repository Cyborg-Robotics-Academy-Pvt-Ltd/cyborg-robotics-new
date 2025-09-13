// Core component that receives mouse positions and renders pointer and content

import React, { useEffect, useState } from "react";

import { motion, AnimatePresence, useMotionValue } from "motion/react";
import { cn } from "@/lib/utils";

export const FollowerPointerCard = ({
  children,
  className,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string | React.ReactNode;
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const ref = React.useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [isInside, setIsInside] = useState<boolean>(false); // Add this line
  const [hideCursor, setHideCursor] = useState<boolean>(false);

  useEffect(() => {
    if (ref.current) {
      setRect(ref.current.getBoundingClientRect());
    }
    const handleResize = () => {
      if (ref.current) {
        setRect(ref.current.getBoundingClientRect());
      }
    };
    window.addEventListener("resize", handleResize, { passive: true } as any);

    // Hide cursor only on devices with a fine pointer (e.g., mouse)
    const mql = window.matchMedia("(pointer: fine)");
    const updatePointer = () => setHideCursor(mql.matches);
    updatePointer();
    mql.addEventListener?.("change", updatePointer);

    return () => {
      window.removeEventListener("resize", handleResize as EventListener);
      mql.removeEventListener?.("change", updatePointer);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Use fresh rect in case layout shifted due to viewport changes
    const currentRect = ref.current?.getBoundingClientRect() ?? rect;
    if (!currentRect) return;
    x.set(e.clientX - currentRect.left);
    y.set(e.clientY - currentRect.top);
  };
  const handleMouseLeave = () => {
    setIsInside(false);
  };

  const handleMouseEnter = () => {
    setIsInside(true);
  };
  return (
    <div
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      style={{
        cursor: hideCursor ? "none" : undefined,
      }}
      ref={ref}
      className={cn("relative", className)}
    >
      <AnimatePresence>
        {isInside && <FollowPointer x={x} y={y} title={title} />}
      </AnimatePresence>
      {children}
    </div>
  );
};

export const FollowPointer = ({
  x,
  y,
  title,
}: {
  x: any;
  y: any;
  title?: string | React.ReactNode;
}) => {
  return (
    <motion.div
      className="absolute z-50 h-4 w-4 rounded-full"
      style={{
        top: y,
        left: x,
        pointerEvents: "none",
      }}
      initial={{
        scale: 1,
        opacity: 1,
      }}
      animate={{
        scale: 1,
        opacity: 1,
      }}
      exit={{
        scale: 0,
        opacity: 0,
      }}
    >
      <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="1"
        viewBox="0 0 16 16"
        className="h-6 w-6 -translate-x-[12px] -translate-y-[10px] -rotate-[70deg] transform stroke-red-600 text-red-500"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z"></path>
      </svg>
      <motion.div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 40,
        }}
        initial={{
          scale: 0.5,
          opacity: 0,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        exit={{
          scale: 0.5,
          opacity: 0,
        }}
        className={
          "min-w-max px-0 py-0 items-center whitespace-nowrap bg-transparent shadow-none"
        }
      >
        {title || `Cyborg robotics academy`}
      </motion.div>
    </motion.div>
  );
};
