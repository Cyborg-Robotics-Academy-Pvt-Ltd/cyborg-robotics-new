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
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Convert children to array for easier manipulation
  const items = React.Children.toArray(children);
  const totalItems = items.length;

  // Calculate how many items we can show based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        if (window.innerWidth < 480) {
          setItemsPerView(1); // Mobile portrait
        } else if (window.innerWidth < 768) {
          setItemsPerView(1); // Mobile landscape / small tablets
        } else if (window.innerWidth < 1024) {
          setItemsPerView(2); // Tablets
        } else if (window.innerWidth < 1280) {
          setItemsPerView(5); // Laptop
        } else {
          setItemsPerView(4); // Desktop and above
        }
      }
    };

    // Initial call to set the correct itemsPerView
    handleResize();

    // Only attach event listener if window is defined (client-side)
    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDragOffset(0);

    setCurrentIndex((prevIndex) => {
      const maxIndex = totalItems - itemsPerView;
      return prevIndex >= maxIndex ? 0 : prevIndex + 1;
    });

    setTimeout(() => setIsAnimating(false), 300);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setDragOffset(0);

    setCurrentIndex((prevIndex) => {
      const maxIndex = totalItems - itemsPerView;
      return prevIndex === 0 ? maxIndex : prevIndex - 1;
    });

    setTimeout(() => setIsAnimating(false), 300);
  };

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isAnimating) return;
    setTouchStart(e.targetTouches[0].clientX);
    setDragOffset(0);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || isAnimating) return;

    const currentX = e.targetTouches[0].clientX;
    const diff = touchStart - currentX;
    setDragOffset(diff);

    // Prevent default scrolling during drag
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    if (!touchStart || isAnimating) return;

    setIsDragging(false);
    const distance = touchStart - touchEnd;
    // Fixed: Right swipe should go to next card (move left = negative direction)
    const isRightSwipe = distance > 40; // Swiping finger right -> show next card
    const isLeftSwipe = distance < -40; // Swiping finger left -> show previous card

    if (isRightSwipe && !isAtEnd) {
      nextSlide(); // Right swipe shows next card
    } else if (isLeftSwipe && !isAtStart) {
      prevSlide(); // Left swipe shows previous card
    } else {
      // Snap back to current position if swipe wasn't significant
      setDragOffset(0);
    }

    // Reset touch positions
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Mouse drag handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isAnimating) return;
    setTouchStart(e.clientX);
    setDragOffset(0);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!touchStart || isAnimating) return;

    const diff = touchStart - e.clientX;
    setDragOffset(diff);
    e.preventDefault();
  };

  const handleMouseUp = () => {
    if (!touchStart || isAnimating) return;

    setIsDragging(false);
    // Fixed: Positive drag (right) should go to next card
    const isRightSwipe = dragOffset > 40; // Dragging mouse right -> show next card
    const isLeftSwipe = dragOffset < -40; // Dragging mouse left -> show previous card

    if (isRightSwipe && !isAtEnd) {
      nextSlide(); // Right drag shows next card
    } else if (isLeftSwipe && !isAtStart) {
      prevSlide(); // Left drag shows previous card
    } else {
      // Snap back to current position if drag wasn't significant
      setDragOffset(0);
    }

    // Reset
    setTouchStart(0);
    setDragOffset(0);
  };

  const handleMouseLeave = () => {
    if (isDragging && !isAnimating) {
      // If leaving while dragging, snap back
      setIsDragging(false);
      setDragOffset(0);
      setTouchStart(0);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      e.stopPropagation();
      prevSlide();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      e.stopPropagation();
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
    <div className="mb-8">
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
                className="bg-white rounded-full p-3 shadow-lg hover:bg-red-50 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-300 group flex items-center justify-center min-w-[44px] min-h-[44px] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 active:scale-95"
                aria-label="Previous courses"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors duration-300" />
              </button>
              <button
                onClick={nextSlide}
                disabled={isAtEnd}
                className="bg-white rounded-full p-3 shadow-lg hover:bg-red-50 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white transition-all duration-300 group flex items-center justify-center min-w-[44px] min-h-[44px] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 active:scale-95"
                aria-label="Next courses"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors duration-300" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Carousel container */}
      <div
        className="relative focus:outline-none"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
        aria-label="Course carousel"
      >
        <div
          className="overflow-hidden"
          ref={carouselRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{ userSelect: "none" }}
        >
          <div
            className={`flex transition-transform gap-1 sm:gap-2 md:gap-3 ${
              isDragging
                ? "duration-150 ease-out"
                : isAnimating
                  ? "duration-300 ease-in-out"
                  : "duration-200 ease-out"
            }`}
            style={{
              transform: `translateX(calc(-${currentIndex * (100 / itemsPerView)}% - ${dragOffset / (itemsPerView * 8)}px))`,
              willChange: isDragging ? "transform" : "auto",
            }}
          >
            {items.map((item, index) => (
              <div
                key={index}
                className={`flex-shrink-0 transition-all ${
                  isDragging ? "duration-150" : "duration-200"
                } ${isDragging ? "scale-[0.99] opacity-95" : "scale-100 opacity-100"}`}
                style={{
                  width:
                    itemsPerView === 1
                      ? "90%" // Show partial next card on mobile
                      : typeof window !== "undefined"
                        ? `calc(${90 / itemsPerView}% - ${((itemsPerView - 1) * (window.innerWidth < 768 ? 6 : window.innerWidth < 1024 ? 10 : 14)) / itemsPerView}px)`
                        : `calc(${90 / itemsPerView}% - ${((itemsPerView - 1) * 10) / itemsPerView}px)`,
                }}
              >
                {item}
              </div>
            ))}
            {/* Spacer to show partial next card */}
            <div className="flex-shrink-0" style={{ width: "10%" }}></div>
          </div>
        </div>

        {/* Mobile navigation arrows overlay */}
        {showNavigation && (
          <div className="sm:hidden">
            {!isAtStart && (
              <button
                onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm rounded-full p-3 shadow-xl hover:bg-white active:scale-95 transition-all duration-300 z-10 flex items-center justify-center min-w-[44px] min-h-[44px] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                aria-label="Previous courses"
              >
                <ChevronLeft className="w-5 h-5 text-gray-800 transition-colors duration-300" />
              </button>
            )}
            {!isAtEnd && (
              <button
                onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/95 backdrop-blur-sm rounded-full p-3 shadow-xl hover:bg-white active:scale-95 transition-all duration-300 z-10 flex items-center justify-center min-w-[44px] min-h-[44px] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                aria-label="Next courses"
              >
                <ChevronRight className="w-5 h-5 text-gray-800 transition-colors duration-300" />
              </button>
            )}
          </div>
        )}
      </div>

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
