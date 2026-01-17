import Header from "@/components/layout/header";
import Link from "next/link";
import React from "react";

const Page = () => {
  return (
    <div>
      <Header />

      <h1 className="text-3xl mt-18 font-bold">Technology Programs</h1>
      <Link href="/tech-programs/lego-robotics">LEGO Robotics</Link>
    </div>
  );
};

export default Page;
