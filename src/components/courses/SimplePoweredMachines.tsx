"use client";
import React from "react";
import CourseTemplate from "@/components/CourseTemplate";
import { SimplePoweredMachines as SimplePoweredMachinesCurriculum } from "../../../utils/curriculum";

const SimplePoweredMachines = () => {
  return (
    <CourseTemplate
      courseId="simplePoweredMachines"
      curriculumData={SimplePoweredMachinesCurriculum}
    />
  );
};

export default SimplePoweredMachines;
