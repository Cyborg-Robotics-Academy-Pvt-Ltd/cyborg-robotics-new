"use client";
import React from "react";
import CourseTemplate from "@/components/CourseTemplate";
import { AppLabCurriculum } from "../../../utils/curriculum";

const AppLab = () => {
  return <CourseTemplate courseId="appLab" curriculumData={AppLabCurriculum} />;
};

export default AppLab;
