"use client";
import React from "react";
import dynamic from "next/dynamic";
import HomePage from "@/components/home/HomePage";
import { ScrollButton, WhatsAppWidget } from "@/components/widgets";
import MouseFollower from "@/components/widgets/MouseFollower";

const Home = () => {
  return (
    <>
      <MouseFollower />
      <div className="pt-16 -mt-10 lg:-mt-9 md:-mt-2">
        <HomePage />
      </div>
      <WhatsAppWidget />
      <ScrollButton />
    </>
  );
};

export default Home;
