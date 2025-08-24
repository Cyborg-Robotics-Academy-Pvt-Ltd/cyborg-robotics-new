import Head from "next/head";
import AppLab from "@/components/courses/AppLab";
import React from "react";

const page = () => {
  return (
    <>
      <Head>
        <title>App Lab Course | Cyborg Robotics Academy</title>
        <meta
          name="description"
          content="Learn app development in App Lab at Cyborg Robotics Academy. Hands-on technical course for all ages."
        />
        <meta
          property="og:title"
          content="App Lab Course | Cyborg Robotics Academy"
        />
        <meta
          property="og:description"
          content="Learn app development in App Lab at Cyborg Robotics Academy. Hands-on technical course for all ages."
        />
        <meta property="og:type" content="website" />
      </Head>
      <main role="main" aria-label="App Lab Course" className="">
        <AppLab />
        {/* TODO: Add loading and error states for better UX. */}
      </main>
    </>
  );
};

export default page;
