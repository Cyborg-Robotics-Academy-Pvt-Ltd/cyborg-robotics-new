"use client";
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";

export default function StudentClassManagementPRNLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const name =
    user?.displayName || (user?.email ? user.email.split("@")[0] : "Admin");

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
