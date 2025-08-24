"use client";
import React from "react";
import CourseTemplate from "@/components/CourseTemplate";
import { MachineLearningCurriculum } from "../../../utils/curriculum";

const MachineLearning = () => {
  return (
    <CourseTemplate
      courseId="machineLearning"
      curriculumData={MachineLearningCurriculum}
    />
  );
};

export default MachineLearning;
