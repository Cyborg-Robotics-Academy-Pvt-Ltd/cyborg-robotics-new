"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "../../../public/assets/logo1.png";
import { User, Settings, LogOut, Menu, X } from "lucide-react";

export default function DashboardHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const { user, userRole } = useAuth();
  const router = useRouter();

  // Fetch extended user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (user && userRole) {
        try {
          let collectionName = "";
          switch (userRole) {
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

          const userDocRef = doc(db, collectionName, user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [user, userRole]);

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
    // First check Firestore user data for username
    if (userData && userData.username) return userData.username;
    if (userData && userData.fullName) return userData.fullName;
    if (userData && userData.name) return userData.name;

    // Fallback to auth user properties
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
                <span className="ml-3 text-xl font-bold text-gray-900 hidden sm:block">
                  Dashboard
                </span>
              </div>
            </Link>
          </div>

          {/* Right side - Profile and Notifications */}
          <div className="flex items-center space-x-4">
            {/* Profile dropdown and Mobile menu button combined */}
            <div className="flex items-center">
              <button
                onClick={() => {
                  router.push("/user-profile");
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 focus:outline-none user-dropdown"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center overflow-hidden">
                  {userData?.profileimage ? (
                    <Image
                      src={userData.profileimage}
                      alt={getUserDisplayName()}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.parentElement!.innerHTML =
                          '<svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                      }}
                    />
                  ) : (
                    <User className="h-4 w-4 text-white" />
                  )}
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
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-red-800 to-red-500 flex items-center justify-center overflow-hidden">
                {userData?.profileimage ? (
                  <Image
                    src={userData.profileimage}
                    alt={getUserDisplayName()}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.parentElement!.innerHTML =
                        '<svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>';
                    }}
                  />
                ) : (
                  <User className="h-5 w-5 text-white" />
                )}
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
