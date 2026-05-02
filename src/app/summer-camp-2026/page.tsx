import type { Metadata } from "next";
import SummerCampPage from "@/components/workshops/SummerCampPage";

export const metadata: Metadata = {
  title: "Robotics & Coding Summer Camp for Kids 2026 in Pune | STEM Learning Program",
  description:
    "Enroll your child in the best Robotics & Coding Summer Camp 2026 in Pune. Hands-on STEM activities, programming basics, and fun tech learning for kids. Limited seats available!",
  keywords: [
    "Robotics summer camp Pune 2026",
    "coding camp for kids Pune",
    "STEM camp Pune",
    "kids robotics classes Pune",
    "programming for children Pune",
    "summer tech camp Pune",
    "robotics workshop for kids India",
    "coding classes for beginners Pune",
    "AI and robotics camp kids",
    "Pune summer camp 2026 kids",
  ],
  openGraph: {
    title:
      "Robotics & Coding Summer Camp for Kids 2026 in Pune | STEM Learning Program",
    description:
      "Enroll your child in the best Robotics & Coding Summer Camp 2026 in Pune. Hands-on STEM activities, programming basics, and fun tech learning for kids. Limited seats available!",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Robotics & Coding Summer Camp for Kids 2026 in Pune | STEM Learning Program",
    description:
      "Enroll your child in the best Robotics & Coding Summer Camp 2026 in Pune. Hands-on STEM activities, programming basics, and fun tech learning for kids. Limited seats available!",
  },
};

const SummerCamp2026Route = () => {
  return <SummerCampPage />;
};

export default SummerCamp2026Route;
