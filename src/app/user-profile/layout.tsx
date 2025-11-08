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
    <DashboardLayout role={role} name={name}>
      {children}
    </DashboardLayout>
  );
}
