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
            className="w-[200px] max-w-full relative rounded-[2rem] border border-white/30 h-auto flex-shrink-0    md:w-[200px] md:mx-4 bg-white/30 backdrop-blur-lg  duration-300 hover:scale-105 shadow-md"
            key={item.title}
          >
            <blockquote>
              <div
                aria-hidden="true"
                className="user-select-none -z-1 pointer-events-none absolute -left-0.5 -top-0.5 h-[calc(100%_+_4px)] w-[calc(100%_+_4px)]"
              ></div>

              <div className="relative z-20 mt-1 flex flex-col items-center">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  width={150}
                  height={200}
                  className=" rounded-tl-3xl rounded-tr-3xl object-cover w-full h-40"
                  priority={true}
                  loading="eager"
                  quality={75}
                />
                <span className="text-base  text-center leading-[1.6] p-3 text-black font-medium">
                  {item.title}
                </span>
              </div>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  );
};
``;
