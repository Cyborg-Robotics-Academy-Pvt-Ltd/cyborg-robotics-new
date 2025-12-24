"use client";
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
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
  LayoutDashboard,
  CheckSquare,
  ArrowLeftCircle,
  Trophy,
  Hash,
  Award,
  Clock,
  Target,
} from "lucide-react";
import { Checkbox } from "../../../components/ui/checkbox";
import Head from "next/head";
import Image from "next/image";
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
      return "bg-green-100 text-green-800 border-green-200";
    case "2":
    case "intermediate":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "3":
    case "advanced":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "4":
    case "expert":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
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

// Props for Recharts Pie label callback
type PieLabelProps = {
  name?: string;
  percent?: number;
};

const Page = ({
  params,
}: {
  params: Promise<{ prn: string; sub: string }>;
}) => {
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
  const [showNextCourseModal, setShowNextCourseModal] = useState(false);
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
          return { ...course, certificate: newCertificateState };
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
          ? "Certificate marked as issued!"
          : "Certificate marked as not issued!"
      );
    } catch (error) {
      console.error("[Checkbox] Error updating certificate status:", error);
      toast.error("Failed to update certificate status");
    }
  };

  const handleSaveNextCourse = async () => {
    if (!student || !nextCourseInput.trim()) {
      toast.error("Please enter a course name");
      return;
    }

    console.log("Saving next course:", {
      studentId: student.id,
      nextCourse: nextCourseInput.trim(),
      studentData: student,
    });

    try {
      const studentRef = doc(db, "students", student.id);
      console.log("Student reference:", studentRef);

      const updateData = { nextCourse: nextCourseInput.trim() };
      console.log("Update data:", updateData);

      await updateDoc(studentRef, updateData);
      console.log("Database update successful");

      // Update local state
      setStudent((prev) =>
        prev ? { ...prev, nextCourse: nextCourseInput.trim() } : null
      );

      setShowNextCourseModal(false);
      setNextCourseInput("");
      setIsEditingNextCourse(false);
      toast.success("Next course saved successfully!");
    } catch (error: unknown) {
      console.error("Error saving next course:", error);
      if (error instanceof Error) {
        toast.error("Failed to save next course: " + error.message);
      } else {
        toast.error("Failed to save next course");
      }
    }
  };

  const handleEditNextCourse = () => {
    setNextCourseInput(student?.nextCourse || "");
    setIsEditingNextCourse(true);
    setShowNextCourseModal(true);
  };

  const handleDeleteNextCourse = async () => {
    if (!student) return;

    console.log("Deleting next course for student:", student.id);

    try {
      const studentRef = doc(db, "students", student.id);
      console.log("Student reference for delete:", studentRef);

      await updateDoc(studentRef, { nextCourse: "" });
      console.log("Database delete successful");

      // Update local state
      setStudent((prev) => (prev ? { ...prev, nextCourse: "" } : null));

      toast.success("Next course removed successfully!");
    } catch (error: unknown) {
      console.error("Error deleting next course:", error);
      if (error instanceof Error) {
        toast.error("Failed to remove next course: " + error.message);
      } else {
        toast.error("Failed to remove next course");
      }
    }
  };

  useEffect(() => {
    if (!resolvedParams) return;
    const fetchStudent = async () => {
      setLoading(true);
      setError(null);
      try {
        const studentsRef = collection(db, "students");
        const q = query(
          studentsRef,
          where("PrnNumber", "==", resolvedParams.prn)
        );
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          setError("No student found with this PRN number.");
          setLoading(false);
          return;
        }
        const studentDoc = querySnapshot.docs[0];
        const data = studentDoc.data();
        console.log("Raw student data from database:", data);

        const studentData: Student = {
          id: studentDoc.id,
          PrnNumber: data.PrnNumber || "",
          username: data.username || "",
          email: data.email || "",
          classes: data.classes || "0",
          createdAt: data.createdAt || null,
          createdBy: data.createdBy || "",
          createdByRole: data.createdByRole || "",
          lastLogin: data.lastLogin || null,
          role: data.role || "",
          tasks: data.tasks || [],
          courses: data.courses || [],
          nextCourse: data.nextCourse || "",
        };
        console.log("Processed student data:", studentData);
        setStudent(studentData);

        // Filter tasks for this course - strict matching with level support
        const { courseName: currentCourseName, level: currentLevel } =
          extractCourseAndLevel(courseName);

        const filtered = (studentData.tasks || []).filter((task) => {
          if (!task.course) return false;
          const { courseName: taskCourseName, level: taskLevel } =
            extractCourseAndLevel(task.course);
          return isSameCourseAndLevel(
            taskCourseName,
            taskLevel,
            currentCourseName,
            currentLevel
          );
        });

        const completedTasksForCourse = filtered.filter(
          (t) => t.status === "complete"
        );

        // Log task filtering results for debugging
        console.log("Task filtering:", {
          totalTasks: studentData.tasks?.length || 0,
          filteredTasks: filtered.length,
          completedTasks: completedTasksForCourse.length,
          courseName,
        });

        // Only show tasks that match the specific course and level - no fallback
        setCompletedTasks(completedTasksForCourse);
        // Status data for pie chart
        const statusCount: Record<string, number> = {};
        filtered.forEach((task) => {
          const status = (task.status || "").toLowerCase();
          statusCount[status] = (statusCount[status] || 0) + 1;
        });
        setStatusData(
          Object.keys(statusCount).map((status) => ({
            name: status,
            value: statusCount[status],
          }))
        );
        // Bar chart: tasks by date and status
        const dateMap: Record<string, { complete: number; ongoing: number }> =
          {};
        filtered.forEach((task) => {
          const date = new Date(task.dateTime).toLocaleDateString();
          if (!dateMap[date]) dateMap[date] = { complete: 0, ongoing: 0 };
          if (task.status === "complete") dateMap[date].complete++;
          else dateMap[date].ongoing++;
        });
        setBarData(
          Object.keys(dateMap).map((date) => ({
            date,
            ...dateMap[date],
          }))
        );

        // Assigned classes logic - strict to handle course and level separately
        if (
          data.courseClassNumbers &&
          typeof data.courseClassNumbers === "object"
        ) {
          const { courseName: currentCourseName, level: currentLevel } =
            extractCourseAndLevel(courseName);

          // Try to find the assigned classes for this specific course and level
          let assigned = null;

          // Try to find by course name and level combination
          console.log(
            "courseClassNumbers keys:",
            Object.keys(data.courseClassNumbers)
          );
          console.log(
            "currentCourseName:",
            currentCourseName,
            "currentLevel:",
            currentLevel
          );
          const courseKey = Object.keys(data.courseClassNumbers).find((key) => {
            const { courseName: keyCourseName, level: keyLevel } =
              extractCourseAndLevel(key);
            return isSameCourseAndLevel(
              keyCourseName,
              keyLevel,
              currentCourseName,
              currentLevel
            );
          });
          console.log("Matched courseKey:", courseKey);

          if (courseKey) {
            assigned = data.courseClassNumbers[courseKey];
          }

          setAssignedClasses(assigned || "N/A");
        } else {
          // Print the raw slug and extracted values
          console.log("Raw courseName from slug:", courseName);
          const { courseName: currentCourseName, level: currentLevel } =
            extractCourseAndLevel(courseName);
          console.log("Extracted from slug:", currentCourseName, currentLevel);
          // Try to get from courses array as fallback
          console.log("All student courses:", studentData.courses);
          const courseFromArray = studentData.courses?.find((c) => {
            if (!c.name) return false;
            // Loose match for debugging
            const nameMatch =
              c.name.toLowerCase().trim() ===
              currentCourseName.toLowerCase().trim();
            const levelMatch =
              String(c.level || "").trim() ===
              String(currentLevel || "").trim();
            console.log(
              "Loose nameMatch:",
              c.name,
              currentCourseName,
              nameMatch,
              "levelMatch:",
              c.level,
              currentLevel,
              levelMatch
            );
            return nameMatch && levelMatch;
          });
          console.log("Matched courseFromArray:", courseFromArray);
          if (courseFromArray?.classNumber) {
            setAssignedClasses(courseFromArray.classNumber);
          } else {
            setAssignedClasses("N/A");
          }
        }

        if (studentData.courses) {
          const { courseName: currentCourseName, level: currentLevel } =
            extractCourseAndLevel(courseName);
          console.log(
            "Extracted for classNumber:",
            currentCourseName,
            currentLevel
          );

          // Try strict match first
          let currentCourse = studentData.courses.find((c) => {
            if (!c.name) return false;
            const nameMatch =
              c.name.toLowerCase().trim() ===
              currentCourseName.toLowerCase().trim();
            const levelMatch =
              String(c.level || "").trim() ===
              String(currentLevel || "").trim();
            console.log(
              "Comparing course:",
              c.name,
              c.level,
              "with",
              currentCourseName,
              currentLevel,
              "=>",
              nameMatch,
              levelMatch
            );
            return nameMatch && levelMatch;
          });

          // Fallback: match only by name if strict match fails
          if (!currentCourse) {
            currentCourse = studentData.courses.find((c) => {
              if (!c.name) return false;
              const nameMatch =
                c.name.toLowerCase().trim() ===
                currentCourseName.toLowerCase().trim();
              console.log(
                "Fallback name-only match:",
                c.name,
                currentCourseName,
                "=>",
                nameMatch
              );
              return nameMatch;
            });
          }

          console.log("Matched course for classNumber:", currentCourse);

          if (currentCourse) {
            setCourseLevel(currentCourse.level);
            setClassNumber(currentCourse.classNumber);
            setIsCourseCompleted(currentCourse.completed || false);
            setIsCertificateIssued(currentCourse.certificate || false);

            // Note: Auto-complete logic moved to a separate useEffect to avoid
            // referencing `completedTasks.length` inside this fetch effect and
            // triggering the react-hooks/exhaustive-deps lint warning.
          } else {
            setClassNumber(""); // or "N/A"
          }
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError("Failed to load course analytics. Please try again later.");
        } else {
          setError("Failed to load course analytics. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [resolvedParams, courseName]);

  // Auto-complete logic: mark course as completed if assignedClasses === completedTasks.length
  useEffect(() => {
    if (!student || !student.courses) return;
    const assignedNum = Number(assignedClasses);
    if (assignedNum > 0 && completedTasks.length === assignedNum) {
      const { courseName: currentCourseName, level: currentLevel } =
        extractCourseAndLevel(courseName);
      const courseIdx = student.courses.findIndex((c) => {
        if (!c.name) return false;
        const { courseName: cName, level: cLevel } = extractCourseAndLevel(
          c.name
        );
        return isSameCourseAndLevel(
          cName,
          cLevel,
          currentCourseName,
          currentLevel
        );
      });

      if (courseIdx !== -1 && !student.courses[courseIdx].completed) {
        // Update Firestore and local state
        const updatedCourses = student.courses.map((course, idx) => {
          if (idx === courseIdx) {
            return {
              ...course,
              completed: true,
            };
          }
          return course;
        });
        const studentRef = doc(db, "students", student.id);
        updateDoc(studentRef, { courses: updatedCourses });
        setIsCourseCompleted(true);
        // Optionally update student state if needed
        setStudent({ ...student, courses: updatedCourses });
      }
    }
  }, [
    assignedClasses,
    completedTasks.length,
    student,
    courseName,
    setIsCourseCompleted,
  ]);

  const remainingClasses = Math.max(
    0,
    (Number(classNumber) || 0) - completedTasks.length
  );

  if (loading) {
    return (
      <main
        role="main"
        aria-label="Loading Course Detail"
        className="min-h-screen bg-gray-50 flex items-center justify-center"
      >
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-700 mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </main>
    );
  }
  if (error || !student) {
    return (
      <main
        role="main"
        aria-label="Course Not Found"
        className="min-h-screen bg-gray-50 flex items-center justify-center"
      >
        <div className="text-center p-6 bg-white rounded-xl shadow-md max-w-md">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <h3 className="mt-4 text-xl font-medium text-gray-900">
            {error || "Student not found"}
          </h3>
          <p className="mt-2 text-gray-500">
            We couldn't find the course details you're looking for.
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-6 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeftCircle size={16} />
            Go Back
          </button>
        </div>
      </main>
    );
  }
  return (
    <>
      <Head>
        <title>
          {student.username} | {courseName} Progress
        </title>
        <meta
          name="description"
          content={`Progress and details for ${courseName} - ${student.username} at Cyborg Robotics Academy.`}
        />
        <meta
          property="og:title"
          content={`${student.username} | ${courseName} Progress`}
        />
        <meta
          property="og:description"
          content={`Progress and details for ${courseName} - ${student.username} at Cyborg Robotics Academy.`}
        />
        <meta property="og:type" content="website" />
      </Head>
      <main
        role="main"
        aria-label="Course Detail"
        className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
      >
        <div className="bg-gradient-to-r from-red-800 to-red-700 py-4 px-4 sm:px-6 lg:px-8 text-white shadow-md overflow-hidden relative">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-900 rounded-full opacity-20 -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-900 rounded-full opacity-10 translate-y-24 -translate-x-24"></div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              {/* Student Profile Card */}
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-3 shadow-md border border-white/20 relative overflow-hidden">
                {/* Certificate Badge */}
                {isCertificateIssued && (
                  <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5 shadow-md border border-white">
                    <Award className="text-red-800" size={16} />
                  </div>
                )}

                {/* Avatar */}
                <div className="flex-shrink-0 relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-red-700 p-0.5">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-sm font-bold uppercase text-red-800">
                      {student.username ? (
                        student.username
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                      ) : (
                        <User size={16} />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-lg font-bold truncate">
                      {student.username}
                    </h1>
                    {student.role && (
                      <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wide">
                        {student.role}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {/* Course Badge */}
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/20 text-xs font-medium">
                      <BookOpen size={12} />
                      <span className="truncate max-w-[80px]">
                        {courseName.replace(/\s+Level\s+\w+$/, "")}
                      </span>
                    </div>

                    {/* Level Badge */}
                    {(() => {
                      const levelFromCourseName =
                        courseName.match(/\s+Level\s+(\w+)$/);
                      const levelToShow =
                        courseLevel ||
                        (levelFromCourseName ? levelFromCourseName[1] : null);

                      return levelToShow ? (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(levelToShow)}`}
                        >
                          <Trophy size={12} />
                          {getLevelLabel(levelToShow)}
                        </span>
                      ) : null;
                    })()}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <User size={12} />
                      <span className="truncate">PRN: {student.PrnNumber}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mail size={12} />
                      <span className="truncate">{student.email}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {(() => {
                    const assignedClassesNum = Number(assignedClasses);
                    const completedTasksCount = completedTasks.length;
                    let percent = 0;
                    if (assignedClassesNum > 0) {
                      percent = Math.round(
                        (completedTasksCount / assignedClassesNum) * 100
                      );
                    }

                    return assignedClassesNum > 0 ? (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-medium flex items-center gap-1">
                            <Target size={10} />
                            Progress
                          </span>
                          <span className="text-xs font-semibold">
                            {percent}%
                          </span>
                        </div>
                        <div className="relative w-full h-2 bg-white/20 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                        <div className="text-xs mt-0.5 opacity-80">
                          {completedTasksCount}/{assignedClassesNum} classes
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                {/* Status Checkboxes - Only for non-students */}
                {userRole !== "student" && (
                  <div className="flex gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                    <div className="flex items-center gap-1.5">
                      <Checkbox
                        id="completed"
                        checked={isCourseCompleted}
                        onCheckedChange={handleCompletedChange}
                        className="border-white data-[state=checked]:bg-green-500 data-[state=checked]:text-white h-4 w-4"
                      />
                      <label
                        htmlFor="completed"
                        className="text-xs font-medium cursor-pointer whitespace-nowrap"
                      >
                        Completed
                      </label>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Checkbox
                        id="certificate"
                        checked={isCertificateIssued}
                        onCheckedChange={handleCertificateChange}
                        className="border-white data-[state=checked]:bg-blue-500 data-[state=checked]:text-white h-4 w-4"
                      />
                      <label
                        htmlFor="certificate"
                        className="text-xs font-medium cursor-pointer whitespace-nowrap"
                      >
                        Certificate
                      </label>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => window.history.back()}
                  className="px-3 py-2 bg-white text-red-700 rounded-lg shadow hover:bg-gray-100 transition-all flex items-center gap-1.5 text-sm font-medium"
                >
                  <ArrowLeftCircle size={14} />
                  Back
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Course Completion Banner */}
        {isCourseCompleted && (
          <div className="max-w-7xl mx-auto mt-6 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center bg-gradient-to-r from-green-500 to-green-600 rounded-xl py-4 px-6 shadow-lg text-white font-semibold text-lg gap-3">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Congratulations! Course Completed Successfully
            </div>
          </div>
        )}

        {/* Next Course Modal */}
        {showNextCourseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold"
                onClick={() => {
                  setShowNextCourseModal(false);
                  setNextCourseInput("");
                  setIsEditingNextCourse(false);
                }}
                aria-label="Close"
              >
                ×
              </button>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {isEditingNextCourse ? "Edit Next Course" : "Set Next Course"}
              </h3>
              <p className="text-gray-600 mb-5">
                {isEditingNextCourse
                  ? "Update the next course for this student"
                  : "Specify what course the student should take next"}
              </p>

              <label
                htmlFor="next-course-modal"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Course Name
              </label>
              <div className="flex gap-2 mb-4">
                <input
                  id="next-course-modal"
                  type="text"
                  placeholder="Enter next course name"
                  className="px-4 py-2.5 text-gray-900 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm flex-1"
                  value={nextCourseInput}
                  onChange={(e) => setNextCourseInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSaveNextCourse();
                    }
                  }}
                />
                <button
                  type="button"
                  className="px-4 py-2.5 rounded-xl bg-red-700 text-white font-semibold text-sm hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSaveNextCourse}
                  disabled={!nextCourseInput.trim()}
                >
                  {isEditingNextCourse ? "Update" : "Save"}
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Tip:</strong> Ask the parent which course the student
                  will do next and enter it here.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Floating Set/Edit Next Course Button */}
        {isCourseCompleted && userRole !== "student" && (
          <button
            type="button"
            className="fixed right-6 bottom-6 z-40 px-5 py-3 rounded-full bg-gradient-to-r from-red-700 to-red-800 text-white font-semibold text-base shadow-lg hover:from-red-800 hover:to-red-900 transition-all flex items-center gap-2 shadow-red-500/30"
            onClick={() => {
              if (student?.nextCourse) {
                handleEditNextCourse();
              } else {
                setShowNextCourseModal(true);
              }
            }}
          >
            <GraduationCap size={18} />
            {student?.nextCourse ? "Edit Next Course" : "Set Next Course"}
          </button>
        )}

        {/* Tabs Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                className={`px-4 py-3 text-base font-medium rounded-t-lg focus:outline-none transition-colors flex items-center gap-2 ${
                  activeTab === 0
                    ? "text-red-700 border-b-2 border-red-700"
                    : "text-gray-500 hover:text-red-700"
                }`}
                onClick={() => setActiveTab(0)}
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </button>
              <button
                className={`px-4 py-3 text-base font-medium rounded-t-lg focus:outline-none transition-colors flex items-center gap-2 ${
                  activeTab === 1
                    ? "text-red-700 border-b-2 border-red-700"
                    : "text-gray-500 hover:text-red-700"
                }`}
                onClick={() => setActiveTab(1)}
              >
                <CheckSquare className="w-5 h-5" />
                Completed Classes
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {activeTab === 0 && (
            <div className="space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-red-500 transition-all hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Assigned Classes
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {classNumber ? classNumber : "N/A"}
                      </p>
                    </div>
                    <div className="bg-red-100 p-3 rounded-full">
                      <ClipboardCheck className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-green-500 transition-all hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Completed
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {completedTasks.length}
                      </p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <BookOpen className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-blue-500 transition-all hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Remaining
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {remainingClasses}
                      </p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-purple-500 transition-all hover:shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Next Course
                      </p>
                      <p className="text-lg font-bold text-gray-900 mt-1 truncate max-w-[120px]">
                        {student?.nextCourse || "Not Set"}
                      </p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-full">
                      <GraduationCap className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  {student?.nextCourse && userRole !== "student" && (
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700 transition-colors"
                        onClick={handleEditNextCourse}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs hover:bg-red-700 transition-colors"
                        onClick={handleDeleteNextCourse}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="bg-white rounded-2xl shadow-md p-5">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-red-700 rounded-full"></div>
                    Status Distribution
                  </h2>
                  {statusData.length > 0 ? (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            innerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }: PieLabelProps) =>
                              `${name}: ${percent ? (Number(percent) * 100).toFixed(0) : 0}%`
                            }
                            paddingAngle={5}
                          >
                            {statusData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={STATUS_COLORS[entry.name] || "#b91c1c"}
                                stroke="none"
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [value, "Classes"]}
                            labelFormatter={(name) => `Status: ${name}`}
                          />
                          <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                      <ClipboardCheck className="h-12 w-12 mb-3" />
                      <p>No status data available</p>
                    </div>
                  )}
                </div>

                {/* Bar Chart */}
                <div className="bg-white rounded-2xl shadow-md p-5">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-red-700 rounded-full"></div>
                    Tasks by Date
                  </h2>
                  {barData.length > 0 ? (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={barData}
                          margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f0f0f0"
                          />
                          <XAxis
                            dataKey="date"
                            tick={{ fill: "#6B7280", fontSize: 12 }}
                            tickLine={{ stroke: "#E5E7EB" }}
                          />
                          <YAxis
                            tick={{ fill: "#6B7280", fontSize: 12 }}
                            tickLine={{ stroke: "#E5E7EB" }}
                          />
                          <Tooltip
                            formatter={(value) => [value, "Classes"]}
                            labelFormatter={(date) => `Date: ${date}`}
                          />
                          <Legend />
                          <Bar
                            dataKey="complete"
                            fill="#10B981"
                            name="Completed"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar
                            dataKey="ongoing"
                            fill="#FBBF24"
                            name="Ongoing"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                      <Calendar className="h-12 w-12 mb-3" />
                      <p>No task data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div className="bg-white rounded-2xl shadow-md p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Completed Classes ({completedTasks.length})
              </h2>

              {completedTasks.length > 0 ? (
                <div className="space-y-4">
                  {completedTasks.map((task, index) => {
                    const taskDate = new Date(task.dateTime);
                    const isValid = !isNaN(taskDate.getTime());
                    const today = new Date();
                    const isToday =
                      isValid &&
                      today.toDateString() === taskDate.toDateString();
                    const statusColor = STATUS_COLORS[task.status] || "#6366F1";
                    return (
                      <div
                        key={index}
                        className="flex items-center p-4 border-l-4 rounded-r-lg bg-gradient-to-r from-gray-50 to-white shadow-sm transition-all hover:shadow-md"
                        style={{ borderLeftColor: statusColor }}
                      >
                        <div className="flex-1 mr-4">
                          <div className="font-medium text-gray-900">
                            {task?.task}
                          </div>
                          <div className="text-sm text-gray-600 mt-1 flex items-center">
                            <Calendar className="h-4 w-4 mr-1.5" />
                            {isValid ? (
                              <>
                                {isToday ? "Today, " : ""}
                                {taskDate.toLocaleString(undefined, {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </>
                            ) : (
                              "Date not specified"
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="mb-2 text-sm font-medium py-1.5 px-3 bg-red-50 text-red-700 rounded-full flex items-center gap-1.5">
                            <BookOpen className="h-3.5 w-3.5" />
                            {task.course}
                          </span>
                          <span
                            className="px-3 py-1.5 text-xs font-medium rounded-full"
                            style={{
                              backgroundColor: `${statusColor}20`,
                              color: statusColor,
                            }}
                          >
                            {task.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <ClipboardCheck className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    No completed classes yet
                  </h3>
                  <p className="mt-1 text-gray-500">
                    Completed classes will appear here once available.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Page;
