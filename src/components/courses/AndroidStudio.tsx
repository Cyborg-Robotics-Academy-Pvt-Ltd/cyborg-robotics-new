"use client";
import React from "react";
import CourseTemplate from "@/components/CourseTemplate";
import { AndroidCurriculum } from "../../../utils/curriculum";

const AndroidStudio = () => {
  return (
    <CourseTemplate
      courseId="androidStudio"
      curriculumData={AndroidCurriculum}
    />
  );
};

export default AndroidStudio;
