"use client";
import React from "react";
import CourseTemplate from "@/components/CourseTemplate";
import { IotCurriculum } from "../../../utils/curriculum";

const Iot = () => {
  return <CourseTemplate courseId="iot" curriculumData={IotCurriculum} />;
};

export default Iot;
