import Head from "next/head";
import BambinoCoding from "@/components/courses/BambinoCoding";
import React from "react";

const page = () => {
  return (
    <>
      <Head>
        <title>Online Bambino Coding Course | Cyborg Robotics Academy</title>
        <meta
          name="description"
          content="Learn Bambino Coding online at Cyborg Robotics Academy. Hands-on technical course for all ages."
        />
        <meta
          property="og:title"
          content="Online Bambino Coding Course | Cyborg Robotics Academy"
        />
        <meta
          property="og:description"
          content="Learn Bambino Coding online at Cyborg Robotics Academy. Hands-on technical course for all ages."
        />
        <meta property="og:type" content="website" />
      </Head>
      <main role="main" aria-label="Online Bambino Coding Course" className="">
        <BambinoCoding />
        {/* TODO: Add loading and error states for better UX. */}
      </main>
    </>
  );
};

export default page;
