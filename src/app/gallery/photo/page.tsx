"use client";

import GalleryImage from "@/components/GalleryImage";
import Head from "next/head";

const Page = () => {
  return (
    <>
      <Head>
        <title>Photo Gallery | Cyborg Robotics Academy</title>
        <meta
          name="description"
          content="Browse photos from Cyborg Robotics Academy events, classes, and activities."
        />
        <meta
          property="og:title"
          content="Photo Gallery | Cyborg Robotics Academy"
        />
        <meta
          property="og:description"
          content="Browse photos from Cyborg Robotics Academy events, classes, and activities."
        />
        <meta property="og:type" content="website" />
      </Head>
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
  );
};

export default Page;
