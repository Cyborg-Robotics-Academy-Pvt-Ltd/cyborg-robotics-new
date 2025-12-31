// src/app/course-mindmap/page.tsx
"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import Footer from "@/components/home/Footer";
import Header from "@/components/layout/header";
export const runtime = "nodejs";

const MindMapComponent = dynamic(() => import("@/components/course/MindMap"), {
  ssr: false,
  loading: () => null,
});

export default function CourseMindmapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      <Suspense
        fallback={
          <div className="w-full h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        }
      >
        <MindMapComponent />
      </Suspense>
      <Footer />
    </div>
  );
}
