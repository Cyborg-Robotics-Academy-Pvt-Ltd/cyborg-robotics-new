import { notFound } from "next/navigation";
import { courseData } from "@/data/courseData";
import CourseTemplate from "@/components/CourseTemplate";

interface PageProps {
  params: { slug: string };
}

export default async function CoursePage({ params }: PageProps) {
  const { slug } = params;
  const course = courseData[slug];

  if (!course) {
    notFound();
  }

  return <CourseTemplate course={course} />;
}

// Optional: generate static params (if you ever use static export or SSG)
export async function generateStaticParams() {
  return Object.keys(courseData).map((slug) => ({ slug }));
}
