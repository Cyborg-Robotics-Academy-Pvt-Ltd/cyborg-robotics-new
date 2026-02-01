import HomePage from "@/components/home/HomePage";
import { ScrollButton, WhatsAppWidget } from "@/components/widgets";
import MouseFollower from "@/components/widgets/MouseFollower";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: " Robotics & Coding Classes For Kids | STEM & Coding Academy in Pune",
  description:
    "Discover engaging robotics and coding courses for kids. Build STEM skills, innovate, and learn through hands-on projects in a fun environment.",
  keywords: [
    "Cyborg Robotics courses",
    "robotics training",
    "AI courses",
    "STEM education",
    "robotics for students",
    "robotics institute",
    "automation courses",
    "machine learning basics",
    "robotics certification",
  ],
};

const Home = () => {
  return (
    <>
      <MouseFollower />
      <div className="pt-16 -mt-10 lg:-mt-9 md:-mt-2">
        <HomePage />
      </div>
      <WhatsAppWidget />
      <ScrollButton />
    </>
  );
};

export default Home;
