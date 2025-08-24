import Head from "next/head";
import Arduino from "@/components/courses/Arduino";
import React from "react";

const page = () => {
  return (
    <>
      <Head>
        <title>Arduino Course | Cyborg Robotics Academy</title>
        <meta
          name="description"
          content="Learn Arduino at Cyborg Robotics Academy. Hands-on technical course for all ages."
        />
        <meta
          property="og:title"
          content="Arduino Course | Cyborg Robotics Academy"
        />
        <meta
          property="og:description"
          content="Learn Arduino at Cyborg Robotics Academy. Hands-on technical course for all ages."
        />
        <meta property="og:type" content="website" />
      </Head>
      <main role="main" aria-label="Arduino Course" className="">
        <Arduino />
        {/* TODO: Add loading and error states for better UX. */}
      </main>
    </>
  );
};

export default page;
