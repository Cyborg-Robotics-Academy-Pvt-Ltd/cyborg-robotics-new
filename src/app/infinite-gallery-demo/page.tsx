"use client";

import React from "react";
import { InfiniteMovingGallery } from "@/components/gallery/InfiniteMovingGallery";

const InfiniteGalleryDemo = () => {
  const galleryItems = [
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Infinite Moving Gallery Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience our smooth infinite scrolling gallery component
          </p>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Left to Right Scrolling
          </h2>
          <InfiniteMovingGallery
            items={galleryItems}
            direction="left"
            speed="fast"
          />
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Right to Left Scrolling
          </h2>
          <InfiniteMovingGallery
            items={galleryItems}
            direction="right"
            speed="normal"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Implementation Details
          </h3>
          <p className="text-gray-600 mb-4">
            The InfiniteMovingGallery component provides a smooth, continuous
            scrolling experience for displaying images or content items.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Features:</h4>
              <ul className="text-gray-600 list-disc list-inside space-y-1">
                <li>Infinite scrolling effect</li>
                <li>Configurable direction</li>
                <li>Adjustable speed</li>
                <li>Pause on hover</li>
                <li>Responsive design</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Props:</h4>
              <ul className="text-gray-600 list-disc list-inside space-y-1">
                <li>items: Array of gallery items</li>
                <li>direction: left | right</li>
                <li>speed: fast | normal | slow</li>
                <li>pauseOnHover: boolean</li>
                <li>className: custom styling</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfiniteGalleryDemo;
