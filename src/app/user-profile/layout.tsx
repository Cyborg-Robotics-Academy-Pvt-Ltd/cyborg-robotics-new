"use client";
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";

export default function UserProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userRole } = useAuth();

  const name =
    user?.displayName || (user?.email ? user.email.split("@")[0] : undefined);
  const role = (userRole as "admin" | "trainer" | "student") || "student";

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        <DashboardLayout role={role} name={name}>
          {children}
        </DashboardLayout>
      </div>
    </div>
  );
}
