import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers | Robotics Academy - Join Our Team",
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
