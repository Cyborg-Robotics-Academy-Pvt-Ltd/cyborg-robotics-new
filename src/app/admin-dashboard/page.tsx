"use client";
import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useDeferredValue,
  useRef,
} from "react";
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
  ArrowRight,
  Sparkles,
  RefreshCw,
  User,
  Shield,
  Search,
  BookOpen,
  TrendingUp,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  CreditCard,
  Download,
  Clock3,
  CheckCircle2,
  CalendarRange,
  Filter as FilterIcon,
  ChevronDown,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import AuthLoadingSpinner from "@/components/AuthLoadingSpinner";
import {
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

const chartConfig = {
  enrollments: {
    label: "Enrollments",
    color: "#AB2F30",
  },
  courses: {
    label: "Courses",
    color: "#8B1A1B",
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

const getStudentCreatedDate = (student: Record<string, any>) => {
  const createdAt = student.createdAt;
  if (!createdAt) return null;

  const createdDate = createdAt.toDate
    ? createdAt.toDate()
    : new Date(createdAt);
  return Number.isNaN(createdDate.getTime()) ? null : createdDate;
};

const getStudentCenter = (student: Record<string, any>) =>
  String(student.center || student.location || "").trim();

const getStudentCourses = (student: Record<string, any>) => {
  const courses = Array.isArray(student.courses) ? student.courses : [];
  return courses
    .map((course: any) =>
      typeof course === "string"
        ? course.trim()
        : String(course?.name || "").trim(),
    )
    .filter(Boolean);
};

const getStudentTrainer = (student: Record<string, any>) => {
  const directTrainer = String(student.trainerName || "").trim();
  if (directTrainer) return directTrainer;

  const courses = Array.isArray(student.courses) ? student.courses : [];
  const courseTrainer = courses.find((course: Record<string, any>) =>
    Boolean(String(course?.trainerName || "").trim()),
  );

  return String(courseTrainer?.trainerName || "").trim();
};

const toCourseSlug = (courseName?: string, level?: string) => {
  if (typeof courseName !== "string" || !courseName) return "";

  let slug = courseName
    .toLowerCase()
    .replace(/ & /g, "-and-")
    .replace(/ \+ /g, "-plus-")
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");

  if (level) {
    let levelText = level;
    if (level === "1") levelText = "beginner";
    else if (level === "2") levelText = "intermediate";
    else if (level === "3") levelText = "advanced";
    else if (level === "4") levelText = "expert";

    slug += `-level-${levelText}`;
  }

  return slug;
};

const getStudentCourseDetailUrl = (student: Record<string, any>) => {
  const prnNumber = String(student.PrnNumber || student.prnNumber || "").trim();
  if (!prnNumber) return null;

  const courses = Array.isArray(student.courses) ? student.courses : [];
  const primaryCourse =
    courses.find(
      (course: Record<string, any>) =>
        course?.completed !== true &&
        (!course?.status || String(course.status).toLowerCase() !== "complete"),
    ) || courses[0];

  const courseName = String(
    primaryCourse?.name || primaryCourse?.courseName || "",
  ).trim();

  if (!courseName) return `/${prnNumber}`;

  const courseSlug = toCourseSlug(
    courseName,
    String(primaryCourse?.level || "").trim() || undefined,
  );

  return courseSlug ? `/${prnNumber}/${courseSlug}` : `/${prnNumber}`;
};

const getRangeMonths = (range: string) =>
  range === "3_months" ? 3 : range === "6_months" ? 6 : 12;

const getQuarterStart = (date: Date) =>
  new Date(date.getFullYear(), Math.floor(date.getMonth() / 3) * 3, 1);

const getTimestampDate = (value: unknown) => {
  if (!value) return null;

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    const date = (value as { toDate: () => Date }).toDate();
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === "string" || value instanceof Date) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
};

const getRegistrationCreatedDate = (registration: Record<string, any>) =>
  getTimestampDate(
    registration.createdAt ||
      registration.dateOfRegistration ||
      registration.registrationDate ||
      registration.dateOfJoining,
  );

const getPaymentCreatedDate = (payment: Record<string, any>) =>
  getTimestampDate(payment.registrationCreatedAt || payment.createdAt);

const formatDateLabel = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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
  const [registrationRecords, setRegistrationRecords] = useState<any[]>([]);
  const [paymentRecords, setPaymentRecords] = useState<any[]>([]);

  // State for recent activity data
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  // State for enrollment trends
  const [enrollmentTrendStudents, setEnrollmentTrendStudents] = useState<any[]>(
    [],
  );
  const [enrollmentTrends, setEnrollmentTrends] = useState<any[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(true);
  const [enrollmentRangeFilter, setEnrollmentRangeFilter] =
    useState("12_months");
  const [enrollmentGranularityFilter, setEnrollmentGranularityFilter] =
    useState("monthly");
  const [enrollmentCenterFilter, setEnrollmentCenterFilter] = useState("");
  const [enrollmentCourseFilter, setEnrollmentCourseFilter] = useState("");
  const [enrollmentTrainerFilter, setEnrollmentTrainerFilter] = useState("");

  // State for course category data
  const [courseCategoryData, setCourseCategoryData] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [isGlobalSearchFocused, setIsGlobalSearchFocused] = useState(false);
  const deferredGlobalSearchQuery = useDeferredValue(globalSearchQuery);
  const globalSearchInputRef = useRef<HTMLInputElement | null>(null);

  const [drilldownOpen, setDrilldownOpen] = useState(false);
  const [selectedDrilldownPoint, setSelectedDrilldownPoint] = useState<{
    label: string;
    periodStart: string;
    periodEnd: string;
  } | null>(null);

  const openEnrollmentDrilldown = useCallback(
    (payload?: Record<string, any>) => {
      if (!payload?.periodStart || !payload?.periodEnd) return;

      setSelectedDrilldownPoint({
        label: String(payload.month || "Selected period"),
        periodStart: String(payload.periodStart),
        periodEnd: String(payload.periodEnd),
      });
      setDrilldownOpen(true);
    },
    [],
  );

  const enrollmentCenterOptions = useMemo(() => {
    return Array.from(
      new Set(
        enrollmentTrendStudents
          .map((student) => getStudentCenter(student))
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [enrollmentTrendStudents]);

  const enrollmentCourseOptions = useMemo(() => {
    return Array.from(
      new Set(
        enrollmentTrendStudents.flatMap((student) =>
          getStudentCourses(student),
        ),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [enrollmentTrendStudents]);

  const enrollmentTrainerOptions = useMemo(() => {
    return Array.from(
      new Set(
        enrollmentTrendStudents
          .map((student) => getStudentTrainer(student))
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [enrollmentTrendStudents]);

  const globalSearchResults = useMemo(() => {
    const query = deferredGlobalSearchQuery.trim().toLowerCase();
    if (!query) {
      return { students: [], courses: [] };
    }

    const students = enrollmentTrendStudents
      .filter((student) => {
        const searchableText = [
          student.fullName,
          student.username,
          student.studentName,
          student.PrnNumber,
          getStudentCenter(student),
          getStudentTrainer(student),
          ...getStudentCourses(student),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(query);
      })
      .slice(0, 5)
      .map((student) => ({
        id:
          student.id ||
          student.PrnNumber ||
          student.username ||
          student.fullName,
        href: getStudentCourseDetailUrl(student),
        label:
          student.fullName ||
          student.username ||
          student.studentName ||
          "Unnamed student",
        meta: [
          student.PrnNumber ? `PRN ${student.PrnNumber}` : null,
          getStudentCourses(student)[0] || null,
          getStudentCenter(student) || null,
        ]
          .filter(Boolean)
          .join(" • "),
      }));

    const courses = enrollmentCourseOptions
      .filter((course) => course.toLowerCase().includes(query))
      .slice(0, 5)
      .map((course) => ({
        id: course,
        label: course,
        meta: "Filter enrollment overview by this course",
      }));

    return { students, courses };
  }, [
    deferredGlobalSearchQuery,
    enrollmentCourseOptions,
    enrollmentTrendStudents,
  ]);

  const hasGlobalSearchResults =
    globalSearchResults.students.length > 0 ||
    globalSearchResults.courses.length > 0;

  const handleStudentSearchSelect = useCallback(
    (href?: string | null) => {
      setIsGlobalSearchFocused(false);
      if (!href) {
        router.push("/student-list");
        return;
      }
      router.push(href);
    },
    [router],
  );

  const handleCourseSearchSelect = useCallback((course: string) => {
    setGlobalSearchQuery(course);
    setEnrollmentCourseFilter(course);
    setIsGlobalSearchFocused(false);
    document.getElementById("enrollment-overview")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  useEffect(() => {
    if (!drilldownOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [drilldownOpen]);

  useEffect(() => {
    const handleSearchShortcut = (event: KeyboardEvent) => {
      if (
        !(event.ctrlKey || event.metaKey) ||
        event.key.toLowerCase() !== "k"
      ) {
        return;
      }

      event.preventDefault();
      globalSearchInputRef.current?.focus();
      setIsGlobalSearchFocused(true);
    };

    window.addEventListener("keydown", handleSearchShortcut);
    return () => window.removeEventListener("keydown", handleSearchShortcut);
  }, []);

  const filteredEnrollmentTrends = useMemo(() => {
    if (enrollmentTrendStudents.length === 0) {
      return enrollmentTrends;
    }

    const now = new Date();
    const rangeMonths = getRangeMonths(enrollmentRangeFilter);
    const eligibleStudents = enrollmentTrendStudents.filter((student) => {
      const createdDate = getStudentCreatedDate(student);
      if (!createdDate) return false;

      if (
        enrollmentCenterFilter &&
        getStudentCenter(student) !== enrollmentCenterFilter
      ) {
        return false;
      }

      if (
        enrollmentCourseFilter &&
        !getStudentCourses(student).includes(enrollmentCourseFilter)
      ) {
        return false;
      }

      if (
        enrollmentTrainerFilter &&
        getStudentTrainer(student) !== enrollmentTrainerFilter
      ) {
        return false;
      }

      return true;
    });

    const trends: any[] = [];

    if (enrollmentGranularityFilter === "daily") {
      const totalDays = rangeMonths * 30;

      for (let i = totalDays - 1; i >= 0; i--) {
        const dayStart = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - i,
        );
        dayStart.setHours(0, 0, 0, 0);

        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);

        const enrollments = eligibleStudents.filter((student) => {
          const createdDate = getStudentCreatedDate(student);
          return (
            createdDate && createdDate >= dayStart && createdDate <= dayEnd
          );
        }).length;

        trends.push({
          month: dayStart.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          enrollments,
          courses: Math.max(10, Math.floor(enrollments * 0.3)),
          periodStart: dayStart.toISOString(),
          periodEnd: dayEnd.toISOString(),
        });
      }

      return trends;
    }

    if (enrollmentGranularityFilter === "weekly") {
      const totalWeeks = Math.ceil((rangeMonths * 30) / 7);
      const currentWeekStart = new Date(now);
      currentWeekStart.setHours(0, 0, 0, 0);
      currentWeekStart.setDate(
        currentWeekStart.getDate() - currentWeekStart.getDay(),
      );

      for (let i = totalWeeks - 1; i >= 0; i--) {
        const weekStart = new Date(currentWeekStart);
        weekStart.setDate(currentWeekStart.getDate() - i * 7);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const enrollments = eligibleStudents.filter((student) => {
          const createdDate = getStudentCreatedDate(student);
          return (
            createdDate && createdDate >= weekStart && createdDate <= weekEnd
          );
        }).length;

        trends.push({
          month: `Wk ${weekStart.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}`,
          enrollments,
          courses: Math.max(10, Math.floor(enrollments * 0.3)),
          periodStart: weekStart.toISOString(),
          periodEnd: weekEnd.toISOString(),
        });
      }

      return trends;
    }

    if (enrollmentGranularityFilter === "quarterly") {
      const totalQuarters = Math.ceil(rangeMonths / 3);
      const currentQuarterStart = getQuarterStart(now);

      for (let i = totalQuarters - 1; i >= 0; i--) {
        const quarterStart = new Date(
          currentQuarterStart.getFullYear(),
          currentQuarterStart.getMonth() - i * 3,
          1,
        );
        const quarterEnd = new Date(
          quarterStart.getFullYear(),
          quarterStart.getMonth() + 3,
          0,
          23,
          59,
          59,
          999,
        );

        const enrollments = eligibleStudents.filter((student) => {
          const createdDate = getStudentCreatedDate(student);
          return (
            createdDate &&
            createdDate >= quarterStart &&
            createdDate <= quarterEnd
          );
        }).length;

        trends.push({
          month: `Q${Math.floor(quarterStart.getMonth() / 3) + 1} ${quarterStart.getFullYear()}`,
          enrollments,
          courses: Math.max(10, Math.floor(enrollments * 0.3)),
          periodStart: quarterStart.toISOString(),
          periodEnd: quarterEnd.toISOString(),
        });
      }

      return trends;
    }

    for (let i = rangeMonths - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );

      const enrollments = eligibleStudents.filter((student) => {
        const createdDate = getStudentCreatedDate(student);
        return (
          createdDate && createdDate >= monthStart && createdDate <= monthEnd
        );
      }).length;

      trends.push({
        month: date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        }),
        enrollments,
        courses: Math.max(10, Math.floor(enrollments * 0.3)),
        periodStart: monthStart.toISOString(),
        periodEnd: monthEnd.toISOString(),
      });
    }

    return trends;
  }, [
    enrollmentCenterFilter,
    enrollmentCourseFilter,
    enrollmentGranularityFilter,
    enrollmentRangeFilter,
    enrollmentTrainerFilter,
    enrollmentTrendStudents,
    enrollmentTrends,
  ]);

  const drilldownDetails = useMemo(() => {
    if (!selectedDrilldownPoint) {
      return {
        students: [],
        registrations: [],
        pendingPayments: [],
        unassignedStudents: [],
      };
    }

    const periodStart = new Date(selectedDrilldownPoint.periodStart);
    const periodEnd = new Date(selectedDrilldownPoint.periodEnd);

    const matchesEnrollmentFilters = (student: Record<string, any>) => {
      if (
        enrollmentCenterFilter &&
        getStudentCenter(student) !== enrollmentCenterFilter
      ) {
        return false;
      }

      if (
        enrollmentCourseFilter &&
        !getStudentCourses(student).includes(enrollmentCourseFilter)
      ) {
        return false;
      }

      if (
        enrollmentTrainerFilter &&
        getStudentTrainer(student) !== enrollmentTrainerFilter
      ) {
        return false;
      }

      return true;
    };

    const students = enrollmentTrendStudents.filter((student) => {
      const createdDate = getStudentCreatedDate(student);
      return (
        createdDate &&
        createdDate >= periodStart &&
        createdDate <= periodEnd &&
        matchesEnrollmentFilters(student)
      );
    });

    const registrations = registrationRecords.filter((registration) => {
      const createdDate = getRegistrationCreatedDate(registration);
      if (
        !createdDate ||
        createdDate < periodStart ||
        createdDate > periodEnd
      ) {
        return false;
      }

      if (!enrollmentCourseFilter) return true;

      const courseName = String(
        registration.selectedCourseName ||
          registration.courseName ||
          registration.course ||
          "",
      ).trim();

      return courseName === enrollmentCourseFilter;
    });

    const pendingPayments = paymentRecords.filter((payment) => {
      const createdDate = getPaymentCreatedDate(payment);
      if (
        !createdDate ||
        createdDate < periodStart ||
        createdDate > periodEnd
      ) {
        return false;
      }

      if (
        !PENDING_PAYMENT_STATUSES.has(
          String(payment.status || "").toUpperCase(),
        )
      ) {
        return false;
      }

      if (!enrollmentCourseFilter) return true;

      const courseName = String(
        payment.courseName || payment.course?.name || "",
      ).trim();

      return courseName === enrollmentCourseFilter;
    });

    const unassignedStudents = students.filter(
      (student) => !hasTrainerAssignment(student),
    );

    return {
      students,
      registrations,
      pendingPayments,
      unassignedStudents,
    };
  }, [
    enrollmentCenterFilter,
    enrollmentCourseFilter,
    enrollmentTrainerFilter,
    enrollmentTrendStudents,
    paymentRecords,
    registrationRecords,
    selectedDrilldownPoint,
  ]);

  const drilldownContext = useMemo(() => {
    if (!selectedDrilldownPoint) return null;

    const activeFilters = [
      enrollmentCenterFilter
        ? `Center: ${enrollmentCenterFilter}`
        : "Center: All",
      enrollmentCourseFilter
        ? `Course: ${enrollmentCourseFilter}`
        : "Course: All",
      enrollmentTrainerFilter
        ? `Trainer: ${enrollmentTrainerFilter}`
        : "Trainer: All",
      `Range: ${enrollmentRangeFilter.replaceAll("_", " ")}`,
      `Granularity: ${enrollmentGranularityFilter}`,
    ];

    return {
      title: selectedDrilldownPoint.label,
      period:
        `${formatDateLabel(selectedDrilldownPoint.periodStart)} to ${formatDateLabel(selectedDrilldownPoint.periodEnd)}`.trim(),
      activeFilters,
    };
  }, [
    enrollmentCenterFilter,
    enrollmentCourseFilter,
    enrollmentGranularityFilter,
    enrollmentRangeFilter,
    enrollmentTrainerFilter,
    selectedDrilldownPoint,
  ]);

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
      const registrationsSnapshot = await getDocs(
        collection(db, "registrations"),
      );

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

      setPaymentRecords(
        paymentsSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })),
      );
      setRegistrationRecords(
        registrationsSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })),
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
      setPaymentRecords([]);
      setRegistrationRecords([]);
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
      setEnrollmentTrendStudents(students);

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
      fetchCourseCategories();
    }
  }, [
    authLoading,
    isLoading,
    fetchOverviewData,
    fetchRecentActivities,
    fetchEnrollmentTrends,
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

  const quickLinks = [
    {
      title: "Student Record",
      href: "/student-list",
    },
    {
      title: "Access Control",
      href: "/admin-dashboard/access-control",
    },
    {
      title: "Create Multiple Accounts",
      href: "/admin-dashboard/create-user",
    },
    {
      title: "Assign Trainers",
      href: "/admin-dashboard/assign-trainer",
    },
    {
      title: "Workshop Registration",
      href: "/admin-dashboard/workshop-registration",
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
              <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
                <div className="relative w-full md:w-[320px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    ref={globalSearchInputRef}
                    value={globalSearchQuery}
                    onChange={(e) => setGlobalSearchQuery(e.target.value)}
                    onFocus={() => setIsGlobalSearchFocused(true)}
                    onBlur={() => {
                      window.setTimeout(
                        () => setIsGlobalSearchFocused(false),
                        120,
                      );
                    }}
                    placeholder="Search students, courses, trainers..."
                    className="h-10 rounded-full border-red-100 bg-white/85 pl-10 pr-28 shadow-sm placeholder:text-gray-400 focus-visible:ring-red-100"
                    aria-label="Global search"
                  />
                  <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5 text-gray-400">
                    <div className="hidden items-center gap-1 rounded-full border border-red-100 bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500 shadow-sm sm:flex">
                      <span>Ctrl + K</span>
                    </div>
                  </div>
                  {globalSearchQuery ? (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setGlobalSearchQuery("");
                        setIsGlobalSearchFocused(false);
                      }}
                      className="absolute right-24 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600 sm:right-[7.5rem]"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : null}

                  {isGlobalSearchFocused && deferredGlobalSearchQuery.trim() ? (
                    <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-3xl border border-red-100 bg-white/95 shadow-xl backdrop-blur-sm">
                      {hasGlobalSearchResults ? (
                        <div className="p-2">
                          {globalSearchResults.students.length > 0 ? (
                            <div className="mb-2">
                              <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                                Students
                              </p>
                              {globalSearchResults.students.map((student) => (
                                <button
                                  key={student.id}
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() =>
                                    handleStudentSearchSelect(student.href)
                                  }
                                  className="flex w-full items-start justify-between rounded-2xl px-3 py-2 text-left transition hover:bg-red-50"
                                >
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {student.label}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                      {student.meta || "Open course details"}
                                    </p>
                                  </div>
                                  <span className="text-xs font-medium text-red-700">
                                    Open
                                  </span>
                                </button>
                              ))}
                            </div>
                          ) : null}

                          {globalSearchResults.courses.length > 0 ? (
                            <div>
                              <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                                Courses
                              </p>
                              {globalSearchResults.courses.map((course) => (
                                <button
                                  key={course.id}
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() =>
                                    handleCourseSearchSelect(course.label)
                                  }
                                  className="flex w-full items-start justify-between rounded-2xl px-3 py-2 text-left transition hover:bg-red-50"
                                >
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      {course.label}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                      {course.meta}
                                    </p>
                                  </div>
                                  <span className="text-xs font-medium text-red-700">
                                    Filter
                                  </span>
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <div className="px-4 py-4 text-sm text-gray-500">
                          No matching students or courses found.
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" className="hidden sm:flex">
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
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                <span className="rounded-full border border-red-100 bg-white/80 px-3 py-1.5 shadow-sm">
                  {currentDateTime.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="rounded-full border border-red-100 bg-white/80 px-3 py-1.5 shadow-sm">
                  {currentDateTime.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </motion.div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                Quick Links
              </span>
              {quickLinks.map((link) => (
                <Link
                  key={link.title}
                  href={link.href}
                  className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-white/80 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  <span>{link.title}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>
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
            <Card
              id="enrollment-overview"
              className="xl:col-span-2 bg-white/50 backdrop-blur-sm shadow-lg"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-semibold">
                    Enrollment Overview
                  </CardTitle>
                  <CardDescription>
                    Live student registrations with flexible time filters and
                    drill-down insights
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">
                    Growth: {overviewData.monthlyGrowth}% and{" "}
                    {overviewData.weeklyEnrollments} this week
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50/80 to-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-100 text-red-700">
                        <CalendarRange className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Time Controls
                        </p>
                        <p className="text-xs text-gray-500">
                          Adjust the time window and aggregation view
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="flex flex-col gap-1.5 text-sm">
                        <span className="font-medium text-gray-600">Range</span>
                        <div className="relative">
                          <select
                            value={enrollmentRangeFilter}
                            onChange={(e) =>
                              setEnrollmentRangeFilter(e.target.value)
                            }
                            className="h-8 w-full appearance-none rounded-md border border-red-200 bg-white px-2 pr-7 text-[11px] font-medium text-gray-800 shadow-sm outline-none transition hover:border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                            aria-label="Filter enrollment chart by time range"
                            title="Time range"
                          >
                            <option value="3_months">Last 3 months</option>
                            <option value="6_months">Last 6 months</option>
                            <option value="12_months">Last 12 months</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
                        </div>
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm">
                        <span className="font-medium text-gray-600">
                          Granularity
                        </span>
                        <div className="relative">
                          <select
                            value={enrollmentGranularityFilter}
                            onChange={(e) =>
                              setEnrollmentGranularityFilter(e.target.value)
                            }
                            className="h-8 w-full appearance-none rounded-md border border-red-200 bg-white px-2 pr-7 text-[11px] font-medium text-gray-800 shadow-sm outline-none transition hover:border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                            aria-label="Filter enrollment chart by granularity"
                            title="Granularity"
                          >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white/80 p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                        <FilterIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Filters
                        </p>
                        <p className="text-xs text-gray-500">
                          Narrow enrollments by center, course, or trainer
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <label className="flex flex-col gap-1.5 text-sm">
                        <span className="font-medium text-gray-600">
                          Center
                        </span>
                        <div className="relative">
                          <select
                            value={enrollmentCenterFilter}
                            onChange={(e) =>
                              setEnrollmentCenterFilter(e.target.value)
                            }
                            className="h-8 w-full appearance-none rounded-md border border-gray-200 bg-white px-2 pr-7 text-[11px] font-medium text-gray-800 shadow-sm outline-none transition hover:border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                            aria-label="Filter enrollment chart by center"
                            title={enrollmentCenterFilter || "All centers"}
                          >
                            <option value="">All centers</option>
                            {enrollmentCenterOptions.map((center) => (
                              <option key={center} value={center}>
                                {center}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
                        </div>
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm">
                        <span className="font-medium text-gray-600">
                          Course
                        </span>
                        <div className="relative">
                          <select
                            value={enrollmentCourseFilter}
                            onChange={(e) =>
                              setEnrollmentCourseFilter(e.target.value)
                            }
                            className="h-8 w-full appearance-none rounded-md border border-gray-200 bg-white px-2 pr-7 text-[11px] font-medium text-gray-800 shadow-sm outline-none transition hover:border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                            aria-label="Filter enrollment chart by course"
                            title={enrollmentCourseFilter || "All courses"}
                          >
                            <option value="">All courses</option>
                            {enrollmentCourseOptions.map((course) => (
                              <option key={course} value={course}>
                                {course}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
                        </div>
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm">
                        <span className="font-medium text-gray-600">
                          Trainer
                        </span>
                        <div className="relative">
                          <select
                            value={enrollmentTrainerFilter}
                            onChange={(e) =>
                              setEnrollmentTrainerFilter(e.target.value)
                            }
                            className="h-8 w-full appearance-none rounded-md border border-gray-200 bg-white px-2 pr-7 text-[11px] font-medium text-gray-800 shadow-sm outline-none transition hover:border-gray-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                            aria-label="Filter enrollment chart by trainer"
                            title={enrollmentTrainerFilter || "All trainers"}
                          >
                            <option value="">All trainers</option>
                            {enrollmentTrainerOptions.map((trainer) => (
                              <option key={trainer} value={trainer}>
                                {trainer}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-gray-400" />
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
                <ChartContainer
                  config={chartConfig}
                  className="h-[350px] w-full"
                >
                  <AreaChart
                    data={
                      filteredEnrollmentTrends.length > 0
                        ? filteredEnrollmentTrends
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
                      activeDot={(props: any) => (
                        <circle
                          cx={props.cx}
                          cy={props.cy}
                          r={6}
                          fill="#AB2F30"
                          stroke="#ffffff"
                          strokeWidth={2}
                          style={{ cursor: "pointer" }}
                          onClick={() => openEnrollmentDrilldown(props.payload)}
                        />
                      )}
                      dot={(props: any) => (
                        <circle
                          cx={props.cx}
                          cy={props.cy}
                          r={4}
                          fill="#AB2F30"
                          stroke="#ffffff"
                          strokeWidth={1.5}
                          style={{ cursor: "pointer" }}
                          onClick={() => openEnrollmentDrilldown(props.payload)}
                        />
                      )}
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
                  Click any point to open matching students, registrations,
                  pending payments, and unassigned students.
                </div>
                <div className="leading-none text-muted-foreground">
                  Showing total enrollments across{" "}
                  {filteredEnrollmentTrends.length || 7}{" "}
                  {enrollmentGranularityFilter === "daily"
                    ? "days"
                    : enrollmentGranularityFilter === "weekly"
                      ? "weeks"
                      : enrollmentGranularityFilter === "quarterly"
                        ? "quarters"
                        : "months"}
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

          <div className="grid grid-cols-1 gap-6">
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

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="mt-14 border-t border-red-100/80 pt-6"
          >
            <div className="flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
              <p>© {currentDateTime.getFullYear()} Cyborg Robotics Academy</p>
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.14em] text-gray-400">
                <span>System Status: All systems operational</span>
              </div>
            </div>
          </motion.div>
        </div>

        <Dialog open={drilldownOpen} onOpenChange={setDrilldownOpen}>
          <DialogContent
            showCloseButton={false}
            className="inset-0 h-dvh w-dvw max-w-none translate-x-0 translate-y-0 overflow-hidden rounded-none border-0 bg-white p-0 shadow-2xl sm:max-w-none"
            overlayClassName="bg-black/72 backdrop-blur-[3px]"
          >
            <div className="flex h-full min-h-0 flex-col">
              <DialogHeader className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 pr-4">
                    <DialogTitle>Enrollment Drill-down</DialogTitle>
                    <DialogDescription className="mt-1">
                      {drilldownContext
                        ? `You clicked ${drilldownContext.title}. Reviewing all linked records in that period.`
                        : "Matching records for the selected chart point"}
                    </DialogDescription>
                  </div>
                  <div className="flex items-start gap-3">
                    {drilldownContext ? (
                      <div className="rounded-2xl border border-red-100 bg-red-50/80 px-4 py-3 text-left">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-700">
                          Click Context
                        </p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {drilldownContext.title}
                        </p>
                        <p className="mt-1 text-xs text-gray-600">
                          {drilldownContext.period}
                        </p>
                      </div>
                    ) : null}
                    <DialogClose asChild>
                      <button
                        type="button"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-200"
                        aria-label="Close drill-down"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </DialogClose>
                  </div>
                </div>

                {drilldownContext ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {drilldownContext.activeFilters.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[11px] font-medium text-gray-600"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ) : null}
              </DialogHeader>

              <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
                <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
                  {[
                    {
                      label: "Student records",
                      value: drilldownDetails.students.length,
                      helper: "Enrollment entries in the selected period",
                      tone: "border-red-200 bg-gradient-to-br from-red-50 to-white text-red-700",
                    },
                    {
                      label: "Registration records",
                      value: drilldownDetails.registrations.length,
                      helper: "Registrations created during this period",
                      tone: "border-orange-200 bg-gradient-to-br from-orange-50 to-white text-orange-700",
                    },
                    {
                      label: "Pending payments",
                      value: drilldownDetails.pendingPayments.length,
                      helper: "Payments still awaiting confirmation",
                      tone: "border-amber-200 bg-gradient-to-br from-amber-50 to-white text-amber-700",
                    },
                    {
                      label: "Needs trainer assignment",
                      value: drilldownDetails.unassignedStudents.length,
                      helper: "Students still missing a trainer",
                      tone: "border-slate-200 bg-gradient-to-br from-slate-50 to-white text-slate-700",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`rounded-2xl border px-4 py-4 shadow-sm ${item.tone}`}
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                        {item.label}
                      </p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">
                        {item.value}
                      </p>
                      <p className="mt-2 text-xs text-gray-500">
                        {item.helper}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid min-h-0 grid-cols-1 gap-5 xl:grid-cols-2">
                  {[
                    {
                      title: "Students",
                      subtitle: "Who enrolled during the clicked period",
                      items: drilldownDetails.students.map((student: any) => ({
                        primary:
                          student.fullName ||
                          student.username ||
                          student.studentName ||
                          "Unnamed student",
                        metaA: student.PrnNumber
                          ? `PRN ${student.PrnNumber}`
                          : "-",
                        metaB: getStudentCenter(student) || "-",
                        metaC: getStudentTrainer(student) || "No trainer",
                      })),
                      columns: ["Student", "PRN", "Center", "Trainer"],
                    },
                    {
                      title: "Registrations",
                      subtitle: "Registration records captured in this period",
                      items: drilldownDetails.registrations.map(
                        (registration: any) => ({
                          primary:
                            registration.studentName ||
                            registration.fullName ||
                            "Unnamed registration",
                          metaA:
                            registration.selectedCourseName ||
                            registration.courseName ||
                            registration.course ||
                            "-",
                          metaB:
                            registration.primaryParentContact ||
                            registration.parentPhone ||
                            "-",
                          metaC:
                            formatDateLabel(
                              getRegistrationCreatedDate(
                                registration,
                              )?.toISOString() || "",
                            ) || "-",
                        }),
                      ),
                      columns: ["Student", "Course", "Contact", "Date"],
                    },
                    {
                      title: "Pending Payments",
                      subtitle: "Open payment records tied to the period",
                      items: drilldownDetails.pendingPayments.map(
                        (payment: any) => ({
                          primary:
                            payment.studentName ||
                            payment.registrationDraft?.studentName ||
                            "Unnamed payment",
                          metaA:
                            payment.courseName || payment.course?.name || "-",
                          metaB: payment.orderId || "-",
                          metaC:
                            String(payment.status || "").toUpperCase() || "-",
                        }),
                      ),
                      columns: ["Student", "Course", "Order ID", "Status"],
                    },
                    {
                      title: "Unassigned Students",
                      subtitle: "Operational follow-up needed after enrollment",
                      items: drilldownDetails.unassignedStudents.map(
                        (student: any) => ({
                          primary:
                            student.fullName ||
                            student.username ||
                            student.studentName ||
                            "Unnamed student",
                          metaA: student.PrnNumber
                            ? `PRN ${student.PrnNumber}`
                            : "-",
                          metaB: getStudentCenter(student) || "-",
                          metaC: "Trainer not assigned",
                        }),
                      ),
                      columns: ["Student", "PRN", "Center", "Action"],
                    },
                  ].map((section) => (
                    <div
                      key={section.title}
                      className="rounded-2xl border border-gray-200 bg-white shadow-sm"
                    >
                      <div className="border-b border-gray-100 px-4 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">
                              {section.title}
                            </h3>
                            <p className="mt-1 text-xs text-gray-500">
                              {section.subtitle}
                            </p>
                          </div>
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                            {section.items.length}
                          </span>
                        </div>
                      </div>

                      {section.items.length === 0 ? (
                        <div className="px-4 py-8 text-center text-xs text-gray-500">
                          No matching records in this period.
                        </div>
                      ) : (
                        <div className="max-h-[calc(94vh-360px)] overflow-y-auto">
                          <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-3 border-b border-gray-100 bg-gray-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                            {section.columns.map((column) => (
                              <span key={column}>{column}</span>
                            ))}
                          </div>
                          <div className="divide-y divide-gray-100">
                            {section.items.map((item, index) => (
                              <div
                                key={`${section.title}-${index}`}
                                className="grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-3 px-4 py-3 text-sm"
                              >
                                <div className="min-w-0">
                                  <p className="truncate font-medium text-gray-900">
                                    {item.primary}
                                  </p>
                                </div>
                                <p className="truncate text-gray-600">
                                  {item.metaA}
                                </p>
                                <p className="truncate text-gray-600">
                                  {item.metaB}
                                </p>
                                <p className="truncate text-gray-600">
                                  {item.metaC}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
