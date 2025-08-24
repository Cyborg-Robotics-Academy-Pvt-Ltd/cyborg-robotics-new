"use client";
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const name =
    user?.displayName || (user?.email ? user.email.split("@")[0] : "Admin");

  return (
    <DashboardLayout role="admin" name={name}>
      {children}
    </DashboardLayout>
  );
}
