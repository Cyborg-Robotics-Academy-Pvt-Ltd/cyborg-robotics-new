"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Dynamically import components to avoid SSR issues
import dynamic from "next/dynamic";

const MediaSection = dynamic(
  () => import("@/components/gallery/MediaSection"),
  {
    ssr: false,
  }
);

const DashboardLayout = dynamic(() => import("@/components/DashboardLayout"), {
  ssr: false,
});

export default function MediaPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userRole, setUserRole] = useState<"admin" | "trainer" | "student">(
    "admin"
  );

  useEffect(() => {
    // Client-side authorization check
    const checkAuth = () => {
      try {
        const storedUserRole = localStorage.getItem("userRole");

        if (storedUserRole === "admin" || storedUserRole === "trainer") {
          setIsAuthorized(true);
          setUserRole(storedUserRole as "admin" | "trainer");
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

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
    <DashboardLayout role={userRole} name="User">
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
