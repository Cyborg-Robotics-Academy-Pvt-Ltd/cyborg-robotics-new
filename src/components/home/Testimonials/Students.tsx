import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const Students = () => {
  const studentTestimonials = [
    {
      quote:
        "I built my first robot at Cyborg and now I want to become a robotics engineer!",
      name: "Aarav S.",
      image: "/assets/parents/t1.jpg",
      rating: 5,
      course: "Robotics Basics",
    },
    {
      quote: "The classes are so much fun and I learned to code my own games!",
      name: "Meera K.",
      image: "/assets/parents/t2.jpeg",
      rating: 5,
      course: "Game Coding",
    },
    {
      quote: "I love the competitions and working with my friends on projects.",
      name: "Rohan P.",
      image: "/assets/parents/t3.jpeg",
      rating: 5,
      course: "Robotics Competition",
    },
    {
      quote: "The teachers explain everything so well. I never get bored!",
      name: "Simran D.",
      image: "/assets/parents/t4.jpg",
      rating: 5,
      course: "STEM Explorer",
    },
    {
      quote:
        "I made a smart car and showed it to my family. They were so proud!",
      name: "Kabir T.",
      image: "/assets/parents/t5.jpg",
      rating: 5,
      course: "Smart Car Project",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === studentTestimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [studentTestimonials.length]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? studentTestimonials.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === studentTestimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const { quote, name, image, course } = studentTestimonials[currentIndex];

  // Touch swipe handlers for mobile
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndXRef.current = null;
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null)
      return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const swipeThreshold = 40; // px
    if (distance > swipeThreshold) handleNext();
    if (distance < -swipeThreshold) handlePrev();
  };

  const handleKeyNav = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") handlePrev();
    if (event.key === "ArrowRight") handleNext();
  };

  return (
    <motion.div
      className="w-full flex flex-col items-center"
      initial={{ opacity: 0, x: 60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: "tween", duration: 1.2, ease: "easeOut" }}
    >
      <h2 className="mb-3">
        <span className="text-2xl font-bold gradient-text ">From Our</span>
        <span className="text-2xl font-bold text-black"> Learners</span>
      </h2>
      <p className="-mt-2 mb-4 text-sm sm:text-base text-gray-600 text-center">
        Real experiences from students in our programs
      </p>

      <div
        className="relative w-full flex items-center justify-center"
        onKeyDown={handleKeyNav}
        role="region"
        aria-roledescription="carousel"
        aria-label="Student stories"
        tabIndex={0}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Left Button */}
        <button
          onClick={handlePrev}
          className="hidden sm:flex relative z-10 w-12 h-10 rounded-full bg-red-900 text-white shadow-lg items-center justify-center text-xl mr-2 sm:mr-4 hover:bg-red-800 hover:shadow-xl active:scale-95 transition focus:outline-none"
          aria-label="Previous testimonial"
        >
          &lt;
        </button>

        {/* Testimonial Card without Glowing Effect */}
        <div className="relative">
          <div
            className="group relative bg-white/70 backdrop-blur rounded-2xl shadow-lg border border-white/40 
            px-4 py-6 sm:px-6 sm:py-6 md:px-8 md:py-8
            w-full max-w-[280px] sm:max-w-[420px] md:max-w-[520px]
            flex flex-row items-center justify-center transition-transform duration-300 ease-out hover:-translate-y-1"
          >
            <div className="absolute inset-0 -z-10 rounded-2xl  " />
            <Image
              src={image}
              alt={name}
              width={120}
              height={160}
              className="w-[84px] h-[112px] sm:w-[110px] sm:h-[150px] md:w-[130px] md:h-[170px]
                         rounded-2xl bg-[#f1f1f1] 
                         object-cover mr-4 sm:mr-6 shadow-md"
            />
            <div className="flex flex-col justify-center flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-red-900 text-left text-sm sm:text-base">
                  {name}
                </p>
              </div>
              <p className="italic text-left text-xs sm:text-sm text-gray-700 line-clamp-3">
                &quot;{quote}&quot;
              </p>
              <p className="text-gray-500 text-left mt-3 text-xs sm:text-sm">
                {course}
              </p>
            </div>
          </div>
        </div>

        {/* Right Button */}
        <button
          onClick={handleNext}
          className="hidden sm:flex relative z-10 w-12 h-10 rounded-full bg-red-900 text-white shadow-lg items-center justify-center text-xl ml-2 sm:ml-4 hover:bg-red-800 hover:shadow-xl active:scale-95 transition focus:outline-none"
          aria-label="Next testimonial"
        >
          &gt;
        </button>
      </div>

      {/* Dots */}
      <div className="mt-3 flex items-center gap-2" aria-hidden>
        {studentTestimonials.map((_, index) => (
          <span
            key={index}
            className={
              "h-1.5 rounded-full transition-all duration-300 " +
              (index === currentIndex ? "w-4 bg-red-600" : "w-2 bg-gray-300")
            }
          />
        ))}
      </div>
    </motion.div>
  );
};

export default Students;
