// app/courses/[slug]/page.tsx

import React from "react";
import CourseTemplate from "@/components/CourseTemplate";
import {
  getCourseData,
  getCurriculumByCourseId,
  slugToCourseId,
} from "@/lib/courseData";
import { notFound } from "next/navigation";

// Generate static params for all known course slugs during build time
export async function generateStaticParams() {
  const slugs = Object.keys(slugToCourseId);

  // Return an array of objects with the slug parameter
  return slugs.map((slug) => ({
    slug: slug,
  }));
}

// Enable dynamic rendering as fallback for slugs not generated at build time
export const dynamicParams = true;

interface PageProps {
  params: { slug: string };
}

export default async function Page({ params }: PageProps) {
  // Ensure slug is a string and properly formatted
  const slug =
    typeof params.slug === "string" ? params.slug.toLowerCase().trim() : "";

  // Check if slug exists in our mapping
  if (!slugToCourseId.hasOwnProperty(slug)) {
    return notFound();
  }

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
    // Continue with empty curriculum if there's an error
  }

  return <CourseTemplate courseId={courseId} curriculumData={curriculum} />;
}
