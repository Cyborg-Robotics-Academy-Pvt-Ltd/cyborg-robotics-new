import type { Metadata } from "next";
import Header from "@/components/layout/header";
import DroneExperience from "@/components/tech-programs/drone/Drone-Experience";
import DronePocessFlow from "@/components/tech-programs/drone/DronePocessFlow";
import HeroImage from "@/components/tech-programs/drone/HeroImage";
import OfferSection from "@/components/tech-programs/drone/OfferSection";
import ProgramHighlights from "@/components/tech-programs/drone/ProgramHighlights";
import TestimonialSection from "@/components/tech-programs/drone/TestimonialSection";

export const metadata: Metadata = {
  title: "Drone Training Course in Pune for Kids | Learn to Build & Fly Drones",
  description:
    "Best drone training in Pune for kids & teens. Learn to build, fly & code drones at Cyborg Robotics Academy in Kalyani Nagar, Kharadi & Magarpatta.",
  keywords: [
    "drone training Pune",
    "drone classes Pune",
    "drone course for kids Pune",
    "UAV training Pune",
    "drone academy Pune",
    "STEM courses Pune",
    "robotics and drone training Pune",
    "learn drone flying Pune",
    "drone coding classes Pune",
    "Cyborg Robotics Pune",
    "Kalyani Nagar",
    "Kharadi",
    "Magarpatta",
  ],
  openGraph: {
    title:
      "Drone Training Course in Pune for Kids | Learn to Build & Fly Drones",
    description:
      "Best drone training in Pune for kids & teens. Learn to build, fly & code drones at Cyborg Robotics Academy in Kalyani Nagar, Kharadi & Magarpatta.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Drone Training Course in Pune for Kids | Learn to Build & Fly Drones",
    description:
      "Best drone training in Pune for kids & teens. Learn to build, fly & code drones at Cyborg Robotics Academy in Kalyani Nagar, Kharadi & Magarpatta.",
  },
};

const page = () => {
  return (
    <div className="min-h-screen w-full overflow-y-hidden bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      <HeroImage />
      <OfferSection />
      <DroneExperience />
      <DronePocessFlow />
      <ProgramHighlights />
      <TestimonialSection />
    </div>
  );
};

export default page;
