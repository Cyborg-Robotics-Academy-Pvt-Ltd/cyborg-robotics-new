"use client";
import CourseTemplate from "@/components/CourseTemplate";
import { ThreeDPrintingCurriculum } from "../../../utils/curriculum";

const Printing3d = () => {
  return (
    <CourseTemplate
      courseId="printing3d"
      curriculumData={ThreeDPrintingCurriculum}
    />
  );
};

export default Printing3d;
