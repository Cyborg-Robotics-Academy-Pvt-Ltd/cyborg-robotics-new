import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Media Section | Cyborg Robotics Academy",
  description:
    "Access media resources for admins and trainers at Cyborg Robotics Academy.",
};

export default function MediaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
