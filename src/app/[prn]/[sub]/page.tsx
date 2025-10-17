"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "../../../lib/auth-context";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  ClipboardCheck,
  BookOpen,
  User,
  Mail,
  GraduationCap,
  Calendar,
  CheckSquare,
  ArrowLeftCircle,
  Trophy,
  Hash,
} from "lucide-react";
import { Checkbox } from "../../../components/ui/checkbox";
import Head from "next/head";
import { toast } from "react-hot-toast";

// Task type
interface Task {
  course: string;
  task: string;
  dateTime: string;
  status: string;
}

// Student type
interface Student {
  id: string;
  PrnNumber: string;
  username: string;
  email: string;
  classes?: string;
  createdAt?: Date | null;
  createdBy?: string;
  createdByRole?: string;
  lastLogin?: Date | null;
  role?: string;
  tasks?: Task[];
  courses?: {
    name: string;
    level: string;
    classNumber: string;
    completed?: boolean;
    certificate?: boolean;
  }[];
  nextCourse?: string;
}

// Helper to convert slug to course name and level
function fromSlug(slug: string) {
  if (!slug) return "";

  // First, normalize the slug
  let normalized = slug.trim().toLowerCase();

  // Check if the slug contains level information
  const levelMatch = normalized.match(/-level-(\d+)$/);
  const levelTextMatch = normalized.match(
    /-level-(beginner|intermediate|advanced|expert)$/
  );
  let level = "";
  if (levelMatch) {
    level = levelMatch[1];
    // Remove the level part from the slug for course name processing
    normalized = normalized.replace(/-level-\d+$/, "");
  } else if (levelTextMatch) {
    level = levelTextMatch[1];
    // Remove the level part from the slug for course name processing
    normalized = normalized.replace(
      /-level-(beginner|intermediate|advanced|expert)$/,
      ""
    );
  }

  // Convert back to readable course name
  let courseName = normalized
    .replace(/-/g, " ")
    .replace(/\band\b/gi, "&")
    .replace(/\bplus\b/gi, "+")
    .trim();

  // Handle specific course name patterns
  courseName = courseName
    .replace(/\bweb\b/gi, "Web")
    .replace(/\bjava\b/gi, "Java")
    .replace(/\bpython\b/gi, "Python")
    .replace(/\biot\b/gi, "IoT")
    .replace(/\bev3\b/gi, "EV3")
    .replace(/\b3d\b/gi, "3D")
    .replace(/\bapp\b/gi, "App")
    .replace(/\bai\b/gi, "AI")
    .replace(/\bdsa\b/gi, "DSA")
    .replace(/\bml\b/gi, "ML")
    .replace(/\bhtml\b/gi, "HTML")
    .replace(/\bdesigning\b/gi, "Designing")
    .replace(/\bcoding\b/gi, "Coding")
    .replace(/\banimation\b/gi, "Animation")
    .replace(/\bprinting\b/gi, "Printing")
    .replace(/\brobotics\b/gi, "Robotics")
    .replace(/\bmachine\b/gi, "Machine")
    .replace(/\bmachines\b/gi, "Machines")
    .replace(/\bsimple\b/gi, "Simple")
    .replace(/\bpowered\b/gi, "Powered")
    .replace(/\bpneumatics\b/gi, "Pneumatics")
    .replace(/\bprime\b/gi, "Prime")
    .replace(/\bessential\b/gi, "Essential")
    .replace(/\bstudio\b/gi, "Studio")
    .replace(/\blab\b/gi, "Lab")
    .replace(/\bintelligence\b/gi, "Intelligence")
    .replace(/\blearning\b/gi, "Learning")
    .replace(/\bthings\b/gi, "Things")
    .replace(/\bearly\b/gi, "Early")
    .replace(/\bbambino\b/gi, "Bambino")
    .replace(/\bandroid\b/gi, "Android")
    .replace(/\bartificial\b/gi, "Artificial")
    .replace(/\bmachine\b/gi, "Machine")
    .replace(/\bdeep\b/gi, "Deep")
    .replace(/\bdata\b/gi, "Data")
    .replace(/\bstructure\b/gi, "Structure")
    .replace(/\balgorithm\b/gi, "Algorithm")
    .replace(/\bstructures\b/gi, "Structures")
    .replace(/\balgorithms\b/gi, "Algorithms");

  // Clean up multiple spaces
  courseName = courseName.replace(/\s+/g, " ").trim();

  // Add level to course name if it exists
  if (level) {
    // Convert text levels back to numeric format to match database
    let numericLevel = level;
    if (level === "beginner") numericLevel = "1";
    else if (level === "intermediate") numericLevel = "2";
    else if (level === "advanced") numericLevel = "3";
    else if (level === "expert") numericLevel = "4";

    courseName += ` Level ${numericLevel}`;
  }

  return courseName;
}

function getLevelColor(level: string) {
  switch (level.toLowerCase()) {
    case "1":
    case "beginner":
      return "bg-green-50 text-green-700 border-green-200";
    case "2":
    case "intermediate":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "3":
    case "advanced":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "4":
    case "expert":
      return "bg-orange-50 text-orange-700 border-orange-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

function getLevelLabel(level: string) {
  switch (level.toLowerCase()) {
    case "1":
    case "beginner":
      return "Beginner";
    case "2":
    case "intermediate":
      return "Intermediate";
    case "3":
    case "advanced":
      return "Advanced";
    case "4":
    case "expert":
      return "Expert";
    default:
      return `Level ${level}`;
  }
}

// Helper function to extract course name and level from a full course string
function extractCourseAndLevel(courseString: string): {
  courseName: string;
  level: string | null;
} {
  if (!courseString) return { courseName: "", level: null };

  const normalized = courseString.trim().toLowerCase();

  // First check for pipe-separated format (e.g., "3D Printing|1")
  const pipeMatch = courseString.match(/^(.+?)\|(\d+)$/);
  if (pipeMatch) {
    return {
      courseName: pipeMatch[1].trim(),
      level: pipeMatch[2],
    };
  }

  // Check for level patterns in URL format
  const levelMatch = normalized.match(/\blevel\s*(\d+)\b/i);
  const levelTextMatch = normalized.match(
    /\blevel\s*(beginner|intermediate|advanced|expert)\b/i
  );

  let level = null;
  if (levelMatch) {
    level = levelMatch[1];
  } else if (levelTextMatch) {
    level = levelTextMatch[1];
  }

  // Remove level from course name
  const courseName = courseString
    .replace(/\s+Level\s+\d+\b/gi, "")
    .replace(/\s+Level\s+(beginner|intermediate|advanced|expert)\b/gi, "")
    .trim();

  return { courseName, level };
}

// Helper function to compare course name and level strictly
function isSameCourseAndLevel(
  aName: string,
  aLevel: string | null,
  bName: string,
  bLevel: string | null
) {
  return (
    aName.toLowerCase().trim() === bName.toLowerCase().trim() &&
    String(aLevel || "")
      .toLowerCase()
      .trim() ===
      String(bLevel || "")
        .toLowerCase()
        .trim()
  );
}

const STATUS_COLORS: Record<string, string> = {
  complete: "#10B981",
  ongoing: "#FBBF24",
  "in progress": "#FBBF24",
  pending: "#6366F1",
};

const Page = ({
  params,
}: {
  params: Promise<{ prn: string; sub: string }>;
}) => {
  // Resolve params synchronously not available; add a quick guard when available
  const { userRole } = useAuth();
  const [resolvedParams, setResolvedParams] = useState<{
    prn: string;
    sub: string;
  } | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusData, setStatusData] = useState<
    { name: string; value: number }[]
  >([]);
  const [barData, setBarData] = useState<
    { date: string; complete: number; ongoing: number }[]
  >([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [assignedClasses, setAssignedClasses] = useState<string | number>(
    "N/A"
  );
  const [activeTab, setActiveTab] = useState<number>(0);
  const [courseLevel, setCourseLevel] = useState("");
  const [classNumber, setClassNumber] = useState("");
  const [isCourseCompleted, setIsCourseCompleted] = useState(false);
  const [isCertificateIssued, setIsCertificateIssued] = useState(false);
  const [nextCourseInput, setNextCourseInput] = useState("");
  const [isEditingNextCourse, setIsEditingNextCourse] = useState(false);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  // Debug Firebase connection
  useEffect(() => {
    console.log("Firebase db object:", db);
    console.log("Firebase configuration check:", {
      hasDb: !!db,
      dbType: typeof db,
    });
  }, []);

  const courseName = resolvedParams ? fromSlug(resolvedParams.sub) : "";

  // Not found guards once params are resolved - moved to render phase to avoid conditional hooks
  const shouldShowNotFound =
    resolvedParams &&
    (!/^\d+$/.test(resolvedParams.prn) || !resolvedParams.sub || !courseName);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!resolvedParams) return;

      const { prn } = resolvedParams;

      // Validate PRN is numeric
      if (!/^\d+$/.test(prn)) {
        setError("Invalid PRN format");
        setLoading(false);
        return;
      }

      try {
        const studentsRef = collection(db, "students");
        const q = query(studentsRef, where("PrnNumber", "==", prn));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError("Student not found");
          setLoading(false);
          return;
        }

        const studentData = querySnapshot.docs[0].data() as Student;
        const studentId = querySnapshot.docs[0].id;
        setStudent({ ...studentData, id: studentId });

        // Find the specific course
        const course = studentData.courses?.find((c) => {
          const { courseName: currentCourseName, level: currentLevel } =
            extractCourseAndLevel(c.name);

          const { courseName: targetCourseName, level: targetLevel } =
            extractCourseAndLevel(courseName);

          return isSameCourseAndLevel(
            currentCourseName,
            currentLevel,
            targetCourseName,
            targetLevel
          );
        });

        if (course) {
          setCourseLevel(course.level);
          setClassNumber(course.classNumber || "N/A");
          setIsCourseCompleted(!!course.completed);
          setIsCertificateIssued(!!course.certificate);
        }

        // Process tasks
        const courseTasks =
          studentData.tasks?.filter(
            (task) => task.course.toLowerCase() === courseName.toLowerCase()
          ) || [];

        setCompletedTasks(
          courseTasks.filter((task) => task.status.toLowerCase() === "complete")
        );

        // Calculate assigned classes
        const assignedClassesCount = courseTasks.length;
        setAssignedClasses(
          assignedClassesCount > 0 ? assignedClassesCount : "N/A"
        );

        // Prepare status data
        const statusCounts: Record<string, number> = {};
        courseTasks.forEach((task) => {
          const status = task.status.toLowerCase();
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        const statusDataArray = Object.entries(statusCounts).map(
          ([name, value]) => ({ name, value })
        );
        setStatusData(statusDataArray);

        // Prepare bar chart data
        const taskDates = courseTasks.map((task) => {
          const date = new Date(task.dateTime);
          return date.toISOString().split("T")[0]; // YYYY-MM-DD format
        });

        const uniqueDates = [...new Set(taskDates)].sort();
        const barDataArray = uniqueDates.map((date) => {
          const tasksOnDate = courseTasks.filter(
            (task) =>
              new Date(task.dateTime).toISOString().split("T")[0] === date
          );
          const completeCount = tasksOnDate.filter(
            (task) => task.status.toLowerCase() === "complete"
          ).length;
          const ongoingCount = tasksOnDate.filter(
            (task) =>
              task.status.toLowerCase() === "ongoing" ||
              task.status.toLowerCase() === "in progress"
          ).length;
          return { date, complete: completeCount, ongoing: ongoingCount };
        });

        setBarData(barDataArray);
      } catch (err) {
        console.error("Error fetching student data:", err);
        setError("Failed to load student data");
      } finally {
        setLoading(false);
      }
    };

    if (resolvedParams && !shouldShowNotFound) {
      fetchStudentData();
    }
  }, [resolvedParams, courseName, shouldShowNotFound]);

  const handleCompletedChange = async (checked: boolean | "indeterminate") => {
    if (!student) return;

    const newCompletedState = checked === true;

    try {
      const studentRef = doc(db, "students", student.id);
      const updatedCourses = student.courses?.map((course) => {
        if (!course.name) return course;

        // Extract course name and level from URL
        const { courseName: currentCourseName, level: currentLevel } =
          extractCourseAndLevel(courseName);

        // Compare course names and levels
        const courseNameMatches =
          course.name.toLowerCase().trim() ===
          currentCourseName.toLowerCase().trim();
        const levelMatches = course.level === currentLevel;

        // Course matches if both name and level match
        if (courseNameMatches && levelMatches) {
          return {
            ...course,
            completed: newCompletedState,
          };
        }

        return course;
      });

      await updateDoc(studentRef, { courses: updatedCourses });

      // Update local state after successful database update
      setStudent((prev) =>
        prev ? { ...prev, courses: updatedCourses } : null
      );
      setIsCourseCompleted(newCompletedState);
      toast.success(
        newCompletedState
          ? "Course marked as completed!"
          : "Course marked as ongoing!"
      );
    } catch (error) {
      console.error(
        "[Checkbox] Error updating course completion status:",
        error
      );
      toast.error("Failed to update course status");
    }
  };

  const handleCertificateChange = async (
    checked: boolean | "indeterminate"
  ) => {
    if (!student) return;

    const newCertificateState = checked === true;

    try {
      const studentRef = doc(db, "students", student.id);
      const updatedCourses = student.courses?.map((course) => {
        if (!course.name) return course;

        // Extract course name and level from URL
        const { courseName: currentCourseName, level: currentLevel } =
          extractCourseAndLevel(courseName);

        // Compare course names and levels
        const courseNameMatches =
          course.name.toLowerCase().trim() ===
          currentCourseName.toLowerCase().trim();
        const levelMatches = course.level === currentLevel;

        // Course matches if both name and level match
        if (courseNameMatches && levelMatches) {
          return {
            ...course,
            certificate: newCertificateState,
          };
        }

        return course;
      });

      await updateDoc(studentRef, { courses: updatedCourses });

      // Update local state after successful database update
      setStudent((prev) =>
        prev ? { ...prev, courses: updatedCourses } : null
      );
      setIsCertificateIssued(newCertificateState);
      toast.success(
        newCertificateState
          ? "Certificate issued!"
          : "Certificate status updated!"
      );
    } catch (error) {
      console.error("[Checkbox] Error updating certificate status:", error);
      toast.error("Failed to update certificate status");
    }
  };

  const handleNextCourseSave = async () => {
    if (!student || !nextCourseInput.trim()) return;

    try {
      const studentRef = doc(db, "students", student.id);
      await updateDoc(studentRef, { nextCourse: nextCourseInput.trim() });
      setStudent((prev) =>
        prev ? { ...prev, nextCourse: nextCourseInput.trim() } : null
      );
      toast.success("Next course updated!");
      setIsEditingNextCourse(false);
    } catch (error) {
      console.error("[NextCourse] Error updating next course:", error);
      toast.error("Failed to update next course");
    }
  };

  const handleNextCourseEdit = () => {
    if (student?.nextCourse) {
      setNextCourseInput(student.nextCourse);
    }
    setIsEditingNextCourse(true);
  };

  const handleNextCourseCancel = () => {
    setIsEditingNextCourse(false);
    setNextCourseInput("");
  };

  // Show notFound after all hooks have been called
  if (shouldShowNotFound) {
    notFound();
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading student data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Student Not Found
          </h3>
          <p className="text-gray-600">
            No student found with the provided PRN.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>
          {student.username} - {courseName} | Cyborg Robotics Academy
        </title>
        <meta
          name="description"
          content={`Course details for ${courseName} - ${student.username}`}
        />
      </Head>
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href={`/${student.PrnNumber}`}
              className="inline-flex items-center text-red-600 hover:text-red-800 transition-colors"
            >
              <ArrowLeftCircle className="w-5 h-5 mr-2" />
              Back to Student Profile
            </Link>
          </div>

          {/* Student Info Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {student.username}
                  </h1>
                  <div className="flex items-center mt-1">
                    <User className="w-4 h-4 text-gray-500 mr-1" />
                    <span className="text-gray-600 text-sm">
                      PRN: {student.PrnNumber}
                    </span>
                  </div>
                  <div className="flex items-center mt-1">
                    <Mail className="w-4 h-4 text-gray-500 mr-1" />
                    <span className="text-gray-600 text-sm">
                      {student.email || "No email provided"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="bg-red-50 rounded-lg px-4 py-2">
                  <div className="text-red-800 text-sm font-medium">Course</div>
                  <div className="text-red-600 font-bold">{courseName}</div>
                </div>
                <div className="bg-blue-50 rounded-lg px-4 py-2">
                  <div className="text-blue-800 text-sm font-medium">
                    Assigned Classes
                  </div>
                  <div className="text-blue-600 font-bold">
                    {assignedClasses}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Details and Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 sm:mb-0">
                  {courseName}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getLevelColor(
                      courseLevel
                    )}`}
                  >
                    <Trophy className="w-4 h-4 mr-1" />
                    {getLevelLabel(courseLevel)}
                  </div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
                    <Hash className="w-4 h-4 mr-1" />
                    Class: {classNumber}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Completion Status */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">Completion</h3>
                    <Checkbox
                      checked={isCourseCompleted}
                      onCheckedChange={handleCompletedChange}
                      disabled={userRole !== "admin" && userRole !== "trainer"}
                    />
                  </div>
                  <div className="flex items-center">
                    <CheckSquare className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-gray-600">
                      {isCourseCompleted ? "Completed" : "Not completed"}
                    </span>
                  </div>
                </div>

                {/* Certificate Status */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">Certificate</h3>
                    <Checkbox
                      checked={isCertificateIssued}
                      onCheckedChange={handleCertificateChange}
                      disabled={userRole !== "admin" && userRole !== "trainer"}
                    />
                  </div>
                  <div className="flex items-center">
                    <GraduationCap className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-gray-600">
                      {isCertificateIssued ? "Issued" : "Not issued"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Course */}
              <div className="mt-6 bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Next Course</h3>
                  {userRole === "admin" || userRole === "trainer" ? (
                    isEditingNextCourse ? (
                      <div className="flex gap-2">
                        <button
                          onClick={handleNextCourseSave}
                          className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleNextCourseCancel}
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleNextCourseEdit}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                      >
                        Edit
                      </button>
                    )
                  ) : null}
                </div>
                {isEditingNextCourse ? (
                  <input
                    type="text"
                    value={nextCourseInput}
                    onChange={(e) => setNextCourseInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Enter next course name"
                  />
                ) : (
                  <div className="flex items-center">
                    <BookOpen className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-gray-600">
                      {student.nextCourse || "Not set"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Summary */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Progress Overview
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">
                    Task Status Distribution
                  </h3>
                  {statusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => {
                            const percentValue =
                              typeof percent === "number" ? percent : 0;
                            return `${name} ${(percentValue * 100).toFixed(0)}%`;
                          }}
                        >
                          {statusData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                STATUS_COLORS[entry.name.toLowerCase()] ||
                                "#8884d8"
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No task data available
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">
                    Activity Timeline
                  </h3>
                  {barData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={barData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="complete"
                          fill="#10B981"
                          name="Complete"
                        />
                        <Bar
                          dataKey="ongoing"
                          fill="#FBBF24"
                          name="In Progress"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No activity data available
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tasks Section */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Assigned Classes
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab(0)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    activeTab === 0
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All ({assignedClasses})
                </button>
                <button
                  onClick={() => setActiveTab(1)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    activeTab === 1
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Completed (
                  {
                    completedTasks.filter(
                      (task) => task.status.toLowerCase() === "complete"
                    ).length
                  }
                  )
                </button>
              </div>
            </div>

            {activeTab === 0 ? (
              <div>
                {student.tasks &&
                student.tasks.filter(
                  (task) =>
                    task.course.toLowerCase() === courseName.toLowerCase()
                ).length > 0 ? (
                  <div className="space-y-4">
                    {student.tasks
                      .filter(
                        (task) =>
                          task.course.toLowerCase() === courseName.toLowerCase()
                      )
                      .map((task, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {task.task}
                              </h3>
                              <div className="flex items-center mt-1 text-sm text-gray-500">
                                <Calendar className="w-4 h-4 mr-1" />
                                <span>
                                  {new Date(task.dateTime).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <span
                              className={`px-3 py-1 text-xs font-medium rounded-full ${
                                task.status.toLowerCase() === "complete"
                                  ? "bg-green-100 text-green-800"
                                  : task.status.toLowerCase() === "ongoing" ||
                                      task.status.toLowerCase() ===
                                        "in progress"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {task.status}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <ClipboardCheck className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">
                      No Assigned Classes
                    </h3>
                    <p className="mt-1 text-gray-500">
                      No classes have been assigned for this course yet.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {completedTasks.length > 0 ? (
                  <div className="space-y-4">
                    {completedTasks.map((task, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {task.task}
                            </h3>
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>
                                {new Date(task.dateTime).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              {task.course}
                            </span>
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              {task.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <ClipboardCheck className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">
                      No completed Classes
                    </h3>
                    <p className="mt-1 text-gray-500">
                      No completed classes for this course yet.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      {/* Animated Gradient Keyframes */}
      <style jsx>{`
        @keyframes gradient-spin {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient-spin {
          background-size: 200% 200%;
          animation: gradient-spin 3s linear infinite;
        }
      `}</style>
    </>
  );
};

export default Page;
