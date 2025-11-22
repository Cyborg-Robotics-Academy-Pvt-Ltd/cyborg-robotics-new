"use client";
import React from "react";
import { InfiniteMovingGallery } from "@/components/gallery/InfiniteMovingGallery";

const GallerySection = () => {
  const data = [
    {
      id: "1",
      src: "/assets/moments/IMG_2472.PNG",
    },
    {
      id: "2",
      src: "/assets/moments/wsro_national.png",
    },
    {
      id: "3",
      src: "/assets/moments/IMG_2470.PNG",
    },
    {
      id: "4",
      src: "/assets/moments/IMG_2467.PNG",
    },
    {
      id: "5",
      src: "/assets/moments/IMG_2468.PNG",
    },
    {
      id: "6",
      src: "/assets/moments/IMG_2471.PNG",
    },
  ];

  return (
    <div className="w-full h-full mt-4 md:mt-12">
      <h1 className="text-center font-bold text-2xl md:text-3xl">
        Celebrating <span className="gradient-text">Learning</span>
      </h1>
      <div className="flex items-center justify-center gap-1 my-3">
        <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-[#8D0F11]/60 rounded-full"></div>
        <div className="w-16 h-0.5 bg-gradient-to-r from-[#8D0F11]/60 to-[#8D0F11] rounded-full"></div>
        <div className="w-8 h-0.5 bg-gradient-to-r from-[#8D0F11] to-transparent rounded-full"></div>
      </div>
      <p className="text-center text-sm md:text-base text-gray-600 mt-1">
        Explore moments from our programs and events
      </p>

      <div className="mx-6 md:mx-0">
        <InfiniteMovingGallery items={data} speed="normal" className="" />
      </div>
    </div>
  );
};

export default GallerySection;
