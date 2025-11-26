"use client";
import { Check } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useRef, useEffect } from "react";

const benefits = [
  "Expert Mentorship: Deep hands-on experience",
  "Proven Track Record in training innovators",
  "Holistic Development: Technical + soft skills",
  "Industry Exposure & Real Engineering Practice",
  "Strong Community & Global FIRST Network",
];

const mentors = [
  {
    id: "Nilesh",
    name: "Nilesh Jaiswar",
    title: "Mechanical Engineer",
  },
  {
    id: "Anchal",
    name: "Anchal Mishra",
    title: "Electronics Specialist",
  },
  {
    id: "Mahvish",
    name: "Mahvish Fatima",
    title: "Research & Development Specialist",
  },
  {
    id: "Pratima",
    name: "Pratima Thakur",
    title: "Documentation and Soft-Skills Specialist",
  },
  {
    id: "Sirjana ",
    name: "Sirjana Vishwakarma",
    title: "Branding & Outreach Specialist",
  },
  {
    id: "Nikita",
    name: "Nikita Mangale",
    title: "Branding & Outreach Specialist",
  },
];

interface Mentor {
  id: string;
  name: string;
  title: string;
}

export function WhyChooseUs() {
  const { isVisible, setElement } = useScrollAnimation();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) {
      setElement(sectionRef.current);
    }
  }, [setElement]);

  return (
    <section
      id="why-us"
      className="w-full bg-background py-4 md:py-4 lg:py-4 mt-10"
      ref={sectionRef}
    >
      <div className="container px-4 md:px-6 mx-auto">
        <div
          className={`text-center mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <h1 className="text-center">
            <span className="text-3xl font-bold gradient-text">Why Choose</span>
            <span className="text-3xl font-bold text-black"> Us</span>
          </h1>
          <p className="text-muted-foreground md:text-lg max-w-3xl mx-auto">
            Joining Cyborg Robotics means becoming part of a community driven by
            excellence, innovation and growth.
          </p>
        </div>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center w-[90%] mx-auto">
          <div
            className={`space-y-8 transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <ul className="space-y-6 max-w-2xl text-left w-full">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-4 group">
                  <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-red-800 flex items-center justify-center ">
                    <Check className="h-4 w-4 flex-shrink-0 text-white  " />
                  </div>
                  <span className="text-foreground text-lg group-hover:text-red-700 transition-colors duration-300">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div
            className={`space-y-5 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <h1 className="text-center">
              <span className="text-3xl font-bold gradient-text">Meet the</span>
              <span className="text-3xl font-bold text-black"> Mentors</span>
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-4xl justify-items-center">
              {mentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-red-200 w-full max-w-xs hover:border-red-300 group"
                >
                  <div className="flex items-center space-x-2">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-bold text-xl group-hover:from-red-700 group-hover:to-red-900 transition-all duration-300 transform group-hover:scale-110">
                        {mentor.name.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-red-800 text-[15px] font-bold group-hover:text-red-900 transition-colors duration-300 line-clamp-2">
                        {mentor.name}
                      </h4>
                      <p className="text-red-600 text-[11px] mt-1 group-hover:text-red-700 transition-colors duration-300 line-clamp-2">
                        {mentor.title}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
