"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

export const InfiniteMovingGallery = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
  autoPlay = true,
  autoPlayInterval = 3000,
}: {
  items: {
    id: string;
    src: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const itemWidthRef = useRef(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);

  // Calculate the width of each item including gap
  useEffect(() => {
    if (containerRef.current) {
      // Get the actual rendered width of an item
      const itemElement = scrollerRef.current?.firstElementChild;
      if (itemElement) {
        const itemStyle = window.getComputedStyle(itemElement);
        const itemWidth = itemElement.clientWidth;
        const gap =
          parseInt(itemStyle.marginRight) || parseInt(itemStyle.gap) || 16;
        itemWidthRef.current = itemWidth + gap;
      }
    }
  }, [items]);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        // Loop back to first item after reaching the end
        return (prev + 1) % items.length;
      });
    }, autoPlayInterval);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, autoPlayInterval, items.length]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(currentIndex);
    // Pause autoplay when user interacts
    if (autoPlay) {
      setIsAutoPlaying(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - (containerRef.current?.offsetLeft || 0));
    setScrollLeft(currentIndex);
    // Pause autoplay when user interacts
    if (autoPlay) {
      setIsAutoPlaying(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (containerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2; // Scroll-fast factor
    const newIndex = scrollLeft - walk / itemWidthRef.current;
    setCurrentIndex(Math.max(0, Math.min(items.length - 1, newIndex)));
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - (containerRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2; // Scroll-fast factor
    const newIndex = scrollLeft - walk / itemWidthRef.current;
    setCurrentIndex(Math.max(0, Math.min(items.length - 1, newIndex)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Resume autoplay after user interaction if it was enabled
    if (autoPlay && pauseOnHover) {
      setTimeout(() => setIsAutoPlaying(true), 1000);
    }
  };

  const moveSlide = (dir: "prev" | "next") => {
    // Pause autoplay when user interacts
    if (autoPlay) {
      setIsAutoPlaying(false);
      // Resume autoplay after user interaction if it was enabled
      if (pauseOnHover) {
        setTimeout(() => setIsAutoPlaying(true), autoPlayInterval);
      }
    }

    setCurrentIndex((prev) => {
      if (dir === "prev") {
        // Loop to last item when at the beginning
        return prev === 0 ? items.length - 1 : prev - 1;
      } else {
        // Loop to first item when at the end
        return (prev + 1) % items.length;
      }
    });
  };

  // Update position when currentIndex changes
  useEffect(() => {
    if (scrollerRef.current) {
      const newPosition = -currentIndex * itemWidthRef.current;
      scrollerRef.current.style.transform = `translateX(${newPosition}px)`;
      scrollerRef.current.style.transition =
        "transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)";
    }
  }, [currentIndex]);

  // Duplicate items for infinite effect
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
  }, [items]);

  return (
    <div
      ref={containerRef}
      className={`scroller group relative z-20 max-w-8xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_1%,white_99%,transparent)] ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
      onMouseEnter={
        pauseOnHover && autoPlay ? () => setIsAutoPlaying(false) : undefined
      }
      onMouseLeave={
        pauseOnHover && autoPlay ? () => setIsAutoPlaying(true) : undefined
      }
    >
      {/* Navigation Buttons - Show on all devices */}
      <button
        className="absolute left-2 top-1/2 transform -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-300 opacity-100 group-hover:opacity-100 focus:opacity-100 md:opacity-0"
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
        className="absolute right-2 top-1/2 transform -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-300 opacity-100 group-hover:opacity-100 focus:opacity-100 md:opacity-0"
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
        className={`flex min-w-full shrink-0 gap-8 md:gap-4  py-4 w-max flex-nowrap`}
      >
        {items.map((item) => (
          <li
            key={item.id}
            className="w-[240px] md:w-[230px] max-w-full relative rounded-2xl border border-b-2 border-white/30 h-[400px] md:h-[380px] flex-shrink-0 bg-white/10 backdrop-blur-lg shadow-lg overflow-hidden"
          >
            <div className="relative w-full h-full ">
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
