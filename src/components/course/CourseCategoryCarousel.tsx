"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CourseCategoryCarouselProps {
  title: React.ReactNode;
  children: React.ReactNode;
}

const CourseCategoryCarousel: React.FC<CourseCategoryCarouselProps> = ({
  title,
  children,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Convert children to array for easier manipulation
  const items = React.Children.toArray(children);
  const totalItems = items.length;

  // Calculate how many items we can show based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 480) {
        setItemsPerView(1); // Mobile portrait
      } else if (window.innerWidth < 768) {
        setItemsPerView(1); // Mobile landscape / small tablets
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2); // Tablets
      } else if (window.innerWidth < 1280) {
        setItemsPerView(3); // Laptop
      } else if (window.innerWidth < 1536) {
        setItemsPerView(3); // Desktop
      } else {
        setItemsPerView(4); // Large desktop (2xl+)
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    setCurrentIndex((prevIndex) => {
      const maxIndex = totalItems - itemsPerView;
      return prevIndex >= maxIndex ? 0 : prevIndex + 1;
    });

    setTimeout(() => setIsAnimating(false), 300);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    setCurrentIndex((prevIndex) => {
      const maxIndex = totalItems - itemsPerView;
      return prevIndex === 0 ? maxIndex : prevIndex - 1;
    });

    setTimeout(() => setIsAnimating(false), 300);
  };

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50; // Minimum swipe distance
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }

    // Reset touch positions
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      prevSlide();
    } else if (e.key === "ArrowRight") {
      nextSlide();
    }
  };

  // Show navigation buttons only if there are more items than can be displayed
  const showNavigation = totalItems > itemsPerView;
  const maxIndex = totalItems - itemsPerView;
  const isAtStart = currentIndex === 0;
  const isAtEnd = currentIndex >= maxIndex;

  // Calculate total pages for dots
  const totalPages = Math.ceil(totalItems / itemsPerView);
  const currentPage = Math.floor(currentIndex / itemsPerView);

  return (
    <div className="mb-12">
      {/* Header with title and navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">
            {title}
          </h2>
        </div>

        {showNavigation && (
          <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
            {/* Desktop navigation buttons */}
            <div className="hidden sm:flex space-x-2">
              <button
                onClick={prevSlide}
                disabled={isAtStart}
                className="bg-white rounded-full p-1.5 md:p-2 shadow-md border border-gray-200 hover:bg-red-50 hover:border-red-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 transition-all duration-200 group"
                aria-label="Previous courses"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
              </button>
              <button
                onClick={nextSlide}
                disabled={isAtEnd}
                className="bg-white rounded-full p-1.5 md:p-2 shadow-md border border-gray-200 hover:bg-red-50 hover:border-red-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 transition-all duration-200 group"
                aria-label="Next courses"
              >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
              </button>
            </div>

            {/* Course counter */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full whitespace-nowrap">
              <span className="font-semibold text-gray-900">
                {currentIndex + 1}-
                {Math.min(currentIndex + itemsPerView, totalItems)}
              </span>
              <span>/</span>
              <span>{totalItems}</span>
            </div>
          </div>
        )}
      </div>

      {/* Carousel container */}
      <div
        className="relative"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
        aria-label="Course carousel"
      >
        <div
          className="overflow-hidden rounded-lg"
          ref={carouselRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex transition-transform duration-500 ease-out gap-3 sm:gap-4 md:gap-6"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            }}
          >
            {items.map((item, index) => (
              <div
                key={index}
                className="flex-shrink-0"
                style={{
                  width:
                    itemsPerView === 1
                      ? "100%"
                      : `calc(${100 / itemsPerView}% - ${((itemsPerView - 1) * (window.innerWidth < 768 ? 12 : window.innerWidth < 1024 ? 16 : 24)) / itemsPerView}px)`,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile navigation arrows overlay */}
        {showNavigation && (
          <div className="sm:hidden">
            {!isAtStart && (
              <button
                onClick={prevSlide}
                className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm rounded-full p-1.5 shadow-xl border border-gray-300 hover:bg-white active:scale-95 transition-all duration-200 z-10"
                aria-label="Previous courses"
              >
                <ChevronLeft className="w-4 h-4 text-gray-800" />
              </button>
            )}
            {!isAtEnd && (
              <button
                onClick={nextSlide}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm rounded-full p-1.5 shadow-xl border border-gray-300 hover:bg-white active:scale-95 transition-all duration-200 z-10"
                aria-label="Next courses"
              >
                <ChevronRight className="w-4 h-4 text-gray-800" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Enhanced dots indicator */}
      {showNavigation && totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 sm:mt-6 space-x-1.5 sm:space-x-2">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (!isAnimating) {
                  setIsAnimating(true);
                  setCurrentIndex(index * itemsPerView);
                  setTimeout(() => setIsAnimating(false), 300);
                }
              }}
              className={`transition-all duration-300 rounded-full ${
                currentPage === index
                  ? "bg-red-600 w-6 sm:w-8 h-2 sm:h-2.5 shadow-md"
                  : "bg-gray-300 w-2 sm:w-2.5 h-2 sm:h-2.5 hover:bg-gray-400 hover:w-3 sm:hover:w-4"
              }`}
              aria-label={`Go to page ${index + 1}`}
              aria-current={currentPage === index ? "true" : "false"}
            />
          ))}
        </div>
      )}

      {/* Progress bar (alternative to dots for many items) */}
      {showNavigation && totalPages > 8 && (
        <div className="mt-3 sm:mt-4 px-1 sm:px-2">
          <div className="h-0.5 sm:h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-600 rounded-full transition-all duration-300"
              style={{
                width: `${((currentIndex + itemsPerView) / totalItems) * 100}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCategoryCarousel;
