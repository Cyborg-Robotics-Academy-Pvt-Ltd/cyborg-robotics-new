import Head from "next/head";
import AppDesigning from "@/components/courses/AppDesigning";
import React from "react";

const page = () => {
  return (
    <>
      <Head>
        <title>Online App Designing Course | Cyborg Robotics Academy</title>
        <meta
          name="description"
          content="Learn app designing online at Cyborg Robotics Academy. Hands-on technical course for all ages."
        />
        <meta
          property="og:title"
          content="Online App Designing Course | Cyborg Robotics Academy"
        />
        <meta
          property="og:description"
          content="Learn app designing online at Cyborg Robotics Academy. Hands-on technical course for all ages."
        />
        <meta property="og:type" content="website" />
      </Head>
      <main role="main" aria-label="Online App Designing Course" className="">
        <AppDesigning />
        {/* TODO: Add loading and error states for better UX. */}
      </main>
    </>
  );
};

export default page;
