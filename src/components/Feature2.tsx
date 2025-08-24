"use client";
import React, { useMemo } from "react";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

const Feature2: React.FC = React.memo(() => {
  const testimonials = useMemo(
    () => [
      {
        quote:
          "Exploring robotics has been a journey of creativity and innovation. It has allowed me to merge imagination with technology, bringing ideas to life through hands-on projects. The creative experience of building and programming robots has deepened my understanding of engineering and design, fostering a mindset of continuous innovation.",
        src: "/assets/creative1.png",
      },
      {
        quote:
          "Robotics education has never been this simple and engaging. The structured and simplified teaching approach has made complex concepts easy to grasp, allowing me to learn efficiently. Breaking down robotics into step-by-step lessons has helped me build a strong foundation in programming, electronicsand mechanics without feeling overwhelmed.",
        src: "/assets/simplified.png",
      },
      {
        quote:
          "Staying ahead with the latest technology in robotics has given me a competitive edge. From AI-driven automation to advanced machine learning applications, robotics has introduced me to cutting-edge tools that are shaping the future. Learning to integrate modern technology into real-world applications has been an invaluable experience.",
        src: "/assets/latest.png",
      },
      {
        quote:
          "The futuristic potential of robotics is limitless. It has given me a glimpse into a world where AI-powered machines work alongside humans, revolutionizing industries. The ability to design and develop intelligent robotic systems has prepared me for the technological advancements of tomorrow, ensuring I stay at the forefront of innovation.",
        src: "/assets/futuristic.png",
      },
    ],
    []
  );

  return (
    <div className="bg-white text-black md:my-8">
      <h1 className="text-center font-bold text-2xl  md:text-3xl mt-4 ">
        Why {""}
        <span className="text-[#8D0F11]">Learn Robotics ?</span>
      </h1>
      <AnimatedTestimonials testimonials={testimonials} />
    </div>
  );
});
// Set the display name for the component
Feature2.displayName = "Features2";
export default Feature2;
