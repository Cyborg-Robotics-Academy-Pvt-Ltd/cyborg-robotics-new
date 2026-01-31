import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "About Cyborg Robotics Academy | Best Robotics Classes for Kids in Pune | Offline & Online",
  description:
    "Discover Cyborg Robotics Academy - Pune's leading robotics education center offering hands-on training in robotics, coding, AI, and STEM for kids. Expert trainers, state-of-the-art facilities, and proven track record preparing students for future technology careers.",
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
    "child robotics workshops",
    "best robotics classes Pune",
    "robotics education for students",
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

export default function AboutUsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
