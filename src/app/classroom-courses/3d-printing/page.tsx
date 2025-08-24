import Head from "next/head";
import Printing3d from "@/components/courses/Printing3d";
import React from "react";

const page = () => {
  return (
    <>
      <Head>
        <title>3D Printing Course | Cyborg Robotics Academy</title>
        <meta
          name="description"
          content="Learn 3D printing at Cyborg Robotics Academy. Hands-on technical course for all ages."
        />
        <meta
          property="og:title"
          content="3D Printing Course | Cyborg Robotics Academy"
        />
        <meta
          property="og:description"
          content="Learn 3D printing at Cyborg Robotics Academy. Hands-on technical course for all ages."
        />
        <meta property="og:type" content="website" />
      </Head>
      <main role="main" aria-label="3D Printing Course" className="">
        <Printing3d />
        {/* TODO: Add loading and error states for better UX. */}
      </main>
    </>
  );
};

export default page;
