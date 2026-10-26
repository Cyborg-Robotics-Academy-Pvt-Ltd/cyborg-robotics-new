"use client";
import React from "react";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userRole, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const name =
    user?.displayName || (user?.email ? user.email.split("@")[0] : "Admin");
  const staffRole =
    userRole === "sales" || userRole === "marketing" ? userRole : null;
  const isRegistrationRoute =
    pathname.startsWith("/admin-dashboard/registrations") ||
    [
      "/admin-dashboard/new-registration",
      "/admin-dashboard/workshop-registration",
      "/admin-dashboard/competition-registration",
      "/admin-dashboard/renewal",
    ].some((path) => pathname.startsWith(path));
  const staffCanAccessRoute =
    pathname === "/admin-dashboard/trial-availability" ||
    (staffRole === "marketing" && isRegistrationRoute);

  useEffect(() => {
    if (loading || !staffRole) return;
    if (!staffCanAccessRoute) {
      router.replace(`/${staffRole}-dashboard`);
    }
  }, [loading, pathname, router, staffRole, staffCanAccessRoute]);

  if (staffRole) {
    if (!staffCanAccessRoute) return null;
    return (
      <div className="flex min-h-screen">
        <DashboardLayout role={staffRole} name={name}>{children}</DashboardLayout>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <DashboardLayout role="admin" name={name}>
          {children}
        </DashboardLayout>
      </div>
    </div>
  );
}
