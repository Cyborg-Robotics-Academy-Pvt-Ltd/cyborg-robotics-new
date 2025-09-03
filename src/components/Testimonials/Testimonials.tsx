import React from "react";
import Parents from "./Parents";
import Students from "./Students";

const Testimonials = () => {
  return (
    <div className="w-full flex flex-col items-center mt-10">
      <h1 className="mb-10 text-center">
        <span className="text-3xl font-bold gradient-text">Success</span>
        <span className="text-3xl font-bold text-black"> stories</span>
      </h1>
      <h2 className="-mt-6 mb-10 text-center text-gray-600 text-base md:text-lg max-w-2xl">
        Hear from parents and students about their learning journeys with us.
      </h2>

      <div className="w-[90%] max-w-6xl grid md:grid-cols-2 grid-cols-1 gap-6 md:gap-8">
        <div className="flex-1">
          <Parents />
        </div>
        <div className="flex-1">
          <Students />
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
