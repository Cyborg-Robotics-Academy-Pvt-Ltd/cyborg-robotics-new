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
import { auth } from "@/lib/firebase";
import {
  CalendarCheck,
  Clapperboard,
  LayoutDashboard,
  LogOut,
  NotepadText,
  UserLock,
} from "lucide-react";
import { PanelRightOpen, PanelRightClose } from "@/components/ui/panel-buttons";
import Link from "next/link";

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
      icon: <LayoutDashboard className="h-5 w-5 shrink-0 text-black" />,
    },

    {
      label: "User Profile",
      href: "/user-profile",
      icon: <IconUserBolt className="h-5 w-5 shrink-0 text-black" />,
    },
    {
      label: "Student Enrollment",
      href: "/create-user",
      icon: <IconUserPlus className="h-5 w-5 shrink-0 text-black" />,
    },
    {
      label: "Student Record",
      href: "/student-list",
      icon: <IconUsers className="h-5 w-5 shrink-0 text-black" />,
    },

    {
      label: "New Registration",
      href: "/admin-dashboard/new-registration",
      icon: <IconUserBolt className="h-5 w-5 shrink-0 text-black" />,
    },
    {
      label: "Renewal",
      href: "/admin-dashboard/renewal",
      icon: <NotepadText className="h-5 w-5 shrink-0 text-black" />,
    },
    {
      label: "Media",
      href: "/media",
      icon: <Clapperboard className="h-5 w-5 shrink-0 text-black" />,
    },
    {
      label: "Access Control",
      href: "/admin-dashboard/access-control",
      icon: <UserLock className="h-5 w-5 shrink-0 text-black" />,
    },
    {
      label: "Logout",
      href: "/login",
      icon: <LogOut className="h-5 w-5 shrink-0 text-black" />,
    },
  ],
  trainer: [
    {
      label: "Dashboard",
      href: "/trainer-dashboard",
      icon: <LayoutDashboard className="h-5 w-5 shrink-0 text-black" />,
    },
    {
      label: "User Profile",
      href: "/user-profile",
      icon: <IconUserBolt className="h-5 w-5 shrink-0 text-black" />,
    },

    {
      label: "Student Record",
      href: "/student-list",
      icon: <IconUsers className="h-5 w-5 shrink-0 text-black" />,
    },
    {
      label: "Media",
      href: "/media",
      icon: <Clapperboard className="h-5 w-5 shrink-0 text-black" />,
    },

    {
      label: "Logout",
      href: "/login",
      icon: <LogOut className="h-5 w-5 shrink-0 text-black" />,
    },
  ],
  student: [
    {
      label: "Dashboard",
      href: "/student-dashboard",
      icon: <LayoutDashboard className="h-5 w-5 shrink-0 text-black" />,
    },
    {
      label: "User Profile",
      href: "/user-profile",
      icon: <IconUserBolt className="h-5 w-5 shrink-0 text-black" />,
    },
    {
      label: "Media",
      href: "/student-dashboard/media",
      icon: <Clapperboard className="h-5 w-5 shrink-0 gradient-text" />,
    },

    {
      label: "Logout",
      href: "/login",
      icon: <LogOut className="h-5 w-5 shrink-0 gradient-text" />,
    },
  ],
};

export default function DashboardLayout({
  role,
  name,
  children,
  linkOverrides,
}: DashboardLayoutProps) {
  const [open, setOpen] = useState(true);
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
        "flex w-full flex-1 flex-col mt-0 overflow-hidden bg-white md:flex-row",
        "min-h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10 bg-white shadow-lg">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto mt-2 hide-scrollbar">
            {open ? <Logo setOpen={setOpen} /> : <LogoIcon setOpen={setOpen} />}
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
      <div className="flex flex-1">
        <div
          className={`flex h-full w-full flex-1 flex-col bg-white  md:pl-[60px] transition-all duration-200 ease-out ${open ? "md:pl-[250px]" : "md:pl-[60px]"}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

interface LogoProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Logo: React.FC<LogoProps> = ({ setOpen }) => {
  return (
    <div className="relative z-20 flex items-center justify-between w-full py-1 mt-14 md:mt-1 text-sm font-normal text-black">
      <Link href="/" className="flex items-center space-x-2">
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
          className="font-semibold text-black whitespace-pre-wrap"
        >
          Cyborg Robotics Academy
        </motion.span>
      </Link>
      <div className="ml-auto bg-white shadow-md rounded-lg border border-gray-100 ">
        <PanelRightOpen onClick={() => setOpen(false)} />
      </div>
    </div>
  );
};

interface LogoIconProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const LogoIcon: React.FC<LogoIconProps> = ({ setOpen }) => {
  return (
    <div className="relative z-20 flex flex-col items-center justify-between w-full py-1 text-sm font-normal text-black">
      <div className="ml-auto bg-white shadow-md rounded-lg mb-3 border border-gray-100">
        <PanelRightClose onClick={() => setOpen(true)} />
      </div>
      <Link href="/" className="flex items-center space-x-2">
        <Image
          src={logo}
          width={150}
          height={50}
          alt="Cyborg Robotics Academy"
          className="h-7 w-12"
        />
      </Link>
    </div>
  );
};
