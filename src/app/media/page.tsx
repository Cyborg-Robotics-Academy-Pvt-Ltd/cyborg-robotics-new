"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

// Dynamically import components to avoid SSR issues
import dynamic from "next/dynamic";

const MediaSection = dynamic(
  () => import("@/components/gallery/MediaSection"),
  {
    ssr: false,
    loading: () => <LoadingSpinner message="Loading media section..." />,
  }
);

const DashboardLayout = dynamic(() => import("@/components/DashboardLayout"), {
  ssr: false,
  loading: () => <LoadingSpinner message="Loading dashboard..." />,
});

export default function MediaPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Client-side authorization check
    const checkAuth = () => {
      try {
        const userRole = localStorage.getItem("userRole");

        if (userRole === "admin" || userRole === "trainer") {
          setIsAuthorized(true);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    // Delay to ensure proper client-side hydration
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="Checking permissions..." />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl text-gray-600">Redirecting to login...</h2>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout role="admin" name="User">
      <main
        role="main"
        aria-label="Media Section"
        className="min-h-screen bg-neutral-100"
      >
        <MediaSection />
      </main>
    </DashboardLayout>
  );
}
