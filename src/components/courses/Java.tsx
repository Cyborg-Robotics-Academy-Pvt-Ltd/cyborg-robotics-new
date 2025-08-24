"use client";
import React from "react";
import CourseTemplate from "@/components/CourseTemplate";
import { javaCurriculum } from "../../../utils/curriculum";

const Java = () => {
  return <CourseTemplate courseId="java" curriculumData={javaCurriculum} />;
};

export default Java;
