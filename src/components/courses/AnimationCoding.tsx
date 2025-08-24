"use client";
import React from "react";
import CourseTemplate from "@/components/CourseTemplate";
import { AnimationAndCodingCurriculum } from "../../../utils/curriculum";

const AnimationCoding = () => {
  return (
    <CourseTemplate
      courseId="animationCoding"
      curriculumData={AnimationAndCodingCurriculum}
    />
  );
};

export default AnimationCoding;
