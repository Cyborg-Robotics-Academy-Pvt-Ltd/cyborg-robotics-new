import React from "react";
import Parents from "./Parents";
import Students from "./Students";
import Link from "next/link";

const Testimonials = () => {
  return (
    <div className="w-full flex flex-col items-center mt-10">
      <h1 className="mb-1 text-center">
        <span className="text-3xl font-bold gradient-text">Success</span>
        <span className="text-3xl font-bold text-black"> stories</span>
        <div className="flex items-center justify-center gap-1 my-3">
          <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-[#8D0F11]/60 rounded-full"></div>
          <div className="w-16 h-0.5 bg-gradient-to-r from-[#8D0F11]/60 to-[#8D0F11] rounded-full"></div>
          <div className="w-8 h-0.5 bg-gradient-to-r from-[#8D0F11] to-transparent rounded-full"></div>
        </div>
      </h1>

      <h2 className=" mb-10 text-center text-gray-600 text-base md:text-lg max-w-2xl">
        Hear from parents and students about their learning journeys with us.
      </h2>

      <div className="w-[90%] max-w-6xl grid lg:grid-cols-2 grid-cols-1 gap-5 md:gap-6 lg:gap-6">
        <div className="flex-1">
          <Parents />
        </div>
        <div className="flex-1">
          <Students />
        </div>
      </div>

      <div className="mt-8">
        <Link
          href="/registration"
          className="inline-flex items-center gap-2 rounded-full bg-red-900 text-white px-5 py-2 text-sm sm:text-base shadow-lg hover:bg-red-800 hover:shadow-xl active:scale-95 transition"
        >
          <span>Join our programs</span>
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
};

export default Testimonials;
