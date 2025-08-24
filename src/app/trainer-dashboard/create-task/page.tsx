import CreateTasks from "@/components/CreateTasks";
import React from "react";
import Head from "next/head";

const page = () => {
  return (
    <>
      <Head>
        <title>Create Task | Trainer Dashboard</title>
        <meta
          name="description"
          content="Create and manage tasks for students at Cyborg Robotics Academy."
        />
        <meta property="og:title" content="Create Task | Trainer Dashboard" />
        <meta
          property="og:description"
          content="Create and manage tasks for students at Cyborg Robotics Academy."
        />
        <meta property="og:type" content="website" />
      </Head>
      <main
        role="main"
        aria-label="Create Task Page"
        className="min-h-screen bg-white"
      >
        {/* TODO: Add better error handling and accessibility improvements. */}
        <CreateTasks />
      </main>
    </>
  );
};

export default page;
