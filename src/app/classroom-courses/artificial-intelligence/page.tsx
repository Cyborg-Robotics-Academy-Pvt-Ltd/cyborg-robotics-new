import Head from "next/head";
import ArtificialIntelligence from "@/components/courses/ArtificialIntelligence";
import React from "react";

const page = () => {
  return (
    <>
      <Head>
        <title>Artificial Intelligence Course | Cyborg Robotics Academy</title>
        <meta
          name="description"
          content="Learn Artificial Intelligence at Cyborg Robotics Academy. Hands-on technical course for all ages."
        />
        <meta
          property="og:title"
          content="Artificial Intelligence Course | Cyborg Robotics Academy"
        />
        <meta
          property="og:description"
          content="Learn Artificial Intelligence at Cyborg Robotics Academy. Hands-on technical course for all ages."
        />
        <meta property="og:type" content="website" />
      </Head>
      <main
        role="main"
        aria-label="Artificial Intelligence Course"
        className=""
      >
        <ArtificialIntelligence />
        {/* TODO: Add loading and error states for better UX. */}
      </main>
    </>
  );
};

export default page;
