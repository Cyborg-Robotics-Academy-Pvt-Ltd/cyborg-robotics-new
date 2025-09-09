import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";

const Parents = () => {
  const parentTestimonials = [
    {
      quote:
        "Cyborg Robotics has introduced my son to engineering and robotics in an engaging way. The team is knowledgeable, passionateand patient.",
      name: "Pranoti Thakur",
      image: "/assets/parents/t1.jpg",
      rating: 5,
      course: "Robotics Basics",
    },
    {
      quote:
        "Though Divit my son had an idea and knew the basics of Lego but coming to cyborg his robotics skills got enhanced and his knowledge towards AI increased. His future plans of becoming a Robotic Engineer are taking shape and this is all thanks to Team Cyborg",
      name: "Sarika Gemawat",
      image: "/assets/parents/t2.jpeg",
      rating: 5,
      course: "AI for Kids",
    },
    {
      quote:
        "Ira loves her robotics classes and never wants to miss a session. Cyborg makes STEM learning exciting and fun for young kids.",
      name: "DR.Smita",
      image: "/assets/parents/t4.jpg",
      rating: 5,
      course: "STEM Explorer",
    },
    {
      quote:
        "Aaryan enjoys his robotics sessions and is progressing well in assembling and programming. Mrs. Shikha is an excellent and patient teacher.",
      name: "Indrani Ghosh Choudhary",
      image: "/assets/parents/t5.jpg",
      rating: 5,
      course: "Robotics Advanced",
    },
    {
      quote:
        "My kids love Cyborg's robotics classes! The instructors make learning fun by relating concepts to real life, ensuring better understanding and retention.",
      name: "Jisha Alex",
      image: "/assets/parents/t3.jpeg",
      rating: 5,
      course: "Creative Robotics",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === parentTestimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [parentTestimonials.length]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? parentTestimonials.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === parentTestimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const { quote, name, image, course } = parentTestimonials[currentIndex];

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
    <div className="w-full flex flex-col items-center">
      <h2 className="mb-3">
        <span className="text-2xl font-bold gradient-text">Parent</span>
        <span className="text-2xl font-bold text-black"> Stories</span>
      </h2>
      <p className="-mt-2 mb-4 text-sm sm:text-base text-gray-600 text-center">
        What parents say about our programs
      </p>

      <div
        className="relative w-full flex items-center justify-center"
        onKeyDown={handleKeyNav}
        role="region"
        aria-roledescription="carousel"
        aria-label="Parent stories"
        tabIndex={0}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Left Button */}
        <button
          onClick={handlePrev}
          className="hidden sm:flex relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-900 text-white shadow-lg items-center justify-center text-lg sm:text-2xl mr-2 sm:mr-4 hover:bg-red-800 hover:shadow-xl active:scale-95 transition focus:outline-none focus:ring-2 "
          aria-label="Previous testimonial"
        >
          &lt;
        </button>

        {/* Testimonial Card */}
        <div
          className="group relative bg-white/70 backdrop-blur rounded-2xl shadow-lg border border-white/40 
          px-4 py-6 sm:px-6 sm:py-6 md:px-8 md:py-8
          w-full max-w-[280px] sm:max-w-[420px] md:max-w-[520px]
          flex flex-row items-center justify-center transition-transform duration-300 ease-out hover:-translate-y-1"
        >
          <div className="absolute inset-0 -z-10 rounded-2xl " />
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

        {/* Right Button */}
        <button
          onClick={handleNext}
          className="hidden sm:flex relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-900 text-white shadow-lg items-center justify-center text-lg sm:text-2xl ml-2 sm:ml-4 hover:bg-red-800 hover:shadow-xl active:scale-95 transition focus:outline-none  "
          aria-label="Next testimonial"
        >
          &gt;
        </button>
      </div>

      {/* Dots */}
      <div className="mt-3 flex items-center gap-2" aria-hidden>
        {parentTestimonials.map((_, index) => (
          <span
            key={index}
            className={
              "h-1.5 rounded-full transition-all duration-300 " +
              (index === currentIndex ? "w-4 bg-red-600" : "w-2 bg-gray-300")
            }
          />
        ))}
      </div>
    </div>
  );
};

export default Parents;
