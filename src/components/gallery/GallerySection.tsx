"use client";
import React from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";

const GallerySection = () => {
  const cards = data.map((card, index) => (
    <Card key={card.id} card={card} index={index} />
  ));

  return (
    <div className="w-full h-full mt-4  md:mt-4">
      <h1 className="text-center font-bold text-2xl md:text-3xl    ">
        Celebrating <span className="gradient-text">Learning</span>
      </h1>
      <p className="text-center text-sm md:text-base text-gray-600 mt-1">
        Explore moments from our programs and events
      </p>
      <Carousel items={cards} />
    </div>
  );
};

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

export default GallerySection;
