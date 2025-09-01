"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState, useCallback } from "react";
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
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);

  const [start, setStart] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getDirection = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.style.setProperty(
        "--animation-direction",
        direction === "left" ? "forwards" : "reverse"
      );
    }
  }, [direction]);

  const getSpeed = useCallback(() => {
    if (containerRef.current) {
      const duration =
        speed === "fast" ? "20s" : speed === "normal" ? "30s" : "40s";
      containerRef.current.style.setProperty("--animation-duration", duration);
    }
  }, [speed]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const addAnimation = () => {
      if (containerRef.current && scrollerRef.current) {
        const scrollerContent = Array.from(scrollerRef.current.children);

        // Clear existing duplicated items
        while (scrollerRef.current.children.length > items.length) {
          scrollerRef.current.removeChild(scrollerRef.current.lastChild!);
        }

        // Duplicate items
        scrollerContent.forEach((item) => {
          const duplicatedItem = item.cloneNode(true);
          scrollerRef.current?.appendChild(duplicatedItem);
        });

        getDirection();
        getSpeed();
        setStart(true);
      }
    };

    addAnimation();

    // Add these handlers if not already defined
    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    return () => {
      if (scroller) {
        scroller.removeEventListener("mouseenter", handleMouseEnter);
        scroller.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [direction, speed, items.length, getDirection, getSpeed, isHovered]);

  return (
    <div
      ref={containerRef}
      className={cn(
        `scroller relative z-20 max-w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)] bg-white`,
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap mt-2",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {items.map((item) => (
          <li
            className="group w-[200px] max-w-full relative rounded-[2rem] border border-white/30 h-auto flex-shrink-0 md:w-[200px] md:mx-4 bg-white/30 backdrop-blur-lg transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20 hover:border-red-300 overflow-hidden"
            key={item.title}
          >
            {/* Robotics-themed hover background */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/40 via-transparent to-blue-50/40 opacity-0 group-hover:opacity-100 transition-all duration-700 rounded-[2rem]"></div>

            {/* Circuit pattern overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none">
              <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-l-2 border-red-400 rounded-tl-lg"></div>
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-r-2 border-blue-400 rounded-br-lg"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-red-400 rounded-full"></div>
            </div>

            <blockquote>
              <div
                aria-hidden="true"
                className="user-select-none -z-1 pointer-events-none absolute -left-0.5 -top-0.5 h-[calc(100%_+_4px)] w-[calc(100%_+_4px)]"
              ></div>

              <div className="relative z-20 mt-1 flex flex-col items-center">
                <div className="relative overflow-hidden rounded-tl-3xl rounded-tr-3xl">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    width={200}
                    height={200}
                    className="object-cover w-full h-44 transition-transform duration-700 group-hover:scale-110"
                    priority={true}
                    loading="eager"
                    quality={75}
                  />
                  {/* Image overlay effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <span className="text-base text-center leading-[1.6] p-3 text-black font-medium group-hover:text-red-700 transition-colors duration-300">
                  {item.title}
                </span>
              </div>
            </blockquote>

            {/* Hover glow effect */}
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-red-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 blur-xl"></div>
          </li>
        ))}
      </ul>
    </div>
  );
};
