"use client";
import React from "react";
import CourseTemplate from "@/components/CourseTemplate";
import {
  getCourseData,
  getCurriculumByCourseId,
  slugToCourseId,
} from "@/lib/courseData";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const courseId = slugToCourseId[slug.toLowerCase()];
  if (!courseId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Course not found.</p>
      </div>
    );
  }

  const course = getCourseData(courseId);
  const curriculum = getCurriculumByCourseId(courseId) || [];

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Course data unavailable.</p>
      </div>
    );
  }

  return <CourseTemplate courseId={courseId} curriculumData={curriculum} />;
}
