"use client";
import MediaSection from "@/components/gallery/MediaSection";
import DashboardLayout from "@/components/DashboardLayout";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import LoadingSpinner from "@/components/LoadingSpinner";

const MediaPage = () => {
  const router = useRouter();
  const [canRender, setCanRender] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user, userRole, loading } = useAuth();

  const name =
    user?.displayName || (user?.email ? user.email.split("@")[0] : undefined);
  const role =
    userRole === "admin" || userRole === "trainer" || userRole === "student"
      ? userRole
      : "student";

  useEffect(() => {
    // Wait for auth to complete
    if (loading) return;

    // Check if user is authenticated and has proper role
    if (!user) {
      router.push("/login");
      return;
    }

    const userRole =
      typeof window !== "undefined" ? localStorage.getItem("userRole") : null;

    if (userRole !== "admin" && userRole !== "trainer") {
      router.push("/login");
      return;
    }

    setCanRender(true);
    setIsLoading(false);
  }, [user, loading, router]);

  // Show loading while auth is being determined
  if (loading || isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </main>
    );
  }

  // Show skeleton while redirecting or auth check fails
  if (!canRender) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded-lg w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <DashboardLayout role={role} name={name}>
      <main
        role="main"
        aria-label="Media Section"
        className="min-h-screen bg-neutral-100"
      >
        <MediaSection />
      </main>
    </DashboardLayout>
  );
};

export default MediaPage;
