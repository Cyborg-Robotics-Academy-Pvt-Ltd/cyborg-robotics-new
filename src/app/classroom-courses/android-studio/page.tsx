import Head from "next/head";
import AndroidStudio from "@/components/courses/AndroidStudio";
import React from "react";

const page = () => {
  return (
    <>
      <Head>
        <title>Android Studio Course | Cyborg Robotics Academy</title>
        <meta
          name="description"
          content="Learn Android app development with Android Studio at Cyborg Robotics Academy."
        />
        <meta
          property="og:title"
          content="Android Studio Course | Cyborg Robotics Academy"
        />
        <meta
          property="og:description"
          content="Learn Android app development with Android Studio at Cyborg Robotics Academy."
        />
        <meta property="og:type" content="website" />
      </Head>
      <main role="main" aria-label="Android Studio Course" className="">
        <AndroidStudio />
        {/* TODO: Add loading and error states for better UX. */}
      </main>
    </>
  );
};

export default page;
