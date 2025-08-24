"use client";
import React from "react";
import CourseTemplate from "@/components/CourseTemplate";
import { ArtificialIntelligenceCurriculum } from "../../../utils/curriculum";

const ArtificialIntelligence = () => {
  return (
    <CourseTemplate
      courseId="artificialIntelligence"
      curriculumData={ArtificialIntelligenceCurriculum}
    />
  );
};

export default ArtificialIntelligence;
