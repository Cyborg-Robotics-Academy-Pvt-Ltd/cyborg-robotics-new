import Head from "next/head";
import EarlySimpleMachines from "@/components/courses/EarlySimpleMachines";
import React from "react";

const page = () => {
  return (
    <>
      <Head>
        <title>Early Simple Machines Course | Cyborg Robotics Academy</title>
        <meta
          name="description"
          content="Learn Early Simple Machines at Cyborg Robotics Academy. Hands-on technical course for all ages."
        />
        <meta
          property="og:title"
          content="Early Simple Machines Course | Cyborg Robotics Academy"
        />
        <meta
          property="og:description"
          content="Learn Early Simple Machines at Cyborg Robotics Academy. Hands-on technical course for all ages."
        />
        <meta property="og:type" content="website" />
      </Head>
      <main role="main" aria-label="Early Simple Machines Course" className="">
        <EarlySimpleMachines />
        {/* TODO: Add loading and error states for better UX. */}
      </main>
    </>
  );
};

export default page;
