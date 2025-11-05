import React, { ReactNode } from "react";

export default function TestCurriculumLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}
