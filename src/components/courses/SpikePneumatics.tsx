"use client";
import React from "react";
import CourseTemplate from "@/components/CourseTemplate";
import { SpikePneumatics as SpikePneumaticsCurriculum } from "../../../utils/curriculum";

const SpikePneumatics = () => {
  return (
    <CourseTemplate
      courseId="spikePneumatics"
      curriculumData={SpikePneumaticsCurriculum}
    />
  );
};

export default SpikePneumatics;
