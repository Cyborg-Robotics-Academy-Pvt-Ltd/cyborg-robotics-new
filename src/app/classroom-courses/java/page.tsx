import Head from "next/head";
import Java from "@/components/courses/Java";
import React from "react";

const page = () => {
  return (
    <>
      <Head>
        <title>Java Course | Cyborg Robotics Academy</title>
        <meta
          name="description"
          content="Learn Java programming at Cyborg Robotics Academy. Hands-on technical course for all ages."
        />
        <meta
          property="og:title"
          content="Java Course | Cyborg Robotics Academy"
        />
        <meta
          property="og:description"
          content="Learn Java programming at Cyborg Robotics Academy. Hands-on technical course for all ages."
        />
        <meta property="og:type" content="website" />
      </Head>
      <main role="main" aria-label="Java Course" className="">
        <Java />
        {/* TODO: Add loading and error states for better UX. */}
      </main>
    </>
  );
};

export default page;
