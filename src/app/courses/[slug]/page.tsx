"use client";
import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
const CourseTemplate = dynamic(() => import("@/components/CourseTemplate"), {
  ssr: false,
  loading: () => null,
});
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
