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
  // In Next.js 15, params is a Promise that needs to be awaited
  const resolvedParams = await params;
  const slug =
    typeof resolvedParams.slug === "string" ? resolvedParams.slug : "";
  const courseId = slugToCourseId[slug.toLowerCase()];

  if (!courseId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Course not found.</p>
      </div>
    );
  }

  const course = getCourseData(courseId);
  const curriculum = (await getCurriculumByCourseId(courseId)) || [];

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Course data unavailable.</p>
      </div>
    );
  }

  return <CourseTemplate courseId={courseId} curriculumData={curriculum} />;
};

export default Page;
