"use client";

import { notFound } from "next/navigation";
import { courseData, CourseData } from "@/data/courseData";
import { BookOpen, Clock, Download, Star } from "lucide-react";
import * as Icons from "lucide-react";

interface PageProps {
  params: { slug: string };
}

export default function CoursePage({ params }: PageProps) {
  const { slug } = params;

  // Handle potential slug variations
  const normalizedSlug = slug.replace(/-language$/, "");
  let course: CourseData | undefined =
    courseData[slug] || courseData[normalizedSlug];

  // Additional check for python-language case
  if (!course && slug === "python-language") {
    course = courseData["python"];
  }

  // Additional check for web-designing case
  if (!course && slug === "web-designing") {
    course = courseData["webDesigning"];
  }

  // Additional check for app-designing case
  if (!course && slug === "app-designing") {
    course = courseData["appDesigning"];
  }

  // Additional check for machine-learning case
  if (!course && slug === "machine-learning") {
    course = courseData["machineLearning"];
  }

  // Additional check for artificial-intelligence case
  if (!course && slug === "artificial-intelligence") {
    course = courseData["artificialIntelligence"];
  }

  // Additional check for robotics-ev3 case
  if (!course && slug === "robotics-ev3") {
    course = courseData["roboticsEv3"];
  }

  // Additional check for spike-prime case
  if (!course && slug === "spike-prime") {
    course = courseData["spikePrime"];
  }

  // Additional check for 3d-printing case
  if (!course && slug === "3d-printing") {
    course = courseData["printing3d"];
  }

  // Additional check for bambino-coding case
  if (!course && slug === "bambino-coding") {
    course = courseData["bambinoCoding"];
  }

  // Additional check for animation-coding case
  if (!course && slug === "animation-coding") {
    course = courseData["animationCoding"];
  }

  // Additional check for app-lab case
  if (!course && slug === "app-lab") {
    course = courseData["appLab"];
  }

  // Additional check for simple-powered-machines case
  if (!course && slug === "simple-powered-machines") {
    course = courseData["simplePoweredMachines"];
  }

  // Additional check for spike-pneumatics case
  if (!course && slug === "spike-pneumatics") {
    course = courseData["spikePneumatics"];
  }

  // Additional check for early-simple-machines case
  if (!course && slug === "early-simple-machines") {
    course = courseData["earlySimpleMachines"];
  }

  if (!course) {
    notFound();
  }

  const getIconComponent = (iconName: string) => {
    const icon = (
      Icons as unknown as Record<
        string,
        React.ComponentType<React.SVGProps<SVGSVGElement>> | undefined
      >
    )[iconName];
    return icon || Star;
  };

  return (
    <div className="max-w-6xl mx-auto py-16 px-6">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <img
          src={course.imagePath}
          alt={course.imageAlt}
          className="w-full rounded-2xl shadow-md"
        />
        <div>
          <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
            {course.badge}
          </span>
          <h1 className="text-4xl font-bold mt-4">{course.title}</h1>
          <p className="text-gray-600 mt-2">{course.subtitle}</p>

          <div className="flex flex-wrap gap-4 mt-4 text-gray-700">
            <div className="flex items-center gap-2">
              <Clock size={18} /> {course.duration}
            </div>
            <div className="flex items-center gap-2">
              <BookOpen size={18} /> {course.mode}
            </div>
          </div>

          {course.price && (
            <div className="mt-6">
              <div className="flex items-baseline gap-3">
                <p className="text-2xl font-semibold text-green-600">
                  ₹{course.price.toLocaleString(course.locale)}
                </p>
                {course.originalPrice && (
                  <p className="text-gray-500 line-through">
                    ₹{course.originalPrice.toLocaleString(course.locale)}
                  </p>
                )}
              </div>
            </div>
          )}

          <a
            href={course.syllabusPath}
            download={course.syllabusFileName}
            className="mt-6 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Download size={18} /> Download Syllabus
          </a>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Key Features</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {course.keyFeatures.map((feature, index) => {
            const Icon = getIconComponent(feature.iconName);
            return (
              <div
                key={index}
                className="p-5 border rounded-xl shadow-sm hover:shadow-md transition"
              >
                <Icon className="text-blue-600 mb-3" size={28} />
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-4">Course Overview</h2>
        <p className="text-gray-700 leading-relaxed">{course.courseOverview}</p>
      </div>
    </div>
  );
}
