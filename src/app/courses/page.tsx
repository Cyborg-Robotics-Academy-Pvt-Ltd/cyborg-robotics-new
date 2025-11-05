import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Courses | Cyborg Robotics Academy",
  description: "Explore all Cyborg Robotics Academy courses.",
};

export default function CoursesIndexPage() {
  redirect("/course-mindmap");
}
