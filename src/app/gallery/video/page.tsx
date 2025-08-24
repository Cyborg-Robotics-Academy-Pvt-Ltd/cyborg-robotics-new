"use client";

import GalleryVideos from "@/components/GalleryVideos";
import Head from "next/head";

const Page = () => {
  return (
    <>
      <Head>
        <title>Video Gallery | Cyborg Robotics Academy</title>
        <meta
          name="description"
          content="Watch videos from Cyborg Robotics Academy events, classes, and activities."
        />
        <meta
          property="og:title"
          content="Video Gallery | Cyborg Robotics Academy"
        />
        <meta
          property="og:description"
          content="Watch videos from Cyborg Robotics Academy events, classes, and activities."
        />
        <meta property="og:type" content="website" />
      </Head>
      <main
        role="main"
        aria-label="Video Gallery"
        className="relative overflow-hidden w-full h-full mt-4 lg:py-20 lg:mt-10"
      >
        <div>
          <h1 className="text-3xl font-bold text-center">
            Our <span className="text-red-800">Gallery</span>
          </h1>
        </div>
        <GalleryVideos />
        {/* TODO: Add loading and error states for better UX. */}
      </main>
    </>
  );
};

export default Page;
