import Head from "next/head";
import SpikePneumatics from "@/components/courses/SpikePneumatics";
import React from "react";

const page = () => {
  return (
    <>
      <Head>
        <title>Spike Pneumatics Course | Cyborg Robotics Academy</title>
        <meta
          name="description"
          content="Learn Spike Pneumatics at Cyborg Robotics Academy. Hands-on technical course for all ages."
        />
        <meta
          property="og:title"
          content="Spike Pneumatics Course | Cyborg Robotics Academy"
        />
        <meta
          property="og:description"
          content="Learn Spike Pneumatics at Cyborg Robotics Academy. Hands-on technical course for all ages."
        />
        <meta property="og:type" content="website" />
      </Head>
      <main role="main" aria-label="Spike Pneumatics Course" className="">
        <SpikePneumatics />
        {/* TODO: Add loading and error states for better UX. */}
      </main>
    </>
  );
};

export default page;
