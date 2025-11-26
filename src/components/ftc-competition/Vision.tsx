import { Lightbulb, Wrench, Users, Sparkles, ChevronRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const pillars = [
  {
    icon: <Lightbulb className="h-10 w-10 text-red-500" />,
    title: "Innovation",
    description: "Creative ideas, strategy, design thinking",
  },
  {
    icon: <Wrench className="h-10 w-10 text-red-500" />,
    title: "Engineering Excellence",
    description: "Quality builds, robust mechanisms",
  },
  {
    icon: <Users className="h-10 w-10 text-red-500" />,
    title: "Professionalism",
    description: "Teamwork, communication, leadership",
  },
];

export function Vision() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <section
      id="vision"
      className="w-full bg-white relative overflow-hidden py-16 md:py-14"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 15% 50%, rgba(239, 68, 68, 0.3) 0%, transparent 20%), 
                            radial-gradient(circle at 85% 30%, rgba(239, 68, 68, 0.3) 0%, transparent 20%),
                            radial-gradient(circle at 25% 80%, rgba(255, 165, 0, 0.2) 0%, transparent 15%)`,
          }}
        />
      </div>

      <div className="container px-4 md:px-6 relative z-10">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col items-center justify-center space-y-8 md:space-y-1 text-center"
        >
          {/* Header Section */}
          <motion.div className="space-y-6 md:space-y-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-red-500/15 to-red-800/15 px-6 py-3 text-sm font-bold text-red-600 border border-red-200 shadow-md backdrop-blur-sm"
            >
              <Sparkles className="h-5 w-5 animate-pulse" />
              <span>Our Vision</span>
            </motion.div>

            <h1 className="text-center">
              <span className="text-3xl font-bold gradient-text">Our Team</span>
              <span className="text-3xl font-bold text-black"> Vision</span>
            </h1>

            <motion.p className="max-w-3xl text-lg md:text-xl text-gray-600 leading-relaxed mx-auto">
              At <strong className="text-gray-800">Cyborg Robotics</strong>, we
              empower students to become confident, creative and future-ready
              tech innovators.
            </motion.p>
          </motion.div>

          {/* Pillars Grid */}
          <motion.div
            variants={containerVariants}
            className="mx-auto grid max-w-6xl items-start gap-6 md:gap-8 py-8 md:py-7 sm:grid-cols-1 md:grid-cols-3"
          >
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                whileHover={{
                  y: -12,
                  transition: { duration: 0.3 },
                }}
                className="group relative"
              >
                <Card className="relative text-center rounded-3xl bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg group-hover:shadow-xl group-hover:shadow-red-500/10 transition-all duration-500 overflow-hidden h-full">
                  <CardHeader className="items-center relative z-10 py-8">
                    <motion.div
                      whileHover={{
                        scale: 1.1,
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: 0.5,
                        rotate: { repeat: Infinity, duration: 3 },
                      }}
                      className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-red-100 border-2 border-red-200 group-hover:from-red-200 group-hover:to-red-200 transition-all duration-300"
                    >
                      {pillar.icon}
                    </motion.div>
                    <CardTitle className="font-headline text-xl md:text-2xl font-bold text-gray-800 pt-6 pb-2">
                      {pillar.title}
                    </CardTitle>
                    <CardDescription className="text-base text-gray-600 leading-relaxed px-2">
                      {pillar.description}
                    </CardDescription>

                    {/* Animated underline on hover */}
                    <div className="mt-4 w-12 h-1 bg-gradient-to-r from-red-600 to-red-700 rounded-full mx-auto transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
