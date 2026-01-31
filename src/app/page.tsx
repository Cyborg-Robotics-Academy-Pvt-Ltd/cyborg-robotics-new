import HomePage from "@/components/home/HomePage";
import { ScrollButton, WhatsAppWidget } from "@/components/widgets";
import MouseFollower from "@/components/widgets/MouseFollower";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Best Robotics & Coding Classes For Kids in Pune | STEM Academy | Cyborg Robotics",
  description:
    "Join Cyborg Robotics - Pune's premier STEM & coding academy for kids. Expert-led robotics and coding classes with hands-on projects, innovative learning approach, and proven results preparing children for future technology careers.",
  keywords: [
    "robotics academy for kids",
    "kids robotics classes",
    "robotics classes in Pune",
    "STEM classes for kids",
    "coding classes for kids",
    "robotics training for children",
    "kids technology academy",
    "robotics and coding for kids",
    "STEM education for kids",
    "child robotics workshops for homepage",
    "best robotics classes Pune",
    "coding academy for students",
    "AI learning for kids",
    "technology courses for children",
    "robotics programming classes",
    "innovative STEM learning",
    "future technology education",
    "hands-on robotics training",
    "certified robotics courses",
    "educational robotics programs",
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
