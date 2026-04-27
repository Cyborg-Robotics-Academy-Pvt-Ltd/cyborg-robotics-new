"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  CalendarRange,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  RefreshCw,
  Sparkles,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
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

type Course = {
  name?: string;
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
  createdAt?: { toDate?: () => Date } | string | Date | null;
  status?: string;
  tasks: Task[];
  courses: Course[];
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

const fallbackTrend = [
  { month: "Jan", students: 1 },
  { month: "Feb", students: 3 },
  { month: "Mar", students: 2 },
  { month: "Apr", students: 4 },
  { month: "May", students: 5 },
  { month: "Jun", students: 3 },
];

const fallbackWeek = [
  { day: "Sun", tasks: 0 },
  { day: "Mon", tasks: 2 },
  { day: "Tue", tasks: 1 },
  { day: "Wed", tasks: 3 },
  { day: "Thu", tasks: 2 },
  { day: "Fri", tasks: 4 },
  { day: "Sat", tasks: 1 },
];

const toDate = (value: Student["createdAt"] | string | undefined) => {
  if (!value) return null;
  if (typeof value === "string") return new Date(value);
  if (value instanceof Date) return value;
  if (typeof value === "object" && "toDate" in value && value.toDate) {
    return value.toDate();
  }
  return null;
};

const formatRelativeTime = (date: Date) => {
  const minutesAgo = Math.ceil((Date.now() - date.getTime()) / 60000);
  const hoursAgo = Math.floor(minutesAgo / 60);
  const daysAgo = Math.floor(hoursAgo / 24);

  if (daysAgo > 0) {
    return daysAgo === 1 ? "1 day ago" : `${daysAgo} days ago`;
  }

  if (hoursAgo > 0) {
    return `${hoursAgo} hr${hoursAgo !== 1 ? "s" : ""} ago`;
  }

  return `${minutesAgo} min${minutesAgo !== 1 ? "s" : ""} ago`;
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
    monthlyGrowth: 0,
  });
  const [trend, setTrend] = useState<
    Array<{ month: string; students: number }>
  >([]);
  const [week, setWeek] = useState<Array<{ day: string; tasks: number }>>([]);
  const [mix, setMix] = useState<
    Array<{ name: string; value: number; color: string }>
  >([]);
  const [activities, setActivities] = useState<
    Array<{
      id: string;
      name: string;
      description: string;
      time: Date;
      icon: typeof GraduationCap;
      iconColor: string;
    }>
  >([]);
  const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);

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
        username: data.name || data.fullName || data.username || "Student",
        createdAt: data.createdAt || null,
        status: data.status || "active",
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
    const tasks = trainerStudents.flatMap((student) => student.tasks);
    const completedTasks = tasks.filter(
      (task) => (task.status || "").toLowerCase() === "complete",
    );
    const completedCourses = trainerCourses.filter(
      (course) =>
        course.completed || (course.status || "").toLowerCase() === "complete",
    );

    const recentCutoff = new Date();
    recentCutoff.setDate(recentCutoff.getDate() - 30);
    const recentStudents = trainerStudents.filter((student) => {
      const createdAt = toDate(student.createdAt);
      return createdAt ? createdAt >= recentCutoff : false;
    });

    setOverview({
      totalStudents: trainerStudents.length,
      activeStudents: trainerStudents.filter(
        (student) => (student.status || "").toLowerCase() === "active",
      ).length,
      assignedCourses: trainerCourses.length,
      completedCourses: completedCourses.length,
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      recentStudents: recentStudents.length,
      monthlyGrowth: Math.round(
        (recentStudents.length /
          Math.max(trainerStudents.length - recentStudents.length, 1)) *
          100,
      ),
    });

    const trendData: Array<{ month: string; students: number }> = [];
    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
        23,
        59,
        59,
      );

      trendData.push({
        month: date.toLocaleString("en-US", { month: "short" }),
        students: trainerStudents.filter((student) => {
          const createdAt = toDate(student.createdAt);
          return createdAt ? createdAt >= start && createdAt <= end : false;
        }).length,
      });
    }
    setTrend(trendData);

    const weekMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
      (day) => ({ day, tasks: 0 }),
    );
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    tasks.forEach((task) => {
      if (!task.dateTime) return;
      const taskDate = new Date(task.dateTime);
      if (Number.isNaN(taskDate.getTime()) || taskDate < weekStart) return;
      weekMap[taskDate.getDay()].tasks += 1;
    });
    setWeek(weekMap);

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
        const registrationTime = toDate(student.createdAt);
        const base = registrationTime
          ? [
              {
                id: `${student.id}-registration`,
                name: "Student assigned",
                description: `${student.username} has been added to your training roster`,
                time: registrationTime,
                icon: GraduationCap,
                iconColor: "text-red-700",
              },
            ]
          : [];

        const taskItems = student.tasks
          .filter((task) => task.dateTime)
          .sort(
            (a, b) =>
              new Date(b.dateTime || 0).getTime() -
              new Date(a.dateTime || 0).getTime(),
          )
          .slice(0, 2)
          .map((task, index) => ({
            id: `${student.id}-task-${index}`,
            name: "Task updated",
            description: `${student.username}: ${task.task || "Task"}${task.course ? ` (${task.course})` : ""}`,
            time: new Date(task.dateTime || now),
            icon: ClipboardCheck,
            iconColor: "text-red-700",
          }));

        return [...base, ...taskItems];
      })
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, 8);

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

  const rosterPreview = useMemo(
    () =>
      assignedStudents
        .slice()
        .sort((a, b) => {
          const aDate = toDate(a.createdAt)?.getTime() || 0;
          const bDate = toDate(b.createdAt)?.getTime() || 0;
          return bDate - aDate;
        })
        .slice(0, 5),
    [assignedStudents],
  );

  if (authLoading || isLoading) return <AuthLoadingSpinner />;

  return (
    <main role="main" aria-label="Trainer Dashboard" className="relative">
      <div className={`min-h-screen ${theme.background}`}>
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.45)_1px,transparent_0)] bg-[length:20px_20px]" />
        </div>

        <div className="relative mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
              <div className="rounded-[2rem] border border-red-100/80 bg-white/75 p-6 shadow-xl backdrop-blur-sm sm:p-8">
                <div className="inline-flex items-center gap-3 rounded-full border border-red-100 bg-red-50/90 px-4 py-2 text-sm font-medium text-red-700 shadow-sm">
                  <Sparkles className="h-4 w-4" />
                  Trainer workspace overview
                </div>

                <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-2xl">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                      Trainer dashboard for {trainerName}
                    </h1>
                    <p className="mt-3 text-base leading-7 text-gray-600">
                      Monitor student load, completion progress, and day-to-day
                      training activity from a single operational view.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-white px-4 py-4 shadow-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-red-700">
                        Active students
                      </p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">
                        {overview.activeStudents}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Students currently active in your roster
                      </p>
                    </div>
                    <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white px-4 py-4 shadow-sm">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-700">
                        Task completion
                      </p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">
                        {taskCompletionRate}%
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Based on completed vs assigned tasks
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/80 bg-white/75 p-6 shadow-xl backdrop-blur-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Link href="/user-profile" className="shrink-0">
                      {profileImage ? (
                        <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white shadow-md">
                          <Image
                            src={profileImage}
                            alt="Trainer Profile"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6B1516] via-[#8B1A1B] to-[#AB2F30] text-white shadow-md">
                          <User className="h-7 w-7" />
                        </div>
                      )}
                    </Link>

                    <div className="min-w-0">
                      <p className="text-sm font-medium uppercase tracking-[0.16em] text-gray-400">
                        Trainer profile
                      </p>
                      <p className="mt-1 truncate text-xl font-semibold text-gray-900">
                        {trainerName}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Last refresh: {formatDateTime(currentDateTime)}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={refreshDashboard}
                    disabled={isRefreshing}
                    title="Refresh dashboard"
                    className="rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-gray-50"
                  >
                    <RefreshCw
                      className={`h-4 w-4 text-red-700 ${isRefreshing ? "animate-spin" : ""}`}
                    />
                  </Button>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/90 px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                      Assigned courses
                    </p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      {overview.assignedCourses}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/90 px-4 py-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                      Recent additions
                    </p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      {overview.recentStudents}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-red-100 bg-red-50/80 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-red-700">
                        Performance note
                      </p>
                      <p className="mt-2 text-sm leading-6 text-gray-700">
                        {courseCompletionRate}% of your assigned courses are
                        already marked complete.
                      </p>
                    </div>
                    <TrendingUp className="mt-1 h-5 w-5 text-red-700" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Assigned Students"
              value={overview.totalStudents}
              change={`${overview.recentStudents} added this month`}
              trend={overview.recentStudents > 0 ? "up" : "down"}
              helper="Students connected to your courses"
              icon={<Users className="h-5 w-5 text-red-100" />}
              emphasis="primary"
            />
            <StatCard
              title="Active Students"
              value={overview.activeStudents}
              change={`${overview.monthlyGrowth}% monthly growth`}
              trend={overview.monthlyGrowth >= 0 ? "up" : "down"}
              helper="Current active learners under your guidance"
              icon={<GraduationCap className="h-5 w-5 text-red-100" />}
              emphasis="primary"
            />
            <StatCard
              title="Assigned Courses"
              value={overview.assignedCourses}
              change={`${overview.completedCourses} completed`}
              trend={overview.completedCourses > 0 ? "up" : "down"}
              helper="Total course loads across your roster"
              icon={<BookOpen className="h-5 w-5 text-red-700" />}
            />
            <StatCard
              title="Task Completion"
              value={`${overview.completedTasks}/${overview.totalTasks}`}
              change={`${Math.max(overview.totalTasks - overview.completedTasks, 0)} tasks pending`}
              trend={
                overview.completedTasks >=
                Math.max(overview.totalTasks - overview.completedTasks, 0)
                  ? "up"
                  : "down"
              }
              helper="Overall delivery progress for student tasks"
              icon={<CheckCircle2 className="h-5 w-5 text-red-700" />}
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.85fr)]">
            <Card className="overflow-hidden border-0 bg-white/55 shadow-xl backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle>Student Growth</CardTitle>
                    <CardDescription>
                      Assigned student additions across the last six months
                    </CardDescription>
                  </div>
                  <Badge
                    variant="secondary"
                    className="gap-1 bg-red-500/10 text-red-700"
                  >
                    <TrendingUp className="h-3.5 w-3.5" />
                    {overview.monthlyGrowth}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ChartContainer
                  config={chartConfig}
                  className="h-[320px] w-full"
                >
                  <AreaChart data={trend.length > 0 ? trend : fallbackTrend}>
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
                Growth reflects students newly attached to your trainer ID.
              </CardFooter>
            </Card>

            <Card className="overflow-hidden border-0 bg-white/55 shadow-xl backdrop-blur-sm">
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

          <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <Card className="border-0 bg-white/55 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Weekly Task Activity</CardTitle>
                <CardDescription>
                  Tasks recorded in the last seven days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={chartConfig}
                  className="h-[300px] w-full"
                >
                  <BarChart
                    data={
                      week.some((item) => item.tasks > 0) ? week : fallbackWeek
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
                      dataKey="tasks"
                      fill="#AB2F30"
                      radius={[6, 6, 0, 0]}
                      barSize={30}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/55 shadow-xl backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>Activity Feed</CardTitle>
                  <CardDescription>
                    Live updates from your recent student and task activity
                  </CardDescription>
                </div>
                <Link href="/trainer-dashboard/create-task">
                  <Button variant="ghost" size="sm">
                    Task board
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {activities.length > 0 ? (
                  <div className="space-y-6">
                    {activities.map((activity) => (
                      <ActionItem
                        key={activity.id}
                        name={activity.name}
                        description={activity.description}
                        time={formatRelativeTime(activity.time)}
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
                    <p>No recent trainer activity</p>
                    <p className="text-sm">Assigned updates will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Card className="border-0 bg-white/55 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Roster Snapshot</CardTitle>
                <CardDescription>
                  Recently added students in your assigned roster
                </CardDescription>
              </CardHeader>
              <CardContent>
                {rosterPreview.length > 0 ? (
                  <div className="space-y-3">
                    {rosterPreview.map((student) => {
                      const createdAt = toDate(student.createdAt);
                      const activeCourseCount = student.courses.filter(
                        (course) => course.trainerId === user?.uid,
                      ).length;

                      return (
                        <div
                          key={student.id}
                          className="rounded-2xl border border-gray-100 bg-white/80 px-4 py-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-medium text-gray-900">
                                {student.username}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {activeCourseCount} assigned course
                                {activeCourseCount === 1 ? "" : "s"}
                              </p>
                            </div>
                            <Badge
                              variant="secondary"
                              className="bg-gray-100 text-gray-700"
                            >
                              {(student.status || "active").toUpperCase()}
                            </Badge>
                          </div>
                          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                            <CalendarRange className="h-3.5 w-3.5" />
                            <span>
                              {createdAt
                                ? formatDateTime(createdAt)
                                : "Join date unavailable"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No assigned students yet.
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
  time,
  icon,
}: {
  name: string;
  description: string;
  time: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1">{icon}</div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none text-gray-900">{name}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="mt-1 text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  );
}
