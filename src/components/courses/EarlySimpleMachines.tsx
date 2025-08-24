"use client";
import React from "react";
import CourseTemplate from "@/components/CourseTemplate";
import { EarlySimplemachineCurriculum } from "../../../utils/curriculum";

const EarlySimpleMachines = () => {
  return (
    <CourseTemplate
      courseId="earlySimpleMachines"
      curriculumData={EarlySimplemachineCurriculum}
    />
  );
};

export default EarlySimpleMachines;
