"use client";
import React from "react";
import { InfiniteMovingCards } from "../ui/infinite-moving-cards";
import { FeaturesImages } from "../../../utils/Images";

const Features: React.FC = React.memo(() => {
  return (
    <div className="bg-white text-black">
      <h2 className="text-center font-bold text-lg md:text-3xl mt-4 md:mt-6 mx-2">
        Discover the Excellence of{" "}
        <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
          Cyborg Robotics Academy
        </span>
        <span className="text-black"> Private Limited</span>
      </h2>
      <div className="flex items-center justify-center gap-1 my-3">
        <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-[#8D0F11]/60 rounded-full"></div>
        <div className="w-16 h-0.5 bg-gradient-to-r from-[#8D0F11]/60 to-[#8D0F11] rounded-full"></div>
        <div className="w-8 h-0.5 bg-gradient-to-r from-[#8D0F11] to-transparent rounded-full"></div>
      </div>
      <InfiniteMovingCards
        items={FeaturesImages}
        direction="right"
        speed="slow"
        className="will-change-transform"
      />
    </div>
  );
});

// Set the display name for the component
Features.displayName = "Features";

export default Features;
