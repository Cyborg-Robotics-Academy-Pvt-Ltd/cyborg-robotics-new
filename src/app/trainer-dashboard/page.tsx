"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import {
  GraduationCap,
  BookText,
  BarChart3,
  ClipboardCheck,
  UserRoundPlus,
  ArrowRight,
  Sparkles,
  RefreshCw,
  User,
  CheckSquare,
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

const TrainerDashboard = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [trainerName, setTrainerName] = useState("");
  const [currentTheme] = useState("light");
  const [trainerData, setTrainerData] = useState<{
    email?: string;
    createdAt?: { toDate: () => Date };
    name?: string;
    username?: string;
  } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { user, userRole, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    if (!user || userRole !== "trainer") {
      router.push("/login");
      return;
    }

    const checkTrainerAuth = async () => {
      try {
        console.log("Fetching trainer data for user:", user.uid);
        const trainerDocRef = doc(db, "trainers", user.uid);
        const trainerDoc = await getDoc(trainerDocRef);

        if (!trainerDoc.exists()) {
          console.log("Trainer document does not exist for user:", user.uid);
          router.push("/login");
          return;
        }

        // Get trainer data from the document
        const trainerData = trainerDoc.data();
        console.log("Trainer data retrieved:", trainerData);

        // Set trainer data for potential future use
        setTrainerData(trainerData);

        // Determine trainer name with fallback hierarchy
        let name = "Trainer";
        if (trainerData?.username && trainerData.username.trim()) {
          name = trainerData.username.trim();
        } else if (trainerData?.name && trainerData.name.trim()) {
          name = trainerData.name.trim();
        } else if (user.displayName && user.displayName.trim()) {
          name = user.displayName.trim();
        } else if (user.email) {
          // Extract name from email if available
          const emailName = user.email.split("@")[0];
          name = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        }

        console.log("Setting trainer name to:", name);
        setTrainerName(name);
        setIsLoading(false);
      } catch (error) {
        console.error("Error verifying trainer status:", error);
        // Set a fallback name even on error
        setTrainerName("Trainer");
        setIsLoading(false);
        // Don't redirect on error, just show as trainer
      }
    };

    checkTrainerAuth();
  }, [user, userRole, authLoading, router]);

  // Function to refresh trainer data
  const refreshTrainerData = useCallback(async () => {
    if (isRefreshing) return; // Prevent multiple simultaneous refreshes

    setIsRefreshing(true);
    try {
      if (!user) return;

      const trainerDocRef = doc(db, "trainers", user.uid);
      const trainerDoc = await getDoc(trainerDocRef);

      if (trainerDoc.exists()) {
        const trainerData = trainerDoc.data();
        setTrainerData(trainerData);

        // Update name if it has changed
        if (trainerData?.name && trainerData.name.trim() !== trainerName) {
          setTrainerName(trainerData.name.trim());
        }
      }
    } catch (error) {
      console.error("Error refreshing trainer data:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, user, trainerName]);

  // Auto-refresh trainer data every 5 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        if (!isLoading) {
          refreshTrainerData();
        }
      },
      5 * 60 * 1000
    ); // 5 minutes

    return () => clearInterval(interval);
  }, [isLoading, refreshTrainerData]);

  const dashboardCards = [
    {
      title: "Create New Student",
      description: "Add new students to your classes and manage their profiles",
      href: "/create-user",
      icon: UserRoundPlus,
      color: "red",
      gradient: "from-red-500 to-pink-500",
      bgColor: "bg-red-50",
      iconBg: "bg-gradient-to-br from-red-100 to-red-200",
      textColor: "text-red-600",
      hoverColor: "group-hover:text-red-600",
      action: "Add students",
      delay: 0,
    },
    {
      title: "Student Record",
      description: "View and manage the list of students in your classes",
      href: "/student-list",
      icon: GraduationCap,
      color: "emerald",
      gradient: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-50",
      iconBg: "bg-gradient-to-br from-emerald-100 to-emerald-200",
      textColor: "text-emerald-600",
      hoverColor: "group-hover:text-emerald-600",
      action: "View list",
      delay: 0.1,
    },
    {
      title: "Tasks Management",
      description: "Create and manage tasks and assignments for your students",
      href: "/trainer-dashboard/create-task",
      icon: ClipboardCheck,
      color: "cyan",
      gradient: "from-cyan-500 to-blue-500",
      bgColor: "bg-cyan-50",
      iconBg: "bg-gradient-to-br from-cyan-100 to-cyan-200",
      textColor: "text-cyan-600",
      hoverColor: "group-hover:text-cyan-600",
      action: "Manage tasks",
      delay: 0.2,
    },
    {
      title: "Media Section",
      description: "View system analytics, reports and key metrics",
      href: "/media",
      icon: BarChart3,
      color: "blue",
      gradient: "from-blue-500 to-indigo-500",
      bgColor: "bg-blue-50",
      iconBg: "bg-gradient-to-br from-blue-100 to-blue-200",
      textColor: "text-blue-600",
      hoverColor: "group-hover:text-blue-600",
      action: "View analytics",
      delay: 0.3,
    },
    {
      title: "Assignments",
      description: "Create and grade student assignments and projects",
      href: "/trainer-dashboard/assignments",
      icon: CheckSquare,
      color: "teal",
      gradient: "from-teal-500 to-green-500",
      bgColor: "bg-teal-50",
      iconBg: "bg-gradient-to-br from-teal-100 to-teal-200",
      textColor: "text-teal-600",
      hoverColor: "group-hover:text-teal-600",
      action: "Manage assignments",
      delay: 0.4,
    },
    {
      title: "Course Management",
      description: "Manage your courses and curriculum materials",
      href: "/trainer-dashboard/courses",
      icon: BookText,
      color: "violet",
      gradient: "from-violet-500 to-purple-500",
      bgColor: "bg-violet-50",
      iconBg: "bg-gradient-to-br from-violet-100 to-violet-200",
      textColor: "text-violet-600",
      hoverColor: "group-hover:text-violet-600",
      action: "Manage courses",
      delay: 0.5,
    },
  ];

  const theme = themes[currentTheme];

  if (authLoading || isLoading) {
    return <AuthLoadingSpinner />;
  }

  return (
    <>
      <Head>
        <title>Trainer Dashboard | Cyborg Robotics Academy</title>
        <meta
          name="description"
          content="Trainer dashboard for managing students, tasks, and analytics at Cyborg Robotics Academy."
        />
        <meta
          property="og:title"
          content="Trainer Dashboard | Cyborg Robotics Academy"
        />
        <meta
          property="og:description"
          content="Trainer dashboard for managing students, tasks, and analytics at Cyborg Robotics Academy."
        />
        <meta property="og:type" content="website" />
      </Head>

      <main
        role="main"
        aria-label="Trainer Dashboard"
        className={`min-h-[calc(100vh-6rem)] -mt-24 pt-24 ${theme.background}`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_0)] bg-[length:20px_20px]"></div>
        </div>

        <div className="relative w-full mx-auto py-8 px-4 sm:px-6 lg:px-8 md:mt-10">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className=""
          >
            <div className="text-center mb-8 ">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
                className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${theme.cardBg} backdrop-blur-sm ${theme.cardBorder} ${theme.shadow} mb-4`}
              >
                <div className="flex items-center gap-4">
                  <User className="w-5 h-5 text-blue-600" />
                  <span
                    className={`text-sm font-medium ${theme.textSecondary}`}
                  >
                    Welcome,{" "}
                    <span className="font-bold text-blue-600">
                      {trainerName}
                    </span>
                  </span>
                </div>
                <button
                  onClick={refreshTrainerData}
                  disabled={isRefreshing}
                  className="p-1 rounded-full hover:bg-blue-100 transition-colors duration-200 disabled:opacity-50"
                  title="Refresh trainer data"
                >
                  <RefreshCw
                    className={`w-4 h-4 text-blue-600 hover:text-blue-700 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                </button>
              </motion.div>

              {/* Trainer Info Section */}
              {trainerData && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className={`inline-flex mx-4 items-center gap-8 px-4 py-2 rounded-lg ${theme.cardBg} backdrop-blur-sm ${theme.cardBorder} ${theme.shadow} mb-4 rounded-xl`}
                >
                  <Sparkles className="w-4 h-4 text-green-600" />
                  <span className={`text-xs ${theme.textMuted}`}>
                    Role:{" "}
                    <span className="font-semibold text-green-600">
                      Trainer
                    </span>
                    {trainerData.email && (
                      <>
                        {" "}
                        • Email:{" "}
                        <span className="font-semibold">
                          {trainerData.email}
                        </span>
                      </>
                    )}
                    {trainerData.createdAt && (
                      <>
                        {" "}
                        • Member since:{" "}
                        <span className="font-semibold">
                          {new Date(
                            trainerData.createdAt.toDate()
                          ).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>

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
                    className={`relative ${theme.cardBg} backdrop-blur-sm rounded-3xl ${theme.cardBorder} ${theme.shadow} ${theme.hoverShadow} transition-all duration-200 h-full overflow-hidden group`}
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
                        className={`absolute inset-0 rounded-3xl border-2 border-${card.color}-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
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
              © 2025 Cyborg Robotics Academy. Built with ❤️ for the future of
              education.
            </p>
          </motion.div>
        </div>
      </main>
    </>
  );
};

export default TrainerDashboard;
