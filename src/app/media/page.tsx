"use client";
import MediaSection from "@/components/gallery/MediaSection";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";

const Page = () => {
  const router = useRouter();
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    const userRole =
      typeof window !== "undefined" ? localStorage.getItem("userRole") : null;
    if (userRole !== "admin" && userRole !== "trainer") {
      router.push("/login");
    } else {
      setCanRender(true);
    }
  }, [router]);

  if (!canRender) {
    return (
      <main className="min-h-screen bg-gray-50">
        {/* Show skeleton content instead of loading message */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded-lg w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <Head>
        <title>Media Section | Cyborg Robotics Academy</title>
        <meta
          name="description"
          content="Access media resources for admins and trainers at Cyborg Robotics Academy."
        />
        <meta
          property="og:title"
          content="Media Section | Cyborg Robotics Academy"
        />
        <meta
          property="og:description"
          content="Access media resources for admins and trainers at Cyborg Robotics Academy."
        />
        <meta property="og:type" content="website" />
      </Head>
      <main
        role="main"
        aria-label="Media Section"
        className="min-h-screen bg-neutral-100"
      >
        <MediaSection />
      </main>
    </>
  );
};

export default Page;
