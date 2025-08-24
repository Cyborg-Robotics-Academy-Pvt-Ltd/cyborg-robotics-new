import Head from "next/head";
import MachineLearning from "@/components/courses/MachineLearning";
import React from "react";

const page = () => {
  return (
    <>
      <Head>
        <title>Online Machine Learning Course | Cyborg Robotics Academy</title>
        <meta
          name="description"
          content="Learn Machine Learning online at Cyborg Robotics Academy. Hands-on technical course for all ages."
        />
        <meta
          property="og:title"
          content="Online Machine Learning Course | Cyborg Robotics Academy"
        />
        <meta
          property="og:description"
          content="Learn Machine Learning online at Cyborg Robotics Academy. Hands-on technical course for all ages."
        />
        <meta property="og:type" content="website" />
      </Head>
      <main
        role="main"
        aria-label="Online Machine Learning Course"
        className=""
      >
        <MachineLearning />
        {/* TODO: Add loading and error states for better UX. */}
      </main>
    </>
  );
};

export default page;
