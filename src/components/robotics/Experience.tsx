"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

const experiences = [
  {
    title: "Innovative Classrooms",
    description: "Learn robotics concepts in modern smart classrooms.",
    image:
      "https://www.cyborgrobotics.in/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdgbbkclfa%2Fimage%2Fupload%2Fv1768652658%2Fhmmzpdwmlyi1l2gj9ymb.jpg&w=750&q=75",
    themeColor: "0 70% 35%",
  },
  {
    title: "Coding & AI Labs",
    description: "Build intelligent applications with coding and AI.",
    image:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&q=80",
    themeColor: "220 70% 35%",
  },
  {
    title: "3D Printing Studio",
    description: "Design and prototype ideas using 3D printing technology.",
    image:
      "https://www.cyborgrobotics.in/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdgbbkclfa%2Fimage%2Fupload%2Fv1768652658%2Fkz9qfvpwvdvrcseas4oe.jpg&w=750&q=75",
    themeColor: "30 80% 35%",
  },
  {
    title: "Drone Test Arena",
    description: "Build, fly and test drones in real-world scenarios.",
    image:
      "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=1200&q=80",
    themeColor: "190 70% 30%",
  },
  {
    title: "VR / AR Innovation Lab",
    description: "Experience immersive future technologies.",
    image:
      "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=1200&q=80",
    themeColor: "270 70% 35%",
  },
];

export default function Experience() {
  return (
    <section className="py-16 px-4 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-red-50 text-[#A81B1E] text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full border border-red-200">
            What Awaits You
          </span>

          <h2 className="mt-4 text-3xl md:text-5xl font-bold text-gray-900">
            Inside The <span className="text-[#A81B1E]">Experience</span>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {experiences.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.08,
              }}
              viewport={{ once: true }}
              className="group"
              style={
                {
                  "--theme-color": item.themeColor,
                } as React.CSSProperties
              }
            >
              <div
                className="
                  relative h-[360px]
                  overflow-hidden rounded-3xl
                  shadow-lg
                  transition-all duration-500
                  group-hover:scale-[1.03]
                  group-hover:shadow-2xl
                "
              >
                {/* Background Image */}
                <div
                  className="
                    absolute inset-0 bg-cover bg-center
                    transition-transform duration-700
                    group-hover:scale-110
                  "
                  style={{
                    backgroundImage: `url(${item.image})`,
                  }}
                />

                {/* Overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(
                      to top,
                      hsl(${item.themeColor} / 0.95),
                      hsl(${item.themeColor} / 0.55) 45%,
                      transparent 85%
                    )`,
                  }}
                />

                {/* Number */}
                <div className="absolute top-4 right-4 text-white/70 text-sm font-bold">
                  0{index + 1}
                </div>

                {/* Content */}
                <div className="relative flex flex-col justify-end h-full p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>

                  <p className="text-sm text-white/85 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
