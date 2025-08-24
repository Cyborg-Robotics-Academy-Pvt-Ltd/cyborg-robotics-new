"use client";
import React from "react";
import CourseTemplate from "@/components/CourseTemplate";
import { pythonCourseData } from "../../../utils/curriculum";

const Python = () => {
  return <CourseTemplate courseId="python" curriculumData={pythonCourseData} />;
};

export default Python;
