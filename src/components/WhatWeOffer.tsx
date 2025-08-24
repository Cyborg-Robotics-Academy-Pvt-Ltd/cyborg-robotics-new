"use client"; // Use client-side rendering for interactivity

import { LucideArrowLeft, LucideArrowRight } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  FaBook,
  FaLaptopCode,
  FaClock,
  FaChalkboardTeacher,
  FaCertificate,
} from "react-icons/fa";

const offerings = [
  {
    icon: <FaClock size={24} className="mx-auto" />,
    title: "Free Trial",
    description: "Experience our courses with a free trial.",
  },
  {
    icon: <FaBook className="mx-auto" size={24} color="" />,
    title: "Comprehensive Courses",
    description: "Access a wide range of courses designed by experts.",
  },
  {
    icon: <FaLaptopCode size={24} className="mx-auto" />,
    title: "Interactive Learning",
    description: "Engage with quizzes and hands-on projects.",
  },
  {
    icon: <FaClock size={24} className="mx-auto" />,
    title: "Flexible Scheduling",
    description: "Learn at your own pace with flexible scheduling.",
  },
  {
    icon: <FaChalkboardTeacher size={24} className="mx-auto" />,
    title: "Expert Instructors",
    description: "Learn from industry professionals.",
  },

  {
    icon: <FaCertificate size={24} className="mx-auto" />,
    title: "Provide Certificate",
    description:
      "Receive a certificate upon course completion to enhance your career prospects.",
  },
];

export default function WhatWeOffer() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);

  // Determine slides to show based on screen size
  const slidesToShow = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 1024) return 3; // Desktop
      if (window.innerWidth >= 640) return 2; // Tablet
      return 1; // Mobile
    }
    return 3; // Default for SSR
  };

  const totalSlides = offerings.length;
  const visibleSlides = slidesToShow();

  // Handle next slide
  const nextSlide = useCallback(() => {
    if (currentSlide < totalSlides - visibleSlides) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      setCurrentSlide(0); // Loop back to start
    }
  }, [currentSlide, totalSlides, visibleSlides]);

  // Handle previous slide
  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    } else {
      setCurrentSlide(totalSlides - visibleSlides); // Loop to end
    }
  };

  // Go to specific slide via dots
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-slide effect
  useEffect(() => {
    const autoSlide = setInterval(() => {
      nextSlide(); // Automatically go to the next slide
    }, 3000); // Change slide every 3 seconds (adjust as needed)

    // Cleanup interval on component unmount
    return () => clearInterval(autoSlide);
  }, [currentSlide, totalSlides, visibleSlides, nextSlide]); // Added nextSlide to dependencies

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 text-center md:mt-6">
      <h2 className="text-2xl  md:text-3xl font-bold text-gray-900 mb-8">
        What <span className="text-red-800">We Offer ?</span>
      </h2>

      {/* Carousel Container */}
      <div className="relative max-w-6xl mx-auto">
        {/* Slides */}
        <div className="overflow-hidden">
          <div
            ref={sliderRef}
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${
                currentSlide * (100 / visibleSlides)
              }%)`,
            }}
          >
            {offerings.map((offer, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 p-4 mx-auto"
              >
                <div className="bg-white border border-gray-200 rounded-3xl shadow-md p-8 h-full">
                  <div className="text-4xl text-red-700 mb-4">{offer.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {offer.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{offer.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] text-white  text-sm font-semibold uppercase tracking-wide hover:scale-105 hover:shadow-xl transition-all hidden sm:block -left-3 lg:-left-10 top-1/2 transform -translate-y-1/2  p-2 rounded-full shadow-lg"
        >
          <LucideArrowLeft /> {/* Left arrow icon */}
        </button>
        <button
          onClick={nextSlide}
          className="absolute bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] text-white  text-sm font-semibold uppercase tracking-wide hover:scale-105 hover:shadow-xl transition-all hidden sm:block -right-2 lg:-right-10 top-1/2 transform -translate-y-1/2  p-2 rounded-full shadow-lg"
        >
          <LucideArrowRight /> {/* Right arrow icon */}
        </button>

        {/* Dots */}
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: totalSlides - visibleSlides + 1 }).map(
            (_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full ${
                  currentSlide === index ? "bg-red-700" : "bg-gray-300"
                }`}
              />
            )
          )}
        </div>
      </div>
    </section>
  );
}
