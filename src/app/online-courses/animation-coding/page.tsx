import Head from "next/head";
import AnimationCoding from "@/components/courses/AnimationCoding";
import React from "react";

const page = () => {
  return (
    <>
      <Head>
        <title>
          Online Animation & Coding Course | Cyborg Robotics Academy
        </title>
        <meta
          name="description"
          content="Learn animation and coding online at Cyborg Robotics Academy. Creative and technical skills for all ages."
        />
        <meta
          property="og:title"
          content="Online Animation & Coding Course | Cyborg Robotics Academy"
        />
        <meta
          property="og:description"
          content="Learn animation and coding online at Cyborg Robotics Academy. Creative and technical skills for all ages."
        />
        <meta property="og:type" content="website" />
      </Head>
      <main
        role="main"
        aria-label="Online Animation & Coding Course"
        className=""
      >
        <AnimationCoding />
        {/* TODO: Add loading and error states for better UX. */}
      </main>
    </>
  );
};

export default page;
