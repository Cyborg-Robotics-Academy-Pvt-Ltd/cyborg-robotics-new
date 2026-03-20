"use client";

import React, { useEffect, useRef, useState } from "react";
import { useScroll, useTransform, motion } from "motion/react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  // Track height dynamically
  useEffect(() => {
    if (!timelineRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setHeight(entry.contentRect.height);
      }
    });

    observer.observe(timelineRef.current);

    return () => observer.disconnect();
  }, []);

  // Scroll animation
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 15%", "end 60%"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], [0, height]);
  const lineOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <section className="w-full bg-white font-sans md:px-10" ref={containerRef}>
      {/* Section Header */}
      <div className="max-w-7xl mx-auto text-center mb-10">
        <h2 className="text-2xl md:text-4xl font-bold gradient-text">
          IRO Competition Achievements Timeline
        </h2>

        <p className="text-gray-600 text-sm md:text-base max-w-md mx-auto mt-2">
          Our journey through national robotics competitions
        </p>
      </div>

      {/* Timeline */}
      <div ref={timelineRef} className="relative max-w-7xl mx-auto pb-20">
        {data.map((item, index) => (
          <div key={index} className="flex justify-start md:gap-10 mb-12">
            {/* Year + Timeline Dot */}
            <div className="sticky top-32 flex flex-col md:flex-row items-center z-40 max-w-xs md:w-full">
              {/* Dot */}
              <div className="absolute left-3 md:left-3 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow">
                <div className="h-4 w-4 rounded-full bg-red-500 border-4 border-white shadow" />
              </div>

              {/* Year */}
              <h3 className="hidden md:block text-4xl font-bold text-gray-700 md:pl-20">
                {item.title}
              </h3>
            </div>

            {/* Content */}
            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              {/* Mobile Year */}
              <h3 className="md:hidden block text-2xl font-bold text-gray-700 mb-4">
                {item.title}
              </h3>

              {/* Animated Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                viewport={{ once: true }}
              >
                {item.content}
              </motion.div>
            </div>
          </div>
        ))}

        {/* Timeline Line */}
        <div className="absolute left-8 top-0 w-[2px] bg-gray-200 hidden md:block">
          <motion.div
            style={{
              height: lineHeight,
              opacity: lineOpacity,
            }}
            className="absolute top-0 w-[2px] bg-red-500"
          />
        </div>
      </div>
    </section>
  );
};
