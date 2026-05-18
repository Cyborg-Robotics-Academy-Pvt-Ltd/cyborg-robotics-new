"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "slow",
  pauseOnHover = true,
  className,
}: {
  items: {
    title: string;
    imageUrl: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    // Duplicate items once for seamless loop
    const originalChildren = Array.from(scroller.children);
    originalChildren.forEach((child) => {
      const clone = child.cloneNode(true);
      scroller.appendChild(clone);
    });

    // Set CSS variables
    if (containerRef.current) {
      containerRef.current.style.setProperty(
        "--animation-direction",
        direction === "left" ? "forwards" : "reverse",
      );
      const duration =
        speed === "fast" ? "20s" : speed === "normal" ? "30s" : "40s";
      containerRef.current.style.setProperty("--animation-duration", duration);
    }

    setStart(true);

    return () => {
      // Cleanup: remove duplicates on unmount
      while (scroller.children.length > originalChildren.length) {
        scroller.removeChild(scroller.lastChild!);
      }
    };
  }, [direction, speed]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative z-20 overflow-hidden bg-white ",
        "[mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]",
        className,
      )}
      style={
        {
          "--animation-duration": "30s",
          "--animation-direction": "forwards",
        } as React.CSSProperties
      }
    >
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50%)); }
        }
        .animate-scroll {
          animation: scroll var(--animation-duration) linear infinite var(--animation-direction);
        }
        .animate-scroll.pause-on-hover:hover {
          animation-play-state: paused;
        }
      `}</style>

      <ul
        ref={scrollerRef}
        className={cn(
          "flex gap-6 py-6 w-max flex-nowrap",
          start && "animate-scroll",
          pauseOnHover && "pause-on-hover",
        )}
      >
        {items.map((item, idx) => (
          <li
            key={`${item.title}-${idx}`}
            className="flex-shrink-0 w-[220px] rounded-3xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="overflow-hidden rounded-t-3xl h-48 bg-gray-100">
              <Image
                src={item.imageUrl}
                alt={item.title}
                width={220}
                height={192}
                className="w-full h-full object-cover"
                priority={idx < 3} // Only prioritize first 3
                loading={idx < 3 ? "eager" : "lazy"}
                quality={80}
              />
            </div>

            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 text-center leading-snug">
                {item.title}
              </h3>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
