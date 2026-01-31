import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Programming and Robotics Courses Offline - Online | Cyborg Robotics",
  description:
    "Explore industry-focused courses at Cyborg Robotics including Robotics, AI, Coding, and STEM programs for students and professionals. Learn with hands-on training and expert guidance.",
  keywords: [
    "Cyborg Robotics courses",
    "robotics training",
    "AI courses",
    "coding classes",
    "STEM education",
    "robotics for students",
    "robotics institute",
    "automation courses",
    "machine learning basics",
    "robotics certification",
  ],
  robots: {
    index: true,
    follow: true,
  },
};

export default function AllCoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
