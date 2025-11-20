"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";

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
  const [isMobile, setIsMobile] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoSlideInterval = useRef<NodeJS.Timeout | null>(null);

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(typeof window !== "undefined" && window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  // Auto-slide functionality for mobile
  useEffect(() => {
    if (isMobile) {
      autoSlideInterval.current = setInterval(() => {
        if (!isPaused) {
          setCurrentIndex((prev) =>
            prev === awards.length - 1 ? 0 : prev + 1
          );
        }
      }, 3000); // 3 seconds interval
    }

    return () => {
      if (autoSlideInterval.current) {
        clearInterval(autoSlideInterval.current);
      }
    };
  }, [isMobile, isPaused, awards.length]);

  useEffect(() => {
    if (!isMobile) {
      addAnimation();
    }
  }, [isMobile]);

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

  // Pause auto-slide on hover or touch
  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsPaused(false);
    }
  };

  const handleTouchStart = () => {
    setIsPaused(true);
  };

  const handleTouchEnd = () => {
    // Resume auto-slide after a delay
    setTimeout(() => {
      setIsPaused(false);
    }, 3000);
  };

  // Navigation functions for buttons
  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? awards.length - 1 : prev - 1));
    // Pause auto-slide when user interacts
    setIsPaused(true);
    // Resume after delay
    setTimeout(() => {
      setIsPaused(false);
    }, 3000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === awards.length - 1 ? 0 : prev + 1));
    // Pause auto-slide when user interacts
    setIsPaused(true);
    // Resume after delay
    setTimeout(() => {
      setIsPaused(false);
    }, 3000);
  };

  // Mouse event handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMobile) return;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobile) return;
  };

  const handleMouseUp = () => {
    if (isMobile) return;
  };

  return (
    <div className="relative">
      {/* Navigation Buttons - Only show on mobile */}
      {isMobile && (
        <>
          <button
            onClick={goToPrev}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-300 focus:outline-none"
            aria-label="Previous award"
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
            onClick={goToNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-300 focus:outline-none"
            aria-label="Next award"
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
        </>
      )}

      <div
        ref={containerRef}
        className={cn(
          "scroller relative z-20 w-full overflow-hidden bg-white",
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Desktop - Infinite scroll */}
        {!isMobile ? (
          <ul
            ref={scrollerRef}
            className={cn(
              "flex w-max min-w-full shrink-0 flex-nowrap gap-4 py-5 px-4",
              start && "animate-scroll",
              pauseOnHover && isPaused && "[animation-play-state:paused]"
            )}
            style={{
              animationPlayState: isPaused ? "paused" : "running",
            }}
          >
            {awards.map((award) => (
              <li
                key={award.id}
                className="relative w-[320px] h-64 max-w-full shrink-0 rounded-2xl transition-all duration-500 ease-in-out hover:scale-110 hover:z-10"
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
        ) : (
          // Mobile - Single item with navigation
          <div className="flex w-full min-w-full shrink-0 flex-nowrap py-5 px-4 justify-center">
            {awards.length > 0 && (
              <div
                key={awards[currentIndex].id}
                className="relative w-[320px] h-64 max-w-full shrink-0 rounded-2xl transition-all duration-500 ease-in-out"
              >
                <Image
                  src={awards[currentIndex].image}
                  alt={awards[currentIndex].title}
                  width={170}
                  height={170}
                  className="mx-auto mb-4 h-44 w-48 rounded-lg object-contain transition-all duration-500 ease-in-out"
                />
                <p className="text-base font-medium text-black text-center px-3 transition-all duration-300 ease-in-out">
                  {awards[currentIndex].title}
                </p>

                {/* Pagination dots - Fixed to show all dots properly */}
                <div className="flex justify-center mt-4 space-x-2 flex-wrap">
                  {awards.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={cn(
                        "w-3 h-3 rounded-full transition-all duration-300 flex-shrink-0",
                        index === currentIndex
                          ? "bg-red-800 scale-125"
                          : "bg-gray-300 hover:bg-gray-400"
                      )}
                      aria-label={`Go to award ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Counter text */}
                <div className="text-center text-sm text-gray-500 mt-2">
                  {currentIndex + 1} of {awards.length}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
