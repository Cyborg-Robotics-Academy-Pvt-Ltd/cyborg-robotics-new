"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { getAdminUserData } from "@/lib/admin-utils";
import Link from "next/link";
import Image from "next/image";
import {
  UserCog,
  GraduationCap,
  BarChart3,
  ClipboardCheck,
  UserRoundPlus,
  RotateCw,
  ArrowRight,
  Sparkles,
  RefreshCw,
  User,
  Shield,
  BookOpen,
  Gamepad2,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useAuth } from "@/lib/auth-context";
import AuthLoadingSpinner from "@/components/AuthLoadingSpinner";

// Theme configurations
const themes: Record<
  string,
  {
    name: string;
    background: string;
    cardBg: string;
    cardBorder: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    shadow: string;
    hoverShadow: string;
  }
> = {
  light: {
    name: "Light",
    background: "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100",
    cardBg: "bg-white/70 backdrop-blur-sm",
    cardBorder: "border-white/20",
    textPrimary: "text-gray-900",
    textSecondary: "text-gray-600",
    textMuted: "text-gray-500",
    shadow: "shadow-lg",
    hoverShadow: "hover:shadow-2xl",
  },
  dark: {
    name: "Dark",
    background: "bg-gradient-to-br from-gray-900 via-gray-800 to-black",
    cardBg: "bg-gray-800/70 backdrop-blur-sm",
    cardBorder: "border-gray-700/50",
    textPrimary: "text-white",
    textSecondary: "text-gray-300",
    textMuted: "text-gray-400",
    shadow: "shadow-lg shadow-black/20",
    hoverShadow: "hover:shadow-2xl hover:shadow-black/30",
  },
  ocean: {
    name: "Ocean",
    background: "bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100",
    cardBg: "bg-white/60 backdrop-blur-sm",
    cardBorder: "border-cyan-200/30",
    textPrimary: "text-gray-900",
    textSecondary: "text-gray-700",
    textMuted: "text-gray-500",
    shadow: "shadow-lg shadow-cyan-500/10",
    hoverShadow: "hover:shadow-2xl hover:shadow-cyan-500/20",
  },
  sunset: {
    name: "Sunset",
    background: "bg-gradient-to-br from-orange-50 via-red-50 to-pink-100",
    cardBg: "bg-white/60 backdrop-blur-sm",
    cardBorder: "border-orange-200/30",
    textPrimary: "text-gray-900",
    textSecondary: "text-gray-700",
    textMuted: "text-gray-500",
    shadow: "shadow-lg shadow-orange-500/10",
    hoverShadow: "hover:shadow-2xl hover:shadow-orange-500/20",
  },
  forest: {
    name: "Forest",
    background: "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100",
    cardBg: "bg-white/60 backdrop-blur-sm",
    cardBorder: "border-green-200/30",
    textPrimary: "text-gray-900",
    textSecondary: "text-gray-700",
    textMuted: "text-gray-500",
    shadow: "shadow-lg shadow-green-500/10",
    hoverShadow: "hover:shadow-2xl hover:shadow-green-500/20",
  },
  purple: {
    name: "Purple",
    background: "bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-100",
    cardBg: "bg-white/60 backdrop-blur-sm",
    cardBorder: "border-purple-200/30",
    textPrimary: "text-gray-900",
    textSecondary: "text-gray-700",
    textMuted: "text-gray-500",
    shadow: "shadow-lg shadow-purple-500/10",
    hoverShadow: "hover:shadow-2xl hover:shadow-purple-500/20",
  },
};

const AdminDashboard = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [adminName, setAdminName] = useState("");
  const [currentTheme] = useState("light");
  const [adminData, setAdminData] = useState<{
    email?: string;
    createdAt?: { toDate: () => Date };
    name?: string;
    username?: string;
  } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user, userRole, loading: authLoading } = useAuth();

  // State for current date and time
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  // State for user profile image
  const [profileImage, setProfileImage] = useState<string | null>(null);
  // State for user profile data
  const [userProfileData, setUserProfileData] = useState<any>(null);

  // State for overview card data
  const [overviewData, setOverviewData] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalInstructors: 0,
    activeStudents: 0,
  });
  const [loadingOverview, setLoadingOverview] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user || userRole !== "admin") {
      router.push("/login");
      return;
    }

    const checkAdminAuth = async () => {
      try {
        // First try to get admin data using the new utility
        const adminData = await getAdminUserData(user.uid);

        if (!adminData) {
          // Redirect to a page where admin can be created or show an error
          router.push("/create-user");
          return;
        }

        // Set admin data for potential future use
        setAdminData(adminData);

        // Fetch user profile data from Firestore to get profile image
        try {
          const userDocRef = doc(db, "admins", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserProfileData(userData);

            // Set profile image from Firestore data
            if (userData.profileimage) {
              setProfileImage(userData.profileimage);
            } else if (userData.imageUrls && userData.imageUrls[0]) {
              setProfileImage(userData.imageUrls[0]);
            } else if (userData.imageUrl) {
              setProfileImage(userData.imageUrl);
            } else if (user.photoURL) {
              setProfileImage(user.photoURL);
            } else {
              setProfileImage(null);
            }
          }
        } catch (profileError) {
          console.error("Error fetching user profile data:", profileError);
          // Fallback to auth photoURL
          if (user.photoURL) {
            setProfileImage(user.photoURL);
          } else {
            setProfileImage(null);
          }
        }

        // Determine admin name with fallback hierarchy
        let name = "Admin";
        if (adminData?.username && adminData.username.trim()) {
          name = adminData.username.trim();
        } else if (user.displayName && user.displayName.trim()) {
          name = user.displayName.trim();
        } else if (user.email) {
          // Extract name from email if available
          const emailName = user.email.split("@")[0];
          name = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        }

        setAdminName(name);
        setIsLoading(false);
      } catch (error) {
        console.error("Error verifying admin status:", error);
        // Set a fallback name even on error
        setAdminName("Admin");
        setIsLoading(false);
        // Don't redirect on error, just show as admin
      }
    };

    checkAdminAuth();
  }, [user, userRole, authLoading, router]);

  // Update current date/time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000); // Update every minute

    // Clean up interval on component unmount
    return () => clearInterval(timer);
  }, []);

  // Function to refresh admin data
  const refreshAdminData = useCallback(async () => {
    if (isRefreshing) return; // Prevent multiple simultaneous refreshes

    setIsRefreshing(true);
    try {
      if (!user) return;

      const adminDocRef = doc(db, "admins", user.uid);
      const adminDoc = await getDoc(adminDocRef);

      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        setAdminData(adminData);
        setUserProfileData(adminData);

        // Update profile image
        if (adminData.profileimage) {
          setProfileImage(adminData.profileimage);
        } else if (adminData.imageUrls && adminData.imageUrls[0]) {
          setProfileImage(adminData.imageUrls[0]);
        } else if (adminData.imageUrl) {
          setProfileImage(adminData.imageUrl);
        } else if (user?.photoURL) {
          setProfileImage(user.photoURL);
        } else {
          setProfileImage(null);
        }

        // Update name if it has changed
        if (adminData?.username && adminData.username.trim() !== adminName) {
          setAdminName(adminData.username.trim());
        }
      }
    } catch (error) {
      console.error("Error refreshing admin data:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, user, adminName]);

  // Auto-refresh admin data every 5 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        if (!isLoading) {
          refreshAdminData();
        }
      },
      5 * 60 * 1000
    ); // 5 minutes

    return () => clearInterval(interval);
  }, [isLoading, refreshAdminData]);

  // Function to fetch overview data
  const fetchOverviewData = useCallback(async () => {
    try {
      setLoadingOverview(true);

      // Fetch actual data from Firebase using your collections
      const studentsSnapshot = await getDocs(collection(db, "students"));
      const trainersSnapshot = await getDocs(collection(db, "trainers"));

      // Get courses from the static courses.ts file
      const coursesModule = await import("../../../utils/courses");
      const coursesList = coursesModule.default;
      const totalCoursesCount = coursesList.length;

      // Calculate active students
      const activeStudentsCount = studentsSnapshot.docs.filter((doc) => {
        const status = doc.data().status;
        return status === "active" || status === "Active";
      }).length;

      const overviewDataResult = {
        totalUsers: studentsSnapshot.size, // Students are considered users
        totalCourses: totalCoursesCount,
        totalInstructors: trainersSnapshot.size, // Trainers are the instructors
        activeStudents: activeStudentsCount, // Count of students with active status
      };

      setOverviewData(overviewDataResult);
    } catch (error) {
      console.error("Error fetching overview data:", error);
      // Set default values in case of error
      setOverviewData({
        totalUsers: 0,
        totalCourses: 0,
        totalInstructors: 0,
        activeStudents: 0,
      });
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  // Load overview data on component mount
  useEffect(() => {
    if (!authLoading && !isLoading) {
      fetchOverviewData();
    }
  }, [authLoading, isLoading, fetchOverviewData]);

  // Overview cards data
  const overviewCards = [
    {
      title: "Total Students",
      value: overviewData.totalUsers, // Students are stored in the students collection
      change: "+12%",
      icon: GraduationCap,
      color: "blue",
      gradient: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      iconBg: "bg-gradient-to-br from-blue-100 to-blue-200",
      textColor: "text-blue-600",
      delay: 0.1,
    },
    {
      title: "Total Courses",
      value: overviewData.totalCourses,
      change: "+5%",
      icon: BookOpen,
      color: "green",
      gradient: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      iconBg: "bg-gradient-to-br from-green-100 to-green-200",
      textColor: "text-green-600",
      delay: 0.2,
    },
    {
      title: "Total Instructors",
      value: overviewData.totalInstructors,
      change: "",
      icon: UserCog,
      color: "purple",
      gradient: "from-purple-500 to-violet-500",
      bgColor: "bg-purple-50",
      iconBg: "bg-gradient-to-br from-purple-100 to-purple-200",
      textColor: "text-purple-600",
      delay: 0.3,
    },
    {
      title: "Active Students",
      value: overviewData.activeStudents,
      change: "+10%",
      icon: User,
      color: "indigo",
      gradient: "from-indigo-500 to-purple-500",
      bgColor: "bg-indigo-50",
      iconBg: "bg-gradient-to-br from-indigo-100 to-indigo-200",
      textColor: "text-indigo-600",
      delay: 0.4,
    },
  ];

  const dashboardCards = [
    {
      title: "Student Record",
      description: "View and manage the list of students and trainers",
      href: "/student-list",
      icon: GraduationCap,
      color: "emerald",
      gradient: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-50",
      iconBg: "bg-gradient-to-br from-emerald-100 to-emerald-200",
      textColor: "text-emerald-600",
      hoverColor: "group-hover:text-emerald-600",
      borderColor: "border-emerald-200",
      action: "View list",
      delay: 0.2,
    },

    {
      title: "Create Multiple Accounts",
      description: "Create multiple user accounts without email verification",
      href: "/admin-dashboard/create-user",
      icon: UserRoundPlus,
      color: "violet",
      gradient: "from-violet-500 to-purple-500",
      bgColor: "bg-violet-50",
      iconBg: "bg-gradient-to-br from-violet-100 to-violet-200",
      textColor: "text-violet-600",
      hoverColor: "group-hover:text-violet-600",
      borderColor: "border-violet-200",
      action: "Create accounts",
      delay: 0.8,
    },
  ];

  const theme = themes[currentTheme];

  if (authLoading || isLoading) {
    return <AuthLoadingSpinner />;
  }

  return (
    <>
      <main
        role="main"
        aria-label="Admin Dashboard"
        className={`min-h-[calc(100vh-6rem)] `}
      >
        <div className="relative w-full mx-auto py-3 px-4 sm:px-6 lg:px-8 ">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className=""
          >
            <div className="text-center mb-4 ">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.2 }}
                whileHover={{ scale: 1.02 }}
                className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${theme.cardBg} backdrop-blur-sm ${theme.cardBorder} ${theme.shadow} mb-4`}
              >
                <div className="flex items-center gap-4">
                  <Link href="/user-profile">
                    <div className="cursor-pointer group">
                      {profileImage ? (
                        <div className="relative w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden group-hover:shadow-md transition-shadow duration-200">
                          <Image
                            src={profileImage}
                            alt="Profile"
                            fill
                            className="object-cover rounded-full"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center border-2 border-white group-hover:shadow-md transition-shadow duration-200">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                  </Link>
                  <span
                    className={`text-sm font-medium ${theme.textSecondary}`}
                  >
                    Welcome,{" "}
                    <span className="font-bold gradient-text">{adminName}</span>
                  </span>
                </div>
                <button
                  onClick={refreshAdminData}
                  disabled={isRefreshing}
                  className="p-1 rounded-full hover:bg-blue-100 transition-colors duration-200 disabled:opacity-50"
                  title="Refresh admin data"
                >
                  <RefreshCw
                    className={`w-4 h-4 text-red-600 hover:text-red-700 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                </button>
              </motion.div>

              {/* Admin Info Section */}
            </div>
          </motion.div>

          {/* Overview Cards Section */}
          <div className="mb-8">
            <AnimatePresence>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                {overviewCards.map((card) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      damping: 15,
                      delay: card.delay,
                    }}
                    whileHover={{
                      scale: 1.02,
                      y: -4,
                    }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative ${theme.cardBg} backdrop-blur-sm rounded-2xl ${theme.cardBorder} ${theme.shadow} transition-all duration-200 h-full overflow-hidden`}
                  >
                    {/* Gradient Background */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-200`}
                    />

                    {/* Content */}
                    <div className="relative p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`p-3 rounded-xl ${card.iconBg} shadow-sm transition-all duration-200`}
                        >
                          <card.icon className={`h-6 w-6 ${card.textColor}`} />
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-2xl font-bold ${theme.textPrimary} ${card.textColor}`}
                          >
                            {card.value}
                          </p>
                        </div>
                      </div>

                      <h3
                        className={`text-sm font-semibold ${theme.textSecondary} capitalize`}
                      >
                        {card.title}
                      </h3>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </div>

          {/* Dashboard Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {dashboardCards.map((card) => (
                <Link key={card.title} href={card.href} className="group">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 100,
                      damping: 15,
                      delay: card.delay,
                    }}
                    whileHover={{
                      scale: 1.02,
                      y: -4,
                    }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative ${theme.cardBg} backdrop-blur-sm rounded-3xl ${card.borderColor} ${theme.shadow} ${theme.hoverShadow} transition-all duration-200 h-full overflow-hidden group`}
                  >
                    {/* Gradient Background */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-200`}
                    />

                    {/* Content */}
                    <div className="relative p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`p-4 rounded-2xl ${card.iconBg} shadow-sm group-hover:shadow-md transition-all duration-200`}
                        >
                          <card.icon className={`h-7 w-7 ${card.textColor}`} />
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div
                            className={`w-2 h-2 rounded-full bg-${card.color}-400 animate-pulse`}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3
                          className={`text-xl font-bold ${theme.textPrimary} ${card.hoverColor} transition-colors duration-200`}
                        >
                          {card.title}
                        </h3>
                        <p
                          className={`text-sm ${theme.textSecondary} leading-relaxed`}
                        >
                          {card.description}
                        </p>
                      </div>

                      <div className="mt-6 flex items-center justify-between">
                        <span
                          className={`text-sm font-semibold ${card.textColor}`}
                        >
                          {card.action}
                        </span>
                        <div
                          className={`p-2 rounded-full ${card.bgColor} group-hover:bg-white group-hover:shadow-md transition-all duration-200`}
                        >
                          <ArrowRight
                            className={`w-4 h-4 ${card.textColor} group-hover:translate-x-1 transition-transform duration-200`}
                          />
                        </div>
                      </div>

                      {/* Hover Effect Border */}
                      <div
                        className={`absolute inset-0 rounded-3xl border-2 ${card.borderColor} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                      />
                    </div>
                  </motion.div>
                </Link>
              ))}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="mt-16 text-center"
          >
            <p className={`text-sm ${theme.textMuted}`}>
              © {currentDateTime.getFullYear()} Cyborg Robotics Academy. Built
              with ❤️ for the future of education.
            </p>
            <p className={`text-xs ${theme.textMuted} mt-1`}>
              Current Date & Time: {currentDateTime.toLocaleString()}
            </p>
          </motion.div>
        </div>
      </main>
    </>
  );
};

export default AdminDashboard;
