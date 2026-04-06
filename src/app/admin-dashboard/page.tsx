"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { getAdminUserData } from "@/lib/admin-utils";
import Link from "next/link";
import Image from "next/image";
import {
  UserCog,
  GraduationCap,
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
  TrendingUp,
  Users,
  DollarSign,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Activity,
  CreditCard,
  Download,
  AlertTriangle,
  Clock3,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useAuth } from "@/lib/auth-context";
import AuthLoadingSpinner from "@/components/AuthLoadingSpinner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

// Chart data for analytics
const enrollmentData = [
  { month: "Jan", enrollments: 45, courses: 12 },
  { month: "Feb", enrollments: 52, courses: 15 },
  { month: "Mar", enrollments: 48, courses: 14 },
  { month: "Apr", enrollments: 61, courses: 18 },
  { month: "May", enrollments: 59, courses: 17 },
  { month: "Jun", enrollments: 72, courses: 21 },
  { month: "Jul", enrollments: 84, courses: 25 },
];

const visitData = [
  { day: "Mon", visits: 240 },
  { day: "Tue", visits: 140 },
  { day: "Wed", visits: 320 },
  { day: "Thu", visits: 280 },
  { day: "Fri", visits: 350 },
  { day: "Sat", visits: 190 },
  { day: "Sun", visits: 220 },
];

const chartConfig = {
  enrollments: {
    label: "Enrollments",
    color: "#AB2F30",
  },
  courses: {
    label: "Courses",
    color: "#8B1A1B",
  },
  visits: {
    label: "Visits",
    color: "#AB2F30",
  },
};

const SUCCESS_PAYMENT_STATUSES = new Set(["SUCCESS", "CHARGED"]);
const PENDING_PAYMENT_STATUSES = new Set([
  "PENDING",
  "CREATED",
  "AUTHORIZED",
  "PENDING_VBV",
]);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const getRelativeTime = (date: Date) => {
  const minutesAgo = Math.ceil((Date.now() - date.getTime()) / (1000 * 60));
  const hoursAgo = Math.floor(minutesAgo / 60);
  const daysAgo = Math.floor(hoursAgo / 24);

  if (daysAgo > 0) {
    if (daysAgo === 1) return "1 day ago";
    if (daysAgo < 30) return `${daysAgo} days ago`;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (hoursAgo > 0) {
    return `${hoursAgo} hr${hoursAgo !== 1 ? "s" : ""} ago`;
  }

  return `${minutesAgo} min${minutesAgo !== 1 ? "s" : ""} ago`;
};

  const extractAmount = (value: unknown) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const cleaned = Number(value.replace(/[^0-9.-]+/g, ""));
      return Number.isFinite(cleaned) ? cleaned : 0;
    }
    return 0;
  };

  const hasTrainerAssignment = (student: Record<string, any>) => {
    const hasValue = (value: unknown) =>
      typeof value === "string" ? value.trim().length > 0 : Boolean(value);

    if (hasValue(student.trainerId) || hasValue(student.trainerName)) {
      return true;
    }

    const courseTrainers = Array.isArray(student.courseTrainers)
      ? student.courseTrainers
      : [];
    if (
      courseTrainers.some(
        (courseTrainer: Record<string, any>) =>
          hasValue(courseTrainer?.trainerId) ||
          hasValue(courseTrainer?.trainerName),
      )
    ) {
      return true;
    }

    const courses = Array.isArray(student.courses) ? student.courses : [];
    return courses.some(
      (course: Record<string, any>) =>
        hasValue(course?.trainerId) || hasValue(course?.trainerName),
    );
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
    unassignedTrainerStudents: 0,
    activeStudents: 0,
    recentRegistrations: 0,
    weeklyEnrollments: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    conversionRate: 0,
    atRiskStudents: 0,
    monthlyGrowth: 0,
  });
  const [loadingOverview, setLoadingOverview] = useState(true);

  // State for recent activity data
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  // State for enrollment trends
  const [enrollmentTrends, setEnrollmentTrends] = useState<any[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(true);

  // State for course category data
  const [courseCategoryData, setCourseCategoryData] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // State for weekly activity
  const [weeklyActivity, setWeeklyActivity] = useState<any[]>([]);
  const [loadingWeeklyActivity, setLoadingWeeklyActivity] = useState(true);

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
      5 * 60 * 1000,
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
      const paymentsSnapshot = await getDocs(collection(db, "payments"));

      // Get courses from the static courses.ts file
      const coursesModule = await import("../../../utils/courses");
      const coursesList = coursesModule.default;
      const totalCoursesCount = coursesList.length;

      // Calculate active students
      const activeStudentsCount = studentsSnapshot.docs.filter((doc) => {
        const status = doc.data().status;
        return status === "active" || status === "Active";
      }).length;

      // Calculate recent registrations (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentRegistrationsCount = studentsSnapshot.docs.filter((doc) => {
        const createdAt = doc.data().createdAt;
        if (!createdAt) return false;
        const createdDate = createdAt.toDate
          ? createdAt.toDate()
          : new Date(createdAt);
        return createdDate >= thirtyDaysAgo;
      }).length;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const weeklyEnrollmentsCount = studentsSnapshot.docs.filter((doc) => {
        const createdAt = doc.data().createdAt;
        if (!createdAt) return false;
        const createdDate = createdAt.toDate
          ? createdAt.toDate()
          : new Date(createdAt);
        return createdDate >= sevenDaysAgo;
      }).length;

      // Calculate pending approvals (students without active status)
      const pendingApprovalsCount = studentsSnapshot.docs.filter((doc) => {
        const status = doc.data().status;
        return !status || (status !== "active" && status !== "Active");
      }).length;

      const atRiskStudentsCount = studentsSnapshot.docs.filter((doc) => {
        const status = String(doc.data().status || "").toLowerCase();
        return ["hold", "inactive", "paused", "pending"].includes(status);
      }).length;

      const successfulPayments = paymentsSnapshot.docs.filter((doc) =>
        SUCCESS_PAYMENT_STATUSES.has(
          String(doc.data().status || "").toUpperCase(),
        ),
      );

      const pendingPaymentsCount = paymentsSnapshot.docs.filter((doc) =>
        PENDING_PAYMENT_STATUSES.has(
          String(doc.data().status || "").toUpperCase(),
        ),
      ).length;

      const unassignedTrainerStudentsCount = studentsSnapshot.docs.filter(
        (doc) => !hasTrainerAssignment(doc.data() as Record<string, any>),
      ).length;

      const totalRevenue = successfulPayments.reduce(
        (sum, doc) => sum + extractAmount(doc.data().amount),
        0,
      );

      const conversionRate =
        studentsSnapshot.size > 0
          ? Math.round((activeStudentsCount / studentsSnapshot.size) * 100)
          : 0;

      const monthlyGrowth = Math.round(
        (recentRegistrationsCount /
          Math.max(studentsSnapshot.size - recentRegistrationsCount, 1)) *
          100,
      );

      const overviewDataResult = {
        totalUsers: studentsSnapshot.size, // Students are considered users
        totalCourses: totalCoursesCount,
        totalInstructors: trainersSnapshot.size, // Trainers are the instructors
        unassignedTrainerStudents: unassignedTrainerStudentsCount,
        activeStudents: activeStudentsCount, // Count of students with active status
        recentRegistrations: recentRegistrationsCount,
        weeklyEnrollments: weeklyEnrollmentsCount,
        pendingApprovals: pendingApprovalsCount,
        totalRevenue,
        pendingPayments: pendingPaymentsCount,
        conversionRate,
        atRiskStudents: atRiskStudentsCount,
        monthlyGrowth: monthlyGrowth,
      };

      setOverviewData(overviewDataResult);
    } catch (error) {
      console.error("Error fetching overview data:", error);
      // Set default values in case of error
      setOverviewData({
        totalUsers: 0,
        totalCourses: 0,
        totalInstructors: 0,
        unassignedTrainerStudents: 0,
        activeStudents: 0,
        recentRegistrations: 0,
        weeklyEnrollments: 0,
        pendingApprovals: 0,
        totalRevenue: 0,
        pendingPayments: 0,
        conversionRate: 0,
        atRiskStudents: 0,
        monthlyGrowth: 0,
      });
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  // Function to fetch recent activities
  const fetchRecentActivities = useCallback(async () => {
    try {
      setLoadingActivities(true);

      const activities: any[] = [];
      const now = new Date();

      // Fetch recent student registrations
      const studentsSnapshot = await getDocs(collection(db, "students"));
      const recentStudents = studentsSnapshot.docs
        .filter((doc) => {
          const data = doc.data();
          const createdAt = data.createdAt;
          if (!createdAt) return false;
          const createdDate = createdAt.toDate
            ? createdAt.toDate()
            : new Date(createdAt);
          // Last 7 days
          const sevenDaysAgo = new Date(
            now.getTime() - 7 * 24 * 60 * 60 * 1000,
          );
          return createdDate >= sevenDaysAgo;
        })
        .sort((a, b) => {
          const dateA = a.data().createdAt?.toDate
            ? a.data().createdAt.toDate()
            : new Date(a.data().createdAt);
          const dateB = b.data().createdAt?.toDate
            ? b.data().createdAt.toDate()
            : new Date(b.data().createdAt);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 5);

      recentStudents.forEach((doc, index) => {
        const data = doc.data();
        activities.push({
          id: `student-${index}`,
          type: "registration",
          name: "New Student Registration",
          description: data.trainerName
            ? `${data.fullName || data.username || "Student"} has been assigned to trainer ${data.trainerName}`
            : `${data.fullName || data.username || "Student"} registered for courses`,
          time: data.createdAt?.toDate
            ? data.createdAt.toDate()
            : new Date(data.createdAt),
          icon: GraduationCap,
          iconColor: "text-red-700",
        });
      });

      // Fetch recent trainer additions
      const trainersSnapshot = await getDocs(collection(db, "trainers"));
      const recentTrainers = trainersSnapshot.docs
        .filter((doc) => {
          const data = doc.data();
          const createdAt = data.createdAt;
          if (!createdAt) return false;
          const createdDate = createdAt.toDate
            ? createdAt.toDate()
            : new Date(createdAt);
          const sevenDaysAgo = new Date(
            now.getTime() - 7 * 24 * 60 * 60 * 1000,
          );
          return createdDate >= sevenDaysAgo;
        })
        .sort((a, b) => {
          const dateA = a.data().createdAt?.toDate
            ? a.data().createdAt.toDate()
            : new Date(a.data().createdAt);
          const dateB = b.data().createdAt?.toDate
            ? b.data().createdAt.toDate()
            : new Date(b.data().createdAt);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 3);

      recentTrainers.forEach((doc, index) => {
        const data = doc.data();
        activities.push({
          id: `trainer-${index}`,
          type: "trainer_added",
          name: "Instructor Added",
          description: `${data.name || data.username || data.email} joined as instructor`,
          time: data.createdAt?.toDate
            ? data.createdAt.toDate()
            : new Date(data.createdAt),
          icon: UserCog,
          iconColor: "text-purple-600",
        });
      });

      // Sort all activities by time and take top 8
      const sortedActivities = activities
        .sort((a, b) => b.time.getTime() - a.time.getTime())
        .slice(0, 8);

      setRecentActivities(sortedActivities);
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      setRecentActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  }, []);

  // Function to fetch enrollment trends
  const fetchEnrollmentTrends = useCallback(async () => {
    try {
      setLoadingTrends(true);

      // Get students and group by month
      const studentsSnapshot = await getDocs(collection(db, "students"));
      const students: any[] = studentsSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      // Group by month for the last 12 months
      const trends: any[] = [];
      const now = new Date();

      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const enrollments = students.filter((student) => {
          const createdAt = student.createdAt;
          if (!createdAt) return false;
          const createdDate = createdAt.toDate
            ? createdAt.toDate()
            : new Date(createdAt);
          return createdDate >= monthStart && createdDate <= monthEnd;
        }).length;

        // Get courses count for this period (simplified - you might want to track this separately)
        const courses = Math.max(10, Math.floor(enrollments * 0.3)); // Rough estimation

        trends.push({
          month: date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
          }),
          enrollments: enrollments,
          courses: courses,
        });
      }

      setEnrollmentTrends(trends);
    } catch (error) {
      console.error("Error fetching enrollment trends:", error);
      // Fallback to static data
      setEnrollmentTrends([
        { month: "Jan", enrollments: 45, courses: 12 },
        { month: "Feb", enrollments: 52, courses: 15 },
        { month: "Mar", enrollments: 48, courses: 14 },
        { month: "Apr", enrollments: 61, courses: 18 },
        { month: "May", enrollments: 59, courses: 17 },
        { month: "Jun", enrollments: 72, courses: 21 },
        { month: "Jul", enrollments: 84, courses: 25 },
      ]);
    } finally {
      setLoadingTrends(false);
    }
  }, []);

  // Function to fetch weekly activity
  const fetchWeeklyActivity = useCallback(async () => {
    try {
      setLoadingWeeklyActivity(true);

      // Get students and count by day for the last 7 days
      const studentsSnapshot = await getDocs(collection(db, "students"));
      const students: any[] = studentsSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      const activityData: any[] = [];
      const now = new Date();

      // Days of week mapping
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));

        const registrations = students.filter((student) => {
          const createdAt = student.createdAt;
          if (!createdAt) return false;
          const createdDate = createdAt.toDate
            ? createdAt.toDate()
            : new Date(createdAt);
          return createdDate >= dayStart && createdDate <= dayEnd;
        }).length;

        activityData.push({
          day: days[date.getDay()],
          visits: registrations,
        });
      }

      setWeeklyActivity(activityData);
    } catch (error) {
      console.error("Error fetching weekly activity:", error);
      // Fallback to static data
      setWeeklyActivity([
        { day: "Mon", visits: 240 },
        { day: "Tue", visits: 140 },
        { day: "Wed", visits: 320 },
        { day: "Thu", visits: 280 },
        { day: "Fri", visits: 350 },
        { day: "Sat", visits: 190 },
        { day: "Sun", visits: 220 },
      ]);
    } finally {
      setLoadingWeeklyActivity(false);
    }
  }, []);

  // Function to fetch course enrollment distribution based on unique students
  const fetchCourseCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);

      // Get all students and their courses
      const studentsSnapshot = await getDocs(collection(db, "students"));
      const students = studentsSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      // Import actual courses from courses.ts
      const coursesModule = await import("../../../utils/courses");
      const allCourses = coursesModule.default;

      const resolveCourseName = (courseName: string) => {
        const normalizedInput = courseName.toLowerCase().trim();

        const exactMatch = allCourses.find(
          (course) => course.toLowerCase().trim() === normalizedInput,
        );
        if (exactMatch) return exactMatch;

        const partialMatch = allCourses.find((course) => {
          const normalizedCourse = course.toLowerCase().trim();
          return (
            normalizedCourse.includes(normalizedInput) ||
            normalizedInput.includes(normalizedCourse)
          );
        });

        return partialMatch || courseName;
      };

      // Count each student only once per course
      const courseEnrollmentMap: Record<string, Set<string>> = {};

      // Color palette for courses
      const colors = [
        "#3b82f6",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6",
        "#06b6d4",
        "#f97316",
        "#64748b",
        "#ec4899",
        "#14b8a6",
        "#f43f5e",
        "#8b5cf6",
        "#0ea5e9",
        "#f59e0b",
        "#84cc16",
        "#f97316",
        "#6366f1",
        "#10b981",
        "#f43f5e",
        "#06b6d4",
        "#f59e0b",
        "#8b5cf6",
        "#ec4899",
        "#14b8a6",
        "#64748b",
      ];

      // Process each student's courses
      students.forEach((student: any) => {
        const studentKey = String(
          student.PrnNumber || student.id || student.username || "",
        ).trim();
        if (!studentKey) return;

        const courses = student.courses || [];
        if (Array.isArray(courses)) {
          const seenCoursesForStudent = new Set<string>();

          courses.forEach((course: any) => {
            const courseName =
              typeof course === "string" ? course : course.name || "";
            if (!courseName) return;

            const resolvedCourse = resolveCourseName(courseName);

            if (seenCoursesForStudent.has(resolvedCourse)) {
              return;
            }

            seenCoursesForStudent.add(resolvedCourse);

            if (!courseEnrollmentMap[resolvedCourse]) {
              courseEnrollmentMap[resolvedCourse] = new Set();
            }

            courseEnrollmentMap[resolvedCourse].add(studentKey);
          });
        }
      });

      // Convert to chart format and filter out zero counts
      const rankedCourseData = Object.entries(courseEnrollmentMap)
        .filter(([_, studentIds]) => studentIds.size > 0)
        .map(([name, studentIds], index) => ({
          name: name.length > 20 ? name.substring(0, 17) + "..." : name,
          fullName: name,
          value: studentIds.size,
          color: name === "Other" ? "#64748b" : colors[index % colors.length],
        }))
        .sort((a, b) => b.value - a.value);

      // Ensure all entries have required properties
      const validatedCourseData = rankedCourseData.map((item) => ({
        ...item,
        name: item.name || "Unknown",
        fullName: item.fullName || item.name || "Unknown",
        value: item.value || 0,
        color: item.color || "#64748b",
      }));

      setCourseCategoryData(validatedCourseData);
    } catch (error) {
      console.error("Error fetching course categories:", error);
      setCourseCategoryData([]);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  // Load all dynamic data on component mount
  useEffect(() => {
    if (!authLoading && !isLoading) {
      fetchOverviewData();
      fetchRecentActivities();
      fetchEnrollmentTrends();
      fetchWeeklyActivity();
      fetchCourseCategories();
    }
  }, [
    authLoading,
    isLoading,
    fetchOverviewData,
    fetchRecentActivities,
    fetchEnrollmentTrends,
    fetchWeeklyActivity,
    fetchCourseCategories,
  ]);

  // Overview cards data
  const overviewCards = [
    {
      title: "Active Students",
      value: overviewData.activeStudents,
      change: `+${overviewData.monthlyGrowth}%`,
      icon: Users,
      color: "red",
      gradient: "from-[#AB2F30] to-[#8B1A1B]",
      bgColor: "bg-red-50",
      iconBg: "bg-gradient-to-br from-red-100 to-red-200",
      textColor: "text-red-700",
      delay: 0.1,
      trend: "up",
      emphasis: "primary",
      helper: `${overviewData.conversionRate}% activation rate`,
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(overviewData.totalRevenue),
      change: `${overviewData.pendingPayments} pending`,
      icon: DollarSign,
      color: "red",
      gradient: "from-[#991B1B] to-[#7F1D1D]",
      bgColor: "bg-red-50",
      iconBg: "bg-gradient-to-br from-red-100 to-red-200",
      textColor: "text-red-700",
      delay: 0.2,
      trend: "up",
      emphasis: "primary",
      helper: "Successful payments collected",
    },
    {
      title: "Pending Approvals",
      value: overviewData.pendingApprovals,
      change: "Awaiting review",
      icon: ClipboardCheck,
      color: "red",
      gradient: "from-[#B91C1C] to-[#991B1B]",
      bgColor: "bg-red-50",
      iconBg: "bg-gradient-to-br from-red-100 to-red-200",
      textColor: "text-red-700",
      delay: 0.3,
      trend: overviewData.pendingApprovals > 0 ? "down" : "up",
      helper: "New accounts blocked from activation",
    },
    {
      title: "New Enrollments",
      value: overviewData.weeklyEnrollments,
      change: "Last 7 days",
      icon: ShoppingCart,
      color: "red",
      gradient: "from-[#AB2F30] to-[#6B1516]",
      bgColor: "bg-red-50",
      iconBg: "bg-gradient-to-br from-red-100 to-red-200",
      textColor: "text-red-700",
      delay: 0.4,
      trend: "up",
      helper: "Fresh registrations this week",
    },
    {
      title: "Conversion Rate",
      value: `${overviewData.conversionRate}%`,
      change: `${overviewData.totalUsers} total students`,
      icon: TrendingUp,
      color: "red",
      gradient: "from-[#AB2F30] to-[#8B1A1B]",
      bgColor: "bg-orange-50",
      iconBg: "bg-gradient-to-br from-red-100 to-red-200",
      textColor: "text-red-700",
      delay: 0.5,
      trend: "up",
      helper: "Registered to active ratio",
    },
    {
      title: "Pending Payments",
      value: overviewData.pendingPayments,
      change:
        overviewData.pendingPayments > 0 ? "Needs follow-up" : "All clear",
      icon: CreditCard,
      color: "yellow",
      gradient: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
      iconBg: "bg-gradient-to-br from-yellow-100 to-yellow-200",
      textColor: "text-yellow-600",
      delay: 0.6,
      trend: overviewData.pendingPayments > 0 ? "down" : "up",
      helper: "Open payment transactions",
    },
    {
      title: "Total Instructors",
      value: overviewData.totalInstructors,
      change: `${overviewData.totalCourses} active courses`,
      icon: UserCog,
      color: "slate",
      gradient: "from-slate-500 to-slate-700",
      bgColor: "bg-slate-50",
      iconBg: "bg-gradient-to-br from-slate-100 to-slate-200",
      textColor: "text-slate-600",
      delay: 0.7,
      trend: "up",
      helper: "Teaching capacity snapshot",
    },
    {
      title: "Unassigned Trainer Students",
      value: overviewData.unassignedTrainerStudents,
      change:
        overviewData.unassignedTrainerStudents > 0
          ? "Need assignment"
          : "All assigned",
      icon: UserRoundPlus,
      color: "amber",
      gradient: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50",
      iconBg: "bg-gradient-to-br from-amber-100 to-orange-200",
      textColor: "text-amber-700",
      delay: 0.8,
      trend: overviewData.unassignedTrainerStudents > 0 ? "down" : "up",
      helper: "Students without a trainer linked yet",
    },
  ];

  const actionCenterItems = useMemo(
    () => [
      {
        title: "Review pending accounts",
        description: `${overviewData.pendingApprovals} approvals are waiting for admin action.`,
        href: "/admin-dashboard/access-control",
        icon: Clock3,
        cta: "Open approvals",
        tone:
          overviewData.pendingApprovals > 0
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-red-200 bg-red-50 text-red-700",
      },
      {
        title: "Follow up on open payments",
        description: `${overviewData.pendingPayments} payment records are still pending confirmation.`,
        href: "/admin-dashboard/payment-management",
        icon: CreditCard,
        cta: "Check payments",
        tone:
          overviewData.pendingPayments > 0
            ? "border-red-200 bg-red-50 text-red-700"
            : "border-red-200 bg-red-50 text-red-700",
      },
      {
        title: "Assign new registrations",
        description: `${overviewData.weeklyEnrollments} new enrollments landed this week and may need course assignment.`,
        href: "/admin-dashboard/create-user",
        icon: UserRoundPlus,
        cta: "View new accounts",
        tone: "border-red-200 bg-red-50 text-red-700",
      },
    ],
    [
      overviewData.pendingApprovals,
      overviewData.pendingPayments,
      overviewData.weeklyEnrollments,
    ],
  );

  const dashboardCards = [
    {
      title: "Student Record",
      description: "View and manage the list of students and trainers",
      href: "/student-list",
      icon: GraduationCap,
      color: "red",
      gradient: "from-[#AB2F30] to-[#8B1A1B]",
      bgColor: "bg-red-50",
      iconBg: "bg-gradient-to-br from-red-100 to-red-200",
      textColor: "text-red-700",
      hoverColor: "group-hover:text-red-700",
      borderColor: "border-emerald-200",
      action: "Manage Students",
      delay: 0.1,
    },
    {
      title: "Access Control",
      description: "Manage user permissions and access levels",
      href: "/admin-dashboard/access-control",
      icon: Shield,
      color: "red",
      gradient: "from-[#991B1B] to-[#7F1D1D]",
      bgColor: "bg-red-50",
      iconBg: "bg-gradient-to-br from-red-100 to-red-200",
      textColor: "text-red-700",
      hoverColor: "group-hover:text-red-700",
      borderColor: "border-red-200",
      action: "Manage Access",
      delay: 0.2,
    },
    {
      title: "Create Multiple Accounts",
      description: "Create multiple user accounts without email verification",
      href: "/admin-dashboard/create-user",
      icon: UserRoundPlus,
      color: "red",
      gradient: "from-[#B91C1C] to-[#991B1B]",
      bgColor: "bg-red-50",
      iconBg: "bg-gradient-to-br from-red-100 to-red-200",
      textColor: "text-red-700",
      hoverColor: "group-hover:text-red-700",
      borderColor: "border-violet-200",
      action: "Create Accounts",
      delay: 0.3,
    },
    {
      title: "Assign Trainers",
      description: "Assign trainers to students and courses",
      href: "/admin-dashboard/assign-trainer",
      icon: UserCog,
      color: "red",
      gradient: "from-[#AB2F30] to-[#6B1516]",
      bgColor: "bg-red-50",
      iconBg: "bg-gradient-to-br from-red-100 to-red-200",
      textColor: "text-red-700",
      hoverColor: "group-hover:text-red-700",
      borderColor: "border-purple-200",
      action: "Assign Trainers",
      delay: 0.4,
    },
    {
      title: "Workshop Registration",
      description: "Review workshop leads and payment status in one place",
      href: "/admin-dashboard/workshop-registration",
      icon: BookOpen,
      color: "red",
      gradient: "from-[#AB2F30] to-[#7F1D1D]",
      bgColor: "bg-red-50",
      iconBg: "bg-gradient-to-br from-red-100 to-red-200",
      textColor: "text-red-700",
      hoverColor: "group-hover:text-red-700",
      borderColor: "border-red-200",
      action: "Open Workshop Tab",
      delay: 0.5,
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
        className={`min-h-[calc(100vh-6rem)] ${theme.background}`}
      >
        <div className="relative w-full max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                  Welcome back, {adminName}! Here's what's happening today.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hidden sm:flex"
                    >
                      <Download className="mr-2 h-4 w-4" /> Export Data
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <span>CSV Format</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <span>PDF Report</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <span>Share Link</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  size="sm"
                  onClick={async () => {
                    setIsRefreshing(true);
                    try {
                      await Promise.all([
                        fetchOverviewData(),
                        fetchRecentActivities(),
                        fetchEnrollmentTrends(),
                        fetchWeeklyActivity(),
                        fetchCourseCategories(),
                      ]);
                    } finally {
                      setIsRefreshing(false);
                    }
                  }}
                  disabled={isRefreshing}
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Profile Section */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.2 }}
              className="mt-6"
            >
              <div
                className={`inline-flex items-center gap-3 px-4 py-2 rounded-full ${theme.cardBg} backdrop-blur-sm ${theme.cardBorder} ${theme.shadow}`}
              >
                <Link href="/user-profile">
                  <div className="cursor-pointer group">
                    {profileImage ? (
                      <div className="relative w-8 h-8 rounded-full border border-white shadow-sm overflow-hidden group-hover:shadow-md transition-shadow duration-200">
                        <Image
                          src={profileImage}
                          alt="Profile"
                          fill
                          className="object-cover rounded-full"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center border border-white group-hover:shadow-md transition-shadow duration-200">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </Link>
                <span className={`text-sm font-medium ${theme.textSecondary}`}>
                  Welcome, <span className="font-bold">{adminName}</span>
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {overviewCards.map((card) => (
              <StatCard
                key={card.title}
                title={card.title}
                value={card.value}
                change={card.change}
                icon={<card.icon className={`h-4 w-4 ${card.textColor}`} />}
                trend={card.trend}
                helper={card.helper}
                emphasis={card.emphasis}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-8">
            <Card className="xl:col-span-1 border-0 bg-gradient-to-br from-[#6B1516] via-[#8B1A1B] to-[#AB2F30] text-white shadow-xl shadow-red-900/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-xl text-white">
                  <Sparkles className="h-5 w-5 " />
                  Action Center
                </CardTitle>
                <CardDescription className="text-red-100/85">
                  The highest-priority admin tasks from today&apos;s live data.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {actionCenterItems.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="block rounded-2xl border border-white/15 bg-white/10 p-4 transition hover:bg-white/15"
                  >
                    <div className="mb-3 flex items-start gap-3">
                      <div
                        className={`rounded-xl border px-2.5 py-2 ${item.tone}`}
                      >
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white">{item.title}</p>
                        <p className="mt-1 text-sm text-red-50/85">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm font-medium text-red-100">
                      <span>{item.cta}</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Main Enrollment Chart */}
            <Card className="xl:col-span-2 bg-white/50 backdrop-blur-sm shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-semibold">
                    Enrollment Overview
                  </CardTitle>
                  <CardDescription>
                    Rolling 12-month enrollment trend with live student
                    registrations
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-red-500/10 text-red-700"
                  >
                    <TrendingUp className="mr-1 h-3 w-3" /> Growth:{" "}
                    {overviewData.monthlyGrowth}%
                  </Badge>
                  <Badge variant="outline">
                    {overviewData.weeklyEnrollments} this week
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ChartContainer
                  config={chartConfig}
                  className="h-[350px] w-full"
                >
                  <AreaChart
                    data={
                      enrollmentTrends.length > 0
                        ? enrollmentTrends
                        : enrollmentData
                    }
                  >
                    <defs>
                      <linearGradient
                        id="colorEnrollments"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#AB2F30"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#AB2F30"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted/30"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      label={{
                        value: "Month",
                        position: "insideBottom",
                        offset: -5,
                      }}
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "currentColor",
                        opacity: 0.5,
                        fontSize: 12,
                      }}
                      dy={10}
                    />
                    <YAxis
                      label={{
                        value: "Enrollments",
                        angle: -90,
                        position: "insideLeft",
                      }}
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "currentColor",
                        opacity: 0.5,
                        fontSize: 12,
                      }}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    <Area
                      type="monotone"
                      dataKey="enrollments"
                      stroke="#AB2F30"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorEnrollments)"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-sm pt-4">
                <div className="flex gap-2 font-medium leading-none">
                  Trending up by {overviewData.monthlyGrowth}% this month{" "}
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                  Showing total enrollments for the last{" "}
                  {enrollmentTrends.length || 7} months
                </div>
              </CardFooter>
            </Card>

            {/* Students by Course */}
            <Card className="bg-white/50 backdrop-blur-sm shadow-lg xl:h-[780px] xl:flex xl:flex-col">
              <CardHeader>
                <CardTitle>Students by Course</CardTitle>
                <CardDescription>
                  Unique student enrollments by course are shown here
                </CardDescription>
              </CardHeader>
              <CardContent className="flex min-h-0 flex-1 flex-col items-center">
                {loadingCategories ? (
                  <div className="flex items-center justify-center h-64 w-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
                  </div>
                ) : courseCategoryData.length === 0 ? (
                  <div className="flex h-64 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white/60 px-6 text-center">
                    <p className="text-sm font-medium text-gray-900">
                      No course enrollment data yet
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Add student course records to populate this chart.
                    </p>
                  </div>
                ) : (
                  <>
                    <ChartContainer
                      config={chartConfig}
                      className="h-[250px] w-full"
                    >
                      <PieChart>
                        <Pie
                          data={courseCategoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {courseCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              hideLabel
                              formatter={(value, name, props) => {
                                const entry =
                                  courseCategoryData[props.payload?.index];
                                if (!entry) return [`${value} students`, name];
                                return [
                                  `${value} students`,
                                  entry.fullName || entry.name,
                                ];
                              }}
                            />
                          }
                        />
                      </PieChart>
                    </ChartContainer>
                    <p className="mt-4 text-xs text-gray-700">
                      Based on {overviewData.totalUsers} total students,{" "}
                      {overviewData.totalCourses} available courses, and{" "}
                      <span className="font-semibold">
                        {overviewData.unassignedTrainerStudents} unassigned
                        trainer student
                        {overviewData.unassignedTrainerStudents !== 1
                          ? "s"
                          : ""}
                        .
                      </span>
                    </p>
                    <div className="styled-scrollbar mt-6 w-full flex-1 min-h-0 space-y-3 overflow-y-auto pr-1">
                      {courseCategoryData.map((item) => (
                        <div
                          key={item.name}
                          className="rounded-xl border border-gray-200/80 bg-white/80 p-3 shadow-sm transition-all hover:border-red-200 hover:shadow-md"
                          title={item.fullName || item.name}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="mt-1 h-3 w-3 flex-shrink-0 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-4">
                                <span
                                  className="text-sm font-semibold leading-snug text-gray-900 break-words"
                                  title={item.fullName || item.name}
                                >
                                  {item.fullName || item.name}
                                </span>
                                <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                                  {courseCategoryData.length > 0
                                    ? Math.round(
                                        (item.value /
                                          courseCategoryData.reduce(
                                            (sum, cat) => sum + cat.value,
                                            0,
                                          )) *
                                          100,
                                      )
                                    : 0}
                                  %
                                </span>
                              </div>
                              <div className="mt-1 flex items-end justify-between gap-3">
                                <span className="text-base font-bold text-gray-900">
                                  {item.value}
                                </span>
                                <span className="text-xs text-gray-500">
                                  student{item.value !== 1 ? "s" : ""}
                                </span>
                              </div>
                              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${
                                      courseCategoryData.length > 0
                                        ? Math.round(
                                            (item.value /
                                              courseCategoryData.reduce(
                                                (sum, cat) => sum + cat.value,
                                                0,
                                              )) *
                                              100,
                                          )
                                        : 0
                                    }%`,
                                    backgroundColor: item.color,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Activity */}
            <Card className="bg-white/50 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>
                  Daily student registrations across the last 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={chartConfig}
                  className="h-[300px] w-full"
                >
                  <BarChart
                    data={
                      weeklyActivity.length > 0 ? weeklyActivity : visitData
                    }
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted/30"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "currentColor",
                        opacity: 0.5,
                        fontSize: 12,
                      }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "currentColor",
                        opacity: 0.5,
                        fontSize: 12,
                      }}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => [
                            `${value} registrations`,
                            "Registrations",
                          ]}
                        />
                      }
                    />
                    <Bar
                      dataKey="visits"
                      fill="#AB2F30"
                      radius={[4, 4, 0, 0]}
                      barSize={30}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Recent Actions */}
            <Card className="bg-white/50 backdrop-blur-sm shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>Activity Feed</CardTitle>
                  <CardDescription>
                    Live registration and team updates from the last 7 days
                  </CardDescription>
                </div>
                <Link href="/admin-dashboard/new-accounts">
                  <Button variant="ghost" size="sm">
                    Review queue
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {loadingActivities ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700"></div>
                  </div>
                ) : recentActivities.length > 0 ? (
                  <div className="space-y-6">
                    {recentActivities.map((activity) => (
                      <ActionItem
                        key={activity.id}
                        name={activity.name}
                        description={activity.description}
                        time={getRelativeTime(activity.time)}
                        icon={
                          <activity.icon
                            className={`h-4 w-4 ${activity.iconColor}`}
                          />
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No recent activity</p>
                    <p className="text-sm">Check back later for updates</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Dashboard Cards Grid */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Quick Access
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      className={`relative ${theme.cardBg} backdrop-blur-sm rounded-3xl ${theme.shadow} ${theme.hoverShadow} transition-all duration-200 h-full overflow-hidden group`}
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
                            <card.icon
                              className={`h-7 w-7 ${card.textColor}`}
                            />
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

                        {/* Hover Effect Shadow */}
                        <div
                          className={`absolute inset-0 rounded-3xl shadow-inner opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                        />
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </AnimatePresence>
            </div>
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

const StatCard = ({
  title,
  value,
  change,
  icon,
  trend,
  helper,
  emphasis,
}: any) => {
  const isBrandPrimary =
    emphasis === "primary" &&
    (title === "Active Students" || title === "Monthly Revenue");

  return (
    <Card
      className={`overflow-hidden relative group shadow-lg transition-all hover:shadow-xl ${
        isBrandPrimary
          ? "border-0 bg-gradient-to-br from-[#6B1516] via-[#8B1A1B] to-[#AB2F30] text-white shadow-red-900/20"
          : emphasis === "primary"
            ? "border-0 bg-slate-950 text-white"
          : "bg-white/50 backdrop-blur-sm"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle
          className={`text-sm font-medium ${
            isBrandPrimary
              ? "text-red-100/85"
              : emphasis === "primary"
                ? "text-slate-300"
                : "text-gray-600"
          }`}
        >
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div
          className={`text-2xl font-bold ${
            emphasis === "primary" ? "text-white" : "text-gray-900"
          }`}
        >
          {value}
        </div>
        {helper ? (
          <p
            className={`mt-1 text-xs ${
              isBrandPrimary
                ? "text-red-50/85"
                : emphasis === "primary"
                  ? "text-slate-300"
                  : "text-muted-foreground"
            }`}
          >
            {helper}
          </p>
        ) : null}
        <p
          className={`mt-2 flex items-center gap-1 text-xs ${
            isBrandPrimary
              ? "text-red-50"
              : emphasis === "primary"
                ? "text-slate-200"
                : "text-muted-foreground"
          }`}
        >
          {trend === "up" ? (
            <ArrowUpRight className="h-3 w-3 text-green-600" />
          ) : trend === "down" ? (
            <ArrowDownRight className="h-3 w-3 text-red-600" />
          ) : (
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
          )}
          <span
            className={
              trend === "up"
                ? "text-green-600 font-medium"
                : trend === "down"
                  ? "text-red-600 font-medium"
                  : "text-emerald-600 font-medium"
            }
          >
            {change.split(" ")[0]}
          </span>
          {change.split(" ").slice(1).join(" ")}
        </p>
      </CardContent>
    </Card>
  );
};

const ActionItem = ({ name, description, time, icon }: any) => {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1">{icon}</div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none text-gray-900">{name}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground mt-1">{time}</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
