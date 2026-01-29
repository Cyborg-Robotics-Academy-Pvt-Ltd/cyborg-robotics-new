"use client";
import React from "react";
import Image from "next/image";

const VisionSection = () => {
  return (
    <div className="relative w-full h-[35vh] py-4 sm:h-[20vh] lg:h-[140vh] md:h-[60vh] xl:h-[120vh] mx-auto mt-10">
      <Image
        src="https://res.cloudinary.com/dgbbkclfa/image/upload/v1761889889/To_be_competitive_you_ll_have_to_be_some_version_of_a_cyborg._qafuq5.png"
        alt="Vision Image"
        fill
        quality={100}
        className="object-cover "
        priority
      />
    </div>
  );
};

export default VisionSection;
