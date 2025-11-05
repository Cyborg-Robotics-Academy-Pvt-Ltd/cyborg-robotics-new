import React, { Suspense } from "react";
import CourseTemplate from "@/components/CourseTemplate";
import { notFound } from "next/navigation";
import {
  getCourseData,
  getCurriculumByCourseId,
  slugToCourseId,
} from "@/lib/courseData";

export default async function Page({
  params,
}: {
  params: { slug?: string | string[] };
}) {
  const slugParam = Array.isArray(params?.slug)
    ? params?.slug[0]
    : params?.slug;
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
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      }
    >
      <CourseTemplate courseId={courseId} curriculumData={curriculum} />
    </Suspense>
  );
}

export function generateStaticParams() {
  return Object.keys(slugToCourseId).map((slug) => ({ slug }));
}
