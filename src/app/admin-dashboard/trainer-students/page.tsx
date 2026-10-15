"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Search,
  UserRound,
  Users,
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import AuthLoadingSpinner from "@/components/AuthLoadingSpinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Course = {
  name?: string;
  courseName?: string;
  level?: string;
  status?: string;
  completed?: boolean;
  trainerId?: string;
  trainerName?: string;
};

type Student = {
  id: string;
  name: string;
  prn?: string;
  email?: string;
  profileImage?: string;
  trainerId?: string;
  trainerName?: string;
  courses: Course[];
};

type Trainer = {
  id: string;
  name: string;
  email?: string;
  profileImage?: string;
};

const normalize = (value?: string) => (value || "").trim().toLowerCase();

const isCourseComplete = (course: Course) =>
  course.completed === true || normalize(course.status) === "complete";

const getTrainerCourses = (
  student: Student,
  trainer: Trainer,
  status: "ongoing" | "completed",
) => {
  const trainerName = normalize(trainer.name);
  return student.courses.filter(
    (course) =>
      (course.trainerId === trainer.id ||
        (!course.trainerId &&
          Boolean(course.trainerName) &&
          normalize(course.trainerName) === trainerName)) &&
      isCourseComplete(course) === (status === "completed"),
  );
};

export default function TrainerStudentsPage() {
  const { user, userRole, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const trainerIdFromQuery = searchParams.get("trainerId") || "";
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedTrainerId, setSelectedTrainerId] = useState("");
  const [trainerSearch, setTrainerSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [courseStatusFilter, setCourseStatusFilter] = useState<
    "ongoing" | "completed"
  >("ongoing");

  useEffect(() => {
    if (authLoading) return;
    if (!user || userRole !== "admin") {
      router.push("/login");
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [trainerSnapshot, studentSnapshot] = await Promise.all([
          getDocs(collection(db, "trainers")),
          getDocs(collection(db, "students")),
        ]);

        const loadedTrainers = trainerSnapshot.docs
          .map((item) => {
            const data = item.data();
            return {
              id: item.id,
              name:
                data.name ||
                data.fullName ||
                data.displayName ||
                data.username ||
                data.email ||
                "Unnamed trainer",
              email: data.email || "",
              profileImage:
                data.profileimage || data.imageUrls?.[0] || data.imageUrl || "",
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name));
        setTrainers(loadedTrainers);
        if (
          loadedTrainers.some((trainer) => trainer.id === trainerIdFromQuery)
        ) {
          setSelectedTrainerId(trainerIdFromQuery);
        }

        setStudents(
          studentSnapshot.docs.map((item) => {
            const data = item.data();
            return {
              id: item.id,
              name:
                data.fullName ||
                data.name ||
                data.username ||
                data.email?.split("@")[0] ||
                "Unnamed student",
              prn: String(data.PrnNumber || data.prnNumber || "").trim(),
              email: data.email || "",
              profileImage:
                data.profileimage || data.imageUrls?.[0] || data.imageUrl || "",
              trainerId: data.trainerId || "",
              trainerName: data.trainerName || "",
              courses: Array.isArray(data.courses)
                ? data.courses.filter(
                    (course: unknown): course is Course =>
                      Boolean(course) && typeof course === "object",
                  )
                : [],
            };
          }),
        );
      } catch (loadError) {
        console.error("Unable to load trainer student records:", loadError);
        setError(
          "Unable to load trainer and student records. Please refresh and try again.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, [authLoading, router, trainerIdFromQuery, user, userRole]);

  const courseStatusCounts = useMemo(
    () => ({
      ongoing: students.reduce(
        (total, student) =>
          total +
          student.courses.filter(
            (course) =>
              (Boolean(course.trainerId) || Boolean(course.trainerName)) &&
              !isCourseComplete(course),
          ).length,
        0,
      ),
      completed: students.reduce(
        (total, student) =>
          total +
          student.courses.filter(
            (course) =>
              (Boolean(course.trainerId) || Boolean(course.trainerName)) &&
              isCourseComplete(course),
          ).length,
        0,
      ),
    }),
    [students],
  );

  const studentCountByTrainer = useMemo(() => {
    const counts = new Map<string, number>();
    for (const trainer of trainers) {
      counts.set(
        trainer.id,
        students.filter(
          (student) =>
            getTrainerCourses(student, trainer, courseStatusFilter).length > 0,
        ).length,
      );
    }
    return counts;
  }, [students, trainers, courseStatusFilter]);

  const filteredTrainers = trainers.filter(
    (trainer) =>
      (studentCountByTrainer.get(trainer.id) || 0) > 0 &&
      `${trainer.name} ${trainer.email || ""}`
        .toLowerCase()
        .includes(trainerSearch.trim().toLowerCase()),
  );
  const selectedTrainer = trainers.find(
    (trainer) => trainer.id === selectedTrainerId,
  );
  const selectedTrainerStudents = useMemo(() => {
    if (!selectedTrainer) return [];
    return students
      .map((student) => {
        return {
          ...student,
          assignedCourses: getTrainerCourses(
            student,
            selectedTrainer,
            courseStatusFilter,
          ),
        };
      })
      .filter((student) => student.assignedCourses.length > 0)
      .filter((student) =>
        `${student.name} ${student.prn || ""} ${student.email || ""} ${student.assignedCourses
          .map((course) => course.name || course.courseName || "")
          .join(" ")}`
          .toLowerCase()
          .includes(studentSearch.trim().toLowerCase()),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [courseStatusFilter, selectedTrainer, students, studentSearch]);

  if (authLoading || isLoading) return <AuthLoadingSpinner />;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-orange-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Trainer Course Progress
            </h1>
            <p className="mt-1 text-gray-600">
              Filter by ongoing or completed courses, then select a trainer to
              view their students.
            </p>
          </div>
          <Link href="/admin-dashboard">
            <Button
              variant="outline"
              className="rounded-full border-red-200 bg-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Admin dashboard
            </Button>
          </Link>
        </div>

        {error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-4 text-sm text-red-800">
              {error}
            </CardContent>
          </Card>
        ) : null}

        <div
          className="flex w-full gap-2 sm:w-auto"
          aria-label="Filter trainers by course status"
        >
          <Button
            type="button"
            variant={courseStatusFilter === "ongoing" ? "default" : "outline"}
            aria-pressed={courseStatusFilter === "ongoing"}
            onClick={() => {
              setCourseStatusFilter("ongoing");
              setStudentSearch("");
            }}
            className={
              courseStatusFilter === "ongoing"
                ? "flex-1 rounded-full bg-red-800 text-white hover:bg-red-900 sm:flex-none"
                : "flex-1 rounded-full border-red-200 text-red-800 sm:flex-none"
            }
          >
            Ongoing
          </Button>
          <Button
            type="button"
            variant={courseStatusFilter === "completed" ? "default" : "outline"}
            aria-pressed={courseStatusFilter === "completed"}
            onClick={() => {
              setCourseStatusFilter("completed");
              setStudentSearch("");
            }}
            className={
              courseStatusFilter === "completed"
                ? "flex-1 rounded-full bg-red-800 text-white hover:bg-red-900 sm:flex-none"
                : "flex-1 rounded-full border-red-200 text-red-800 sm:flex-none"
            }
          >
            Completed
          </Button>
        </div>

        {!selectedTrainer ? (
          <Card className="border-0 bg-white/75 shadow-xl backdrop-blur-sm">
            <CardHeader>
              <CardTitle>
                {courseStatusFilter === "completed"
                  ? "Trainers with Completed Courses"
                  : "Trainers with Ongoing Courses"}
              </CardTitle>
              <CardDescription>
                Select a trainer to see the students in this course status.
              </CardDescription>
              <div className="relative pt-2">
                <Search className="pointer-events-none absolute left-3 top-5 h-4 w-4 text-gray-400" />
                <Input
                  value={trainerSearch}
                  onChange={(event) => setTrainerSearch(event.target.value)}
                  placeholder="Search trainers..."
                  aria-label="Search trainers"
                  className="rounded-full bg-white pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              {filteredTrainers.length > 0 ? (
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredTrainers.map((trainer) => (
                    <li key={trainer.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTrainerId(trainer.id);
                          setStudentSearch("");
                        }}
                        className="flex w-full items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                      >
                        {trainer.profileImage ? (
                          <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-100">
                            <Image
                              src={trainer.profileImage}
                              alt=""
                              fill
                              sizes="48px"
                              className="object-cover"
                              unoptimized
                            />
                          </span>
                        ) : (
                          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-700">
                            <UserRound className="h-6 w-6" />
                          </span>
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold text-gray-900">
                            {trainer.name}
                          </span>
                          <span className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                            <Users className="h-4 w-4" />
                            {studentCountByTrainer.get(trainer.id) || 0}{" "}
                            students
                          </span>
                          <span className="mt-1 block truncate text-xs text-gray-500">
                            {Array.from(
                              new Set(
                                students.flatMap((student) =>
                                  getTrainerCourses(
                                    student,
                                    trainer,
                                    courseStatusFilter,
                                  ).map(
                                    (course) =>
                                      `${course.name || course.courseName || "Course"}${course.level ? ` · Level ${course.level}` : ""}`,
                                  ),
                                ),
                              ),
                            )
                              .slice(0, 2)
                              .join(", ") || "Course"}
                          </span>
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-red-700" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-8 text-center text-sm text-gray-500">
                  {trainerSearch.trim()
                    ? "No trainers match your search."
                    : `No trainers have ${courseStatusFilter} courses.`}
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 bg-white/75 shadow-xl backdrop-blur-sm">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setSelectedTrainerId("");
                    router.replace("/admin-dashboard/trainer-students");
                  }}
                  className="-ml-3 mb-2 text-red-800 hover:bg-red-50 hover:text-red-900"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  All trainers
                </Button>
                <CardTitle>{selectedTrainer.name}</CardTitle>
                <CardDescription className="mt-1 flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {studentCountByTrainer.get(selectedTrainer.id) || 0} students
                  with {courseStatusFilter} courses
                  {selectedTrainer.email ? ` · ${selectedTrainer.email}` : ""}
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={studentSearch}
                  onChange={(event) => setStudentSearch(event.target.value)}
                  placeholder="Search students or courses..."
                  aria-label="Search this trainer's students"
                  className="rounded-full bg-white pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              {selectedTrainerStudents.length > 0 ? (
                <ul className="max-h-[32rem] divide-y divide-gray-100 overflow-y-auto pr-2">
                  {selectedTrainerStudents.map((student) => (
                    <li
                      key={student.id}
                      className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {student.profileImage ? (
                          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-gray-100">
                            <Image
                              src={student.profileImage}
                              alt=""
                              fill
                              sizes="44px"
                              className="object-cover"
                              unoptimized
                            />
                          </span>
                        ) : (
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-700">
                            <UserRound className="h-5 w-5" />
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-gray-900">
                            {student.name}
                          </span>
                          <span className="block truncate text-sm text-gray-600">
                            {student.prn
                              ? `PRN ${student.prn}`
                              : student.email || "PRN unavailable"}
                          </span>
                          <span className="mt-1 flex flex-wrap gap-1.5">
                            {student.assignedCourses.map((course, index) => {
                              const completed = isCourseComplete(course);
                              return (
                                <Badge
                                  key={`${course.name || course.courseName || "course"}-${index}`}
                                  className={
                                    completed
                                      ? "border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-50"
                                      : "border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-50"
                                  }
                                >
                                  <BookOpen className="mr-1 h-3 w-3" />
                                  {course.name ||
                                    course.courseName ||
                                    "Course"}{" "}
                                  · {completed ? "Completed" : "Ongoing"}
                                </Badge>
                              );
                            })}
                          </span>
                        </span>
                      </div>
                      {student.prn ? (
                        <Link
                          href={`/${encodeURIComponent(student.prn)}`}
                          className="inline-flex items-center gap-1 self-start text-sm font-semibold text-red-800 hover:text-red-900 sm:self-auto"
                        >
                          View student details
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      ) : (
                        <span className="text-xs text-gray-500">
                          Student PRN unavailable
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-xl border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500">
                  No students found for this trainer.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
