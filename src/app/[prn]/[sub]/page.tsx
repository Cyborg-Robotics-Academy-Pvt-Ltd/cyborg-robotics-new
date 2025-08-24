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
import { db } from "../../../../firebaseConfig";
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

        // If no filtered tasks found, fallback to all completed tasks
        const finalCompletedTasks =
          filtered.length > 0
            ? completedTasksForCourse
            : (studentData.tasks || []).filter((t) => t.status === "complete");

        setCompletedTasks(finalCompletedTasks);
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
            // --- AUTO COMPLETE LOGIC ---
            const assignedNum = Number(currentCourse.classNumber);
            if (
              assignedNum > 0 &&
              completedTasks.length === assignedNum &&
              !currentCourse.completed
            ) {
              // Mark as completed in Firestore
              const updatedCourses = studentData.courses.map((course) => {
                if (!course.name) return course;
                const { courseName: currentCourseName, level: currentLevel } =
                  extractCourseAndLevel(courseName);
                const courseNameMatches =
                  course.name.toLowerCase().trim() ===
                  currentCourseName.toLowerCase().trim();
                const levelMatches = course.level === currentLevel;
                if (courseNameMatches && levelMatches) {
                  return {
                    ...course,
                    completed: true,
                  };
                }
                return course;
              });
              const studentRef = doc(db, "students", studentData.id);
              updateDoc(studentRef, { courses: updatedCourses });
              setIsCourseCompleted(true);
            }
            // --- END AUTO COMPLETE LOGIC ---
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
        {/* TODO: Add loading spinner and better feedback. */}
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
        {/* TODO: Add error message and better feedback. */}
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
        className="min-h-screen bg-gray-50"
      >
        {/* TODO: Add loading and error states for better UX. */}
        <div className="bg-gray-50 min-h-screen pb-12 lg:mt-20">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-red-800 to-red-700 py-6 px-4 sm:px-6 lg:px-8 text-white shadow-lg overflow-hidden">
            {/* SVG Wave Background */}
            <svg
              className="absolute bottom-0 left-0 w-full h-10"
              viewBox="0 0 1440 320"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ zIndex: 0 }}
            >
              <path
                fill="#fff"
                fillOpacity="0.08"
                d="M0,224L48,202.7C96,181,192,139,288,144C384,149,480,203,576,197.3C672,192,768,128,864,117.3C960,107,1056,149,1152,176C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              />
            </svg>

            <div className="max-w-5xl mx-auto relative z-10">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-0">
                {/* Glassmorphism Profile Card */}
                <div className="flex items-center gap-4 bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white border-opacity-20 relative">
                  {/* Certificate Badge */}
                  {isCertificateIssued && (
                    <Image
                      src="/assets/certificate.png"
                      alt="Certificate"
                      width={56}
                      height={56}
                      className="absolute top-2 right-2 object-contain rounded-full shadow-lg border-2 border-yellow-400 bg-white"
                      style={{ zIndex: 20 }}
                    />
                  )}
                  {/* Animated Gradient Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 via-pink-500 to-red-700 animate-gradient-spin shadow-lg">
                      <div className="w-full h-full rounded-full bg-white bg-opacity-20 flex items-center justify-center text-xl font-bold uppercase border-2 border-white border-opacity-60">
                        {student.username ? (
                          student.username
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                        ) : (
                          <User size={24} />
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                      {student.username}
                      {student.role && (
                        <span
                          className="ml-2 px-2 py-0.5 rounded bg-white bg-opacity-20 text-xs font-semibold uppercase tracking-wide border border-white border-opacity-30 cursor-pointer relative group"
                          tabIndex={0}
                        >
                          {student.role}
                          <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-max px-3 py-1 rounded bg-black bg-opacity-80 text-white text-xs opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity z-20 pointer-events-none whitespace-nowrap">
                            User Role
                          </span>
                        </span>
                      )}
                    </h1>
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      {/* Course Badge */}
                      {courseName && courseName.trim() !== "" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white bg-opacity-20 text-xs font-medium shadow border border-white border-opacity-20">
                          <BookOpen size={14} className="text-yellow-200" />
                          {courseName.replace(/\s+Level\s+\w+$/, "")}
                        </span>
                      ) : resolvedParams?.sub ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white bg-opacity-20 text-xs font-medium shadow border border-white border-opacity-20">
                          <BookOpen size={14} className="text-yellow-200" />
                          {resolvedParams.sub
                            .replace(/-/g, " ")
                            .replace(/\s+level\s+\w+$/i, "")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white bg-opacity-20 text-xs font-medium shadow border border-white border-opacity-20">
                          <BookOpen size={14} className="text-yellow-200" />
                          Course Not Found
                        </span>
                      )}

                      {/* Level Badge - Extract from course name if not already set */}
                      {(() => {
                        const levelFromCourseName =
                          courseName.match(/\s+Level\s+(\w+)$/);
                        const levelToShow =
                          courseLevel ||
                          (levelFromCourseName ? levelFromCourseName[1] : null);

                        return levelToShow ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shadow border ${getLevelColor(levelToShow)}`}
                          >
                            <Trophy size={14} />
                            {getLevelLabel(levelToShow)}
                          </span>
                        ) : null;
                      })()}
                      <div className="flex items-center gap-1 text-xs text-gray-200">
                        <User size={12} className="mr-1" />
                        <span>PRN: {student.PrnNumber}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-200">
                        <Mail size={12} className="mr-1" />
                        <span>{student.email}</span>
                      </div>
                    </div>
                    {/* Course Status Checkboxes - Only show for non-students */}
                    {userRole !== "student" && (
                      <div className="flex items-center gap-6 mt-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="completed"
                            checked={isCourseCompleted}
                            onCheckedChange={handleCompletedChange}
                            className="border-white data-[state=checked]:bg-green-500 data-[state=checked]:text-white "
                          />
                          <label
                            htmlFor="completed"
                            className="text-sm font-medium text-white cursor-pointer"
                          >
                            Course Completed (
                            {isCourseCompleted ? "true" : "false"})
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="certificate"
                            checked={isCertificateIssued}
                            onCheckedChange={handleCertificateChange}
                            className="border-white data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
                          />
                          <label
                            htmlFor="certificate"
                            className="text-sm font-medium text-white cursor-pointer"
                          >
                            Certificate Issued (
                            {isCertificateIssued ? "true" : "false"})
                          </label>
                        </div>
                      </div>
                    )}
                    {/* Course Progress Bar */}
                    {(() => {
                      const assignedClassesNum = Number(assignedClasses);
                      const completedTasksCount = completedTasks.length;

                      // Calculate percentage based on assigned classes and completed tasks
                      let percent = 0;
                      if (assignedClassesNum > 0) {
                        percent = Math.round(
                          (completedTasksCount / assignedClassesNum) * 100
                        );
                      }

                      // Show progress bar only when we have assigned classes
                      return assignedClassesNum > 0 ? (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-white font-medium">
                              Course Progress
                            </span>
                            <span className="text-[10px] text-white font-semibold">
                              {percent}%
                            </span>
                          </div>
                          <div className="relative w-full h-5 bg-white bg-opacity-20 rounded-full border border-white border-opacity-40 shadow-inner overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-green-400 via-green-500 to-green-700 transition-all duration-700 flex items-center justify-end pr-2"
                              style={{
                                width: `${percent}%`,
                                minWidth: percent > 0 ? "2rem" : 0,
                              }}
                            >
                              <span
                                className={`text-xs font-normal ${percent > 50 ? "text-white" : "text-green-900"} transition-colors duration-700`}
                              >
                                {percent}%
                              </span>
                              {percent === 100 && (
                                <svg
                                  className="ml-1 w-4 h-4 text-white inline-block animate-bounce"
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
                              )}
                            </div>
                          </div>
                          <div className="text-[8px] text-white opacity-60 mt-1">
                            {completedTasksCount}/{assignedClassesNum} class
                            completed
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <div className="text-[10px] text-white opacity-60">
                            No assigned classes for progress tracking
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
                <div className="mt-2 md:mt-0 flex justify-end">
                  <button
                    onClick={() => window.history.back()}
                    className="px-4 py-1.5 bg-white text-red-700 rounded-xl shadow hover:bg-red-50 hover:scale-105 transition-all flex items-center gap-2 font-semibold border border-red-200 text-sm"
                  >
                    <ArrowLeftCircle size={16} className="text-red-700" />
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>
          {isCourseCompleted && (
            <div className="max-w-5xl mx-auto mt-4 mb-6">
              <div className="flex items-center justify-center bg-green-100 border border-green-300 rounded-xl py-3 px-6 shadow text-green-800 font-semibold text-lg gap-2 animate-pulse">
                <svg
                  className="w-6 h-6 text-green-600"
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
                Course Completed!
              </div>
            </div>
          )}
          {showNextCourseModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl relative">
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
                  onClick={() => {
                    setShowNextCourseModal(false);
                    setNextCourseInput("");
                    setIsEditingNextCourse(false);
                  }}
                  aria-label="Close"
                >
                  ×
                </button>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {isEditingNextCourse ? "Edit Next Course" : "Set Next Course"}
                </h3>
                <label
                  htmlFor="next-course-modal"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Course Name:
                </label>
                <div className="flex gap-2 mb-4">
                  <input
                    id="next-course-modal"
                    type="text"
                    placeholder="Enter next course name"
                    className="px-3 py-2 text-black rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm flex-1"
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
                    className="px-4 py-2 rounded-xl bg-red-700 text-white font-semibold text-sm hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSaveNextCourse}
                    disabled={!nextCourseInput.trim()}
                  >
                    {isEditingNextCourse ? "Update" : "Save"}
                  </button>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800">
                    <strong>Note:</strong> Ask the parent which course the
                    student will do next and enter it here.
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* Floating Set/Edit Next Course Button - Only show for non-students */}
          {isCourseCompleted && userRole !== "student" && (
            <button
              type="button"
              className="fixed right-6 bottom-8 z-40 px-5 py-2 rounded-full bg-red-700 text-white font-semibold text-base shadow-lg hover:bg-red-800 transition-colors flex items-center gap-2"
              onClick={() => {
                if (student?.nextCourse) {
                  handleEditNextCourse();
                } else {
                  setShowNextCourseModal(true);
                }
              }}
              style={{ boxShadow: "0 4px 24px rgba(153,27,27,0.15)" }}
            >
              <BookOpen size={16} />
              {student?.nextCourse ? "Edit Next Course" : "Set Next Course"}
            </button>
          )}
          {/* Tabs Navigation */}
          <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-8 mt-6">
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8" aria-label="Tabs">
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg focus:outline-none transition-colors flex items-center gap-2 ${activeTab === 0 ? "bg-white text-red-700 border-b-2 border-red-700" : "text-gray-500 hover:text-red-700"}`}
                  onClick={() => setActiveTab(0)}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg focus:outline-none transition-colors flex items-center gap-2 ${activeTab === 1 ? "bg-white text-red-700 border-b-2 border-red-700" : "text-gray-500 hover:text-red-700"}`}
                  onClick={() => setActiveTab(1)}
                >
                  <CheckSquare className="w-5 h-5" />
                  Completed
                </button>
              </nav>
            </div>
          </div>
          {/* Tab Content */}
          {activeTab === 0 && (
            <>
              {/* Summary Cards */}
              <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-8 mt-0 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Assigned Classes
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {classNumber ? classNumber : "N/A"}
                      </p>
                    </div>
                    <div className="bg-red-100 p-3 rounded-full">
                      <ClipboardCheck className="h-6 w-6 text-red-700" />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Completed
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {completedTasks.length}
                      </p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <BookOpen className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-indigo-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Remaining Classes
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {remainingClasses}
                      </p>
                    </div>
                    <div className="bg-indigo-100 p-3 rounded-full">
                      <Hash className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Next Course
                      </p>
                      <p className="text-lg font-bold text-gray-900 truncate">
                        {student?.nextCourse || "Not Set"}
                      </p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <GraduationCap className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  {student?.nextCourse && userRole !== "student" && (
                    <div className="mt-2 flex gap-1">
                      <button
                        type="button"
                        className="px-2 py-1 rounded-lg bg-blue-600 text-white text-xs hover:bg-blue-700 transition-colors"
                        onClick={handleEditNextCourse}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="px-2 py-1 rounded-lg bg-red-600 text-white text-xs hover:bg-red-700 transition-colors"
                        onClick={handleDeleteNextCourse}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {/* Charts */}
              <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Pie Chart */}
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-gray-100 w-full overflow-x-auto">
                  <div className="min-w-[320px]">
                    <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-red-700 border-b pb-2 flex items-center">
                      <div className="w-1 h-6 bg-red-700 rounded-full mr-2"></div>
                      Status Distribution
                    </h2>
                    {statusData.length > 0 ? (
                      <div className="h-64 sm:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={statusData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={120}
                              innerRadius={60}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) =>
                                `${name}: ${(percent * 100).toFixed(0)}%`
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
                            <Tooltip />
                            <Legend
                              verticalAlign="bottom"
                              height={36}
                              iconType="circle"
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-gray-500">
                        <p>No status data available</p>
                      </div>
                    )}
                  </div>
                </div>
                {/* Bar Chart */}
                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-gray-100 w-full overflow-x-auto">
                  <div className="min-w-[320px]">
                    <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-red-700 border-b pb-2 flex items-center">
                      <div className="w-1 h-6 bg-red-700 rounded-full mr-2"></div>
                      Tasks by Date
                    </h2>
                    {barData.length > 0 ? (
                      <div className="h-64 sm:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={barData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#f0f0f0"
                            />
                            <XAxis
                              dataKey="date"
                              tick={{ fill: "#4B5563", fontSize: 12 }}
                              tickLine={{ stroke: "#E5E7EB" }}
                            />
                            <YAxis
                              tick={{ fill: "#4B5563", fontSize: 12 }}
                              tickLine={{ stroke: "#E5E7EB" }}
                              domain={[0, 2]}
                            />
                            <Tooltip />
                            <Legend />
                            <Bar
                              dataKey="complete"
                              fill="#991b1b"
                              name="Completed"
                              barSize={30}
                            />
                            <Bar
                              dataKey="ongoing"
                              fill="#991b1b"
                              name="Ongoing"
                              barSize={30}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-gray-500">
                        <p>No bar chart data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
          {activeTab === 1 && (
            <div className="max-w-8xl mx-auto px-2 sm:px-4 lg:px-8 mb-8">
              {/* Completed Tasks */}
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md mb-8 ">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-800 border-b pb-2 ">
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
                      const statusColor =
                        STATUS_COLORS[task.status] || "#6366F1";
                      return (
                        <div
                          key={index}
                          className="flex items-center p-4 border-l-4 rounded-r-lg shadow-sm transition-all hover:shadow-md bg-green-50"
                          style={{ borderLeftColor: statusColor }}
                        >
                          <div className="flex-1 mr-4">
                            <div className="font-medium text-gray-900">
                              {task?.task}
                            </div>
                            <div className="text-sm text-gray-600 mt-1 flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
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
                            <span className="mb-2 text-sm font-medium py-1 px-3 bg-indigo-50 text-indigo-700 rounded-full flex items-center gap-1">
                              <GraduationCap className="h-3 w-3" />
                              {task.course}
                            </span>
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              {task.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
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
            </div>
          )}
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
