"use client";
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const name =
    user?.displayName || (user?.email ? user.email.split("@")[0] : "Student");

  return (
    <DashboardLayout role="student" name={name}>
      {children}
    </DashboardLayout>
  );
}
