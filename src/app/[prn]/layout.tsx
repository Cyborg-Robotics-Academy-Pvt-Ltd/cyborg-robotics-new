"use client";
import React from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";

export default function PrnLayout({ children }: { children: React.ReactNode }) {
  const { user, userRole } = useAuth();

  const name =
    user?.displayName || (user?.email ? user.email.split("@")[0] : undefined);
  const role = (userRole as "admin" | "trainer" | "student") || "student";

  // Force "Student List" as active when on PRN routes
  const linkOverrides = {
    "Student List": {
      activeWhen: (p: string) => {
        const first = (p.split("/")[1] || "").trim();
        if (!first) return false;
        const knownRoots = new Set([
          "admin-dashboard",
          "trainer-dashboard",
          "student-dashboard",
          "blogs",
          "classroom-courses",
          "online-courses",
          "create-user",
          "login",
          "about",
          "contact-us",
          "events",
          "gallery",
          "registration",
          "privacy-policy",
          "terms-conditions",
          "media",
          "student-list",
          "api",
        ]);
        return !knownRoots.has(first);
      },
    },
  } as const;

  return (
    <DashboardLayout role={role} name={name} linkOverrides={linkOverrides}>
      {children}
    </DashboardLayout>
  );
}
