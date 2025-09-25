"use client";
import React from "react";

const Carousel = () => {
  return (
    <div className="relative w-full overflow-hidden pt-8 sm:pt-10 md:pt-2 lg:pt-10 xl:pt-8 group">
      {/* Clean Video Background */}
      <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[700px] xl:h-[640px] 2xl:h-[650  px]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        >
          <source src="/assets/Hero.mov" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default Carousel;
