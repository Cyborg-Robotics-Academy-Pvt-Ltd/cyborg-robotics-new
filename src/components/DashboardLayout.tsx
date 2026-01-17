"use client";
import React, {
  useState,
  useCallback,
  useMemo,
  useRef as useReactRef,
} from "react";
import { useEffect, useRef } from "react";
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
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  CalendarCheck,
  Clapperboard,
  ClipboardList,
  FilePen,
  LayoutDashboard,
  LogOut,
  Menu,
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
      icon: <LayoutDashboard className="h-5 w-5 shrink-0 text-gray-700" />,
    },

    {
      label: "User Profile",
      href: "/user-profile",
      icon: <IconUserBolt className="h-5 w-5 shrink-0 text-gray-700" />,
    },
    {
      label: "Student Enrollment",
      href: "/create-user",
      icon: <FilePen className="h-5 w-5 shrink-0 text-gray-700" />,
    },
    {
      label: "Student Record",
      href: "/student-list",
      icon: <ClipboardList className="h-5 w-5 shrink-0 text-gray-700" />,
    },

    {
      label: "New Registration",
      href: "/admin-dashboard/new-registration",
      icon: <IconUserBolt className="h-5 w-5 shrink-0 text-gray-700" />,
    },
    {
      label: "Renewal",
      href: "/admin-dashboard/renewal",
      icon: <NotepadText className="h-5 w-5 shrink-0 text-gray-700" />,
    },
    {
      label: "Student Media",
      href: "/media",
      icon: <Clapperboard className="h-5 w-5 shrink-0 text-gray-700" />,
    },
    {
      label: "Assign Trainers",
      href: "/admin-dashboard/assign-trainer",
      icon: <IconUsers className="h-5 w-5 shrink-0 text-gray-700" />,
    },
    {
      label: "Access Control",
      href: "/admin-dashboard/access-control",
      icon: <UserLock className="h-5 w-5 shrink-0 text-gray-700" />,
    },
    {
      label: "Photo Upload",
      href: "/admin-dashboard/photo-upload",
      icon: <Clapperboard className="h-5 w-5 shrink-0 text-gray-700" />,
    },
    {
      label: "Logout",
      href: "/login",
      icon: <LogOut className="h-5 w-5 shrink-0 text-gray-700" />,
    },
  ],
  trainer: [
    {
      label: "Dashboard",
      href: "/trainer-dashboard",
      icon: <LayoutDashboard className="h-5 w-5 shrink-0 text-gray-700" />,
    },
    {
      label: "User Profile",
      href: "/user-profile",
      icon: <IconUserBolt className="h-5 w-5 shrink-0 text-gray-700" />,
    },

    {
      label: "Student Record",
      href: "/student-list",
      icon: <IconUsers className="h-5 w-5 shrink-0 text-gray-700" />,
    },
    {
      label: "Student Media",
      href: "/media",
      icon: <Clapperboard className="h-5 w-5 shrink-0 text-gray-700" />,
    },
    {
      label: "Logout",
      href: "/login",
      icon: <LogOut className="h-5 w-5 shrink-0 text-gray-700" />,
    },
  ],
  student: [
    {
      label: "Dashboard",
      href: "/student-dashboard",
      icon: <LayoutDashboard className="h-5 w-5 shrink-0 text-gray-700" />,
    },
    {
      label: "User Profile",
      href: "/user-profile",
      icon: <IconUserBolt className="h-5 w-5 shrink-0 text-gray-700" />,
    },
    {
      label: "Media",
      href: "/student-dashboard/media",
      icon: <Clapperboard className="h-5 w-5 shrink-0 gradient-text" />,
    },
    {
      label: "Logout",
      href: "/login",
      icon: <LogOut className="h-5 w-5 shrink-0 text-gray-700" />,
    },
  ],
};

export default function DashboardLayout({
  role,
  name,
  children,
  linkOverrides,
}: DashboardLayoutProps) {
  const [open, setOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const savedOpen = localStorage.getItem("sidebarOpen");
      return savedOpen !== null ? JSON.parse(savedOpen) : true;
    }
    return true;
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileEmail, setProfileEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | undefined>(name);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const openRef = useRef(open);
  const profileMenuRef = useReactRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openRef.current !== open) {
      localStorage.setItem("sidebarOpen", JSON.stringify(open));
      openRef.current = open;
    }
  }, [open]);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (typeof window !== "undefined" && auth.currentUser) {
        try {
          // Set email from Firebase auth
          setProfileEmail(auth.currentUser.email);

          let collectionName = "";
          switch (role) {
            case "admin":
              collectionName = "admins";
              break;
            case "trainer":
              collectionName = "trainers";
              break;
            case "student":
              collectionName = "students";
              break;
            default:
              collectionName = "students";
          }

          const userDocRef = doc(db, collectionName, auth.currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const data = userDoc.data();
            // Check for profile image in different possible fields
            const profileImg =
              data.profileimage || data.imageUrls?.[0] || data.imageUrl || null;
            setProfileImage(profileImg);

            // Update email if it's stored in the document
            if (data.email) {
              setProfileEmail(data.email);
            }

            // Update name if it's stored in the document
            const documentName =
              data.name || data.displayName || data.username || data.fullName;
            if (documentName) {
              setDisplayName(documentName);
            }
          }
        } catch (error) {
          console.error("Error fetching profile data:", error);
        }
      }
    };

    fetchProfileData();
  }, [role]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const getDisplayText = (): string => {
    return displayName || name || "";
  };

  const linksWithHandlers = useMemo(() => {
    return links.map((link) => {
      const base =
        link.label === "Logout"
          ? { ...link, href: "/login", onClick: handleLogout }
          : link;
      const override = linkOverrides?.[link.label] || {};
      return { ...base, ...override };
    });
  }, [links, handleLogout, linkOverrides, open, displayName, name]);

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
              {open && (
                <div className="px-3 py-2 w-full text-center bg-red-800 text-xs font-semibold text-white uppercase tracking-wider rounded-lg">
                  {role === "admin"
                    ? "Admin Panel"
                    : role === "trainer"
                      ? "Trainer Panel"
                      : "Student Panel"}
                </div>
              )}
              {linksWithHandlers.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={cn(
                  "flex items-center group/bottom-sidebar w-full p-1 rounded-lg hover:bg-gray-100 transition-colors text-left",
                  open ? "justify-start gap-2 pl-3" : "justify-center"
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  {profileImage ? (
                    <Image
                      src={profileImage}
                      className="h-7 w-7 shrink-0 rounded-full object-cover"
                      width={28}
                      height={28}
                      alt="User Profile"
                    />
                  ) : (
                    <div className="h-7 w-7 shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">
                      {getDisplayText()?.charAt(0).toUpperCase() ||
                        role.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {open && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="text-md font-bold"
                    >
                      {getDisplayText() ||
                        (role === "admin"
                          ? "Admin"
                          : role === "trainer"
                            ? "Trainer"
                            : "Student")}
                    </motion.span>
                  )}
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute  bottom-full mb-2 left-0 w-56 bg-white rounded-xl shadow-xl border border-gray-200  overflow-hidden">
                  <div className="p-3 bg-gradient-to-r from-red-700 to-red-800 text-white">
                    <div className="flex items-center gap-3">
                      {profileImage ? (
                        <Image
                          src={profileImage}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white"
                          width={48}
                          height={48}
                          alt="User Profile"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white font-bold text-lg">
                          {getDisplayText()?.charAt(0).toUpperCase() ||
                            role.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">
                          {getDisplayText() ||
                            (role === "admin"
                              ? "Admin"
                              : role === "trainer"
                                ? "Trainer"
                                : "Student")}
                        </h3>
                        <p className="text-xs text-white text-opacity-80 truncate">
                          {profileEmail || "No email"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <Link
                      href="/user-profile"
                      className="flex items-center gap-2 w-full p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <IconUserBolt className="h-4 w-4 text-gray-600" />
                      My Profile
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleLogout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm text-left"
                    >
                      <LogOut className="h-4 w-4 text-gray-600" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-1">
        <div
          className={`flex h-full w-full flex-1 flex-col bg-white  md:pl-[60px] transition-all duration-200 ease-out ${open ? "md:pl-[250px]" : "md:pl-[60px]"}`}
        >
          {/* Mobile-only header */}
          <div className="md:hidden flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setOpen(!open)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-6 w-6 text-gray-700" />
              </button>
              <span className="text-lg font-semibold text-gray-800">
                Dashboard
              </span>
            </div>
            <Link href="/user-profile">
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2"
                >
                  {profileImage ? (
                    <Image
                      src={profileImage}
                      className="h-8 w-8 rounded-full object-cover"
                      width={32}
                      height={32}
                      alt="User Profile"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-medium">
                      {getDisplayText()?.charAt(0).toUpperCase() ||
                        role.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>
              </div>
            </Link>
          </div>
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
    <div className="relative z-20 flex items-center justify-between w-full py-1   text-sm font-normal text-black">
      <Link href="/" className="flex items-center space-x-2 mt-4">
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
      <div className=" bg-white shadow-md rounded-lg border border-gray-100 ">
        <PanelRightOpen
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(false);
          }}
        />
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
      <div className=" bg-white shadow-md rounded-lg mb-3 border border-gray-100">
        <PanelRightClose
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          }}
        />
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
