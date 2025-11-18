"use client";
import React from "react";
import dynamic from "next/dynamic";
import HomePage from "@/components/home/HomePage";
import { ScrollButton, WhatsAppWidget } from "@/components/widgets";

const Home = () => {
  return (
    <>
      <div className="pt-16 -mt-10 lg:-mt-9 md:-mt-2">
        <HomePage />
      </div>
      <WhatsAppWidget />
      <ScrollButton />
    </>
  );
};

export default Home;
