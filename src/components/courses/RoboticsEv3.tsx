"use client";
import React from "react";
import CourseTemplate from "@/components/CourseTemplate";
import { RoboticsCurriculum } from "../../../utils/curriculum";

const RoboticsEv3 = () => {
  return (
    <CourseTemplate
      courseId="roboticsEv3"
      curriculumData={RoboticsCurriculum}
    />
  );
};

export default RoboticsEv3;
