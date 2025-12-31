"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Header from "@/components/layout/header";
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

  // Check if current path is a dashboard route or PRN route
  // More precise detection: paths that start with dashboard routes or PRN routes
  const isDashboardRoute =
    pathname?.startsWith("/admin-dashboard") ||
    pathname?.startsWith("/student-dashboard") ||
    pathname?.startsWith("/trainer-dashboard") ||
    pathname === "/user-profile" ||
    pathname === "/student-list" ||
    pathname === "/create-user" ||
    pathname?.startsWith("/media");

  // Check if current path is a PRN route (e.g., /[prn] or /[prn]/[sub])
  const isPrnRoute =
    pathname &&
    (pathname.match(/^\/[^\/]+$/) || pathname.match(/^\/[^\/]+\/[^\/]+$/)) && // Matches /[prn] or /[prn]/[sub] format
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next") &&
    pathname !== "/"; // Exclude homepage

  // Don't show any header on dashboard routes
  if (user && userRole && isDashboardRoute) {
    return null;
  }

  // Don't show any header on PRN routes (both /[prn] and /[prn]/[sub])
  if (isPrnRoute) {
    return null;
  }

  // Show public header for all other cases
  return <Header />;
}
