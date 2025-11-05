import React, { Suspense } from "react";
import CourseTemplate from "@/components/CourseTemplate";
import { notFound } from "next/navigation";
import {
  getCourseData,
  getCurriculumByCourseId,
  slugToCourseId,
} from "@/lib/courseData";
import type { Metadata } from "next";

// Disable dynamic params - only allow slugs from generateStaticParams
export const dynamicParams = false;

// Generate static paths for all course slugs
export async function generateStaticParams() {
  const slugs = Object.keys(slugToCourseId).map((slug) => ({
    slug: slug.toLowerCase(),
  }));

  console.log("✅ Generating static params for slugs:", slugs);
  return slugs;
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
  // Resolve params
  const resolvedParams = await params;
  const slug = resolvedParams.slug?.toLowerCase();

  console.log("🔍 Requested slug:", slug);

  // Validate slug exists
  if (!slug) {
    console.error("❌ No slug provided");
    notFound();
  }

  // Get course ID from slug
  const courseId = slugToCourseId[slug];

  if (!courseId) {
    console.error(`❌ Course ID not found for slug: ${slug}`);
    console.log("Available slugs:", Object.keys(slugToCourseId));
    notFound();
  }

  console.log("✅ Found courseId:", courseId);

  // Fetch course data
  const course = getCourseData(courseId);
  const curriculum = getCurriculumByCourseId(courseId) || [];

  if (!course) {
    console.error(`❌ Course data not found for courseId: ${courseId}`);
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
