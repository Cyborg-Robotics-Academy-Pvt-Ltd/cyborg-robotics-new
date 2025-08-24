"use client";
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";

export default function StudentListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userRole } = useAuth();
  const name =
    user?.displayName || (user?.email ? user.email.split("@")[0] : undefined);
  const role =
    userRole === "admin" || userRole === "trainer" || userRole === "student"
      ? userRole
      : "student";

  return (
    <DashboardLayout role={role} name={name}>
      {children}
    </DashboardLayout>
  );
}
