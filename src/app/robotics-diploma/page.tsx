import Footer from "@/components/home/Footer";
import Header from "@/components/layout/header";
import CTASection from "@/components/robotics/CTASection";
import Experience from "@/components/robotics/Experience";
import FutureTech from "@/components/robotics/FutureTech";
import Hero from "@/components/robotics/Hero";
import LearningJourney from "@/components/robotics/LearningJourney";
import MeetTheMentors from "@/components/robotics/MeetTheMentors";
import Outcomes from "@/components/robotics/Outcomes";
import Technologies from "@/components/robotics/Technologies";
import WhatStudentsBuild from "@/components/robotics/WhatStudentsBuild";

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <WhatStudentsBuild />
      <LearningJourney />
      <Technologies />
      <MeetTheMentors />
      <Experience />
      <Outcomes />
      <FutureTech />
      <CTASection />
      <Footer />
    </>
  );
}
