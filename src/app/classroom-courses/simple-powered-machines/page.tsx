import Head from "next/head";
import SimplePoweredMachines from "@/components/courses/SimplePoweredMachines";
import React from "react";

const page = () => {
  return (
    <>
      <Head>
        <title>Simple Powered Machines Course | Cyborg Robotics Academy</title>
        <meta
          name="description"
          content="Learn Simple Powered Machines at Cyborg Robotics Academy. Hands-on technical course for all ages."
        />
        <meta
          property="og:title"
          content="Simple Powered Machines Course | Cyborg Robotics Academy"
        />
        <meta
          property="og:description"
          content="Learn Simple Powered Machines at Cyborg Robotics Academy. Hands-on technical course for all ages."
        />
        <meta property="og:type" content="website" />
      </Head>
      <main
        role="main"
        aria-label="Simple Powered Machines Course"
        className=""
      >
        <SimplePoweredMachines />
        {/* TODO: Add loading and error states for better UX. */}
      </main>
    </>
  );
};

export default page;
