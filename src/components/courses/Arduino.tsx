"use client";
import React from "react";
import CourseTemplate from "@/components/CourseTemplate";
import { ArduinoCurriculum } from "../../../utils/curriculum";

const Arduino = () => {
  return (
    <CourseTemplate courseId="arduino" curriculumData={ArduinoCurriculum} />
  );
};

export default Arduino;
