"use client";
import React, { useState, useCallback, useMemo } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
  IconUsers,
  IconUserPlus,
  IconHome,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import logo from "../../public/assets/logo1.png";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { CalendarCheck, Clapperboard, LogOut, NotepadText } from "lucide-react";

type Role = "admin" | "trainer" | "student";

interface DashboardLayoutProps {
  role: Role;
  name?: string;
  children: React.ReactNode;
  linkOverrides?: Partial<
    Record<string, { activeWhen?: (pathname: string) => boolean }>
  >;
}

const roleLinksMap: Record<
  Role,
  Array<{
    label: string;
    href: string;
    icon: React.ReactNode;
    activeWhen?: (pathname: string) => boolean;
  }>
> = {
  admin: [
    {
      label: "Dashboard",
      href: "/admin-dashboard",
      icon: (
        <IconHome className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Create User",
      href: "/create-user",
      icon: (
        <IconUserPlus className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Student List",
      href: "/student-list",
      icon: (
        <IconUsers className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Tasks",
      href: "/admin-dashboard/create-task",
      icon: (
        <CalendarCheck className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "New Registration",
      href: "/admin-dashboard/new-registration",
      icon: (
        <IconUserBolt className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Renewal",
      href: "/admin-dashboard/renewal",
      icon: (
        <NotepadText className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Media",
      href: "/media",
      icon: (
        <Clapperboard className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Settings",
      href: "#",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Logout",
      href: "/login",
      icon: (
        <LogOut className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ],
  trainer: [
    {
      label: "Dashboard",
      href: "/trainer-dashboard",
      icon: (
        <IconHome className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Create Task",
      href: "/trainer-dashboard/create-task",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Student List",
      href: "/student-list",
      icon: (
        <IconUsers className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Media",
      href: "/media",
      icon: (
        <Clapperboard className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Settings",
      href: "#",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Logout",
      href: "/login",
      icon: (
        <LogOut className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ],
  student: [
    {
      label: "Dashboard",
      href: "/student-dashboard",
      icon: (
        <IconHome className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Course Progress",
      href: "/student-dashboard/course-progress",
      icon: (
        <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Upcoming Tasks",
      href: "/student-dashboard/upcoming-tasks",
      icon: (
        <IconBrandTabler className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Media",
      href: "/student-dashboard/media",
      icon: (
        <Clapperboard className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Settings",
      href: "#",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Logout",
      href: "/login",
      icon: (
        <LogOut className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ],
};

export default function DashboardLayout({
  role,
  name,
  children,
  linkOverrides,
}: DashboardLayoutProps) {
  const [open, setOpen] = useState(false);
  const links = roleLinksMap[role];
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      if (typeof window !== "undefined") {
        localStorage.removeItem("userRole");
      }
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, [router]);

  const linksWithHandlers = useMemo(() => {
    return links.map((link) => {
      const base =
        link.label === "Logout"
          ? { ...link, href: "/login", onClick: handleLogout }
          : link;
      const override = linkOverrides?.[link.label] || {};
      return { ...base, ...override };
    });
  }, [links, handleLogout, linkOverrides]);

  return (
    <div
      className={cn(
        "flex w-full flex-1 flex-col -mt-10 overflow-hidden bg-gray-100 md:flex-row dark:bg-neutral-800",
        "min-h-[calc(100vh-6rem)]"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <div className="flex  flex-1 flex-col overflow-x-hidden overflow-y-auto mt-16">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-2 flex flex-col gap-2">
              {linksWithHandlers.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label:
                  name ||
                  (role === "admin"
                    ? "Admin"
                    : role === "trainer"
                      ? "Trainer"
                      : "Student"),
                href: "#",
                icon: (
                  <Image
                    src="/assets/logo1.png"
                    className="h-7 w-7 shrink-0 rounded-full"
                    width={28}
                    height={28}
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-1 md:ml-[60px]">
        <div className="flex h-full w-full flex-1 flex-col bg-transparent md:w-[85%]">
          {children}
        </div>
      </div>
    </div>
  );
}

export const Logo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
    >
      <Image
        src={logo}
        width={150}
        height={60}
        alt="Cyborg Robotics Academy"
        className="h-7 w-auto"
      />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-semibold text-black whitespace-pre"
      >
        Cyborg Robotics Academy
      </motion.span>
    </a>
  );
};

export const LogoIcon = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black "
    >
      <Image
        src={logo}
        width={28}
        height={28}
        alt="Cyborg Robotics Academy"
        className="h-7 w-7"
      />
    </a>
  );
};
