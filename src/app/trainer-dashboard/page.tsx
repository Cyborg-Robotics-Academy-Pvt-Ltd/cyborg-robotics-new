"use client";

import { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  MoreVertical,
  RefreshCw,
  Sparkles,
  TrendingUp,
  User,
  Users,
  Video,
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

type Course = { status?: string; completed?: boolean; trainerId?: string };
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
  background: "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100",
  cardBg: "bg-white/70 backdrop-blur-sm",
  textPrimary: "text-gray-900",
  textSecondary: "text-gray-600",
  textMuted: "text-gray-500",
  shadow: "shadow-lg",
  hoverShadow: "hover:shadow-2xl",
};

const chartConfig = {
  students: { label: "Students", color: "hsl(var(--primary))" },
  tasks: { label: "Tasks", color: "#2563eb" },
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
  if (typeof value === "object" && "toDate" in value && value.toDate)
    return value.toDate();
  return null;
};

const formatRelativeTime = (date: Date) => {
  const minutesAgo = Math.ceil((Date.now() - date.getTime()) / 60000);
  const hoursAgo = Math.floor(minutesAgo / 60);
  const daysAgo = Math.floor(hoursAgo / 24);
  if (daysAgo > 0) return daysAgo === 1 ? "1 day ago" : `${daysAgo} days ago`;
  if (hoursAgo > 0) return `${hoursAgo} hr${hoursAgo !== 1 ? "s" : ""} ago`;
  return `${minutesAgo} min${minutesAgo !== 1 ? "s" : ""} ago`;
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
      icon: any;
      iconColor: string;
    }>
  >([]);

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

    const assignedStudents = students.filter((student) =>
      student.courses.some((course) => course.trainerId === user.uid),
    );
    const assignedCourses = assignedStudents.flatMap((student) =>
      student.courses.filter((course) => course.trainerId === user.uid),
    );
    const tasks = assignedStudents.flatMap((student) => student.tasks);
    const completedTasks = tasks.filter(
      (task) => (task.status || "").toLowerCase() === "complete",
    );
    const completedCourses = assignedCourses.filter(
      (course) =>
        course.completed || (course.status || "").toLowerCase() === "complete",
    );
    const recentCutoff = new Date();
    recentCutoff.setDate(recentCutoff.getDate() - 30);
    const recentStudents = assignedStudents.filter((student) => {
      const createdAt = toDate(student.createdAt);
      return createdAt ? createdAt >= recentCutoff : false;
    });

    setOverview({
      totalStudents: assignedStudents.length,
      activeStudents: assignedStudents.filter(
        (student) => (student.status || "").toLowerCase() === "active",
      ).length,
      assignedCourses: assignedCourses.length,
      completedCourses: completedCourses.length,
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      recentStudents: recentStudents.length,
      monthlyGrowth: Math.round(
        (recentStudents.length /
          Math.max(assignedStudents.length - recentStudents.length, 1)) *
          100,
      ),
    });

    const trendData: Array<{ month: string; students: number }> = [];
    for (let i = 5; i >= 0; i--) {
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
        students: assignedStudents.filter((student) => {
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
        value: Math.max(assignedCourses.length - completedCourses.length, 0),
        color: "#3b82f6",
      },
      {
        name: "Pending Tasks",
        value: Math.max(tasks.length - completedTasks.length, 0),
        color: "#f59e0b",
      },
    ]);

    const feed = assignedStudents
      .flatMap((student) => {
        const registrationTime = toDate(student.createdAt);
        const base = registrationTime
          ? [
              {
                id: `${student.id}-registration`,
                name: "Student assigned",
                description: `${student.username} has been assigned to trainer ${trainerName}`,
                time: registrationTime,
                icon: GraduationCap,
                iconColor: "text-emerald-600",
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
            iconColor: "text-blue-600",
          }));
        return [...base, ...taskItems];
      })
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, 8);
    setActivities(feed);
  }, [trainerName, user]);

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

  if (authLoading || isLoading) return <AuthLoadingSpinner />;

  const cards = [
    {
      title: "Student Record",
      description: "Review students assigned to your courses.",
      href: "/student-list",
      icon: Users,
      gradient: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-50",
      iconBg: "bg-gradient-to-br from-emerald-100 to-emerald-200",
      textColor: "text-emerald-600",
      hoverColor: "group-hover:text-emerald-600",
      action: "Open roster",
      delay: 0.1,
    },
    {
      title: "Media Section",
      description: "Manage student media and gallery content.",
      href: "/media",
      icon: Video,
      gradient: "from-blue-500 to-indigo-500",
      bgColor: "bg-blue-50",
      iconBg: "bg-gradient-to-br from-blue-100 to-blue-200",
      textColor: "text-blue-600",
      hoverColor: "group-hover:text-blue-600",
      action: "Open media",
      delay: 0.2,
    },
  ];

  return (
    <>
      <Head>
        <title>Trainer Dashboard | Cyborg Robotics Academy</title>
      </Head>
      <main role="main" aria-label="Trainer Dashboard" className="relative">
        <div className={`min-h-screen ${theme.background}`}>
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.4)_1px,transparent_0)] bg-[length:20px_20px]" />
          </div>
          <div className="relative w-full mx-auto py-8 px-4 sm:px-6 lg:px-8 ">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-10"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div
                    className={`inline-flex items-center gap-3 px-4 py-2 rounded-full ${theme.cardBg} ${theme.shadow} mb-4`}
                  >
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span
                      className={`text-sm font-medium ${theme.textSecondary}`}
                    >
                      Trainer workspace
                    </span>
                  </div>

                  <p className={`mt-2 text-base ${theme.textSecondary}`}>
                    Track your students, course load, and task flow from one
                    place.
                  </p>
                </div>
                <div
                  className={`flex items-center gap-4 rounded-3xl px-5 py-4 ${theme.cardBg} ${theme.shadow}`}
                >
                  <Link href="/user-profile" className="shrink-0">
                    {profileImage ? (
                      <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm">
                        <Image
                          src={profileImage}
                          alt="Trainer Profile"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                        <User className="w-6 h-6" />
                      </div>
                    )}
                  </Link>
                  <div className="min-w-0">
                    <p className={`font-semibold ${theme.textPrimary}`}>
                      {trainerName}
                    </p>
                    <p className={`text-sm ${theme.textSecondary}`}>
                      {currentDateTime.toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={refreshDashboard}
                    disabled={isRefreshing}
                    title="Refresh dashboard"
                  >
                    <RefreshCw
                      className={`h-4 w-4 text-blue-600 ${isRefreshing ? "animate-spin" : ""}`}
                    />
                  </Button>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
              <StatCard
                title="Assigned Students"
                value={overview.totalStudents}
                change={`${overview.recentStudents} new in 30 days`}
                trend={overview.recentStudents > 0 ? "up" : "down"}
                icon={<Users className="h-5 w-5 text-blue-600" />}
              />
              <StatCard
                title="Active Students"
                value={overview.activeStudents}
                change={`${overview.monthlyGrowth}% monthly growth`}
                trend={overview.monthlyGrowth >= 0 ? "up" : "down"}
                icon={<GraduationCap className="h-5 w-5 text-emerald-600" />}
              />
              <StatCard
                title="Assigned Courses"
                value={overview.assignedCourses}
                change={`${overview.completedCourses} completed`}
                trend={overview.completedCourses > 0 ? "up" : "down"}
                icon={<BookOpen className="h-5 w-5 text-violet-600" />}
              />
              <StatCard
                title="Task Completion"
                value={`${overview.completedTasks}/${overview.totalTasks}`}
                change={`${Math.max(overview.totalTasks - overview.completedTasks, 0)} pending`}
                trend={
                  overview.completedTasks >=
                  Math.max(overview.totalTasks - overview.completedTasks, 0)
                    ? "up"
                    : "down"
                }
                icon={<CheckCircle2 className="h-5 w-5 text-amber-600" />}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
              <Card className="xl:col-span-2 bg-white/50 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Student Growth</CardTitle>
                      <CardDescription>
                        Assigned student additions across recent months
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="gap-1">
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
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#trainerGrowth)"
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
                <CardFooter className="pt-4 text-sm text-muted-foreground">
                  Growth reflects students attached to your assigned courses.
                </CardFooter>
              </Card>

              <Card className="bg-white/50 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle>Workload Mix</CardTitle>
                  <CardDescription>
                    Completion and pending work balance
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
                      <ChartTooltip
                        content={<ChartTooltipContent hideLabel />}
                      />
                    </PieChart>
                  </ChartContainer>
                  <div className="grid grid-cols-1 gap-3 w-full mt-4">
                    {mix.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white/70 px-3 py-2"
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

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-12">
              <Card className="bg-white/50 backdrop-blur-sm shadow-lg">
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
                        week.some((item) => item.tasks > 0)
                          ? week
                          : fallbackWeek
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
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                        barSize={30}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/50 backdrop-blur-sm shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Latest changes across your roster
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
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
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No recent trainer activity</p>
                      <p className="text-sm">
                        Assigned updates will appear here
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Quick Access
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                  {cards.map((card) => (
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
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative ${theme.cardBg} rounded-3xl ${theme.shadow} ${theme.hoverShadow} transition-all duration-200 h-full overflow-hidden`}
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-200`}
                        />
                        <div className="relative p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div
                              className={`p-4 rounded-2xl ${card.iconBg} shadow-sm group-hover:shadow-md transition-all duration-200`}
                            >
                              <card.icon
                                className={`h-7 w-7 ${card.textColor}`}
                              />
                            </div>
                            <Sparkles className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
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
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="mt-16 text-center"
            >
              <p className={`text-sm ${theme.textMuted}`}>
                © {currentDateTime.getFullYear()} Cyborg Robotics Academy.
              </p>
              <p className={`text-xs ${theme.textMuted} mt-1`}>
                Current Date & Time: {currentDateTime.toLocaleString()}
              </p>
            </motion.div>
          </div>
        </div>
      </main>
    </>
  );
}

function StatCard({
  title,
  value,
  change,
  icon,
  trend,
}: {
  title: string;
  value: string | number;
  change: string;
  icon: React.ReactNode;
  trend: "up" | "down";
}) {
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
        <p className="text-xs text-muted-foreground mt-1">{time}</p>
      </div>
    </div>
  );
}
