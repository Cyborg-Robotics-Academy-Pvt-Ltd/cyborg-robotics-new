"use client";
import React from "react";
import { InfiniteMovingCards } from "./ui/infinite-moving-cards";
import { FeaturesImages } from "../../utils/Images";

const Features: React.FC = React.memo(() => {
  return (
    <div className="bg-white text-black">
      <h2 className="text-center font-bold text-lg md:text-3xl mt-4 md:mt-6 mx-2">
        Discover the Excellence of{" "}
        <span className="text-[#8D0F11]">Cyborg Robotics Academy</span>
        <span className="text-black"> Private Limited</span>
      </h2>
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
