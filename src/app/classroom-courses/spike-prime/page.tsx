import Head from "next/head";
import SpikePrime from "@/components/courses/SpikePrime";
import React from "react";

const page = () => {
  return (
    <>
      <Head>
        <title>Spike Prime Course | Cyborg Robotics Academy</title>
        <meta
          name="description"
          content="Learn Spike Prime at Cyborg Robotics Academy. Hands-on technical course for all ages."
        />
        <meta
          property="og:title"
          content="Spike Prime Course | Cyborg Robotics Academy"
        />
        <meta
          property="og:description"
          content="Learn Spike Prime at Cyborg Robotics Academy. Hands-on technical course for all ages."
        />
        <meta property="og:type" content="website" />
      </Head>
      <main role="main" aria-label="Spike Prime Course" className="">
        <SpikePrime />
        {/* TODO: Add loading and error states for better UX. */}
      </main>
    </>
  );
};

export default page;
