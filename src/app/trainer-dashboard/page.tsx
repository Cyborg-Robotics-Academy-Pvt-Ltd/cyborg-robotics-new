"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  BookOpen,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarRange,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  Plus,
  CalendarClock,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import AuthLoadingSpinner from "@/components/AuthLoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type Course = {
  name?: string;
  level?: string;
  status?: string;
  completed?: boolean;
  trainerId?: string;
};

type Task = {
  course?: string;
  dateTime?: string;
  status?: string;
  task?: string;
};

type Student = {
  id: string;
  username: string;
  prnNumber?: string;
  profileImage?: string | null;
  createdAt?: { toDate?: () => Date } | string | Date | null;
  status?: string;
  tasks: Task[];
  courses: Course[];
};

const normalizeCourseLevel = (level?: string | null) => {
  const normalized = (level || "").trim().toLowerCase();
  const levels: Record<string, string> = {
    beginner: "1",
    intermediate: "2",
    advanced: "3",
    expert: "4",
  };
  return levels[normalized] || normalized;
};

const getCourseIdentity = (name?: string, level?: string) => {
  const value = (name || "").trim();
  const pipeMatch = value.match(/^(.+?)\|(\d+)$/);
  const suffixMatch = value.match(
    /^(.+?)\s+level\s+(beginner|intermediate|advanced|expert|\d+)$/i,
  );
  const parsedName = (pipeMatch?.[1] || suffixMatch?.[1] || value)
    .trim()
    .toLowerCase();
  const parsedLevel = pipeMatch?.[2] || suffixMatch?.[2] || level || "";

  return {
    name: parsedName,
    level: normalizeCourseLevel(parsedLevel),
  };
};

const taskMatchesCourse = (taskCourse: string | undefined, course: Course) => {
  if (!taskCourse) return false;
  const taskIdentity = getCourseIdentity(taskCourse);
  const courseIdentity = getCourseIdentity(course.name, course.level);
  return (
    taskIdentity.name === courseIdentity.name &&
    (!taskIdentity.level ||
      !courseIdentity.level ||
      taskIdentity.level === courseIdentity.level)
  );
};

const getStudentDetailHref = (student: Student, trainerId?: string) => {
  if (!student.prnNumber) return null;

  const assignedCourses = student.courses.filter(
    (course) => course.trainerId === trainerId,
  );
  const primaryCourse =
    assignedCourses.find(
      (course) =>
        course.completed !== true &&
        (course.status || "").toLowerCase() !== "complete",
    ) || assignedCourses[0];

  if (!primaryCourse?.name) return `/${student.prnNumber}`;

  const course = getCourseIdentity(primaryCourse.name, primaryCourse.level);
  const courseSlug = course.name
    .replace(/ & /g, "-and-")
    .replace(/ \+ /g, "-plus-")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
  const levelSlug = course.level
    ? `-level-${({ "1": "beginner", "2": "intermediate", "3": "advanced", "4": "expert" } as Record<string, string>)[course.level] || course.level}`
    : "";

  return courseSlug
    ? `/${student.prnNumber}/${courseSlug}${levelSlug}`
    : `/${student.prnNumber}`;
};

const theme = {
  background: "bg-gradient-to-br from-slate-50 via-red-50 to-orange-100",
  cardBg: "bg-white/70 backdrop-blur-sm",
  textPrimary: "text-gray-900",
  textSecondary: "text-gray-600",
  textMuted: "text-gray-500",
  shadow: "shadow-lg",
  hoverShadow: "hover:shadow-2xl",
};

const chartConfig = {
  students: { label: "Students", color: "#AB2F30" },
  tasks: { label: "Tasks", color: "#8B1A1B" },
};

const toDate = (value: Student["createdAt"] | string | undefined) => {
  if (!value) return null;
  let date: Date;
  if (typeof value === "string") date = new Date(value);
  else if (value instanceof Date) date = value;
  else if (typeof value === "object" && "toDate" in value && value.toDate) {
    date = value.toDate();
  } else {
    return null;
  }

  return Number.isNaN(date.getTime()) ? null : date;
};

const isNewStudent = (
  student: Student,
  trainerId: string | undefined,
  now = new Date(),
) => {
  const enrollmentDate = toDate(student.createdAt);
  if (
    !enrollmentDate ||
    enrollmentDate > now ||
    enrollmentDate < new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  ) {
    return false;
  }

  const trainerCourses = student.courses.filter(
    (course) => course.trainerId === trainerId,
  );
  const completedClasses = student.tasks.filter(
    (task) =>
      (task.status || "").toLowerCase() === "complete" &&
      trainerCourses.some((course) => taskMatchesCourse(task.course, course)),
  ).length;

  return completedClasses < 2;
};

const formatDateTime = (date: Date) =>
  date.toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const getRegularWeekdayPattern = (
  student: Student,
  trainerId: string | undefined,
  today: Date,
  targetWeekday: number,
) => {
  const trainerCourses = student.courses.filter(
    (course) =>
      course.trainerId === trainerId &&
      course.completed !== true &&
      (course.status || "").trim().toLowerCase() !== "complete",
  );
  if (trainerCourses.length === 0) return null;

  const classDatesByDay = new Map<string, Date>();
  student.tasks.forEach((task) => {
    if ((task.status || "").trim().toLowerCase() !== "complete") return;
    const classDate = task.dateTime ? new Date(task.dateTime) : null;
    if (
      !classDate ||
      Number.isNaN(classDate.getTime()) ||
      classDate > today ||
      !trainerCourses.some((course) => taskMatchesCourse(task.course, course))
    ) {
      return;
    }

    const dayKey = `${classDate.getFullYear()}-${classDate.getMonth()}-${classDate.getDate()}`;
    if (!classDatesByDay.has(dayKey)) classDatesByDay.set(dayKey, classDate);
  });

  const recentClassDates = Array.from(classDatesByDay.values())
    .sort((a, b) => b.getTime() - a.getTime())
    .slice(0, 5);
  const matchingDayCount = recentClassDates.filter(
    (date) => date.getDay() === targetWeekday,
  ).length;

  return matchingDayCount >= 3
    ? { matchingDayCount, sampleSize: recentClassDates.length }
    : null;
};

export default function TrainerDashboard() {
  const router = useRouter();
  const { user, userRole, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [trainerName, setTrainerName] = useState("Trainer");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [overview, setOverview] = useState({
    totalStudents: 0,
    activeStudents: 0,
    assignedCourses: 0,
    completedCourses: 0,
    totalTasks: 0,
    completedTasks: 0,
    recentStudents: 0,
    activeStudentRate: 0,
    monthlyGrowth: null as number | null,
  });
  const [trend, setTrend] = useState<
    Array<{ month: string; students: number }>
  >([]);
  const [mix, setMix] = useState<
    Array<{ name: string; value: number; color: string }>
  >([]);
  const [activities, setActivities] = useState<
    Array<{
      id: string;
      name: string;
      description: string;
      course: string;
      time: Date;
      icon: typeof GraduationCap;
      iconColor: string;
    }>
  >([]);
  const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);
  const [predictionDay, setPredictionDay] = useState<"today" | "tomorrow" | number>(
    "today",
  );
  const [studentSearch, setStudentSearch] = useState("");
  const [courseStatusFilter, setCourseStatusFilter] = useState<
    "ongoing" | "completed"
  >("ongoing");
  const studentCarouselRef = useRef<HTMLDivElement>(null);
  const [classStudent, setClassStudent] = useState<Student | null>(null);
  const [classCourse, setClassCourse] = useState("");
  const [className, setClassName] = useState("");
  const [classDateTime, setClassDateTime] = useState("");
  const [isSavingClass, setIsSavingClass] = useState(false);
  const [classFormError, setClassFormError] = useState("");

  const loadProfile = useCallback(async () => {
    if (!user) return;

    const snap = await getDoc(doc(db, "trainers", user.uid));
    if (!snap.exists()) {
      router.push("/login");
      return;
    }

    const data = snap.data();
    const name =
      data.username?.trim() ||
      data.name?.trim() ||
      user.displayName?.trim() ||
      user.email?.split("@")[0] ||
      "Trainer";

    setTrainerName(name.charAt(0).toUpperCase() + name.slice(1));
    setProfileImage(
      data.profileimage ||
        data.imageUrls?.[0] ||
        data.imageUrl ||
        user.photoURL ||
        null,
    );
  }, [router, user]);

  const loadDashboard = useCallback(async () => {
    if (!user) return;

    const now = new Date();
    const studentsSnapshot = await getDocs(collection(db, "students"));
    const students: Student[] = studentsSnapshot.docs.map((item) => {
      const data = item.data();
      return {
        id: item.id,
        username:
          data.name || data.fullName || data.username || "Unnamed student",
        prnNumber: data.PrnNumber || data.prnNumber || "",
        profileImage:
          data.profileimage || data.imageUrls?.[0] || data.imageUrl || null,
        createdAt: data.createdAt || null,
        status: data.status,
        tasks: Array.isArray(data.tasks) ? data.tasks : [],
        courses: Array.isArray(data.courses) ? data.courses : [],
      };
    });

    const trainerStudents = students.filter((student) =>
      student.courses.some((course) => course.trainerId === user.uid),
    );
    setAssignedStudents(trainerStudents);

    const trainerCourses = trainerStudents.flatMap((student) =>
      student.courses.filter((course) => course.trainerId === user.uid),
    );
    const tasks = trainerStudents.flatMap((student) => {
      const assignedCourses = student.courses.filter(
        (course) => course.trainerId === user.uid,
      );
      return student.tasks.filter((task) =>
        assignedCourses.some((course) =>
          taskMatchesCourse(task.course, course),
        ),
      );
    });
    const completedTasks = tasks.filter(
      (task) => (task.status || "").toLowerCase() === "complete",
    );
    const completedCourses = trainerCourses.filter(
      (course) =>
        course.completed || (course.status || "").toLowerCase() === "complete",
    );

    const recentCutoff = new Date(now);
    recentCutoff.setDate(recentCutoff.getDate() - 30);
    const previousCutoff = new Date(now);
    previousCutoff.setDate(previousCutoff.getDate() - 60);
    const recentStudents = trainerStudents.filter((student) => {
      const createdAt = toDate(student.createdAt);
      return createdAt ? createdAt >= recentCutoff && createdAt <= now : false;
    });
    const previousPeriodStudents = trainerStudents.filter((student) => {
      const createdAt = toDate(student.createdAt);
      return createdAt
        ? createdAt >= previousCutoff &&
            createdAt < recentCutoff &&
            createdAt <= now
        : false;
    });
    const activeStudents = trainerStudents.filter(
      (student) => student.status?.toLowerCase() === "active",
    ).length;

    setOverview({
      totalStudents: trainerStudents.length,
      activeStudents,
      assignedCourses: trainerCourses.length,
      completedCourses: completedCourses.length,
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      recentStudents: recentStudents.length,
      activeStudentRate:
        trainerStudents.length > 0
          ? Math.round((activeStudents / trainerStudents.length) * 100)
          : 0,
      monthlyGrowth:
        previousPeriodStudents.length > 0
          ? Math.round(
              ((recentStudents.length - previousPeriodStudents.length) /
                previousPeriodStudents.length) *
                100,
            )
          : null,
    });

    const trendData: Array<{ month: string; students: number }> = [];
    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);

      trendData.push({
        month: date.toLocaleString("en-US", { month: "short" }),
        students: trainerStudents.filter((student) => {
          const createdAt = toDate(student.createdAt);
          return createdAt
            ? createdAt >= start && createdAt < end && createdAt <= now
            : false;
        }).length,
      });
    }
    setTrend(trendData);

    setMix([
      {
        name: "Completed Courses",
        value: completedCourses.length,
        color: "#22c55e",
      },
      {
        name: "Ongoing Courses",
        value: Math.max(trainerCourses.length - completedCourses.length, 0),
        color: "#3b82f6",
      },
      {
        name: "Pending Tasks",
        value: Math.max(tasks.length - completedTasks.length, 0),
        color: "#f59e0b",
      },
    ]);

    const feed = trainerStudents
      .flatMap((student) => {
        const assignedCourses = student.courses.filter(
          (course) => course.trainerId === user.uid,
        );

        const taskItems = student.tasks
          .filter(
            (task) =>
              task.dateTime &&
              task.course &&
              (task.status || "").toLowerCase() === "complete" &&
              !Number.isNaN(new Date(task.dateTime).getTime()) &&
              assignedCourses.some((course) =>
                taskMatchesCourse(task.course, course),
              ),
          )
          .sort(
            (a, b) =>
              new Date(b.dateTime || 0).getTime() -
              new Date(a.dateTime || 0).getTime(),
          )
          .map((task, index) => ({
            id: `${student.id}-task-${index}`,
            name: `${student.username} completed a class`,
            description: task.task || "Class marked complete",
            course: task.course || "",
            time: new Date(task.dateTime || now),
            icon: ClipboardCheck,
            iconColor: "text-red-700",
          }));

        return taskItems;
      })
      .sort((a, b) => b.time.getTime() - a.time.getTime());

    setActivities(feed);
  }, [user]);

  const refreshDashboard = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await loadProfile();
      await loadDashboard();
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, loadDashboard, loadProfile]);

  const openAddClassForm = (student: Student, course: Course) => {
    const courseLabel = course.level
      ? `${course.name || "Course"} Level ${normalizeCourseLevel(course.level)}`
      : course.name || "";
    const now = new Date();
    const localDateTime = new Date(
      now.getTime() - now.getTimezoneOffset() * 60000,
    )
      .toISOString()
      .slice(0, 16);

    setClassStudent(student);
    setClassCourse(courseLabel);
    setClassName("");
    setClassDateTime(localDateTime);
    setClassFormError("");
  };

  const saveAddedClass = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!classStudent || !user || isSavingClass) return;

    const classTitle = className.trim();
    const parsedDate = new Date(classDateTime);
    if (!classCourse || !classTitle || Number.isNaN(parsedDate.getTime())) {
      setClassFormError(
        "Select a course and enter a class name and valid date.",
      );
      return;
    }

    setIsSavingClass(true);
    setClassFormError("");
    try {
      const studentRef = doc(db, "students", classStudent.id);
      const studentSnapshot = await getDoc(studentRef);
      if (!studentSnapshot.exists()) {
        throw new Error("This student record no longer exists.");
      }

      const studentData = studentSnapshot.data();
      const currentCourses: Course[] = Array.isArray(studentData.courses)
        ? studentData.courses
        : [];
      const matchedCourse = currentCourses.find(
        (course) =>
          course.trainerId === user.uid &&
          taskMatchesCourse(classCourse, course),
      );
      if (!matchedCourse) {
        throw new Error(
          "This course is no longer assigned to your trainer account. Refresh the dashboard and try again.",
        );
      }

      const courseLabel = matchedCourse.level
        ? `${matchedCourse.name || "Course"} Level ${normalizeCourseLevel(matchedCourse.level)}`
        : matchedCourse.name || classCourse;
      const currentTasks: Task[] = Array.isArray(studentData.tasks)
        ? studentData.tasks
        : [];
      await updateDoc(studentRef, {
        tasks: [
          ...currentTasks,
          {
            course: courseLabel,
            task: classTitle,
            dateTime: parsedDate.toISOString(),
            status: "complete",
          },
        ],
      });

      setClassStudent(null);
      await loadDashboard();
    } catch (error) {
      console.error("Unable to add class to student record:", error);
      setClassFormError(
        error instanceof Error
          ? error.message
          : "Unable to save the class. Please try again.",
      );
    } finally {
      setIsSavingClass(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user || userRole !== "trainer") {
      router.push("/login");
      return;
    }

    const init = async () => {
      try {
        await loadProfile();
        await loadDashboard();
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [authLoading, loadDashboard, loadProfile, router, user, userRole]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const taskCompletionRate =
    overview.totalTasks > 0
      ? Math.round((overview.completedTasks / overview.totalTasks) * 100)
      : 0;

  const courseCompletionRate =
    overview.assignedCourses > 0
      ? Math.round((overview.completedCourses / overview.assignedCourses) * 100)
      : 0;

  const rosterPreview = useMemo(() => {
    const now = new Date();
    return assignedStudents.slice().sort((a, b) => {
      const aIsNew = isNewStudent(a, user?.uid, now);
      const bIsNew = isNewStudent(b, user?.uid, now);
      if (aIsNew !== bIsNew) return aIsNew ? -1 : 1;

      const aDate = toDate(a.createdAt)?.getTime() || 0;
      const bDate = toDate(b.createdAt)?.getTime() || 0;
      return bDate - aDate;
    });
  }, [assignedStudents, user?.uid]);

  const filteredStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    if (!query) return rosterPreview;

    return rosterPreview.filter((student) => {
      const courseNames = student.courses
        .filter((course) => course.trainerId === user?.uid)
        .map(
          (course) =>
            `${course.name || ""} ${course.level || ""} ${normalizeCourseLevel(course.level)}`,
        )
        .join(" ");
      return `${student.username} ${student.prnNumber || ""} ${courseNames}`
        .toLowerCase()
        .includes(query);
    });
  }, [rosterPreview, studentSearch, user?.uid]);

  const targetPredictionWeekday =
    predictionDay === "today"
      ? currentDateTime.getDay()
      : predictionDay === "tomorrow"
        ? (currentDateTime.getDay() + 1) % 7
        : predictionDay;
  const predictionWeekdayName = new Date(
    2024,
    0,
    7 + targetPredictionWeekday,
  ).toLocaleDateString("en-IN", { weekday: "long" });

  const studentsLikelyOnSelectedDay = useMemo(
    () =>
      assignedStudents
        .map((student) => ({
          student,
          pattern: getRegularWeekdayPattern(
            student,
            user?.uid,
            currentDateTime,
            targetPredictionWeekday,
          ),
        }))
        .filter(
          (
            entry,
          ): entry is {
            student: Student;
            pattern: { matchingDayCount: number; sampleSize: number };
          } => entry.pattern !== null,
        )
        .sort(
          (a, b) =>
            b.pattern.matchingDayCount - a.pattern.matchingDayCount ||
            a.student.username.localeCompare(b.student.username),
        ),
    [assignedStudents, currentDateTime, targetPredictionWeekday, user?.uid],
  );

  const courseRecords = useMemo(
    () =>
      assignedStudents.flatMap((student) =>
        student.courses
          .filter((course) => course.trainerId === user?.uid)
          .map((course, index) => ({
            student,
            course,
            index,
            completed:
              course.completed === true ||
              (course.status || "").trim().toLowerCase() === "complete",
          })),
      ),
    [assignedStudents, user?.uid],
  );

  const visibleCourseRecords = courseRecords.filter(
    (record) => record.completed === (courseStatusFilter === "completed"),
  );

  const quickLinks = [
    { title: "Student Record", href: "/student-list" },
    { title: "My Profile", href: "/user-profile" },
  ];

  const actionCenterItems = [
    {
      title: "Plan your next student task",
      description: `${Math.max(overview.totalTasks - overview.completedTasks, 0)} tasks are currently pending across your roster.`,
      href: "/trainer-dashboard/create-task",
      cta: "Create or update tasks",
      icon: ClipboardCheck,
    },
    {
      title: "Check in with active students",
      description: `${overview.activeStudents} active students are currently assigned to your courses.`,
      href: "#student-carousel",
      cta: "View student roster",
      icon: Users,
    },
    {
      title: "Review course progress",
      description: `${overview.completedCourses} of ${overview.assignedCourses} assigned courses are marked complete.`,
      href: "#workload-mix",
      cta: "View workload",
      icon: BookOpen,
    },
  ];

  if (authLoading || isLoading) return <AuthLoadingSpinner />;

  return (
    <main
      role="main"
      aria-label="Trainer Dashboard"
      className={`min-h-[calc(100vh-6rem)] ${theme.background}`}
    >
      <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Trainer Dashboard
              </h1>
              <p className="mt-1 text-muted-foreground">
                Welcome back, {trainerName}! Here&apos;s your training overview.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <Link
                href="/user-profile"
                className="inline-flex items-center gap-2 self-start rounded-full border border-red-100 bg-white/80 px-3 py-2 text-sm text-gray-700 shadow-sm transition hover:bg-white"
              >
                {profileImage ? (
                  <span className="relative h-8 w-8 overflow-hidden rounded-full border border-white shadow-sm">
                    <Image
                      src={profileImage}
                      alt="Trainer profile"
                      fill
                      className="rounded-full object-cover"
                      unoptimized
                    />
                  </span>
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#6B1516] to-[#AB2F30] text-white">
                    <User className="h-4 w-4" />
                  </span>
                )}
                <span>
                  Welcome, <span className="font-semibold">{trainerName}</span>
                </span>
              </Link>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                <span className="rounded-full border border-red-100 bg-white/80 px-3 py-2 shadow-sm">
                  {currentDateTime.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="rounded-full border border-red-100 bg-white/80 px-3 py-2 shadow-sm">
                  {currentDateTime.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <Button
                  size="sm"
                  onClick={refreshDashboard}
                  disabled={isRefreshing}
                  className="h-10 rounded-xl bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] px-4 font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:from-red-700 hover:to-red-800 hover:shadow-lg disabled:translate-y-0 disabled:opacity-60"
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
              Quick Links
            </span>
            {quickLinks.map((link) => (
              <Link key={link.title} href={link.href}>
                <motion.span
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] px-4 py-2.5 text-sm font-medium text-white shadow-md transition hover:from-red-700 hover:to-red-800 hover:shadow-lg"
                >
                  {link.title}
                  <ArrowRight className="h-3.5 w-3.5" />
                </motion.span>
              </Link>
            ))}
          </div>
        </motion.div>

        <section aria-labelledby="likely-students-heading" className="mb-8">
          <Card className="border border-red-100 bg-white/85 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-800">
                  <CalendarClock className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle
                    id="likely-students-heading"
                    className="text-lg text-gray-900"
                  >
                    Students who may come on {predictionWeekdayName}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Based on each student&apos;s last five distinct completed
                    class days. This is an estimate.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={predictionDay === "today" ? "default" : "outline"}
                  aria-pressed={predictionDay === "today"}
                  onClick={() => setPredictionDay("today")}
                  className={
                    predictionDay === "today"
                      ? "rounded-full bg-red-800 text-white hover:bg-red-900"
                      : "rounded-full border-red-200 text-red-800"
                  }
                >
                  Today
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={predictionDay === "tomorrow" ? "default" : "outline"}
                  aria-pressed={predictionDay === "tomorrow"}
                  onClick={() => setPredictionDay("tomorrow")}
                  className={
                    predictionDay === "tomorrow"
                      ? "rounded-full bg-red-800 text-white hover:bg-red-900"
                      : "rounded-full border-red-200 text-red-800"
                  }
                >
                  Tomorrow
                </Button>
                <label
                  htmlFor="prediction-weekday"
                  className="sr-only"
                >
                  Choose a weekday
                </label>
                <select
                  id="prediction-weekday"
                  value={
                    typeof predictionDay === "number"
                      ? predictionDay
                      : targetPredictionWeekday
                  }
                  onChange={(event) =>
                    setPredictionDay(Number(event.target.value))
                  }
                  className="h-9 rounded-full border border-red-200 bg-white px-3 text-sm font-medium text-red-800 focus:outline-none focus:ring-2 focus:ring-red-200"
                >
                  {[1, 2, 3, 4, 5, 6, 0].map((weekday) => (
                    <option key={weekday} value={weekday}>
                      {new Date(2024, 0, 7 + weekday).toLocaleDateString(
                        "en-IN",
                        { weekday: "long" },
                      )}
                    </option>
                  ))}
                </select>
              </div>
              {studentsLikelyOnSelectedDay.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {studentsLikelyOnSelectedDay.map(({ student, pattern }) => {
                    const trainerCourses = student.courses.filter(
                      (course) =>
                        course.trainerId === user?.uid &&
                        course.completed !== true &&
                        (course.status || "").trim().toLowerCase() !==
                          "complete",
                    );
                    const detailHref = getStudentDetailHref(student, user?.uid);

                    return (
                      <li
                        key={student.id}
                        className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          {student.profileImage ? (
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100">
                              <Image
                                src={student.profileImage}
                                alt=""
                                fill
                                sizes="40px"
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-700">
                              <User className="h-5 w-5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-900">
                              {student.username}
                              {student.prnNumber
                                ? ` · PRN ${student.prnNumber}`
                                : ""}
                            </p>
                            <p className="truncate text-sm text-gray-600">
                              {trainerCourses
                                .map((course) => course.name)
                                .filter(Boolean)
                                .join(", ") || "Assigned course"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 pl-[52px] sm:pl-0">
                          <Badge className="border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-50">
                            {pattern.matchingDayCount} of {pattern.sampleSize}{" "}
                            recent class days on {predictionWeekdayName}
                          </Badge>
                          {detailHref ? (
                            <Link
                              href={detailHref}
                              className="inline-flex items-center gap-1 text-sm font-semibold text-red-800 hover:text-red-900"
                            >
                              View
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="rounded-xl border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-500">
                  No students have a regular{" "}
                  {predictionWeekdayName} pattern in their recent class
                  history.
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        <section id="student-carousel" className="mb-8">
          <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Your Students
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {assignedStudents.length} student
                {assignedStudents.length === 1 ? "" : "s"} assigned to your
                courses
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={studentSearch}
                  onChange={(event) => {
                    setStudentSearch(event.target.value);
                    studentCarouselRef.current?.scrollTo({
                      left: 0,
                      behavior: "smooth",
                    });
                  }}
                  placeholder="Search students, PRN, course..."
                  aria-label="Search assigned students by name, PRN, or course"
                  className="h-10 rounded-full border border-red-100 bg-white/85 pl-10 pr-10 text-sm shadow-sm placeholder:text-gray-400 focus-visible:ring-red-200"
                />
                {studentSearch ? (
                  <button
                    type="button"
                    onClick={() => {
                      setStudentSearch("");
                      studentCarouselRef.current?.scrollTo({
                        left: 0,
                        behavior: "smooth",
                      });
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-700"
                    aria-label="Clear student search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
              {filteredStudents.length > 1 ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Scroll students left"
                    className="h-9 w-9 rounded-full border-red-200 bg-white text-red-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 hover:text-red-900 hover:shadow-md"
                    onClick={() =>
                      studentCarouselRef.current?.scrollBy({
                        left: -320,
                        behavior: "smooth",
                      })
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Scroll students right"
                    className="h-9 w-9 rounded-full border-red-200 bg-white text-red-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-50 hover:text-red-900 hover:shadow-md"
                    onClick={() =>
                      studentCarouselRef.current?.scrollBy({
                        left: 320,
                        behavior: "smooth",
                      })
                    }
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
          {filteredStudents.length > 0 ? (
            <div
              ref={studentCarouselRef}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {filteredStudents.map((student) => {
                const trainerCourses = student.courses.filter(
                  (course) => course.trainerId === user?.uid,
                );
                const showNewStudentBadge = isNewStudent(student, user?.uid);
                const detailHref = getStudentDetailHref(student, user?.uid);
                const content = (
                  <div className="flex w-[min(72vw,200px)] shrink-0 snap-start flex-col items-center px-2 py-0 text-center sm:w-[200px]">
                    {student.profileImage ? (
                      <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-white bg-gray-100 shadow-sm ring-1 ring-red-100">
                        <Image
                          src={student.profileImage}
                          alt={`${student.username}'s profile`}
                          fill
                          sizes="80px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-red-50 to-orange-100 text-red-700 shadow-sm ring-1 ring-red-100">
                        <User className="h-9 w-9" />
                      </div>
                    )}
                    <p className="mt-1 w-full truncate text-sm font-semibold text-gray-900">
                      {student.username}
                    </p>
                    {showNewStudentBadge ? (
                      <Badge className="mt-1 border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 hover:bg-emerald-50">
                        New student
                      </Badge>
                    ) : null}
                    <div className="flex flex-col items-center gap-0">
                      {trainerCourses.length > 0 ? (
                        trainerCourses.map((course, index) =>
                          (() => {
                            const identity = getCourseIdentity(
                              course.name,
                              course.level,
                            );
                            const levelLabels: Record<string, string> = {
                              "1": "Beginner",
                              "2": "Intermediate",
                              "3": "Advanced",
                              "4": "Expert",
                            };
                            return (
                              <span
                                key={`${course.name || "course"}-${course.level || ""}-${index}`}
                                className="text-xs font-medium leading-4 text-gray-700"
                              >
                                {course.name || "Course"}
                                {identity.level
                                  ? ` · ${levelLabels[identity.level] || `Level ${identity.level}`}`
                                  : ""}
                              </span>
                            );
                          })(),
                        )
                      ) : (
                        <span className="text-xs text-gray-500">
                          No assigned course details
                        </span>
                      )}
                    </div>
                    {detailHref ? (
                      <Link
                        href={detailHref}
                        aria-label={`View details for ${student.username}`}
                        className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:from-red-700 hover:to-red-800 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-2"
                      >
                        View details
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    ) : null}
                    {trainerCourses.length > 0 ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="mt-2 h-8 rounded-full border-red-200 px-3 text-xs font-semibold text-red-800 transition hover:bg-red-50 hover:text-red-900"
                        onClick={() =>
                          openAddClassForm(student, trainerCourses[0])
                        }
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        Add class
                      </Button>
                    ) : null}
                  </div>
                );

                return <div key={student.id}>{content}</div>;
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white/60 px-6 py-4 text-center text-sm text-gray-500">
              {studentSearch.trim()
                ? `No students found for "${studentSearch.trim()}".`
                : "No assigned students yet."}
            </div>
          )}
        </section>

        <section aria-labelledby="course-progress-heading" className="mb-8">
          <Card className="border-0 bg-white/65 shadow-xl backdrop-blur-sm">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle id="course-progress-heading">
                  Student Course Progress
                </CardTitle>
                <CardDescription className="mt-1">
                  Browse students by ongoing or completed assigned courses
                </CardDescription>
              </div>
              <div
                className="flex w-full gap-2 sm:w-auto"
                aria-label="Filter students by course status"
              >
                <Button
                  type="button"
                  variant={courseStatusFilter === "ongoing" ? "default" : "outline"}
                  aria-pressed={courseStatusFilter === "ongoing"}
                  onClick={() => setCourseStatusFilter("ongoing")}
                  className={
                    courseStatusFilter === "ongoing"
                      ? "flex-1 rounded-full bg-red-800 text-white hover:bg-red-900 sm:flex-none"
                      : "flex-1 rounded-full border-red-200 text-red-800 sm:flex-none"
                  }
                >
                  Ongoing ({courseRecords.filter((record) => !record.completed).length})
                </Button>
                <Button
                  type="button"
                  variant={courseStatusFilter === "completed" ? "default" : "outline"}
                  aria-pressed={courseStatusFilter === "completed"}
                  onClick={() => setCourseStatusFilter("completed")}
                  className={
                    courseStatusFilter === "completed"
                      ? "flex-1 rounded-full bg-red-800 text-white hover:bg-red-900 sm:flex-none"
                      : "flex-1 rounded-full border-red-200 text-red-800 sm:flex-none"
                  }
                >
                  Completed ({courseRecords.filter((record) => record.completed).length})
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {visibleCourseRecords.length > 0 ? (
                <div className="max-h-[28rem] overflow-y-auto pr-2">
                  <ul className="divide-y divide-gray-100">
                    {visibleCourseRecords.map(
                    ({ student, course, index, completed }) => {
                      const detailHref = getStudentDetailHref(student, user?.uid);
                      const courseIdentity = getCourseIdentity(
                        course.name,
                        course.level,
                      );
                      const levelNames: Record<string, string> = {
                        "1": "Beginner",
                        "2": "Intermediate",
                        "3": "Advanced",
                        "4": "Expert",
                      };

                      return (
                        <li
                          key={`${student.id}-${course.name || "course"}-${course.level || ""}-${index}`}
                          className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            {student.profileImage ? (
                              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-gray-100">
                                <Image
                                  src={student.profileImage}
                                  alt=""
                                  fill
                                  sizes="44px"
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-700">
                                <User className="h-5 w-5" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-gray-900">
                                {student.username}
                              </p>
                              <p className="truncate text-sm text-gray-600">
                                {course.name || "Course"}
                                {courseIdentity.level
                                  ? ` · ${levelNames[courseIdentity.level] || `Level ${courseIdentity.level}`}`
                                  : ""}
                                {student.prnNumber ? ` · PRN ${student.prnNumber}` : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 pl-14 sm:pl-0">
                            <Badge
                              className={
                                completed
                                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-50"
                                  : "border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-50"
                              }
                            >
                              {completed ? "Completed" : "Ongoing"}
                            </Badge>
                            {detailHref ? (
                              <Link
                                href={detailHref}
                                className="inline-flex items-center gap-1 text-sm font-semibold text-red-800 hover:text-red-900"
                              >
                                Student record
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                            ) : null}
                          </div>
                        </li>
                      );
                    },
                    )}
                  </ul>
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500">
                  No {courseStatusFilter} assigned courses found.
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        <Dialog
          open={Boolean(classStudent)}
          onOpenChange={(open) => {
            if (!open && !isSavingClass) setClassStudent(null);
          }}
        >
          <DialogContent className="overflow-hidden rounded-3xl border-0 p-0 shadow-2xl sm:max-w-lg">
            <div className="bg-gradient-to-r from-[#6B1516] via-[#8B1A1B] to-[#AB2F30] px-5 py-4 text-white">
              <DialogHeader className="text-left">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl border border-white/20 bg-white/10">
                  <Plus className="h-4 w-4" />
                </div>
                <DialogTitle className="text-lg text-white">
                  Add completed class
                </DialogTitle>
                <DialogDescription className="text-xs text-red-100">
                  Record a class for {classStudent?.username || "this student"}.
                </DialogDescription>
              </DialogHeader>
            </div>
            <form onSubmit={saveAddedClass} className="space-y-3 px-5 py-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="class-course"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-800"
                >
                  <BookOpen className="h-4 w-4 text-red-700" />
                  Assigned course
                </label>
                <select
                  id="class-course"
                  value={classCourse}
                  onChange={(event) => setClassCourse(event.target.value)}
                  required
                  className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 shadow-sm outline-none transition focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-100"
                >
                  {classStudent?.courses
                    .filter((course) => course.trainerId === user?.uid)
                    .map((course, index) => {
                      const label = course.level
                        ? `${course.name || "Course"} Level ${normalizeCourseLevel(course.level)}`
                        : course.name || "";
                      return (
                        <option
                          key={`${label}-${index}`}
                          value={label}
                          disabled={!label}
                        >
                          {label || "Unnamed course"}
                        </option>
                      );
                    })}
                </select>
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="class-name"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-800"
                >
                  <ClipboardCheck className="h-4 w-4 text-red-700" />
                  Class name or topic
                </label>
                <Input
                  id="class-name"
                  value={className}
                  onChange={(event) => setClassName(event.target.value)}
                  placeholder="e.g. Build and test a line-following robot"
                  maxLength={120}
                  required
                  className="h-10 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm shadow-sm focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-red-100"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="class-date-time"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-800"
                >
                  <CalendarClock className="h-4 w-4 text-red-700" />
                  Class date and time
                </label>
                <Input
                  id="class-date-time"
                  type="datetime-local"
                  value={classDateTime}
                  onChange={(event) => setClassDateTime(event.target.value)}
                  required
                  className="h-10 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm shadow-sm focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-red-100"
                />
              </div>
              {classFormError ? (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800"
                >
                  {classFormError}
                </p>
              ) : null}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 rounded-xl border-gray-200 px-4"
                  onClick={() => setClassStudent(null)}
                  disabled={isSavingClass}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSavingClass}
                  className="h-9 rounded-xl bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] px-4 font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:from-red-700 hover:to-red-800 hover:shadow-lg disabled:translate-y-0 disabled:opacity-60"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {isSavingClass ? "Saving class..." : "Save class"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Assigned Students"
            value={overview.totalStudents}
            change={`${overview.recentStudents} registered in the last 30 days`}
            trend={overview.recentStudents > 0 ? "up" : "down"}
            helper="Students connected to your courses"
            icon={<Users className="h-5 w-5 text-red-100" />}
            emphasis="primary"
          />
          <StatCard
            title="Active Students"
            value={overview.activeStudents}
            change={`${overview.activeStudentRate}% of assigned students`}
            trend="up"
            helper="Current active learners under your guidance"
            icon={<GraduationCap className="h-5 w-5 text-red-100" />}
            emphasis="primary"
          />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-4">
          <div className="grid gap-6 sm:grid-cols-2 xl:col-span-3 xl:grid-cols-2">
            <Card className="overflow-hidden border-0 bg-white/55 shadow-xl backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle>Roster Student Registrations</CardTitle>
                    <CardDescription>
                      Accounts registered by students currently in your assigned
                      roster
                    </CardDescription>
                  </div>
                  <Badge
                    variant="secondary"
                    className="gap-1 bg-red-500/10 text-red-700"
                  >
                    <TrendingUp className="h-3.5 w-3.5" />
                    {overview.monthlyGrowth === null
                      ? "No prior baseline"
                      : `${overview.monthlyGrowth > 0 ? "+" : ""}${overview.monthlyGrowth}% vs prior 30 days`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ChartContainer
                  config={chartConfig}
                  className="h-[320px] w-full"
                >
                  <AreaChart data={trend}>
                    <defs>
                      <linearGradient
                        id="trainerGrowth"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#AB2F30"
                          stopOpacity={0.28}
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
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    <Area
                      type="monotone"
                      dataKey="students"
                      stroke="#AB2F30"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#trainerGrowth)"
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                Student account registrations by calendar month; assignment
                dates are not available in the roster data.
              </CardFooter>
            </Card>

            <Card
              id="workload-mix"
              className="overflow-hidden border-0 bg-white/55 shadow-xl backdrop-blur-sm"
            >
              <CardHeader>
                <CardTitle>Workload Mix</CardTitle>
                <CardDescription>
                  Completion and pending work balance across your assignments
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <ChartContainer
                  config={chartConfig}
                  className="h-[250px] w-full"
                >
                  <PieChart>
                    <Pie
                      data={mix}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={84}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {mix.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  </PieChart>
                </ChartContainer>

                <div className="mt-4 grid w-full grid-cols-1 gap-3">
                  {mix.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white/80 px-3 py-2"
                    >
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {item.name}
                      </span>
                      <span className="ml-auto text-sm font-semibold text-gray-900">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8">
          <Card className="border-0 bg-white/55 shadow-xl backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Student Updated Classes</CardTitle>
                <CardDescription>
                  Classes students have marked complete in your assigned courses
                </CardDescription>
              </div>
              <Link href="/trainer-dashboard/create-task">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-red-200 bg-white text-red-800 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-red-50 hover:text-red-900 hover:shadow-md"
                >
                  Task board
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {activities.length > 0 ? (
                <div className="max-h-[32rem] space-y-6 overflow-y-auto pr-3">
                  {activities.map((activity) => (
                    <ActionItem
                      key={activity.id}
                      name={activity.name}
                      description={activity.description}
                      course={activity.course}
                      time={formatDateTime(activity.time)}
                      icon={
                        <activity.icon
                          className={`h-4 w-4 ${activity.iconColor}`}
                        />
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <Activity className="mx-auto mb-3 h-12 w-12 opacity-50" />
                  <p>No completed classes yet</p>
                  <p className="text-sm">
                    Completed classes from your students will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="mt-14 border-t border-red-100/80 pt-6"
        >
          <div className="flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <p>(c) {currentDateTime.getFullYear()} Cyborg Robotics Academy</p>
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.14em] text-gray-400">
              <span>Trainer system status: operational</span>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  change,
  icon,
  trend,
  helper,
  emphasis,
}: {
  title: string;
  value: string | number;
  change: string;
  icon: React.ReactNode;
  trend: "up" | "down";
  helper?: string;
  emphasis?: "primary";
}) {
  const isPrimary = emphasis === "primary";

  return (
    <Card
      className={`group relative overflow-hidden shadow-lg transition-all hover:shadow-xl ${
        isPrimary
          ? "border-0 bg-gradient-to-br from-[#6B1516] via-[#8B1A1B] to-[#AB2F30] text-white shadow-red-900/20"
          : "border-white/70 bg-white/55 backdrop-blur-sm"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle
          className={`text-sm font-medium ${
            isPrimary ? "text-red-100/85" : "text-gray-600"
          }`}
        >
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div
          className={`text-2xl font-bold ${
            isPrimary ? "text-white" : "text-gray-900"
          }`}
        >
          {value}
        </div>
        {helper ? (
          <p
            className={`mt-1 text-xs ${
              isPrimary ? "text-red-50/85" : "text-muted-foreground"
            }`}
          >
            {helper}
          </p>
        ) : null}
        <p
          className={`mt-2 flex items-center gap-1 text-xs ${
            isPrimary ? "text-red-50" : "text-muted-foreground"
          }`}
        >
          {trend === "up" ? (
            <ArrowUpRight className="h-3 w-3 text-green-600" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-red-600" />
          )}
          <span
            className={
              trend === "up"
                ? "font-medium text-green-600"
                : "font-medium text-red-600"
            }
          >
            {change}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}

function ActionItem({
  name,
  description,
  course,
  time,
  icon,
}: {
  name: string;
  description: string;
  course: string;
  time: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50">
        {icon}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-sm font-semibold leading-5 text-gray-900">{name}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-800">
            {course}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
            <CalendarRange className="h-3.5 w-3.5" />
            {time}
          </span>
        </div>
      </div>
    </div>
  );
}
