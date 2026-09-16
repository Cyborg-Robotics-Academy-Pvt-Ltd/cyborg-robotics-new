import FreeTrialPage from "@/components/free-trial/FreeTrialPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a Free Trial | Cyborg Robotics Academy",
  description:
    "Book a free robotics, coding, AI, drone, or 3D design trial class at Cyborg Robotics Academy.",
};

export default function Page() {
  return <FreeTrialPage />;
}
