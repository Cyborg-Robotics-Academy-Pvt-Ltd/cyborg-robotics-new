"use client";
import React, { memo, useState, useEffect } from "react";
import Image from "next/image";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Star } from "lucide-react";

const FeedBack = memo(() => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex >= testimonials.length - cardsPerView() ? 0 : prevIndex + 1
      );
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  const cardsPerView = () => {
    if (typeof window === "undefined") return 3; // Default for SSR
    return window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3;
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex >= testimonials.length - cardsPerView() ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex <= 0 ? testimonials.length - cardsPerView() : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="flex flex-col items-center mx-4 sm:mx-8 antialiased bg-white mt-6 py-2 relative">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold py-4 text-center mb-4 md:mb-10">
        What <span className="text-red-800">our parents</span> have to say!
      </h1>

      <div className="relative w-full max-w-6xl mx-auto px-2 sm:px-4">
        <div className="relative h-[200px] sm:h-[280px] overflow-hidden rounded-xl ">
          <div
            className="flex transition-transform duration-500 ease-in-out h-full"
            style={{
              transform: `translateX(-${currentIndex * (100 / cardsPerView())}%)`,
            }}
          >
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="flex-shrink-0 px-2 w-full h-[270px]  sm:w-1/2 lg:w-1/3"
              >
                <div className="flex flex-col items-center justify-center h-full p-4    text-center bg-white rounded-2xl shadow-lg relative">
                  {/* Google logo in top-right corner */}
                  <div className="absolute top-3 right-3 w-8 h-8 sm:w-12 sm:h-12">
                    <Image
                      src="/assets/social-icons/google.png"
                      alt="Google logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-3 rounded-full overflow-hidden">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex mb-2">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className="text-yellow-400 text-lg sm:text-xl"
                      >
                        <Star fill="#facc15" size={20} />
                      </span>
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm mb-2 italic line-clamp-3">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <p className="font-bold text-xs sm:text-sm text-red-800">
                    {testimonial.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute -left-3 bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] text-white  shadow-lg text-sm font-semibold uppercase tracking-wide hover:scale-105 hover:shadow-xl transition-all sm:-left-10 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 sm:p-2 rounded-full "
          aria-label="Previous slide"
        >
          <FaChevronLeft className="text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] text-white  shadow-lg text-sm font-semibold uppercase tracking-wide hover:scale-105 hover:shadow-xl transition-all -right-3 sm:-right-10 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-1 sm:p-2 rounded-full "
          aria-label="Next slide"
        >
          <FaChevronRight className="text-white" />
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center mt-6 sm:mt-8 gap-2 sm:gap-3">
        {[...Array(testimonials.length - (cardsPerView() - 1))].map(
          (_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-red-800 w-6 sm:w-8"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          )
        )}
      </div>
    </div>
  );
});

FeedBack.displayName = "FeedBack";

export default FeedBack;

const testimonials = [
  {
    quote:
      "Cyborg Robotics has introduced my son to engineering and robotics in an engaging way. The team is knowledgeable, passionateand patient.",
    name: "Pranoti Thakur",
    image: "/assets/parents/t1.jpg",
    rating: 5,
  },
  {
    quote:
      "Though Divit my son had an idea and knew the basics of Lego but coming to cyborg his robotics skills got enhanced and his knowledge towards AI increased. His future plans of becoming a Robotic Engineer are taking shape and this is all thanks to Team Cyborg",
    name: "Sarika Gemawat",
    image: "/assets/parents/t2.jpeg",
    rating: 5,
  },
  {
    quote:
      "Ira loves her robotics classes and never wants to miss a session. Cyborg makes STEM learning exciting and fun for young kids.",
    name: "DR.Smita",
    image: "/assets/parents/t4.jpg",
    rating: 5,
  },
  {
    quote:
      "Aaryan enjoys his robotics sessions and is progressing well in assembling and programming. Mrs. Shikha is an excellent and patient teacher.",
    name: "Indrani Ghosh Choudhary",
    image: "/assets/parents/t5.jpg",
    rating: 5,
  },
  {
    quote:
      "My kids love Cyborg's robotics classes! The instructors make learning fun by relating concepts to real life, ensuring better understanding and retention.",
    name: "Jisha Alex",
    image: "/assets/parents/t3.jpeg",
    rating: 5,
  },
];
