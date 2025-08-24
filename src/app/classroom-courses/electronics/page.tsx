import Head from "next/head";
import Electronics from "@/components/courses/Electronics";
import React from "react";

const page = () => {
  return (
    <>
      <Head>
        <title>Electronics Course | Cyborg Robotics Academy</title>
        <meta
          name="description"
          content="Learn Electronics at Cyborg Robotics Academy. Hands-on technical course for all ages."
        />
        <meta
          property="og:title"
          content="Electronics Course | Cyborg Robotics Academy"
        />
        <meta
          property="og:description"
          content="Learn Electronics at Cyborg Robotics Academy. Hands-on technical course for all ages."
        />
        <meta property="og:type" content="website" />
      </Head>
      <main role="main" aria-label="Electronics Course" className="">
        <Electronics />
        {/* TODO: Add loading and error states for better UX. */}
      </main>
    </>
  );
};

export default page;
