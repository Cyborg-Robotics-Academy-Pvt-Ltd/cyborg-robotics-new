"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

export const InfiniteMovingGallery = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  items: {
    id: string;
    src: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);

  function getDirection() {
    if (containerRef.current) {
      containerRef.current.style.setProperty(
        "--animation-direction",
        direction === "left" ? "normal" : "reverse"
      );
    }
  }

  function getSpeed() {
    if (containerRef.current) {
      const duration =
        speed === "fast" ? "20s" : speed === "normal" ? "40s" : "80s";
      containerRef.current.style.setProperty("--animation-duration", duration);
    }
  }

  useEffect(() => {
    getDirection();
    getSpeed();
    setStart(true);
  }, [direction, speed]);

  useEffect(() => {
    if (!scrollerRef.current || !containerRef.current) return;

    const scrollerContent = Array.from(scrollerRef.current.children);

    // Clear any existing duplicated items
    while (scrollerRef.current.children.length > items.length) {
      scrollerRef.current.removeChild(scrollerRef.current.lastChild!);
    }

    // Duplicate items for infinite scrolling effect
    scrollerContent.forEach((item) => {
      const duplicatedItem = item.cloneNode(true);
      scrollerRef.current?.appendChild(duplicatedItem);
    });

    getDirection();
    getSpeed();
    setStart(true);
  }, [items]);

  return (
    <div
      ref={containerRef}
      className={`scroller relative z-20 max-w-8xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_1%,white_99%,transparent)] ${className}`}
    >
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll var(--animation-duration, 40s) linear infinite;
          animation-direction: var(--animation-direction, normal);
        }
      `}</style>
      <ul
        ref={scrollerRef}
        className={`flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap ${
          start ? "animate-scroll" : ""
        } ${pauseOnHover ? "hover:[animation-play-state:paused]" : ""}`}
      >
        {items.map((item) => (
          <li
            key={item.id}
            className="w-[230px] max-w-full relative rounded-2xl border border-b-2 border-white/30 h-[380px] flex-shrink-0 bg-white/10 backdrop-blur-lg shadow-lg overflow-hidden"
          >
            <div className="relative w-full h-full">
              <Image
                src={item.src}
                alt={`Gallery image ${item.id}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
