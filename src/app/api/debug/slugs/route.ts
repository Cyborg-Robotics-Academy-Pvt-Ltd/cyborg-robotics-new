import { NextResponse } from "next/server";
import { slugToCourseId, getCourseData } from "@/lib/courseData";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const slugs = Object.keys(slugToCourseId);
  const has3d = slugs.includes("3d-printing");
  const courseId = slugToCourseId["3d-printing"];
  const course = courseId ? getCourseData(courseId) : null;

  return NextResponse.json({
    totalSlugs: slugs.length,
    sample: slugs.sort().slice(0, 50),
    has3dPrintingSlug: has3d,
    resolvedCourseId: courseId || null,
    hasCourseData: Boolean(course),
  });
}


