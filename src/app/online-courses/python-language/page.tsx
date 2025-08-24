import Head from "next/head";
import Python from "@/components/courses/Python";
import React from "react";

const page = () => {
  return (
    <>
      <Head>
        <title>Online Python Course | Cyborg Robotics Academy</title>
        <meta
          name="description"
          content="Learn Python programming online at Cyborg Robotics Academy. Hands-on technical course for all ages."
        />
        <meta
          property="og:title"
          content="Online Python Course | Cyborg Robotics Academy"
        />
        <meta
          property="og:description"
          content="Learn Python programming online at Cyborg Robotics Academy. Hands-on technical course for all ages."
        />
        <meta property="og:type" content="website" />
      </Head>
      <main role="main" aria-label="Online Python Course" className="">
        <Python />
        {/* TODO: Add loading and error states for better UX. */}
      </main>
    </>
  );
};

export default page;
