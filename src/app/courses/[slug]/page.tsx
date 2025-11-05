import React from "react";
import { notFound } from "next/navigation";
import CourseTemplate from "@/components/CourseTemplate";
import {
  getCourseData,
  getCurriculumByCourseId,
  slugToCourseId,
} from "@/lib/courseData";

export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string | string[] }>;
}) {
  const resolvedParams = await params;
  const slugParam = Array.isArray(resolvedParams?.slug)
    ? resolvedParams?.slug[0]
    : resolvedParams?.slug;
  const slug =
    typeof slugParam === "string" ? slugParam.toLowerCase() : undefined;
  if (!slug) {
    return notFound();
  }
  const courseId = slugToCourseId[slug];
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

export function generateStaticParams() {
  return Object.keys(slugToCourseId).map((slug) => ({ slug }));
}
