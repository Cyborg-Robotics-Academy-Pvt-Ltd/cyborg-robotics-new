"use client";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { InfiniteMovingAwards } from "../ui/infinite-moving-cards-awards";

// Type definition for award data
interface Award {
  id: number;
  title: string;
  image: string;
}

const AwardSection = () => {
  const awards: Award[] = [
    {
      id: 1,
      title:
        "1st place Indian Robotics Olympiad (IRO) 2024  (Techies Category)",
      image: "/assets/awards/IRO-2024-TECHIES-1ST.png",
    },
    {
      id: 2,
      title:
        "3rd place Indian Robotics Olympiad (IRO) 2024  (Techies Category)",
      image: "/assets/awards/IRO-2024-TECHIES-3RD.png",
    },

    {
      id: 3,
      title:
        "3rd  Place – Indian Robotics Olympiad (IRO) 2024 (Innovators Category) ",
      image: "/assets/awards/IRO-2024-INNOVATORS-3RD.png",
    },
    {
      id: 4,
      title:
        "1ST  Place – Indian Robotics Olympiad (IRO) 2025 (Innovators Category) ",
      image: "/assets/awards/IRO-2025-INNOVATORS-1ST.png",
    },
    {
      id: 5,
      title:
        "3rd Place & Judges’ Award – Jr. Line Following (RoboTex), Ahmedabad",
      image: "/assets/awards/Jr.Line-following.png",
    },
    {
      id: 6,
      title:
        "2nd Runner-Up – Jr. Robo Race, World STEM & Robotics Olympiad, Ahmedabad",
      image: "/assets/awards/jr.Robo-race.png",
    },
    {
      id: 7,
      title: "Judges’ Award – World STEM & Robotics Olympiad",
      image: "/assets/awards/Judges-awards.png",
    },
    {
      id: 8,
      title:
        "2nd Place (Beginner) & 3rd Place (National) – RoboTex 2025, LEGO Line Follower",
      image: "/assets/awards/Lego_Follower.png",
    },
    {
      id: 9,
      title:
        "1st Place (Beginner) & 2nd Place (Intermediate) – RoboTex, Line Follower",
      image: "/assets/awards/Line-Follower.png",
    },
    {
      id: 10,
      title:
        "1st & 3rd Prize – World STEM & Robotics Olympiad, LEGO Line Follower",
      image: "/assets/awards/lego-line-follower.png",
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-10 bg-white ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 sm:mb-1"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-[#BF2121]/10 text-[#BF2121] px-4 py-2 rounded-full text-sm font-medium mb-1">
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

        {/* Awards Carousel with Infinite Movement */}
        <div className="my-2">
          <InfiniteMovingAwards
            awards={awards}
            speed="normal"
            autoPlay={true}
            autoPlayInterval={3000}
          />
        </div>
      </div>
    </section>
  );
};

export default AwardSection;
