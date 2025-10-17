"use client";
import React from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";

const GallerySection = () => {
  const cards = data.map((card, index) => (
    <Card key={card.id} card={card} index={index} />
  ));

  return (
    <div className="w-full h-full  md:mt-4">
      <h1 className="text-center font-bold text-2xl md:text-3xl    ">
        Celebrating <span className="gradient-text">Learning</span>
      </h1>
      <p className="text-center text-sm md:text-base text-gray-600 mt-2">
        Explore moments from our programs and events
      </p>
      <Carousel items={cards} />
    </div>
  );
};

const data = [
  {
    id: "1",
    src: "/assets/gallery/gallery (81).jpg",
  },

  {
    id: "2",
    src: "/assets/gallery/gallery (81).jpg",
  },
  {
    id: "3",
    src: "/assets/gallery/gallery (67).JPG",
  },
  {
    id: "4",
    src: "/assets/gallery/gallery (81).jpg",
  },
];

export default GallerySection;
