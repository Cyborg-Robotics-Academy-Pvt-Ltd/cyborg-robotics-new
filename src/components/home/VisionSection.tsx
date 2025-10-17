"use client";
import React from "react";
import Image from "next/image";

const VisionSection = () => {
  return (
    <div className="relative w-full h-[25vh] py-4  md:h-[50vh] lg:h-[100vh]">
      <Image
        src="https://res.cloudinary.com/dz8enfjtx/image/upload/v1760426287/Gemini_Generated_Image_xkjwcmxkjwcmxkjw_wots49.png"
        alt="Vision Image"
        fill
        quality={100}
        className="object-cover"
        priority
      />
    </div>
  );
};

export default VisionSection;
