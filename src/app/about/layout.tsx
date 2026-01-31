import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Robotics & Coding Academy",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
