"use client";

import CourseTemplate from "@/components/CourseTemplate";
import { SpikePrimeCurriculum } from "../../../utils/curriculum";

const SpikePrime = () => {
  return (
    <CourseTemplate
      courseId="spikePrime"
      curriculumData={SpikePrimeCurriculum}
    />
  );
};

export default SpikePrime;
