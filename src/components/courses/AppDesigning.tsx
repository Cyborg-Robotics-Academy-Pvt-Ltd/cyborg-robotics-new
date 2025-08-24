"use client";
import React from "react";
import CourseTemplate from "@/components/CourseTemplate";
import { AppDevelopmentData } from "../../../utils/curriculum";

const AppDesigning = () => {
  return (
    <CourseTemplate
      courseId="appDesigning"
      curriculumData={AppDevelopmentData}
    />
  );
};

export default AppDesigning;
