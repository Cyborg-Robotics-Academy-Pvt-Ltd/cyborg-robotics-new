"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Header from "@/components/layout/header";
import DashboardHeader from "@/components/layout/dashboard-header";
import { useEffect, useState } from "react";

export default function ConditionalHeader() {
  const pathname = usePathname();
  const { user, userRole, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // While loading auth state, show nothing to prevent flickering
  if (loading || !isClient) {
    return null;
  }

  // Check if current path is a dashboard route
  // More precise detection: paths that start with dashboard routes
  const isDashboardRoute =
    pathname?.startsWith("/admin-dashboard") ||
    pathname?.startsWith("/student-dashboard") ||
    pathname?.startsWith("/trainer-dashboard") ||
    pathname === "/user-profile" ||
    pathname === "/student-list" ||
    pathname === "/create-user" ||
    pathname?.startsWith("/media");

  // Show dashboard header if user is authenticated and on a dashboard route
  if (user && userRole && isDashboardRoute) {
    return <DashboardHeader />;
  }

  // Show public header for all other cases
  return <Header />;
}
