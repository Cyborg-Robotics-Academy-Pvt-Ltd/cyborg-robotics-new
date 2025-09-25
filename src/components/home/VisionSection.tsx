"use client";
import React from "react";
import Image from "next/image";

const VisionSection = () => {
  return (
    <div className="relative w-full h-[25vh]  md:h-[50vh] lg:h-[100vh]">
      <Image
        src="/assets/visionmission.png"
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
