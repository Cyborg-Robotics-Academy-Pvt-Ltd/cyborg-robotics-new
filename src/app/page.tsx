"use client";
import React from "react";
import dynamic from "next/dynamic";
import HomePage from "@/components/home/HomePage";

// Lazy load mouse follower only on desktop devices
const MouseFollowerCircleDot = dynamic(
  () => import("@/components/ui/mouse-follower-circle-dot-optimized"),
  {
    ssr: false,
    loading: () => null, // No loading state needed
  }
);

const Home = () => {
  return (
    <>
      <div className="pt-16 -mt-10 lg:-mt-9 md:-mt-2">
        <HomePage />
      </div>
      {/* Only load mouse follower on larger screens */}
      <div className="hidden lg:block">
        <MouseFollowerCircleDot />
      </div>
    </>
  );
};

export default Home;
