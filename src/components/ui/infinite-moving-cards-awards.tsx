"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import React, { useEffect, useState } from "react";

export const InfiniteMovingAwards = ({
  awards,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  awards: {
    id: number;
    title: string;
    image: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    addAnimation();
  }, []);

  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);
      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        scrollerRef.current?.appendChild(duplicatedItem);
      });

      setAnimationDirection();
      setAnimationSpeed();
      setStart(true);
    }
  }

  const setAnimationDirection = () => {
    if (containerRef.current) {
      containerRef.current.style.setProperty(
        "--animation-direction",
        direction === "left" ? "forwards" : "reverse"
      );
    }
  };

  const setAnimationSpeed = () => {
    if (containerRef.current) {
      const duration =
        speed === "fast" ? "20s" : speed === "normal" ? "40s" : "80s";
      containerRef.current.style.setProperty("--animation-duration", duration);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 w-full overflow-hidden bg-white ",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap gap-4 py-5 px-4",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {awards.map((award) => (
          <li
            key={award.id}
            className="relative w-[320px] h-64 max-w-full shrink-0 rounded-2xl transition-all duration-500 ease-in-out hover:scale-110  hover:z-10"
          >
            <Image
              src={award.image}
              alt={award.title}
              width={170}
              height={170}
              className="mx-auto mb-4 h-44 w-48 rounded-lg object-contain transition-all duration-500 ease-in-out hover:scale-105"
            />
            <p className="text-base font-medium text-black text-center px-3 transition-all duration-300 ease-in-out hover:text-red-800">
              {award.title}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};
