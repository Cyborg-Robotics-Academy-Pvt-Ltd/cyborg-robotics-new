"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  foundersData,
  getSkillColorClasses,
} from "../../../utils/foundersData";

export default function FoundersSection() {
  const foundersRef = useRef(null);
  const foundersInView = useInView(foundersRef, {
    once: true,
    margin: "-100px",
  });

  // Create refs for each founder
  const founder1Ref = useRef(null);
  const founder2Ref = useRef(null);
  const founderRefs = [founder1Ref, founder2Ref];

  // Create individual useInView hooks for each founder
  const founder1InView = useInView(founder1Ref, {
    once: true,
    margin: "-50px",
  });
  const founder2InView = useInView(founder2Ref, {
    once: true,
    margin: "-50px",
  });

  const founderInViews = [founder1InView, founder2InView];

  return (
    <motion.section
      ref={foundersRef}
      initial={{ opacity: 0, y: 30 }}
      animate={foundersInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="max-w-6xl mx-auto mb-12 sm:mb-16 md:mb-20 px-2 sm:px-4"
    >
      <motion.h2
        className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2 sm:mb-4 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={foundersInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        Meet the{" "}
        <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
          Founders
        </span>
      </motion.h2>

      <motion.div
        className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r from-red-600 to-red-800 mx-auto rounded-full mb-8 sm:mb-10 md:mb-12"
        initial={{ width: 0 }}
        animate={foundersInView ? { width: 96 } : {}}
        transition={{ delay: 0.3, duration: 0.4 }}
      />

      <div className="space-y-8 sm:space-y-10 md:space-y-12">
        {foundersData.map((founder, index) => {
          const isInView = founderInViews[index];
          const IconComponent = founder.floatingBadgeIcon;

          return (
            <motion.div
              key={founder.id}
              ref={founderRefs[index]}
              className="group"
              initial={{ opacity: 0, y: 60 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Card
                className={`border-0 drop-shadow-lg hover:shadow-3xl transition-all duration-300 overflow-hidden bg-gradient-to-br ${founder.gradientColors.card}`}
              >
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row items-center gap-4 sm:gap-6 md:gap-8">
                    {/* Image Section - Left */}
                    <motion.div
                      className="flex-shrink-0"
                      initial={{ opacity: 0, y: 30 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{
                        delay: 0.1,
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                    >
                      <div className="relative w-40 h-52 sm:w-44 sm:h-56 md:w-48 md:h-64">
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${founder.gradientColors.badge} rounded-3xl transform transition-transform duration-300`}
                        ></div>
                        <div className="relative w-full h-full rounded-3xl overflow-hidden border-4 border-white shadow-xl">
                          <Image
                            src={founder.image}
                            alt={founder.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                            loading="lazy"
                            sizes="192px"
                            quality={75}
                          />
                        </div>
                        {/* Floating badge */}
                        <div
                          className={`absolute -top-2 -right-2 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${founder.gradientColors.badge.replace("from-", "from-").replace("to-", "to-").replace("-200", "-500").replace("-300", "-600")} rounded-full flex items-center justify-center shadow-lg`}
                        >
                          <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                      </div>
                    </motion.div>

                    {/* Content Section - Right */}
                    <motion.div
                      className="flex-1 text-center lg:text-left"
                      initial={{ opacity: 0, y: 30 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{
                        delay: 0.2,
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                    >
                      <motion.h3
                        className={`text-xl sm:text-2xl font-bold text-gray-800 mb-2 ${founder.gradientColors.text} transition-colors`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.1, duration: 0.3 }}
                      >
                        {founder.name}
                      </motion.h3>
                      <motion.p
                        className={`${founder.id === "shikha" ? "text-red-600" : "text-blue-600"} font-semibold mb-3 text-sm sm:text-base`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.15, duration: 0.3 }}
                      >
                        {founder.title}
                      </motion.p>

                      {/* Skills badges */}
                      <motion.div
                        className="flex flex-wrap justify-center lg:justify-start gap-1 sm:gap-2 mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.2, duration: 0.3 }}
                      >
                        {founder.skills.map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className={`px-2 sm:px-3 py-1 ${getSkillColorClasses(skill.color)} rounded-full text-xs font-medium`}
                          >
                            {skill.label}
                          </span>
                        ))}
                      </motion.div>

                      <motion.p
                        className="text-gray-600 leading-relaxed mb-6 text-sm sm:text-base"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.25, duration: 0.3 }}
                      >
                        {founder.description}
                      </motion.p>

                      {/* Achievements */}
                      <motion.div
                        className="space-y-2 mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.3, duration: 0.3 }}
                      >
                        {founder.achievements.map(
                          (achievement, achievementIndex) => {
                            const AchievementIcon = achievement.icon;
                            return (
                              <div
                                key={achievementIndex}
                                className="flex items-center justify-center lg:justify-start gap-2 text-sm text-gray-600"
                              >
                                <AchievementIcon
                                  className={`w-3 h-3 sm:w-4 sm:h-4 ${achievement.iconColor}`}
                                />
                                <span>{achievement.text}</span>
                              </div>
                            );
                          }
                        )}
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.35, duration: 0.3 }}
                      >
                        <Button
                          asChild
                          className={`bg-gradient-to-r ${founder.gradientColors.button} text-white px-4 sm:px-6 py-2 rounded-full transition-all duration-300 hover:scale-105 shadow-lg text-sm sm:text-base`}
                        >
                          <Link href={founder.linkedinUrl} target="_blank">
                            Connect on LinkedIn
                          </Link>
                        </Button>
                      </motion.div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
/*End of FoundersSection Component*/
