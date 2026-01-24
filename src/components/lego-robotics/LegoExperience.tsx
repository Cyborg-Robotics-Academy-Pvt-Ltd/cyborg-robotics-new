import React from "react";
import { motion } from "framer-motion";

const LegoExperience = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const benefits = [
    {
      icon: "⏰",
      title: "Only 1 Hour",
      description: "No long-term commitment needed",
    },
    {
      icon: "🎓",
      title: "Age-Appropriate",
      description: "Curriculum tailored for each stage",
    },
    {
      icon: "👨‍🏫",
      title: "Mentor-Guided",
      description: "Learning with real mentors",
    },
    {
      icon: "🌟",
      title: "Builds Confidence",
      description: "Boosts curiosity & self-assurance",
    },
    {
      icon: "✨",
      title: "Results from Day One",
      description: "Visible progress immediately",
    },
  ];

  return (
    <div>
      {/* Enhanced Parents Choice Section */}
      <motion.section
        className="py-4 md:py-10 bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
      >
        <div className="max-w-[1200px] mx-auto px-4">
          <motion.div className="text-center mb-6" variants={fadeInUp}>
            <motion.h2
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#062341] mb-2 md:mb-2 font-sans"
              variants={fadeInUp}
            >
              Why Parents Love{" "}
              <span className="gradient-text font-bold">this Workshop</span>
            </motion.h2>
          </motion.div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-bold text-[#062341] mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-700">{benefit.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Testimonial Card */}
            <motion.div
              className="mt-10 max-w-3xl mx-auto bg-gradient-to-br from-[#FFF8E6] to-[#FFF0CC] rounded-2xl p-8 border border-[#FFECB3]"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-start">
                <div className="text-3xl mr-4">💭</div>
                <div>
                  <h4 className="font-bold text-xl text-gray-800 mb-3">
                    Parent Feedback
                  </h4>
                  <p className="text-gray-700 italic text-lg">
                    "My child came home excited and kept explaining what they
                    built — that itself says everything."
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default LegoExperience;
