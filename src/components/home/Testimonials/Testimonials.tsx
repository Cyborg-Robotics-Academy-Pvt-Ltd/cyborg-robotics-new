"use client";

import React from "react";
import Parents from "./Parents";
import Students from "./Students";

const Testimonials = () => {
  return (
    <section className="mt-10 flex w-full flex-col items-center testimonials-section">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .testimonials-section {
          animation: fadeInUp 0.6s ease-out;
        }

        .testimonials-title {
          animation: fadeInUp 0.6s ease-out 0.12s both;
        }

        .testimonials-subtitle {
          animation: fadeInUp 0.6s ease-out 0.24s both;
        }

        .testimonials-grid {
          animation: fadeInUp 0.6s ease-out 0.36s both;
        }
      `}</style>

      <h1 className="testimonials-title mb-1 text-center">
        <span className="text-3xl font-bold gradient-text">Success</span>
        <span className="text-3xl font-bold text-black"> stories</span>
        <div className="flex items-center justify-center gap-1 my-3">
          <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-[#8D0F11]/60 rounded-full"></div>
          <div className="w-16 h-0.5 bg-gradient-to-r from-[#8D0F11]/60 to-[#8D0F11] rounded-full"></div>
          <div className="w-8 h-0.5 bg-gradient-to-r from-[#8D0F11] to-transparent rounded-full"></div>
        </div>
      </h1>

      <h2 className="testimonials-subtitle mb-10 max-w-2xl text-center text-base text-gray-600 md:text-lg">
        Hear from parents and students about their learning journeys with us.
      </h2>

      <div className="testimonials-grid grid w-[90%] max-w-6xl grid-cols-1 gap-5 md:gap-6 lg:grid-cols-2 lg:gap-6">
        <div className="flex-1">
          <Parents />
        </div>
        <div className="flex-1">
          <Students />
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
