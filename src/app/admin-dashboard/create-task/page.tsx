import CreateTasks from "@/components/CreateTasks";
import React from "react";
import Head from "next/head";

const page = () => {
  return (
    <>
      <Head>
        <title>Create Task | Cyborg Robotics Academy</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="Create and manage tasks for students and trainers at Cyborg Robotics Academy."
        />
        <meta
          property="og:title"
          content="Create Task | Cyborg Robotics Academy"
        />
        <meta
          property="og:description"
          content="Create and manage tasks for students and trainers at Cyborg Robotics Academy."
        />
        <meta property="og:type" content="website" />
      </Head>
      <main
        role="main"
        aria-label="Create Task Page"
        className="min-h-screen bg-white w-full"
      >
        <div className="container mx-auto px-4">
          <CreateTasks />
        </div>
      </main>
    </>
  );
};

export default page;
