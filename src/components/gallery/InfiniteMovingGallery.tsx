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
  const [position, setPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(position);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(position);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (containerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2; // Scroll-fast factor
    setPosition(scrollLeft + walk); // Fixed: changed from minus to plus
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - (containerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2; // Scroll-fast factor
    setPosition(scrollLeft + walk); // Fixed: changed from minus to plus
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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

  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.style.transform = `translateX(${position}px)`;
    }
  }, [position]);

  const moveSlide = (dir: "prev" | "next") => {
    const containerWidth = containerRef.current?.clientWidth || 0;
    // Fixed: swapped the direction logic
    const moveAmount =
      dir === "prev" ? containerWidth / 2 : -containerWidth / 2;
    setPosition((prev) => prev + moveAmount);
  };

  return (
    <div
      ref={containerRef}
      className={`scroller group relative z-20 max-w-8xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_1%,white_99%,transparent)] ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
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
      `}</style>

      {/* Navigation Buttons */}
      <button
        className="absolute left-2 top-1/2 transform -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100"
        onClick={() => moveSlide("prev")}
        aria-label="Previous slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        className="absolute right-2 top-1/2 transform -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100"
        onClick={() => moveSlide("next")}
        aria-label="Next slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      <ul
        ref={scrollerRef}
        className={`flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap`}
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
