import React, { Suspense } from "react";
import CourseTemplate from "@/components/CourseTemplate";
import { notFound } from "next/navigation";
import {
  getCourseData,
  getCurriculumByCourseId,
  slugToCourseId,
} from "@/lib/courseData";
import type { Metadata } from "next";

// CRITICAL: Set these export options
export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = false;

// Generate static paths for all course slugs
export async function generateStaticParams() {
  // Get all slugs
  const allSlugs = Object.keys(slugToCourseId);

  // Log during build
  console.log("\n=================================");
  console.log("🔨 BUILDING STATIC PAGES");
  console.log("=================================");
  console.log("Total slugs found:", allSlugs.length);
  console.log("Slugs:", allSlugs);
  console.log("=================================\n");

  const params = allSlugs.map((slug) => ({
    slug: slug.toLowerCase(),
  }));

  // Log the params being returned
  console.log("Generated params:", JSON.stringify(params, null, 2));

  return params;
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug?.toLowerCase();

  if (!slug) {
    return {
      title: "Course Not Found",
    };
  }

  const courseId = slugToCourseId[slug];

  if (!courseId) {
    return {
      title: "Course Not Found",
    };
  }

  const course = getCourseData(courseId);

  if (!course) {
    return {
      title: "Course Not Found",
    };
  }

  return {
    title: `${course.title} | Your Site Name`,
    description: course.description || "Learn with our comprehensive course",
    openGraph: {
      title: course.title,
      description: course.description,
    },
  };
}

// Main page component
export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug?.toLowerCase();

  if (!slug) {
    notFound();
  }

  const courseId = slugToCourseId[slug];

  if (!courseId) {
    notFound();
  }

  const course = getCourseData(courseId);
  const curriculum = getCurriculumByCourseId(courseId) || [];

  if (!course) {
    notFound();
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
