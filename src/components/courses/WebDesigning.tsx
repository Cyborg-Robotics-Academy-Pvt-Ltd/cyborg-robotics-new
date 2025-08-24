"use client";
import React from "react";
import CourseTemplate from "@/components/CourseTemplate";
import { WebDesignCurriculum } from "../../../utils/curriculum";

const WebDesigning = () => {
  return (
    <CourseTemplate
      courseId="webDesigning"
      curriculumData={WebDesignCurriculum}
    />
  );
};

export default WebDesigning;
