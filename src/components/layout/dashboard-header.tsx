"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "../../../public/assets/logo1.png";
import { Bell, User, Settings, LogOut, Menu, X } from "lucide-react";

export default function DashboardHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, userRole } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("userRole");
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return "User";

    if (user.displayName) return user.displayName;
    if (user.email) return user.email.split("@")[0];

    return "User";
  };

  // Get role display name
  const getRoleDisplayName = () => {
    switch (userRole) {
      case "admin":
        return "Administrator";
      case "trainer":
        return "Trainer";
      case "student":
        return "Student";
      default:
        return "User";
    }
  };

  return (
    <header className="z-50 dashboard-header border-b border-transparent">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Dashboard Title */}
          <div className="flex items-center">
            <Link href={`/${userRole}-dashboard`} className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Image
                  src={logo}
                  alt="Cyborg Robotics Academy"
                  width={32}
                  height={32}
                  className="rounded-md h-10 w-10"
                />
                <span className="ml-3 text-xl font-bold text-gray-900 hidden sm:block">
                  Dashboard
                </span>
              </div>
            </Link>
          </div>

          {/* Right side - Profile and Notifications */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-1 rounded-full text-gray-500 hover:text-gray-700 focus:outline-none relative">
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
            </button>

            {/* Profile dropdown and Mobile menu button combined */}
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex items-center space-x-2 focus:outline-none user-dropdown"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {getUserDisplayName()}
                </span>
                <span className="hidden md:block text-xs text-gray-500">
                  {getRoleDisplayName()}
                </span>
              </button>

              {/* Combined mobile menu button with user profile */}
              <button
                className="ml-2 p-1 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mobile-dashboard-menu">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/user-profile"
              className="block px-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
            >
              <div className="flex items-center">
                <User className="mr-3 h-5 w-5 text-gray-500" />
                Profile
              </div>
            </Link>
            <Link
              href="#"
              className="block px-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
            >
              <div className="flex items-center">
                <Settings className="mr-3 h-5 w-5 text-gray-500" />
                Settings
              </div>
            </Link>
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
            >
              <div className="flex items-center">
                <LogOut className="mr-3 h-5 w-5 text-gray-500" />
                Sign out
              </div>
            </button>
          </div>

          <div className="border-t border-gray-200 pt-4 pb-3  ">
            <div className="flex items-center px-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-red-800 to-red-500 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">
                  {getUserDisplayName()}
                </div>
                <div className="text-sm font-medium text-gray-500">
                  {getRoleDisplayName()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
