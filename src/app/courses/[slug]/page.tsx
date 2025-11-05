// app/courses/[slug]/page.tsx

export const dynamic = "force-dynamic";
export const revalidate = 60;

import React from "react";
import CourseTemplate from "@/components/CourseTemplate";
import { getCourseData, slugToCourseId } from "@/lib/courseData";
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
  let curriculum = [];
  try {
    const curriculumModule = require("@/utils/curriculum");

    const map: Record<string, any[]> = {
      python: curriculumModule.pythonCourseData,
      arduino: curriculumModule.ArduinoCurriculum,
      webDesigning: curriculumModule.WebDesignCurriculum,
      java: curriculumModule.javaCurriculum,
      androidStudio: curriculumModule.AndroidCurriculum,
      machineLearning: curriculumModule.MachineLearningCurriculum,
      artificialIntelligence: curriculumModule.ArtificialIntelligenceCurriculum,
      roboticsEv3: curriculumModule.RoboticsCurriculum,
      spikePrime: curriculumModule.SpikePrimeCurriculum,
      printing3d: curriculumModule.ThreeDPrintingCurriculum,
      bambinoCoding: curriculumModule.BambinoCodingCurriculum,
      electronics: [],
      animationCoding: curriculumModule.AnimationAndCodingCurriculum,
      appDesigning: [],
      earlySimpleMachines: curriculumModule.EarlySimplemachineCurriculum,
      iot: curriculumModule.IotCurriculum,
      spikePneumatics: curriculumModule.SpikePneumatics,
      simplePoweredMachines: curriculumModule.SimplePoweredMachines,
      appLab: curriculumModule.AppLabCurriculum,
    };

    curriculum = map[courseId] || [];
  } catch (error) {
    console.error("Error loading curriculum:", error);
  }

  return <CourseTemplate courseId={courseId} curriculumData={curriculum} />;
}
