// app/courses/[slug]/page.tsx

export const dynamic = "force-dynamic";
export const revalidate = 60;

import React from "react";
import CourseTemplate from "@/components/CourseTemplate";
import {
  getCourseData,
  getCurriculumByCourseId,
  slugToCourseId,
} from "@/lib/courseData";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return Object.keys(slugToCourseId).map((slug) => ({ slug }));
}

interface PageProps {
  params: { slug: string };
}

export default async function Page({ params }: PageProps) {
  const slug = params.slug.toLowerCase().trim();
  const courseId = slugToCourseId[slug];

  if (!courseId) {
    return notFound();
  }

  const course = getCourseData(courseId);
  if (!course) {
    return notFound();
  }

  // Load curriculum data
  let curriculum: { id: string; title: string; subtitle: string[] }[] = [];
  try {
    const curriculumData = await getCurriculumByCourseId(courseId);
    curriculum = curriculumData || [];
  } catch (error) {
    console.error("Error loading curriculum:", error);
  }

  return <CourseTemplate courseId={courseId} curriculumData={curriculum} />;
}
