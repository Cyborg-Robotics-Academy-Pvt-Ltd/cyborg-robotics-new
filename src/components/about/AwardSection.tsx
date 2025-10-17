"use client";
import React from "react";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

// Type definition for award data
interface Award {
  id: number;
  title: string;
  image: string;
}

const AwardSection = () => {
  // Initialize Embla with autoplay plugin
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "center", slidesToScroll: 1 },
    [
      Autoplay({
        delay: 2000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ]
  );

  // Play autoplay when component mounts
  React.useEffect(() => {
    if (emblaApi) {
      emblaApi.plugins().autoplay?.play();
    }
  }, [emblaApi]);

  const awards: Award[] = [
    {
      id: 1,
      title: "Best Educational Robotics Program",
      image: "/assets/image.png",
    },
    {
      id: 2,
      title: "Excellence in AI Education",
      image: "/assets/image.png",
    },
    {
      id: 3,
      title: "Community Impact Award",
      image: "/assets/image.png",
    },
    {
      id: 4,
      title: "Innovative STEM Learning",
      image: "/assets/image.png",
    },
    {
      id: 5,
      title: "Innovative STEM Learning",
      image: "/assets/image.png",
    },
    {
      id: 6,
      title: "Innovative STEM Learning",
      image: "/assets/image.png",
    },
    {
      id: 7,
      title: "Innovative STEM Learning",
      image: "/assets/image.png",
    },
  ];

  return (
    <section className="py-2 sm:py-16 md:py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-[#BF2121]/10 text-[#BF2121] px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Trophy size={16} />
            Recognition & Awards
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            Our{" "}
            <span className="bg-gradient-to-r from-[#BF2121] to-[#8C2D2D] bg-clip-text text-transparent">
              Achievements
            </span>
          </motion.h2>

          <motion.p
            className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Recognized for excellence in robotics education and technological
            innovation
          </motion.p>

          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-12 h-1 bg-gradient-to-r from-transparent to-[#BF2121] rounded-full"></div>
            <div className="w-24 h-1 bg-gradient-to-r from-[#BF2121] to-[#a63534] rounded-full"></div>
            <div className="w-12 h-1 bg-gradient-to-r from-[#a63534] to-transparent rounded-full"></div>
          </div>
        </motion.div>

        {/* Carousel Section */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {awards.map((award) => (
              <div
                key={award.id}
                className="flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_33.33%] flex flex-col items-center justify-center p-4"
              >
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 flex items-center justify-center">
                  <Image
                    src={award.image}
                    alt={award.title}
                    fill
                    className="object-contain p-4"
                  />
                </div>
                <h3 className="text-lg text-gray-900 mt-4 font-medium text-center">
                  {award.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AwardSection;
