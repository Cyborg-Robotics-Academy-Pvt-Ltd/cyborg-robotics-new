import React, { Suspense } from "react";
import nextDynamic from "next/dynamic";
import { notFound, redirect } from "next/navigation";
import {
  getCourseData,
  getCurriculumByCourseId,
  slugToCourseId,
} from "@/lib/courseData";
import type { Metadata } from "next";

// Route options: allow handling unknown-at-build-time slugs at runtime
export const dynamicParams = true;
// Force dynamic rendering so Vercel creates a server lambda for this route
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

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
  params: { slug: string };
}): Promise<Metadata> {
  const slug = params.slug?.toLowerCase();

  if (!slug) {
    return {
      title: "Course Not Found",
    };
  }

  const courseId = slugToCourseId[slug];
  console.error(
    "[courses/[slug]] [metadata] slug:",
    slug,
    "→ courseId:",
    courseId
  );

  if (!courseId) {
    return {
      title: "Course Not Found",
    };
  }

  const course = getCourseData(courseId);
  console.error("[courses/[slug]] [metadata] hasCourse:", Boolean(course));

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
  params: { slug: string };
}) {
  const slug = params.slug?.toLowerCase();

  if (!slug) {
    redirect("/course-mindmap");
  }

  const courseId = slugToCourseId[slug];

  if (!courseId) {
    console.error("[courses/[slug]] Not found: unknown slug", slug);
    redirect("/course-mindmap");
  }

  const course = getCourseData(courseId);
  const curriculum = getCurriculumByCourseId(courseId) || [];

  if (!course) {
    console.error(
      "[courses/[slug]] Not found: missing course for id",
      courseId
    );
    redirect("/course-mindmap");
  }

  const CourseTemplate = nextDynamic(
    () => import("@/components/CourseTemplate"),
    {
      loading: () => (
        <div className="w-full h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ),
      ssr: false,
    }
  );

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
