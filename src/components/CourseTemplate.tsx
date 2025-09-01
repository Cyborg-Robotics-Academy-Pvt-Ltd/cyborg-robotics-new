"use client";

import Image from "next/image";
import React from "react";
import Footer from "@/components/Footer";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { getCourseData } from "@/lib/courseData";
import * as LucideIcons from "lucide-react";

interface CourseTemplateProps {
  courseId: string;
  curriculumData: {
    id: string;
    title: string;
    subtitle: string[];
  }[];
}

const CourseTemplate: React.FC<CourseTemplateProps> = ({
  courseId,
  curriculumData,
}: CourseTemplateProps) => {
  const courseData = getCourseData(courseId);
  // Removed unused variable 'y'

  if (!courseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-800 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Course not found</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  const scaleInVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  const handleDownloadSyllabus = () => {
    const link = document.createElement("a");
    link.href = courseData.syllabusPath;
    link.download = courseData.syllabusFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = (
      LucideIcons as unknown as Record<string, React.ElementType>
    )[iconName];
    return IconComponent ? (
      <IconComponent className="text-red-600" size={28} />
    ) : null;
  };

  return (
    <div className="mx-auto max-w-7xl mt-2 md:mt-24 overflow-hidden px-2 sm:px-4 lg:px-8">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          className="absolute -top-24 -right-24 w-96 h-96 bg-red-100 rounded-full opacity-20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-100 rounded-full opacity-20 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Hero Section */}
      <div className="lg:mt-16 mt-4 px-2 sm:px-4 lg:px-0 relative">
        <motion.div
          className="flex flex-col lg:flex-row items-center gap-8 md:gap-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="w-full md:w-10/12 lg:w-1/2 space-y-4 md:space-y-6"
            variants={fadeInUpVariants}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Badge className="mb-4 px-4 py-2 bg-gradient-to-r from-red-100 to-red-200 text-red-800 hover:from-red-200 hover:to-red-300 border-0 shadow-xl backdrop-blur-sm font-medium text-sm">
                ✨ {courseData.badge}
              </Badge>
            </motion.div>

            <motion.h1
              className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-800 via-red-600 to-red-800 leading-tight"
              variants={fadeInUpVariants}
            >
              {courseData.title}
            </motion.h1>

            <motion.p
              className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg"
              variants={fadeInUpVariants}
            >
              {courseData.subtitle}
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-2 md:gap-4"
              variants={fadeInUpVariants}
            >
              <Badge
                variant="outline"
                className="px-4 py-2 border-2 border-red-200 text-red-700 bg-red-50 hover:bg-red-100 transition-colors font-medium"
              >
                🎯 {courseData.mode}
              </Badge>
              <Badge
                variant="outline"
                className="px-4 py-2 border-2 border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors font-medium"
              >
                ⏰ {courseData.duration}
              </Badge>
            </motion.div>

            <motion.div
              variants={fadeInUpVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="https://wa.me/917028511161?text=Hello%20Cyborg,%20I%20am%20looking%20for%20some%20help!%20(Enquiry)"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center gap-2">
                  <span>🚀 Enroll Now</span>
                </button>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="w-full lg:w-1/2 mt-8 lg:mt-0"
            variants={scaleInVariants}
          >
            <motion.div
              className="relative rounded-3xl overflow-hidden shadow-2xl"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 to-blue-500/10 z-10"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 z-10"></div>

              <Image
                src={courseData.imagePath}
                alt={courseData.imageAlt}
                width={600}
                height={400}
                layout="responsive"
                unoptimized
                className="object-cover w-full h-auto max-h-80 sm:max-h-[400px] transition-transform duration-700 hover:scale-110"
              />

              {/* Floating elements */}
              <motion.div
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-xl z-20"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Course Overview */}
      <motion.div
        className="mt-16 sm:mt-20 mx-2 sm:mx-4 lg:mx-8"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="relative p-4 bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-xl border border-gray-100">
          <motion.div
            className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full opacity-20 blur-xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          <h2 className="md:text-3xl text-xl font-bold  text-gray-800 mb-6 flex items-center gap-3">
            <span className="md:text-4xl text-xl ">📚</span>
            Course Overview
          </h2>
          <p className="text-gray-700 text-sm md:text-lg leading-relaxed">
            {courseData.courseOverview}
          </p>
        </div>
      </motion.div>

      {/* Key Features */}
      <motion.div
        className="mt-16 sm:mt-20 mx-2 sm:mx-4 lg:mx-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className=" mr-3 md:text-3xl text-2xl">🎯</span>
          <span className=" mr-3 md:text-3xl text-2xl">
            {" "}
            What You&apos;ll Master
          </span>
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {courseData.keyFeatures.map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeInUpVariants}
              whileHover={{
                scale: 1.03,
                rotateY: 5,
              }}
              className="h-full"
            >
              <Card className="border-0 shadow-xl hover:shadow-xl transition-all duration-300 h-full bg-gradient-to-br from-white to-gray-50 overflow-hidden relative group">
                <motion.div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <CardContent className="p-8 relative z-10">
                  <motion.div
                    className="flex items-center mb-6"
                    whileHover={{ scale: 1.1 }}
                  >
                    <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-xl mr-4 shadow-md">
                      {getIconComponent(feature.iconName)}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {feature.title}
                    </h3>
                  </motion.div>
                  <p className="text-gray-600 leading-relaxed text-base">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Learning Journey Timeline */}
      <motion.div
        className="mt-16 sm:mt-20 mx-2 sm:mx-4 lg:mx-8"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="p-6 sm:p-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl shadow-xl relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, #f43f5e 0%, transparent 50%), 
                               radial-gradient(circle at 75% 75%, #3b82f6 0%, transparent 50%)`,
              }}
            />
          </div>

          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-8 sm:mb-12 relative z-10"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="md:text-5xl text-2xl mr-3">🗺️</span>
            <span className="md:text-5xl text-xl mr-3">
              Your Learning Adventure
            </span>
          </motion.h2>

          <div className="relative flex flex-col gap-6 sm:gap-8 pl-4 sm:pl-4">
            {/* Enhanced vertical line */}
            <motion.div
              className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-red-300 via-blue-300 to-purple-300 rounded-full shadow-xl"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              style={{ transformOrigin: "top" }}
            />

            {curriculumData.map((level, index) => (
              <motion.div
                key={level.id}
                className="relative flex items-start z-10"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {/* Enhanced numbered circle */}
                <motion.div
                  className="flex flex-col items-center mr-8"
                  whileHover={{ scale: 1.1 }}
                >
                  <motion.div
                    className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-red-700 text-white text-lg sm:text-xl font-bold shadow-xl border-4 border-white relative"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      className="absolute inset-0 rounded-full bg-gradient-to-br from-red-400 to-red-600 opacity-0"
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="relative z-10">{index + 1}</span>
                  </motion.div>
                </motion.div>

                {/* Enhanced step box */}
                <motion.div
                  className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-8 border border-white/50 relative overflow-hidden group"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <h3 className="text-xl sm:text-2xl font-bold text-red-700 mb-2 sm:mb-3 relative z-10">
                    {level.title}
                  </h3>
                  <p className="text-gray-700 text-base sm:text-lg mb-2 sm:mb-3 relative z-10">
                    {level.subtitle[0]}
                  </p>
                  {level.subtitle.length > 1 && (
                    <motion.ul
                      className="space-y-1 sm:space-y-2 relative z-10"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {level.subtitle
                        .slice(1)
                        .map((item: string, itemIndex: number) => (
                          <motion.li
                            key={itemIndex}
                            className="text-gray-600 text-sm sm:text-base flex items-start gap-2"
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: itemIndex * 0.1 }}
                          >
                            <span className="text-red-500 mt-1">•</span>
                            {item}
                          </motion.li>
                        ))}
                    </motion.ul>
                  )}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* NEW: Additional CTA Section for Course Journey */}
      <motion.div
        className="mt-12 sm:mt-16 mx-2 sm:mx-4 lg:mx-8 p-4 sm:p-8 bg-red-50 rounded-2xl text-center relative overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        {/* Subtle background decoration */}
        <motion.div
          className="absolute -top-4 -right-4 w-24 h-24 bg-red-200 rounded-full opacity-20 blur-2xl"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute -bottom-4 -left-4 w-32 h-32 bg-red-100 rounded-full opacity-30 blur-2xl"
          animate={{
            scale: [1.1, 1, 1.1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <motion.h2
          className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-800 mb-2 sm:mb-4 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Ready to Start Your Development Journey?
        </motion.h2>

        <motion.p
          className="text-gray-700 mb-4 sm:mb-6 max-w-2xl mx-auto relative z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Join our sscomprehensive course and transform yourself into a skilled
          developer with industry-relevant skills.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="https://wa.me/917028511161?text=Hello%20Cyborg,%20I%20am%20looking%20for%20some%20help!%20(Enquiry)"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="bg-red-800 hover:bg-red-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-0.5">
                Enroll Now
              </button>
            </Link>
          </motion.div>

          <motion.button
            className="bg-white hover:bg-gray-100 text-red-800 font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg border border-red-300 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            onClick={handleDownloadSyllabus}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Download Syllabus
          </motion.button>
        </motion.div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default CourseTemplate;
