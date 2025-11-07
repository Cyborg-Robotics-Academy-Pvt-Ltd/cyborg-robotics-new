"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CourseCategoryCarouselProps {
  title: string;
  children: React.ReactNode;
}

const CourseCategoryCarousel: React.FC<CourseCategoryCarouselProps> = ({
  title,
  children,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);

  // Convert children to array for easier manipulation
  const items = React.Children.toArray(children);
  const totalItems = items.length;

  // Calculate how many items we can show based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2);
      } else {
        setItemsPerView(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + itemsPerView >= totalItems ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? Math.max(0, totalItems - itemsPerView) : prevIndex - 1
    );
  };

  // Calculate visible items
  const visibleItems = items.slice(currentIndex, currentIndex + itemsPerView);

  // Show navigation buttons only if there are more items than can be displayed
  const showNavigation = totalItems > itemsPerView;

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>

      <div className="relative">
        {showNavigation && (
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous courses"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
        )}

        <div className="overflow-hidden px-8">
          <div
            className="flex transition-transform duration-300 ease-in-out gap-6"
            style={{
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            }}
          >
            {items}
          </div>
        </div>

        {showNavigation && (
          <button
            onClick={nextSlide}
            disabled={currentIndex + itemsPerView >= totalItems}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next courses"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        )}
      </div>

      {/* Dots indicator */}
      {showNavigation && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: Math.ceil(totalItems / itemsPerView) }).map(
            (_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * itemsPerView)}
                className={`w-3 h-3 rounded-full ${
                  Math.floor(currentIndex / itemsPerView) === index
                    ? "bg-blue-600"
                    : "bg-gray-300"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            )
          )}
        </div>
      )}
    </div>
  );
};

export default CourseCategoryCarousel;
