"use client";
import React from "react";
import type { Metadata } from "next";

export default function MediaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen ">
      <div className="flex-1">{children}</div>
    </div>
  );
}
