"use client";
import { Check } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

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
    name: "Mr. Nilesh Jaiswar",
    title: "Mechanical Engineer",
    image: "assets/team/nilesh.png",
  },
  {
    id: "Anchal",
    name: "Ms. Anchal Mishra",
    title: "Electronics Specialist",
    image: "assets/team/anchal.png",
  },
  {
    id: "Mahvish",
    name: "Ms. Mahvish Fatima",
    title: "Robotics Skills Expert",
    image: "assets/team/mahvish3.png",
  },
  {
    id: "Pratima",
    name: "Ms. Pratima Thakur",
    title: "Programming Lead",
    image: "assets/team/pratima.png",
  },
  {
    id: "Nikita",
    name: "Ms. Nikita Mangale",
    title: "Branding & Outreach Specialist",
    image: "assets/team/nikita.png",
  },
];

interface Mentor {
  id: string;
  name: string;
  title: string;
  image: string;
}

function MentorCard({ mentor }: { mentor: Mentor }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="h-full w-full mx-auto">
      <div
        className="relative w-full h-full cursor-pointer"
        style={{ perspective: "1000px" }}
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
      >
        <div
          className="relative w-full h-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front of the card */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden shadow-xl bg-white"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="w-full h-60 relative">
              <Image
                src={`/${mentor.image}`}
                alt={mentor.name}
                fill
                className="object-"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-white py-4 px-3">
              <h4 className="text-black font-extrabold text-sm mb-1 truncate">
                {mentor.name}
              </h4>
              <p className="text-black/90 text-[11px] font-medium line-clamp-2">
                {mentor.title}
              </p>
            </div>
          </div>

          {/* Back of the card */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-red-900"></div>
            <div className="relative z-10 h-full flex flex-col justify-center items-center px-3 py-4 text-white">
              <div className="mb-2">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg p-1 border-2 border-white/30">
                  <Image
                    src="/assets/Cyborg-logo.png"
                    alt="Logo"
                    width={60}
                    height={60}
                    className="object-contain w-full h-full"
                  />
                </div>
              </div>
              <div className="w-8 h-0.5 bg-gradient-to-r from-white/40 to-white rounded-full mb-2"></div>
              <h4 className="font-bold text-base text-center mb-1 px-2 truncate">
                {mentor.name}
              </h4>
              <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3 py-0.5 mb-2 max-w-[90%]">
                <p className="text-[10px] font-normal text-center text-white/90 line-clamp-3">
                  {mentor.title}
                </p>
              </div>
              <div className="w-8 h-0.5 bg-gradient-to-r from-white/40 to-white rounded-full mt-1 mb-2"></div>
              <div className="text-[10px] font-normal text-white/90 text-center px-2">
                Cyborg Robotics Mentor
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WhyChooseUs() {
  return (
    <section id="why-us" className="w-full bg-background py-4 md:py-4 lg:py-4">
      <div className="container px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-6">
            <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Why Choose Us
            </h2>
            <p className="text-muted-foreground md:text-lg">
              Joining Cyborg Robotics means more than just building robots. It's
              about becoming part of a community dedicated to excellence,
              innovation, and growth.
            </p>
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="mt-1 h-5 w-5 flex-shrink-0 text-red-800" />
                  <span className="text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-6">
            <h3 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">
              Meet the Mentors
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              {mentors.map((mentor) => (
                <div
                  key={mentor.id}
                  className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-red-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-red-700 flex items-center justify-center text-white font-bold text-lg">
                        {mentor.name.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-red-800 font-extrabold text-lg truncate">
                        {mentor.name}
                      </h4>
                      <p className="text-red-600 text-xs mt-1 truncate">
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
