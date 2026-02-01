import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Cyborg Robotics Academy | Offline - Online Classes",
  description:
    "Cyborg Robotics empowers students with hands-on training in robotics, coding, AI, and STEM technologies, preparing them for future-ready careers.",
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
  ],
};

export default function AboutUsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
