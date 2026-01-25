"use client";

import GalleryImage from "@/components/gallery/GalleryImage";
import Head from "next/head";
import Header from "@/components/layout/header";
import Footer from "@/components/home/Footer";

const Page = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      <>
        <main
          role="main"
          aria-label="Photo Gallery"
          className="relative overflow-hidden w-full h-full mt-4 lg:py-20 lg:mt-10"
        >
          <div>
            <h1 className="text-3xl font-bold text-center">
              Our <span className="text-red-800">Gallery</span>
            </h1>
          </div>
          <GalleryImage />
          {/* TODO: Add loading and error states for better UX. */}
        </main>
      </>
      <Footer />
    </div>
  );
};

export default Page;
