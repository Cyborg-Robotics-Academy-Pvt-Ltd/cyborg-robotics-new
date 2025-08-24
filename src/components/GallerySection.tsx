"use client";
import React from "react";
import { Carousel, Card } from "@/components/ui/apple-cards-carousel";

const GallerySection = () => {
  const cards = data.map((card, index) => (
    <Card key={card.id} card={card} index={index} />
  ));

  return (
    <div className="w-full h-full pt-10 md:mt-4">
      <h1 className="text-center font-bold text-2xl md:text-3xl    ">
        Our <span className="text-[#8D0F11]">Gallery</span>
      </h1>
      <Carousel items={cards} />
    </div>
  );
};

const data = [
  {
    id: "1",
    src: "/assets/gallery/gallery (37).jpg",
  },

  {
    id: "2",
    src: "/assets/gallery/gallery (61).jpg",
  },
  {
    id: "3",
    src: "/assets/gallery/gallery (67).JPG",
  },
  {
    id: "4",
    src: "/assets/gallery/gallery (43).jpg",
  },
];

export default GallerySection;
