"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
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

  // Set up intersection observer for scroll animations
  const [sectionRef, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: "-50px 0px",
  });

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
    <section
      ref={sectionRef}
      className="max-w-6xl mx-auto mb-2 sm:mb-4 pt-2 sm:pt-4 px-2 sm:px-4"
    >
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2 sm:mb-4 bg-gradient-to-r from-[#a63534] to-[#a63534] bg-clip-text text-transparent"
      >
        <span className="gradient-text">Our Story</span>
        <div className="flex items-center justify-center gap-2 my-2">
          <div className="w-12 h-1 bg-gradient-to-r from-transparent to-[#a63534] rounded-full"></div>
          <div className="w-24 h-1 bg-gradient-to-r from-[#a63534] to-[#a63534] rounded-full"></div>
          <div className="w-12 h-1 bg-gradient-to-r from-[#a63534] to-transparent rounded-full"></div>
        </div>
      </motion.h2>

      {/* Interactive Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex flex-wrap justify-center gap-1 sm:gap-2 mb-1 sm:mb-2 px-2"
      >
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-1 sm:gap-2 text-sm sm:text-base ${
                currentTab === tab.id
                  ? "bg-gradient-to-r from-[#a63534] to-[#a63534] text-white shadow-lg scale-105"
                  : "bg-white text-gray-700 hover:bg-[#a63534] hover:text-[#ffffff] border border-gray-200"
              }`}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
            >
              <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
              {tab.label}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Tab Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        <Card className="border-0 drop-shadow-xl bg-gradient-to-br rounded-2xl from-white via-gray-50 to-red-50/50 backdrop-blur-sm relative overflow-hidden">
          <CardContent className="p-4 sm:p-6 md:p-8 lg:p-12 relative z-10">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-gray-700 leading-relaxed text-sm sm:text-base"
            >
              {currentTab === 0 && (
                <div className="space-y-4">
                  <motion.h3
                    className="text-xl sm:text-2xl font-bold text-[#a63534] mb-3"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                  >
                    More Than Robots, It&#39;s About Unleashing Potential
                  </motion.h3>

                  <motion.p
                    className="text-base sm:text-lg mb-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    Hi, we are{" "}
                    <strong className="text-[#a63534]">Shikha</strong> and{" "}
                    <strong className="text-[#a63534]">Lokesh</strong>, the
                    founders of{" "}
                    <em className="font-semibold text-[#a63534]">
                      Cyborg Robotics Academy
                    </em>
                    . We&#39;re so glad you&#39;re here.
                  </motion.p>

                  <motion.p
                    className="mb-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    If you were to ask us what Cyborg is all about, you might
                    expect us to talk about robots, coding, or winning
                    competitions. And while we&#39;re incredibly proud of that,
                    our story actually begins with something much simpler: the{" "}
                    <strong className="text-[#a63534]">
                      unforgettable spark in a child&#39;s eyes
                    </strong>{" "}
                    when something they built with their own hands comes to
                    life.
                  </motion.p>

                  <motion.div
                    className="bg-white/70 rounded-xl p-3 sm:p-4 md:p-6 border border-[#a63534]/20 mb-4"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <h4 className="text-lg sm:text-xl font-bold text-[#a63534] mb-2 sm:mb-3">
                      The Beginning
                    </h4>
                    <p className="mb-3">
                      For Shikha, that spark became her purpose. It started in
                      her first job in STEM education, watching kids grasp
                      complex concepts not from a textbook, but by building and
                      exploring. That &quot;Aha!&quot; moment when a circuit
                      worked or a robot moved – it was{" "}
                      <em className="text-[#a63534] font-medium">pure magic</em>
                      .
                    </p>
                    <p className="mb-3">
                      Later, while leading a team to the{" "}
                      <strong className="text-[#a63534]">
                        World Robot Olympiad
                      </strong>
                      , she saw this magic on a global scale. When she moved to
                      Pune, she carried this passion with her, noticing a gap
                      she was eager to fill.
                    </p>
                    <p className="mb-3">
                      Meanwhile, Lokesh was dreaming about building the
                      ecosystems where this kind of magic could thrive.
                      Together, we asked ourselves one powerful question:{" "}
                      <em className="text-[#a63534] font-semibold">
                        &quot;What if every child could have access to such fun,
                        practical, and meaningful learning?&quot;
                      </em>
                    </p>
                    <p className="font-semibold text-[#a63534]">
                      That question was the seed from which Cyborg Robotics
                      Academy grew.
                    </p>
                  </motion.div>

                  <motion.div
                    className="bg-white/70 rounded-xl p-3 sm:p-4 md:p-6 border border-[#a63534]/20 mb-4"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <h4 className="text-lg sm:text-xl font-bold text-[#a63534] mb-2 sm:mb-3">
                      The Challenge & Growth
                    </h4>
                    <p className="mb-3">
                      The journey wasn&apos;t always easy. We started in{""}
                      <strong className="text-[#a63534]">2018</strong> with
                      limited resources, but the joy on our students&#39; faces
                      was all the fuel we needed. By{" "}
                      <strong className="text-[#a63534]">2019</strong>, we had
                      grown to{" "}
                      <strong className="text-[#a63534]">
                        9 centers across Pune
                      </strong>
                      .
                    </p>
                    <p className="mb-3">
                      Then, the pandemic hit. Our entire model was built on
                      hands-on learning with physical kits, and suddenly, we had
                      to rethink everything. It was a daunting challenge, but we
                      were determined not to let our students&#39; learning
                      stop. We persevered, creatively restructured our programs,
                      and successfully transitioned online, reaching budding
                      innovators across the globe.
                    </p>
                    <p className="font-semibold text-[#a63534]">
                      That period taught us the true meaning of resilience.
                    </p>
                  </motion.div>

                  <motion.div
                    className="bg-white/70 rounded-xl p-3 sm:p-4 md:p-6 border border-[#a63534]/20 mb-4"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <h4 className="text-lg sm:text-xl font-bold text-[#a63534] mb-2 sm:mb-3">
                      Our Turning Point
                    </h4>
                    <p className="mb-3">
                      Our turning point came not from a business milestone, but
                      from our students. Watching them excel in competitions
                      with creativity and confidence was incredible, but the
                      real win was seeing a shy student completely transform.
                    </p>
                    <p className="mb-3">
                      After building his first robot, his parents told us he
                      began approaching all his studies with a{" "}
                      <em className="text-[#a63534] font-semibold">
                        new-found belief in himself
                      </em>
                      .
                    </p>
                    <p className="font-semibold text-[#a63534]">
                      That&#39;s when we knew we were on the right path. We were
                      not just teaching robotics; we were building confidence.
                    </p>
                  </motion.div>

                  <motion.div
                    className="bg-white/70 rounded-xl p-3 sm:p-4 md:p-6 border border-[#a63534]/20 mb-4"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    <h4 className="text-lg sm:text-xl font-bold text-[#a63534] mb-2 sm:mb-3">
                      Partners in Life & Business
                    </h4>
                    <p className="mb-3">
                      As partners in life and business, we balance each other.
                      Shikha&#39;s heart lives in the classroom, ensuring every
                      student feels that thrill of discovery. Lokesh focuses on
                      the strategy and operations to build a strong foundation
                      for that learning to happen.
                    </p>
                    <p className="mb-3">
                      We don&#39;t always agree, but we always come back to our
                      core value:{" "}
                      <strong className="text-[#a63534]">students first</strong>
                      . Every decision we make is guided by one question:{" "}
                      <em className="text-[#a63534] font-semibold">
                        &quot;Will this help our students?&quot;
                      </em>
                    </p>
                  </motion.div>

                  <motion.div
                    className="bg-white/70 rounded-xl p-3 sm:p-4 md:p-6 border border-[#a63534]/20 mb-4"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    <h4 className="text-lg sm:text-xl font-bold text-[#a63534] mb-2 sm:mb-3">
                      What Does The Future Hold?
                    </h4>
                    <p className="mb-3">
                      Our dream is to make this hands-on, practical learning
                      available to{" "}
                      <strong className="text-[#a63534]">
                        every child, everywhere
                      </strong>
                      . We don&#39;t just want to run an academy, we want to
                      inspire a movement.
                    </p>
                    <p className="mb-3">
                      A movement of{" "}
                      <em className="text-[#a63534] font-semibold">
                        curious, confident, and innovative young minds
                      </em>{" "}
                      who see a challenge not as a barrier, but as an
                      opportunity to create.
                    </p>
                    <ul className="space-y-3 mb-3 ml-4">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#a63534] rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong className="text-[#a63534]">
                            For Shikha:
                          </strong>
                          <span className="text-gray-700">
                            {" "}
                            This brand is the place she wished she had as a
                            child – a safe space to try, to fail, and to keep
                            going.
                          </span>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-[#a63534] rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <strong className="text-[#a63534]">
                            For Lokesh:
                          </strong>
                          <span className="text-gray-700">
                            {" "}
                            Cyborg is a launchpad. This isn&#39;t the final
                            destination for our kids; it&#39;s the platform from
                            which they take off into a world of endless
                            possibilities.
                          </span>
                        </div>
                      </li>
                    </ul>
                  </motion.div>

                  <motion.div
                    className="text-center p-4 bg-gradient-to-r from-[#a63534]/10 to-[#a63534]/30 rounded-xl border border-[#a63534]/30"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.9 }}
                  >
                    {/* Watermark */}
                    <div
                      className="absolute inset-0 opacity-15 pointer-events-none"
                      style={{
                        backgroundImage: "url('/assets/logo1.png')",
                        backgroundSize: "400px",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      }}
                    />
                    <p className="text-lg font-semibold text-[#a63534] mb-2">
                      We invite you to join us on this incredible journey.
                    </p>
                    <p className="text-[#a63534] font-medium mb-2">
                      Let&#39;s build the future together.
                    </p>
                    <p className="text-sm text-gray-600">
                      With warmth and excitement,
                    </p>
                    <p className="font-bold text-[#a63534]">Shikha & Lokesh</p>
                    <p className="text-sm text-[#a63534]">
                      Co-Founders, Cyborg Robotics Academy
                    </p>
                  </motion.div>
                </div>
              )}

              {currentTab === 1 && (
                <div className="space-y-4">
                  <motion.div
                    className="relative bg-white rounded-2xl p-4 sm:p-6 md:p-8 lg:p-12 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    {/* Mission icon */}
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#a63534] to-[#a63534] rounded-full flex items-center justify-center shadow-lg">
                        <Target className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                    </div>

                    {/* Mission title */}
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-3 sm:mb-4 bg-gradient-to-r from-[#a63534] via-[#a63534] to-[#a63534] bg-clip-text text-transparent">
                      Our Mission
                    </h3>

                    {/* Mission statement */}
                    <div className="relative">
                      <div
                        className="absolute inset-0
                       rounded-xl transform rotate-1"
                      ></div>
                      <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 md:p-6 lg:p-8 border border-[#a63534]/50 shadow-lg">
                        <p className="text-base sm:text-lg md:text-xl text-center leading-relaxed text-gray-700 font-medium">
                          To{" "}
                          <span className="text-[#a63534] font-bold">
                            transform the way
                          </span>{" "}
                          parents & children think about{" "}
                          <span className="text-[#a63534] font-semibold">
                            learning robotics technology
                          </span>
                          .
                        </p>
                      </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="flex justify-center mt-6 space-x-2">
                      <div className="w-2 h-2 bg-[#a63534]/80 rounded-full animate-pulse"></div>
                      <div
                        className="w-2 h-2 bg-[#a63534] rounded-full animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-[#a63534] rounded-full animate-pulse"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </motion.div>
                </div>
              )}
              {currentTab === 2 && (
                <div className="space-y-4">
                  <motion.div
                    className="relative bg-white rounded-2xl p-4 sm:p-6 md:p-8 lg:p-12 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    {/* Vision icon */}
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#a63534] to-[#a63534] rounded-full flex items-center justify-center shadow-lg">
                        <Rocket className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                    </div>

                    {/* Vision title */}
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-3 sm:mb-4 bg-gradient-to-r from-[#a63534] via-[#a63534] to-[#a63534] bg-clip-text text-transparent">
                      Our Vision
                    </h3>

                    {/* Vision statement */}
                    <div className="relative">
                      <div className="absolute inset-0  transform rotate-1"></div>
                      <div className="relative bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 md:p-6 lg:p-8 border border-[#a63534]/50 shadow-lg">
                        <p className="text-base sm:text-lg md:text-xl text-center leading-relaxed text-gray-700 font-medium">
                          To be a{" "}
                          <span className="text-[#a63534] font-bold">
                            leading global academy
                          </span>
                          , influencing the future of{" "}
                          <span className="text-[#a63534] font-semibold">
                            robotics for kids
                          </span>
                          .
                        </p>
                      </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="flex justify-center mt-6 space-x-2">
                      <div className="w-2 h-2 bg-[#a63534]/80 rounded-full animate-pulse"></div>
                      <div
                        className="w-2 h-2 bg-[#a63534] rounded-full animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-[#a63534] rounded-full animate-pulse"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </motion.div>
                </div>
              )}
              {currentTab === 3 && (
                <div className="space-y-4">
                  <motion.p
                    className="text-base sm:text-lg font-semibold text-[#a63534] mb-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    Our Beliefs
                  </motion.p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    <motion.div
                      className="text-center p-3 sm:p-4 bg-white/70 rounded-xl border border-[#a63534]/20"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                    >
                      <Lightbulb className="w-6 h-6 sm:w-8 sm:h-8 text-[#a63534] mx-auto mb-2" />
                      <p className="font-semibold text-[#a63534] text-sm sm:text-base">
                        Every child is an innovator
                      </p>
                    </motion.div>
                    <motion.div
                      className="text-center p-3 sm:p-4 bg-white/70 rounded-xl border border-[#a63534]/20"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-[#a63534] mx-auto mb-2" />
                      <p className="font-semibold text-[#a63534] text-sm sm:text-base">
                        Quality builds confidence
                      </p>
                    </motion.div>
                    <motion.div
                      className="text-center p-3 sm:p-4 bg-white/70 rounded-xl border border-[#a63534]/20"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-[#a63534] mx-auto mb-2" />
                      <p className="font-semibold text-[#a63534] text-sm sm:text-base">
                        Learning should be hands-on, personal, and inspiring
                      </p>
                    </motion.div>
                  </div>
                </div>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
