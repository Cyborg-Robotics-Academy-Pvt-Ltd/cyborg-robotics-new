import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const Students = () => {
  const studentTestimonials = [
    {
      name: "Shivaan Sharma",
      course: "Drone",
      quote:
        "The drone classes are fun! I learned how drones move, how motors and flight controllers work, and how forces like lift help them fly safely.",
      mentor: "Mahvish Fatima",
      image: "/assets/testimonials/students/ShivaanSharma.jpeg",
    },
    {
      name: "Arjun Anupkumar",
      course: "Drone",
      quote:
        "I really enjoy drone classes! I learned how the flight controller, motors, and propellers work together to make drones fly.",
      mentor: "Mahvish Fatima",
      image: "/assets/testimonials/students/ArjunAnoopkumar.jpeg",
    },
    {
      name: "Adish Bejgamwar",
      course: "3D + Arduino",
      quote:
        "Through the 3D + Arduino course, I learned programming, creative design, and how to use components in new ways to solve problems.",
      mentor: "Anchal Mishra and Nilesh Jaiswar",
      image: "/assets/testimonials/students/ADISHBEJGAMWAR.jpg",
    },
    {
      name: "Mihika Bole",
      course: "Arduino",
      quote:
        "Arduino was so much fun! I learned to connect LEDs, motors, and sensors, and write programs to bring my projects to life.",
      mentor: "Anchal Mishra",
      image: "/assets/testimonials/students/MIHIKABOLE.jpg",
    },
    {
      name: "Renea Ovelker",
      course: "3D Designing and Printing",
      quote:
        "3D Designing was amazing! I learned to make functional models in Tinkercad and turn creative ideas into real designs.",
      mentor: "Nilesh Jaiswar",
      image: "/assets/testimonials/students/RENEAOVELKER.jpg",
    },
    {
      name: "Sudarshan Joshi",
      course: "3D Designing and Printing",
      quote:
        "I built robots with 3D Printing and Arduino! Learned coding, design, and sensors—turning my ideas into real working models.",
      mentor: "Anchal Mishra and Nilesh Jaiswar",
      image: "/assets/testimonials/students/SUDARSHANJOSHI.jpg",
    },
    {
      name: "Moksh Garg",
      course: "3D Designing and Printing",
      quote:
        "I loved 3D designing! I created my own models and felt proud to see my ideas come to life.",
      mentor: "Nilesh Jaiswar",
      image: "/assets/testimonials/students/MOKSHGARG.jpg",
    },
    {
      name: "Viaan Petti",
      course: "3D Designing and Printing",
      quote:
        "3D designing was so interesting! I learned how to make creative models and solve small design problems confidently.",
      mentor: "Anchal Mishra",
      image: "/assets/testimonials/students/VIAANPETTI.jpg",
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

  const { quote, name, image, course, mentor } =
    studentTestimonials[currentIndex];

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
              <p className="italic text-left text-xs sm:text-sm text-gray-700 line-clamp-5">
                &quot;{quote}&quot;
              </p>
              <div className="text-gray-500 text-left mt-3 text-xs sm:text-sm">
                <p>{course}</p>
                <p className="mt-1 text-red-800 font-medium">
                  Mentor: {mentor}
                </p>
              </div>
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
              (index === currentIndex ? "w-4 bg-red-800" : "w-2 bg-gray-300")
            }
          />
        ))}
      </div>
    </motion.div>
  );
};

export default Students;
