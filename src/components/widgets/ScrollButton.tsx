"use client";
import React, { useState, useEffect } from "react";

const ScrollButton = () => {
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrolled = (scrollPosition / windowHeight) * 100;
      setScrollPercent(scrolled);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleButtonClick = () => {
    if (scrollPercent >= 90) {
      // Scroll to the top when the button is clicked and scrollPercent is 90% or more
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Scroll to the bottom when the button is clicked and scrollPercent is less than 90%
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <button
      onClick={handleButtonClick}
      className="fixed z-50 bottom-20 md:bottom-4 md:right-14 right-8 rounded-full bg-white p-2 shadow-lg flex items-center justify-center"
      style={{
        width: "60px",
        height: "60px",
        position: "fixed",
      }}
    >
      <svg
        className="absolute top-0 left-0"
        width="60"
        height="60"
        viewBox="0 0 60 60"
      >
        <circle
          cx="30"
          cy="30"
          r="28"
          stroke="#991B1B"
          strokeWidth="4"
          fill="none"
          style={{
            strokeDasharray: 176,
            strokeDashoffset: 176 - (176 * scrollPercent) / 100,
            transform: "rotate(-90deg)",
            transformOrigin: "center",
          }}
        />
      </svg>
      <div
        className="flex items-center justify-center rounded-full bg-red-800"
        style={{ width: "100%", height: "100%" }}
      >
        {scrollPercent >= 90 ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white relative"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white relative"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </div>
    </button>
  );
};

export default ScrollButton;
