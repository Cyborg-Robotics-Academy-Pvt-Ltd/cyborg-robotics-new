import Head from "next/head";
import Iot from "@/components/courses/Iot";
import React from "react";

const page = () => {
  return (
    <>
      <Head>
        <title>Internet of Things (IoT) Course | Cyborg Robotics Academy</title>
        <meta
          name="description"
          content="Learn IoT at Cyborg Robotics Academy. Hands-on technical course for all ages."
        />
        <meta
          property="og:title"
          content="Internet of Things (IoT) Course | Cyborg Robotics Academy"
        />
        <meta
          property="og:description"
          content="Learn IoT at Cyborg Robotics Academy. Hands-on technical course for all ages."
        />
        <meta property="og:type" content="website" />
      </Head>
      <main
        role="main"
        aria-label="Internet of Things (IoT) Course"
        className=""
      >
        <Iot />
        {/* TODO: Add loading and error states for better UX. */}
      </main>
    </>
  );
};

export default page;
