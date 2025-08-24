import Head from "next/head";
import WebDesigning from "@/components/courses/WebDesigning";
import React from "react";

const page = () => {
  return (
    <>
      <Head>
        <title>Web Designing Course | Cyborg Robotics Academy</title>
        <meta
          name="description"
          content="Learn Web Designing at Cyborg Robotics Academy. Hands-on technical course for all ages."
        />
        <meta
          property="og:title"
          content="Web Designing Course | Cyborg Robotics Academy"
        />
        <meta
          property="og:description"
          content="Learn Web Designing at Cyborg Robotics Academy. Hands-on technical course for all ages."
        />
        <meta property="og:type" content="website" />
      </Head>
      <main role="main" aria-label="Web Designing Course" className="">
        <WebDesigning />
        {/* TODO: Add loading and error states for better UX. */}
      </main>
    </>
  );
};

export default page;
