import React from "react";
import HeroSection from "../LandingPage/HeroSection";
import Header from "../layout/header";
import HowTrialBookingWorks from "../LandingPage/HowTrialBookingWorks";
import CourseFormatSelector from "../LandingPage/CourseFormatSelector";
import FeatureHighlights from "../LandingPage/FeatureHighlights";
import CoursesSection from "../LandingPage/CourseSection";
import Footer from "../home/Footer";

const FreeTrialPage = () => {
  return (
    <div>
      <Header />
      <HeroSection />
      <CourseFormatSelector />
      <CoursesSection />
      <HowTrialBookingWorks />
      <Footer />
    </div>
  );
};

export default FreeTrialPage;
