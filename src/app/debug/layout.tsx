import React, { ReactNode } from "react";

export default function DebugLayout({ children }: { children: ReactNode }) {
  return <div className="w-full">{children}</div>;
}
