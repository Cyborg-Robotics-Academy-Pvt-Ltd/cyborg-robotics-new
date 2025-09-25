"use client";
import React from "react";

import HomePage from "@/components/home/HomePage";
import MouseFollowerCircleDot from "@/components/ui/mouse-follower-circle-dot";

const Home = () => {
  return (
    <>
      <div className="-mt-10 lg:-mt-9 md:-mt-2">
        <HomePage />
      </div>
      <MouseFollowerCircleDot />
    </>
  );
};

export default Home;
