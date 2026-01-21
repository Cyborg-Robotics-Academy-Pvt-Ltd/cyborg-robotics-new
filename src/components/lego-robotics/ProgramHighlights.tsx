import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const ProgramHighlights = () => {
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };
  const ageGroups = [
    {
      id: "ages4-6",
      title: "Ages 4–6",
      emoji: "🧠",
      subtitle: "Early Simple Machines",
      description: "Learning through play",
      benefits: [
        "Build simple machines using LEGO®",
        "Understand concepts like gears, wheels, levers",
        "Improve hand–eye coordination",
        "Develop focus, patience, and confidence",
      ],

      usedInWorkshop: true,
      nextStep: "Basic building concepts",
      color: "from-[#A81B1E] to-[#C73E1D]",
    },
    {
      id: "ages7-9",
      title: "Ages 7–9",
      emoji: "⚙",
      subtitle: "Simple & Powered Machines",
      description: "Where thinking meets action",
      benefits: [
        "Build moving model using motor & gears",
        "Learn cause-and-effect and basic mechanics",
        "Get introduced to logical sequencing",
        "Strengthen problem-solving skills",
      ],

      usedInWorkshop: true,
      nextStep: "Motor & sensor basics",
      color: "from-[#0855AB] to-[#2B6ECC]",
    },
    {
      id: "ages10+",
      title: "Ages 10+",
      emoji: "🤖",
      subtitle: " EV3 Robotics",
      description: "From building to real robotics",
      benefits: [
        "Build and program robots using LEGO® EV3",
        "Learn basic coding & automation",
        "Understand sensors, motors & logic",
        "Think like an engineer and innovator",
      ],

      usedInWorkshop: true,
      nextStep: "Advanced programming & robotics",
      color: "from-[#6D6D6D] to-[#6D6D6D]",
    },
  ];
  // Helper function to get age group specific images
  const getAgeGroupImage = (ageGroupId: string): string => {
    const imageMap: Record<string, string> = {
      "ages4-6": "/assets/lego/early-simple-machines.jpg",
      "ages7-9": "/assets/lego/simple-and-power-machines.jpg",
      "ages10+": "/assets/lego/ev3robotics.jpg",
    };

    return imageMap[ageGroupId] || "/assets/lego/default-lego-image.jpg"; // Return default image if not found
  };
  return (
    <div>
      {/* Enhanced Age-wise Program Highlights with Tabs */}
      <motion.section
        className="py-6 md:py-10 bg-gradient-to-b from-white to-gray-50 "
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="max-w-[1200px]  mx-auto px-4 sm:px-6 md:px-8">
          <motion.div className="text-center" variants={fadeInUp}>
            <motion.h2
              className="text-lg md:text-xl lg:text-2xl font-bold text-[#062341] mb-1 md:mb-2 font-sans"
              variants={fadeInUp}
            >
              AGE-WISE{" "}
              <span className="gradient-text font-bold">
                PROGRAM HIGHLIGHTS
              </span>
            </motion.h2>

            {/* Cards Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-8"
              variants={staggerContainer}
            >
              {ageGroups.map((group, index) => (
                <motion.div
                  key={group.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                >
                  {/* Card Header with Color Bar */}
                  <div className={`h-2 bg-gradient-to-r ${group.color}`}></div>

                  {/* Age Group Title Section */}
                  <div className="p-3 pb-2 justify-center flex">
                    <div className="flex items-center gap-2">
                      <div className="text-2xl">{group.emoji}</div>
                      <h3
                        className={`text-xl font-bold bg-gradient-to-r ${group.color} bg-clip-text text-transparent`}
                      >
                        {group.title}
                      </h3>
                    </div>
                  </div>

                  {/* Card Image */}
                  <div className="relative h-40 w-full">
                    <Image
                      src={getAgeGroupImage(group.id)}
                      alt={`${group.title} LEGO Robotics Workshop`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>

                  {/* Card Content */}
                  <div className="p-3 pt-2">
                    {/* Subtitle */}
                    <h4
                      className={`text-base font-semibold bg-gradient-to-r ${group.color} bg-clip-text text-transparent mb-1.5`}
                    >
                      {group.subtitle}
                    </h4>

                    {/* Description */}
                    <p className="text-gray-600 text-xs mb-2">
                      {group.description}
                    </p>

                    {/* Benefits List */}
                    <div className="space-y-0.5 mb-1.5">
                      {group.benefits.map((benefit, benefitIndex) => (
                        <div
                          key={benefitIndex}
                          className="flex items-start gap-2"
                        >
                          <div className="w-4 h-4 bg-[#A81B1E] rounded-full flex items-start justify-center mt-1 flex-shrink-0">
                            <span className="text-white text-[10px]">✓</span>
                          </div>
                          <span className="text-gray-700 text-sm text-start">
                            {benefit}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Next Step */}
                    {group.nextStep && (
                      <div className="p-1 bg-gradient-to-r from-[#FFF8E6] to-[#FFF0CC] rounded-md border border-[#FFECB3]">
                        <p className="text-xs text-gray-700">
                          <span className="font-semibold">Next:</span>{" "}
                          {group.nextStep}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default ProgramHighlights;
