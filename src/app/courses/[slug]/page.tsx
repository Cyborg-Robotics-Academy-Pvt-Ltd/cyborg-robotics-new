import React from "react";
import CourseTemplate from "@/components/CourseTemplate";
import {
  getCourseData,
  getCurriculumByCourseId,
  slugToCourseId,
} from "@/lib/courseData";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const Page = async ({ params }: PageProps) => {
  try {
    // In Next.js 15, params is a Promise that needs to be awaited
    const resolvedParams = await params;
    const slug =
      typeof resolvedParams.slug === "string" ? resolvedParams.slug : "";

    // Ensure slug is properly formatted
    const formattedSlug = slug.toLowerCase().trim();
    const courseId = slugToCourseId[formattedSlug];

    if (!courseId) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Course not found.</p>
        </div>
      );
    }

    const course = getCourseData(courseId);

    if (!course) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-600">Course data unavailable.</p>
        </div>
      );
    }

    // Safely get curriculum data with proper typing
    let curriculum: { id: string; title: string; subtitle: string[] }[] = [];
    try {
      const curriculumData = await getCurriculumByCourseId(courseId);
      curriculum = curriculumData || [];
    } catch (error) {
      console.error("Error loading curriculum:", error);
      curriculum = [];
    }

    return <CourseTemplate courseId={courseId} curriculumData={curriculum} />;
  } catch (error) {
    console.error("Error loading course page:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">
          Error loading course. Please try again later.
        </p>
      </div>
    );
  }
};

export default Page;
