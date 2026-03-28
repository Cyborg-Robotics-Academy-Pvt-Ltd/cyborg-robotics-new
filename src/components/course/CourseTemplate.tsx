"use client";

import { CourseData } from "@/data/courseData";
import * as Icons from "lucide-react";
import { BookOpen, Clock, Download, Star } from "lucide-react";
import Image from "next/image";

interface CourseTemplateProps {
  course: CourseData;
}

export default function CourseTemplate({ course }: CourseTemplateProps) {
  // Create a safer way to access icons without type casting the entire module
  const getIconComponent = (iconName: string) => {
    // Use a type guard to safely access icons
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
      {/* Header Section */}
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <Image
          width={500}
          height={300}
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

          {/* Pricing */}
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

          {/* Download syllabus */}
          <a
            href={course.syllabusPath}
            download={course.syllabusFileName}
            className="mt-6 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Download size={18} /> Download Syllabus
          </a>
        </div>
      </div>

      {/* Key Features */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Key Features</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {course.keyFeatures.map((feature, index) => {
            const Icon = getIconComponent(feature.iconName);
            return (
              <div
                key={index}
                className="p-5 rounded-xl shadow-sm hover:shadow-md transition"
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

      {/* Overview */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-4">Course Overview</h2>
        <p className="text-gray-700 leading-relaxed">{course.courseOverview}</p>
      </div>
    </div>
  );
}
