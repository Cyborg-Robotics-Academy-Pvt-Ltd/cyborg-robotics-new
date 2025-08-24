"use client";
import React from "react";
import CourseTemplate from "@/components/CourseTemplate";
import { BambinoCodingCurriculum } from "../../../utils/curriculum";

const BambinoCoding = () => {
  return (
    <CourseTemplate
      courseId="bambinoCoding"
      curriculumData={BambinoCodingCurriculum}
    />
  );
};

export default BambinoCoding;
