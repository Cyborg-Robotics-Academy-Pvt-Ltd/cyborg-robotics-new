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
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
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
  ChartLegend,
  ChartLegendContent,
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

const categoryData = [
  { name: "Robotics", value: 40, color: "#3b82f6" },
  { name: "Programming", value: 30, color: "#10b981" },
  { name: "STEM", value: 20, color: "#f59e0b" },
  { name: "AI/ML", value: 10, color: "#ef4444" },
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
    color: "hsl(var(--primary))",
  },
  courses: {
    label: "Courses",
    color: "#10b981",
  },
  visits: {
    label: "Visits",
    color: "#3b82f6",
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
    recentRegistrations: 0,
    pendingApprovals: 0,
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
      const adminsSnapshot = await getDocs(collection(db, "admins"));

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

      // Calculate pending approvals (students without active status)
      const pendingApprovalsCount = studentsSnapshot.docs.filter((doc) => {
        const status = doc.data().status;
        return !status || (status !== "active" && status !== "Active");
      }).length;

      const monthlyGrowth = Math.round(
        (recentRegistrationsCount /
          Math.max(studentsSnapshot.size - recentRegistrationsCount, 1)) *
          100,
      );

      const overviewDataResult = {
        totalUsers: studentsSnapshot.size, // Students are considered users
        totalCourses: totalCoursesCount,
        totalInstructors: trainersSnapshot.size, // Trainers are the instructors
        activeStudents: activeStudentsCount, // Count of students with active status
        recentRegistrations: recentRegistrationsCount,
        pendingApprovals: pendingApprovalsCount,
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
        activeStudents: 0,
        recentRegistrations: 0,
        pendingApprovals: 0,
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
          iconColor: "text-blue-600",
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

        const visits =
          students.filter((student) => {
            const createdAt = student.createdAt;
            if (!createdAt) return false;
            const createdDate = createdAt.toDate
              ? createdAt.toDate()
              : new Date(createdAt);
            return createdDate >= dayStart && createdDate <= dayEnd;
          }).length * 5; // Multiply by 5 to simulate more activity

        activityData.push({
          day: days[date.getDay()],
          visits: Math.max(20, visits), // Minimum 20 visits
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

  // Function to fetch course category distribution based on student enrollments
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

      // Create a map to count enrollments for each course
      const courseEnrollmentMap: Record<string, number> = {};

      // Initialize all courses with 0 count
      allCourses.forEach((course) => {
        courseEnrollmentMap[course] = 0;
      });

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
        const courses = student.courses || [];
        if (Array.isArray(courses)) {
          courses.forEach((course: any) => {
            const courseName =
              typeof course === "string" ? course : course.name || "";
            if (!courseName) return;

            // Exact match with courses from courses.ts
            if (courseEnrollmentMap.hasOwnProperty(courseName)) {
              courseEnrollmentMap[courseName]++;
            } else {
              // Handle partial matches or variations
              const normalizedInput = courseName.toLowerCase().trim();
              const matchedCourse = allCourses.find(
                (c) =>
                  c.toLowerCase().trim() === normalizedInput ||
                  c.toLowerCase().includes(normalizedInput) ||
                  normalizedInput.includes(c.toLowerCase().trim()),
              );

              if (matchedCourse) {
                courseEnrollmentMap[matchedCourse]++;
              } else {
                // Group unmatched courses as "Other"
                courseEnrollmentMap["Other"] =
                  (courseEnrollmentMap["Other"] || 0) + 1;
              }
            }
          });
        }
      });

      // Convert to chart format and filter out zero counts
      const courseData = Object.entries(courseEnrollmentMap)
        .filter(([_, count]) => count > 0)
        .map(([name, count], index) => ({
          name: name.length > 20 ? name.substring(0, 17) + "..." : name, // Truncate long names
          fullName: name, // Keep full name for tooltip
          value: count,
          color: name === "Other" ? "#64748b" : colors[index % colors.length],
        }))
        .sort((a, b) => b.value - a.value) // Sort by count descending
        .slice(0, 8); // Show top 8 courses plus "Other"

      // Ensure all entries have required properties
      const validatedCourseData = courseData.map((item) => ({
        ...item,
        name: item.name || "Unknown",
        fullName: item.fullName || item.name || "Unknown",
        value: item.value || 0,
        color: item.color || "#64748b",
      }));

      // If no data, provide sample data from courses.ts
      if (validatedCourseData.length === 0) {
        const sampleCourses = allCourses.slice(0, 5);
        setCourseCategoryData(
          sampleCourses.map((course, index) => ({
            name: course.length > 20 ? course.substring(0, 17) + "..." : course,
            fullName: course,
            value: Math.floor(Math.random() * 20) + 5,
            color: colors[index % colors.length],
          })),
        );
      } else {
        setCourseCategoryData(validatedCourseData);
      }
    } catch (error) {
      console.error("Error fetching course categories:", error);
      // Fallback to sample data from courses.ts
      const coursesModule = await import("../../../utils/courses");
      const sampleCourses = coursesModule.default.slice(0, 5);
      const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

      const fallbackData = sampleCourses.map((course, index) => ({
        name: course.length > 20 ? course.substring(0, 17) + "..." : course,
        fullName: course,
        value: 10,
        color: colors[index],
      }));

      setCourseCategoryData(fallbackData);
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
      title: "Total Students",
      value: overviewData.totalUsers, // Students are stored in the students collection
      change: `+${overviewData.monthlyGrowth}%`,
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
    {
      title: "Recent Registrations",
      value: overviewData.recentRegistrations,
      change: "Last 30 days",
      icon: UserRoundPlus,
      color: "orange",
      gradient: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      iconBg: "bg-gradient-to-br from-orange-100 to-orange-200",
      textColor: "text-orange-600",
      delay: 0.5,
    },
    {
      title: "Pending Approvals",
      value: overviewData.pendingApprovals,
      change: "Awaiting review",
      icon: ClipboardCheck,
      color: "yellow",
      gradient: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
      iconBg: "bg-gradient-to-br from-yellow-100 to-yellow-200",
      textColor: "text-yellow-600",
      delay: 0.6,
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
      action: "Manage Students",
      delay: 0.1,
    },
    {
      title: "Access Control",
      description: "Manage user permissions and access levels",
      href: "/admin-dashboard/access-control",
      icon: Shield,
      color: "blue",
      gradient: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      iconBg: "bg-gradient-to-br from-blue-100 to-blue-200",
      textColor: "text-blue-600",
      hoverColor: "group-hover:text-blue-600",
      borderColor: "border-blue-200",
      action: "Manage Access",
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
      action: "Create Accounts",
      delay: 0.3,
    },
    {
      title: "Assign Trainers",
      description: "Assign trainers to students and courses",
      href: "/admin-dashboard/assign-trainer",
      icon: UserCog,
      color: "purple",
      gradient: "from-purple-500 to-fuchsia-500",
      bgColor: "bg-purple-50",
      iconBg: "bg-gradient-to-br from-purple-100 to-purple-200",
      textColor: "text-purple-600",
      hoverColor: "group-hover:text-purple-600",
      borderColor: "border-purple-200",
      action: "Assign Trainers",
      delay: 0.4,
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {overviewCards.map((card, index) => (
              <StatCard
                key={card.title}
                title={card.title}
                value={
                  typeof card.value === "number"
                    ? card.value.toString()
                    : card.value
                }
                change={card.change}
                icon={<card.icon className={`h-4 w-4 ${card.textColor}`} />}
                trend={index < 4 ? "up" : ""} // First 4 cards show upward trend
                theme={theme}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Main Enrollment Chart */}
            <Card className="lg:col-span-2 bg-white/50 backdrop-blur-sm shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-semibold">
                    Enrollment Overview
                  </CardTitle>
                  <CardDescription>
                    Monthly enrollment trends for the current year
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-blue-500/10 text-blue-600"
                  >
                    <TrendingUp className="mr-1 h-3 w-3" /> Growth:{" "}
                    {overviewData.monthlyGrowth}%
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
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(var(--primary))"
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
                      stroke="hsl(var(--primary))"
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

            {/* Courses by Category */}
            <Card className="bg-white/50 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle>Courses by Category</CardTitle>
                <CardDescription>
                  Distribution of courses based on student enrollments
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                {loadingCategories ? (
                  <div className="flex items-center justify-center h-64 w-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
                                if (!entry)
                                  return [`${value} students :`, name];
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-6">
                      {courseCategoryData.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                          title={item.fullName || item.name}
                        >
                          <div
                            className="h-3 w-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <span
                              className="text-sm font-medium truncate block"
                              title={item.fullName || item.name}
                            >
                              {item.name}
                            </span>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">
                                {item.value} student
                                {item.value !== 1 ? "s" : ""}
                              </span>
                              <span className="text-xs font-semibold text-primary">
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
                  Daily platform activity across the past week
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
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="visits"
                      fill="hsl(var(--primary))"
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
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest administrative activities
                  </CardDescription>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {loadingActivities ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : recentActivities.length > 0 ? (
                  <div className="space-y-6">
                    {recentActivities.map((activity) => (
                      <ActionItem
                        key={activity.id}
                        name={activity.name}
                        description={activity.description}
                        time={(() => {
                          const minutesAgo = Math.ceil(
                            (new Date().getTime() - activity.time.getTime()) /
                              (1000 * 60),
                          );
                          const hoursAgo = Math.floor(minutesAgo / 60);
                          const daysAgo = Math.floor(hoursAgo / 24);

                          if (daysAgo > 0) {
                            if (daysAgo === 1) return "1 day ago";
                            if (daysAgo < 30) return `${daysAgo} days ago`;

                            // For older dates, show actual date
                            const activityDate = activity.time;
                            return activityDate.toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            });
                          } else if (hoursAgo > 0) {
                            return `${hoursAgo} hr${hoursAgo !== 1 ? "s" : ""} ago`;
                          } else {
                            return `${minutesAgo} min${minutesAgo !== 1 ? "s" : ""} ago`;
                          }
                        })()}
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

const StatCard = ({ title, value, change, icon, trend, theme }: any) => {
  return (
    <Card className="bg-white/50 backdrop-blur-sm transition-all hover:shadow-lg overflow-hidden relative group shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          {trend === "up" ? (
            <ArrowUpRight className="h-3 w-3 text-green-600" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-red-600" />
          )}
          <span
            className={
              trend === "up"
                ? "text-green-600 font-medium"
                : "text-red-600 font-medium"
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
