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
      <main
        role="main"
        aria-label="Loading Media Section"
        className="min-h-screen flex items-center justify-center bg-gray-50"
      >
        {/* TODO: Add loading spinner and better feedback. */}
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
