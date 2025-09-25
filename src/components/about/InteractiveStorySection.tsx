"use client";

import { useState, useRef, useMemo } from "react";

import { motion, useInView } from "framer-motion";
import {
  Calendar,
  Target,
  Rocket,
  Heart,
  Lightbulb,
  Trophy,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function InteractiveStorySection() {
  const [currentTab, setCurrentTab] = useState(0);

  // Independent refs for different sections
  const storyRef = useRef(null);
  const titleRef = useRef(null);
  const tabsRef = useRef(null);
  const contentRef = useRef(null);

  // Independent view detection for each section
  const storyInView = useInView(storyRef, { once: true, margin: "-100px" });
  const titleInView = useInView(titleRef, { once: true, margin: "-50px" });
  const tabsInView = useInView(tabsRef, { once: true, margin: "-50px" });
  const contentInView = useInView(contentRef, { once: true, margin: "-50px" });

  const tabs = useMemo(
    () => [
      { id: 0, label: "Our Journey", icon: Calendar },
      { id: 1, label: "Mission", icon: Target },
      { id: 2, label: "Vision", icon: Rocket },
      { id: 3, label: "Values", icon: Heart },
    ],
    []
  );

  return (
    <motion.section
      ref={storyRef}
      initial={{ opacity: 0, y: 30 }}
      animate={storyInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-6xl mx-auto mb-8"
    >
      <motion.h2
        ref={titleRef}
        className="text-3xl md:text-4xl font-bold text-center mb-6 bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: 20 }}
        animate={titleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <span className="gradient-text">Our Story</span>
      </motion.h2>

      {/* Interactive Tabs */}
      <motion.div
        ref={tabsRef}
        className="flex flex-wrap justify-center gap-2 mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={tabsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      >
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
                currentTab === tab.id
                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg scale-105"
                  : "bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border border-gray-200"
              }`}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, y: 10 }}
              animate={
                tabsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
              }
              transition={{
                duration: 0.3,
                ease: "easeOut",
                delay: index * 0.05,
              }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Tab Content */}
      <motion.div
        ref={contentRef}
        initial={{ opacity: 0, y: 30 }}
        animate={contentInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
      >
        <Card className="border-0 drop-shadow-xl bg-gradient-to-br rounded-2xl from-white via-gray-50 to-red-50/50 backdrop-blur-sm relative overflow-hidden">
          {/* Background decorative element - removed for performance */}
          <CardContent className="p-8 md:p-12 ">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-gray-700 leading-relaxed"
            >
              {currentTab === 0 && (
                <div className="space-y-6">
                  <p className="text-lg">
                    In 2018,{" "}
                    <strong className="text-red-700">Shikha Virmani</strong> and{" "}
                    <strong className="text-red-700">Lokesh Malik</strong>{" "}
                    founded{" "}
                    <em className="font-semibold text-red-600">
                      Cyborg Robotics Academy Pvt. Ltd.
                    </em>{" "}
                    with a simple belief: technology should be learned by
                    creating, not memorizing.
                  </p>
                  <p className="font-semibold text-red-700 text-lg">
                    But the journey began long before that.
                  </p>

                  <div className="bg-white/70 rounded-xl p-6 border border-red-100">
                    <h4 className="text-xl font-bold text-red-700 mb-4">
                      Shikha&apos;s Journey
                    </h4>
                    <p className="mb-4">
                      After completing her Engineering in Electronics &
                      Telecommunication, Shikha stepped into the edtech industry
                      in 2012. What amazed her was how the complex concepts she
                      had struggled through in engineering were being taught to
                      young kids in a{" "}
                      <em className="text-red-600 font-medium">
                        practical, playful, and easy-to-understand manner
                      </em>
                      .
                    </p>
                    <p className="mb-4">
                      She was fascinated and inspired. She saw how this kind of
                      learning:
                    </p>
                    <ul className="space-y-2 mb-4 ml-4">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>
                          Sparked curiosity in children who once found science
                          intimidating
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>
                          Boosted confidence by letting them build, fail, and
                          rebuild
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>
                          Encouraged teamwork, problem-solving, and leadership
                          at a young age
                        </span>
                      </li>
                    </ul>
                    <p className="mb-4">
                      Over the next six years, Shikha trained{" "}
                      <strong className="text-red-700">5000+ students</strong>,
                      mentored teams at national and international competitions,
                      and eventually rose to head an organization that was part
                      of the{" "}
                      <strong className="text-red-700">
                        National Organizing Committee of the World Robotics
                        Olympiad (WRO)
                      </strong>
                      .
                    </p>
                    <p>
                      In 2018, she moved to Pune, ready to take her vision
                      further. Together with{" "}
                      <strong className="text-red-700">Lokesh Malik</strong>,
                      who shared her belief in hands-on, future-ready education,
                      she laid the foundation of{" "}
                      <strong className="text-red-700">
                        Cyborg Robotics Academy Pvt. Ltd.
                      </strong>
                    </p>
                  </div>
                </div>
              )}

              {currentTab === 1 && (
                <div className="space-y-6">
                  <div className="relative bg-white rounded-2xl p-8 md:p-12   overflow-hidden">
                    {/* Mission icon */}
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                        <Target className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Mission title */}
                    <h3 className="text-2xl md:text-3xl font-bold text-center mb-6 bg-gradient-to-r from-red-600 via-red-700 to-red-800 bg-clip-text text-transparent">
                      Our Mission
                    </h3>

                    {/* Mission statement */}
                    <div className="relative">
                      <div
                        className="absolute inset-0
                       rounded-xl transform rotate-1"
                      ></div>
                      <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-red-200/50 shadow-lg">
                        <p className="text-lg md:text-xl text-center leading-relaxed text-gray-700 font-medium">
                          To{" "}
                          <span className="text-red-700 font-bold">
                            transform the way
                          </span>{" "}
                          parents & children think about{" "}
                          <span className="text-red-600 font-semibold">
                            learning robotics technology
                          </span>
                          .
                        </p>
                      </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="flex justify-center mt-8 space-x-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                      <div
                        className="w-2 h-2 bg-red-500 rounded-full animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-red-600 rounded-full animate-pulse"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {currentTab === 2 && (
                <div className="space-y-6">
                  <div className="relative bg-white rounded-2xl p-8 md:p-12   overflow-hidden">
                    {/* Vision icon */}
                    <div className="flex justify-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                        <Rocket className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Vision title */}
                    <h3 className="text-2xl md:text-3xl font-bold text-center mb-6 bg-gradient-to-r from-red-600 via-red-700 to-red-800 bg-clip-text text-transparent">
                      Our Vision
                    </h3>

                    {/* Vision statement */}
                    <div className="relative">
                      <div className="absolute inset-0  transform rotate-1"></div>
                      <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-red-200/50 shadow-lg">
                        <p className="text-lg md:text-xl text-center leading-relaxed text-gray-700 font-medium">
                          To be a{" "}
                          <span className="text-red-700 font-bold">
                            leading global academy
                          </span>
                          , influencing the future of{" "}
                          <span className="text-red-600 font-semibold">
                            robotics for kids
                          </span>
                          .
                        </p>
                      </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="flex justify-center mt-8 space-x-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                      <div
                        className="w-2 h-2 bg-red-500 rounded-full animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-red-600 rounded-full animate-pulse"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {currentTab === 3 && (
                <div className="space-y-6">
                  <p className="text-lg font-semibold text-red-700">
                    Our Core Beliefs
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-white/70 rounded-xl border border-red-100">
                      <Lightbulb className="w-8 h-8 text-red-600 mx-auto mb-3" />
                      <p className="font-semibold text-red-700">
                        Every child is an innovator
                      </p>
                    </div>
                    <div className="text-center p-4 bg-white/70 rounded-xl border border-red-100">
                      <Trophy className="w-8 h-8 text-red-600 mx-auto mb-3" />
                      <p className="font-semibold text-red-700">
                        Quality builds confidence
                      </p>
                    </div>
                    <div className="text-center p-4 bg-white/70 rounded-xl border border-red-100">
                      <Zap className="w-8 h-8 text-red-600 mx-auto mb-3" />
                      <p className="font-semibold text-red-700">
                        Learning must be hands-on
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.section>
  );
}
