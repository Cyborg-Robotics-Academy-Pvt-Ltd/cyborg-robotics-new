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
  X,
} from "lucide-react";
import { Checkbox } from "../../../components/ui/checkbox";
import { getCourseTaskTemplates } from "../../../data/courseTasks";
import Head from "next/head";

import { toast } from "react-hot-toast";
import Image from "next/image";

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
    rubric1Given?: boolean;
    rubric2Given?: boolean;
    rubric3Given?: boolean;
    media1Given?: boolean;
    media2Given?: boolean;
    media3Given?: boolean;
    media4Given?: boolean;
    media5Given?: boolean;
    trainerId?: string;
  }[];
  nextCourse?: string;
  profileimage?: string;
  imageUrls?: string[];
  fullName?: string;
  grade?: string;
  status?: string;
  uid?: string;
}

// Helper to convert slug to course name and level
function fromSlug(slug: string) {
  if (!slug) return "";

  // First, normalize the slug
  let normalized = slug.trim().toLowerCase();

  // Check if the slug contains level information
  const levelMatch = normalized.match(/-level-(\d+)$/);
  const levelTextMatch = normalized.match(
    /-level-(beginner|intermediate|advanced|expert)$/,
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
      "",
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

// New helper — detects video by file extension in the Cloudinary URL.
const isVideoUrl = (url: string): boolean =>
  /\.(mp4|webm|mov|m4v|avi|mkv)(\?.*)?$/i.test(url);

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
    /\blevel\s*(beginner|intermediate|advanced|expert)\b/i,
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
  bLevel: string | null,
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
  const { user, userRole } = useAuth();
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
  const [assignedClassesData, setAssignedClassesData] = useState<
    { name: string; value: number }[]
  >([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [ongoingTasks, setOngoingTasks] = useState<Task[]>([]);
  const [assignedClasses, setAssignedClasses] = useState<string | number>(
    "N/A",
  );
  const [activeTab, setActiveTab] = useState<number>(0);
  const [courseLevel, setCourseLevel] = useState("");
  const [classNumber, setClassNumber] = useState("");
  const [isCourseCompleted, setIsCourseCompleted] = useState(false);
  const [isCertificateIssued, setIsCertificateIssued] = useState(false);
  const [rubricsGiven, setRubricsGiven] = useState({
    rubric1Given: false,
    rubric2Given: false,
    rubric3Given: false,
  });
  const [studentMediaGiven, setStudentMediaGiven] = useState({
    media1Given: false,
    media2Given: false,
    media3Given: false,
    media4Given: false,
    media5Given: false,
  });
  const [showNextCourseModal, setShowNextCourseModal] = useState(false);
  const [nextCourseInput, setNextCourseInput] = useState("");
  const [isEditingNextCourse, setIsEditingNextCourse] = useState(false);
  const [nextCourseOption, setNextCourseOption] = useState<
    "enrolling" | "not-interested" | "join-soon" | ""
  >("");
  const [nextCourseComment, setNextCourseComment] = useState("");
  const [joinSoonTime, setJoinSoonTime] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(
    null,
  );
  const canViewOngoingTab =
    userRole === "admin" || userRole === "superAdmin" || userRole === "trainer";

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  useEffect(() => {
    if (!selectedPhoto) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedPhoto(null);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [selectedPhoto]);

  const courseName = resolvedParams ? fromSlug(resolvedParams.sub) : "";
  const currentCourseAssignment = student?.courses?.find((course) => {
    if (!course.name) return false;

    const { courseName: currentCourseName, level: currentLevel } =
      extractCourseAndLevel(courseName);

    return isSameCourseAndLevel(
      course.name,
      course.level,
      currentCourseName,
      currentLevel,
    );
  });
  const canCompleteOngoingTask =
    userRole === "admin" ||
    userRole === "superAdmin" ||
    (userRole === "trainer" &&
      Boolean(user?.uid) &&
      currentCourseAssignment?.trainerId === user?.uid);

  const refreshCourseTaskLists = (tasks: Task[]) => {
    const { courseName: currentCourseName, level: currentLevel } =
      extractCourseAndLevel(courseName);

    const filtered = tasks.filter((task) => {
      if (!task.course) return false;
      const { courseName: taskCourseName, level: taskLevel } =
        extractCourseAndLevel(task.course);
      return isSameCourseAndLevel(
        taskCourseName,
        taskLevel,
        currentCourseName,
        currentLevel,
      );
    });

    const completedTasksForCourse = filtered.filter(
      (task) => (task.status || "").toLowerCase() === "complete",
    );
    const savedOngoingTasksForCourse = filtered.filter(
      (task) => (task.status || "").toLowerCase() !== "complete",
    );
    const savedTaskNames = new Set(
      filtered.map((task) => task.task.toLowerCase().trim()),
    );
    const courseLabel = currentLevel
      ? `${currentCourseName} Level ${currentLevel}`
      : currentCourseName;
    const templateOngoingTasks = getCourseTaskTemplates(
      currentCourseName,
      currentLevel,
    )
      .filter(
        (template) => !savedTaskNames.has(template.task.toLowerCase().trim()),
      )
      .map((template) => ({
        course: courseLabel,
        task: template.task,
        dateTime: "",
        status: "ongoing",
      }));
    const ongoingTasksForCourse = [
      ...savedOngoingTasksForCourse,
      ...templateOngoingTasks,
    ];

    setCompletedTasks(completedTasksForCourse);
    setOngoingTasks(ongoingTasksForCourse);

    return { filtered, completedTasksForCourse, ongoingTasksForCourse };
  };

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
        prev ? { ...prev, courses: updatedCourses } : null,
      );
      setIsCourseCompleted(newCompletedState);
      toast.success(
        newCompletedState
          ? "Course marked as completed!"
          : "Course marked as ongoing!",
      );
    } catch (error) {
      console.error(
        "[Checkbox] Error updating course completion status:",
        error,
      );
      toast.error("Failed to update course status");
    }
  };

  const handleCertificateChange = async (
    checked: boolean | "indeterminate",
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
        prev ? { ...prev, courses: updatedCourses } : null,
      );
      setIsCertificateIssued(newCertificateState);
      toast.success(
        newCertificateState
          ? "Certificate marked as issued!"
          : "Certificate marked as not issued!",
      );
    } catch (error) {
      console.error("[Checkbox] Error updating certificate status:", error);
      toast.error("Failed to update certificate status");
    }
  };

  const handleRubricChange = async (
    rubricKey: "rubric1Given" | "rubric2Given" | "rubric3Given",
    checked: boolean | "indeterminate",
  ) => {
    if (!student) return;

    const newRubricState = checked === true;

    try {
      const studentRef = doc(db, "students", student.id);
      const updatedCourses = student.courses?.map((course) => {
        if (!course.name) return course;

        const { courseName: currentCourseName, level: currentLevel } =
          extractCourseAndLevel(courseName);

        const courseNameMatches =
          course.name.toLowerCase().trim() ===
          currentCourseName.toLowerCase().trim();
        const levelMatches = course.level === currentLevel;

        if (courseNameMatches && levelMatches) {
          return { ...course, [rubricKey]: newRubricState };
        }

        return course;
      });

      await updateDoc(studentRef, { courses: updatedCourses });

      setStudent((prev) =>
        prev ? { ...prev, courses: updatedCourses } : null,
      );
      setRubricsGiven((current) => ({
        ...current,
        [rubricKey]: newRubricState,
      }));
      toast.success(
        newRubricState
          ? "Rubric marked as given!"
          : "Rubric marked as not given!",
      );
    } catch (error) {
      console.error("[Checkbox] Error updating rubric status:", error);
      toast.error("Failed to update rubric status");
    }
  };

  const handleStudentMediaChange = async (
    mediaKey:
      | "media1Given"
      | "media2Given"
      | "media3Given"
      | "media4Given"
      | "media5Given",
    checked: boolean | "indeterminate",
  ) => {
    if (!student) return;

    const newMediaState = checked === true;

    try {
      const studentRef = doc(db, "students", student.id);
      const updatedCourses = student.courses?.map((course) => {
        if (!course.name) return course;

        const { courseName: currentCourseName, level: currentLevel } =
          extractCourseAndLevel(courseName);

        const courseNameMatches =
          course.name.toLowerCase().trim() ===
          currentCourseName.toLowerCase().trim();
        const levelMatches = course.level === currentLevel;

        if (courseNameMatches && levelMatches) {
          return { ...course, [mediaKey]: newMediaState };
        }

        return course;
      });

      await updateDoc(studentRef, { courses: updatedCourses });

      setStudent((prev) =>
        prev ? { ...prev, courses: updatedCourses } : null,
      );
      setStudentMediaGiven((current) => ({
        ...current,
        [mediaKey]: newMediaState,
      }));
      toast.success(
        newMediaState
          ? "Student media marked as given!"
          : "Student media marked as not given!",
      );
    } catch (error) {
      console.error("[Checkbox] Error updating student media status:", error);
      toast.error("Failed to update student media status");
    }
  };

  const handleSaveNextCourse = async () => {
    if (!student) {
      toast.error("No student found");
      return;
    }

    // Validate based on selected option
    if (nextCourseOption === "enrolling" && !nextCourseInput.trim()) {
      toast.error("Please enter a course name");
      return;
    }

    if (nextCourseOption === "not-interested" && !nextCourseComment.trim()) {
      toast.error(
        "Please provide a comment explaining why the student is not interested",
      );
      return;
    }

    if (nextCourseOption === "join-soon" && !joinSoonTime.trim()) {
      toast.error("Please specify when the student will join");
      return;
    }

    // Validate date format if join-soon option is selected
    if (nextCourseOption === "join-soon" && joinSoonTime.trim()) {
      const date = new Date(joinSoonTime);
      if (isNaN(date.getTime())) {
        toast.error("Please select a valid date");
        return;
      }
    }

    try {
      const studentRef = doc(db, "students", student.id);

      let updateData;

      if (nextCourseOption === "enrolling") {
        updateData = { nextCourse: nextCourseInput.trim() };
      } else if (nextCourseOption === "not-interested") {
        updateData = {
          nextCourse: `Not Enrolling: ${nextCourseComment.trim()}`,
        };
      } else if (nextCourseOption === "join-soon") {
        // Format the date for display
        const date = new Date(joinSoonTime);
        const formattedDate = isNaN(date.getTime())
          ? joinSoonTime.trim()
          : date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
        updateData = { nextCourse: `Join Soon: ${formattedDate}` };
      } else {
        updateData = { nextCourse: "" };
      }

      await updateDoc(studentRef, updateData);

      // Update local state
      setStudent((prev) =>
        prev ? { ...prev, nextCourse: updateData.nextCourse } : null,
      );

      setShowNextCourseModal(false);
      setNextCourseInput("");
      setNextCourseOption("");
      setNextCourseComment("");
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
    const nextCourseValue = student?.nextCourse || "";

    // Check if the next course indicates not interested status
    if (nextCourseValue.startsWith("Not Enrolling: ")) {
      setNextCourseOption("not-interested");
      setNextCourseComment(nextCourseValue.substring("Not Enrolling: ".length));
      setNextCourseInput("");
      setJoinSoonTime("");
    } else if (nextCourseValue.startsWith("Join Soon: ")) {
      setNextCourseOption("join-soon");
      const dateString = nextCourseValue.substring("Join Soon: ".length);
      // Try to parse the date string and convert to date format if it's a valid date
      try {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          // Format to YYYY-MM-DD for date input
          const formattedDate = date.toISOString().split("T")[0];
          setJoinSoonTime(formattedDate);
        } else {
          setJoinSoonTime(dateString);
        }
      } catch (e) {
        setJoinSoonTime(dateString);
      }
      setNextCourseInput("");
      setNextCourseComment("");
    } else {
      setNextCourseOption("enrolling");
      setNextCourseInput(nextCourseValue);
      setNextCourseComment("");
      setJoinSoonTime("");
    }

    setIsEditingNextCourse(true);
    setShowNextCourseModal(true);
  };

  const handleDeleteNextCourse = async () => {
    if (!student) return;

    try {
      const studentRef = doc(db, "students", student.id);

      await updateDoc(studentRef, { nextCourse: "" });

      // Update local state
      setStudent((prev) => (prev ? { ...prev, nextCourse: "" } : null));

      // Reset the radio option and comment
      setNextCourseOption("");
      setNextCourseComment("");
      setJoinSoonTime("");

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
          where("PrnNumber", "==", resolvedParams.prn),
        );
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          setError("No student found with this PRN number.");
          setLoading(false);
          return;
        }
        const studentDoc = querySnapshot.docs[0];
        const data = studentDoc.data();

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
          profileimage: data.profileimage || "",
          imageUrls: data.imageUrls || [],
          fullName: data.fullName || "",
          grade: data.grade || "",
          status: data.status || "",
          uid: data.uid || "",
        };
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
            currentLevel,
          );
        });

        const { completedTasksForCourse } = refreshCourseTaskLists(
          studentData.tasks || [],
        );

        // Log task filtering results for debugging

        // Only show tasks that match the specific course and level - no fallback
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
          })),
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
          })),
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

          const courseKey = Object.keys(data.courseClassNumbers).find((key) => {
            const { courseName: keyCourseName, level: keyLevel } =
              extractCourseAndLevel(key);
            return isSameCourseAndLevel(
              keyCourseName,
              keyLevel,
              currentCourseName,
              currentLevel,
            );
          });

          if (courseKey) {
            assigned = data.courseClassNumbers[courseKey];
          }

          setAssignedClasses(assigned || "N/A");

          // Assigned classes pie chart data (completed vs remaining)
          const assignedClassesNum = Number(assigned) || 0;
          const completedCount = completedTasksForCourse.length;
          const remainingCount = Math.max(
            0,
            assignedClassesNum - completedCount,
          );

          const assignedClassesPieData = [];
          if (assignedClassesNum > 0) {
            if (completedCount > 0) {
              assignedClassesPieData.push({
                name: "Completed",
                value: completedCount,
              });
            }
            if (remainingCount > 0) {
              assignedClassesPieData.push({
                name: "Remaining",
                value: remainingCount,
              });
            }
          }
          setAssignedClassesData(assignedClassesPieData);
        } else {
          // Print the raw slug and extracted values

          const { courseName: currentCourseName, level: currentLevel } =
            extractCourseAndLevel(courseName);

          const courseFromArray = studentData.courses?.find((c) => {
            if (!c.name) return false;
            // Loose match for debugging
            const nameMatch =
              c.name.toLowerCase().trim() ===
              currentCourseName.toLowerCase().trim();
            const levelMatch =
              String(c.level || "").trim() ===
              String(currentLevel || "").trim();

            return nameMatch && levelMatch;
          });

          if (courseFromArray?.classNumber) {
            setAssignedClasses(courseFromArray.classNumber);

            // Assigned classes pie chart data (completed vs remaining)
            const assignedClassesNum = Number(courseFromArray.classNumber) || 0;
            const completedCount = completedTasksForCourse.length;
            const remainingCount = Math.max(
              0,
              assignedClassesNum - completedCount,
            );

            const assignedClassesPieData = [];
            if (assignedClassesNum > 0) {
              if (completedCount > 0) {
                assignedClassesPieData.push({
                  name: "Completed",
                  value: completedCount,
                });
              }
              if (remainingCount > 0) {
                assignedClassesPieData.push({
                  name: "Remaining",
                  value: remainingCount,
                });
              }
            }
            setAssignedClassesData(assignedClassesPieData);
          } else {
            setAssignedClasses("N/A");
            setAssignedClassesData([]);
          }
        }

        if (studentData.courses) {
          const { courseName: currentCourseName, level: currentLevel } =
            extractCourseAndLevel(courseName);

          // Try strict match first
          let currentCourse = studentData.courses.find((c) => {
            if (!c.name) return false;
            const nameMatch =
              c.name.toLowerCase().trim() ===
              currentCourseName.toLowerCase().trim();
            const levelMatch =
              String(c.level || "").trim() ===
              String(currentLevel || "").trim();

            return nameMatch && levelMatch;
          });

          // Fallback: match only by name if strict match fails
          if (!currentCourse) {
            currentCourse = studentData.courses.find((c) => {
              if (!c.name) return false;
              const nameMatch =
                c.name.toLowerCase().trim() ===
                currentCourseName.toLowerCase().trim();

              return nameMatch;
            });
          }

          if (currentCourse) {
            setCourseLevel(currentCourse.level);
            setClassNumber(currentCourse.classNumber);
            setIsCourseCompleted(currentCourse.completed || false);
            setIsCertificateIssued(currentCourse.certificate || false);
            setRubricsGiven({
              rubric1Given: currentCourse.rubric1Given || false,
              rubric2Given: currentCourse.rubric2Given || false,
              rubric3Given: currentCourse.rubric3Given || false,
            });
            setStudentMediaGiven({
              media1Given: currentCourse.media1Given || false,
              media2Given: currentCourse.media2Given || false,
              media3Given: currentCourse.media3Given || false,
              media4Given: currentCourse.media4Given || false,
              media5Given: currentCourse.media5Given || false,
            });

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
          c.name,
        );
        return isSameCourseAndLevel(
          cName,
          cLevel,
          currentCourseName,
          currentLevel,
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
    (Number(classNumber) || 0) - completedTasks.length,
  );

  // State for edit modal
  const [editingTask, setEditingTask] = useState<{
    index: number;
    task: Task;
  } | null>(null);
  const [editedTask, setEditedTask] = useState<Task>({
    course: "",
    task: "",
    dateTime: "",
    status: "",
  });

  // Handler for editing a task
  const handleEditTask = async (index: number, task: Task) => {
    setEditingTask({ index, task });
    setEditedTask({
      course: task.course,
      task: task.task,
      dateTime: task.dateTime,
      status: task.status,
    });
  };

  // Handler for saving edited task
  const handleSaveEdit = async () => {
    if (!student || !editingTask) return;

    try {
      const studentRef = doc(db, "students", student.id);

      // Get current tasks and update the specific task
      const currentTasks = [...(student.tasks || [])];
      const taskIndex = currentTasks.findIndex(
        (t) =>
          t.course === editingTask.task.course &&
          t.task === editingTask.task.task &&
          t.dateTime === editingTask.task.dateTime &&
          t.status === editingTask.task.status,
      );

      if (taskIndex !== -1) {
        currentTasks[taskIndex] = {
          ...currentTasks[taskIndex],
          task: editedTask.task,
          dateTime: editedTask.dateTime,
          status: editedTask.status,
        };
      } else {
        currentTasks.push({
          course: editingTask.task.course,
          task: editedTask.task,
          dateTime: editedTask.dateTime,
          status: editedTask.status || "ongoing",
        });
      }

      await updateDoc(studentRef, { tasks: currentTasks });

      setStudent((prev) => (prev ? { ...prev, tasks: currentTasks } : null));
      refreshCourseTaskLists(currentTasks);

      toast.success("Task updated successfully!");
      setEditingTask(null);
      setEditedTask({ course: "", task: "", dateTime: "", status: "" });
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Failed to update task");
    }
  };

  // Handler for canceling edit
  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditedTask({ course: "", task: "", dateTime: "", status: "" });
  };

  // Handler for deleting a task
  const handleDeleteTask = async (index: number, task: Task) => {
    if (
      !student ||
      !window.confirm(`Are you sure you want to delete task: ${task.task}?`)
    ) {
      return;
    }

    try {
      const studentRef = doc(db, "students", student.id);

      // Get current tasks and remove the specific task
      const currentTasks = [...(student.tasks || [])];
      const taskIndex = currentTasks.findIndex(
        (t) =>
          t.course === task.course &&
          t.task === task.task &&
          t.dateTime === task.dateTime &&
          t.status === task.status,
      );

      if (taskIndex !== -1) {
        currentTasks.splice(taskIndex, 1);

        await updateDoc(studentRef, { tasks: currentTasks });

        // Update local state
        setStudent((prev) => (prev ? { ...prev, tasks: currentTasks } : null));

        // Refresh completed tasks for this course
        refreshCourseTaskLists(currentTasks);

        toast.success("Task deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
    }
  };

  const handleCompleteOngoingTask = async (task: Task) => {
    if (!student || !canCompleteOngoingTask) return;

    try {
      const studentRef = doc(db, "students", student.id);
      const currentTasks = [...(student.tasks || [])];
      const completedAt = new Date().toISOString();
      const taskIndex = currentTasks.findIndex(
        (t) =>
          t.course === task.course &&
          t.task === task.task &&
          t.dateTime === task.dateTime &&
          t.status === task.status,
      );

      if (taskIndex === -1) {
        currentTasks.push({
          ...task,
          dateTime: completedAt,
          status: "complete",
        });
      } else {
        currentTasks[taskIndex] = {
          ...currentTasks[taskIndex],
          dateTime: completedAt,
          status: "complete",
        };
      }

      await updateDoc(studentRef, { tasks: currentTasks });
      setStudent((prev) => (prev ? { ...prev, tasks: currentTasks } : null));
      refreshCourseTaskLists(currentTasks);
      toast.success("Task marked complete!");
    } catch (error) {
      console.error("Error completing ongoing task:", error);
      toast.error("Failed to complete task");
    }
  };

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
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                      {student.profileimage ? (
                        <button
                          type="button"
                          className="block w-full h-full cursor-pointer"
                          onClick={() =>
                            setSelectedPhoto(student.profileimage!)
                          }
                          aria-label="View profile photo"
                        >
                          <Image
                            width={50}
                            height={50}
                            src={student.profileimage}
                            alt={
                              student.fullName || student.username || "Student"
                            }
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null; // Prevent infinite loop
                              if (target.parentNode) {
                                const parent = target.parentNode as HTMLElement;
                                parent.innerHTML = "";
                                const nameToUse =
                                  student.fullName || student.username || "";
                                const initials = nameToUse
                                  ? nameToUse
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .slice(0, 2)
                                  : "";
                                parent.className =
                                  "w-full h-full rounded-full bg-white flex items-center justify-center text-sm font-bold uppercase text-red-800";
                                parent.textContent = initials || "";
                              }
                            }}
                            onLoad={(e) => {}}
                          />
                        </button>
                      ) : student.fullName || student.username ? (
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-sm font-bold uppercase text-red-800">
                          {(student.fullName || student.username)
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                      ) : (
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-sm font-bold uppercase text-red-800">
                          <User size={16} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-lg font-bold truncate">
                      {student.fullName || student.username}
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
                        (completedTasksCount / assignedClassesNum) * 100,
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
                  <div className="flex flex-col gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                    <div className="flex gap-3">
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
                    <div className="flex gap-3">
                      {[
                        {
                          id: "rubric1Given",
                          label: "Rubric 1",
                        },
                        {
                          id: "rubric2Given",
                          label: "Rubric 2",
                        },
                        {
                          id: "rubric3Given",
                          label: "Rubric 3",
                        },
                      ].map(({ id, label }) => (
                        <div key={id} className="flex items-center gap-1.5">
                          <Checkbox
                            id={id}
                            checked={
                              rubricsGiven[id as keyof typeof rubricsGiven]
                            }
                            onCheckedChange={(checked) =>
                              handleRubricChange(
                                id as keyof typeof rubricsGiven,
                                checked,
                              )
                            }
                            className="border-white data-[state=checked]:bg-yellow-500 data-[state=checked]:text-white h-4 w-4"
                          />
                          <label
                            htmlFor={id}
                            className="text-xs font-medium cursor-pointer whitespace-nowrap"
                          >
                            {label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {[
                        {
                          id: "media1Given",
                          label: "Media 1",
                        },
                        {
                          id: "media2Given",
                          label: "Media 2",
                        },
                        {
                          id: "media3Given",
                          label: "Media 3",
                        },
                        {
                          id: "media4Given",
                          label: "Media 4",
                        },
                        {
                          id: "media5Given",
                          label: "Media 5",
                        },
                      ].map(({ id, label }) => (
                        <div key={id} className="flex items-center gap-1.5">
                          <Checkbox
                            id={id}
                            checked={
                              studentMediaGiven[
                                id as keyof typeof studentMediaGiven
                              ]
                            }
                            onCheckedChange={(checked) =>
                              handleStudentMediaChange(
                                id as keyof typeof studentMediaGiven,
                                checked,
                              )
                            }
                            className="border-white data-[state=checked]:bg-purple-500 data-[state=checked]:text-white h-4 w-4"
                          />
                          <label
                            htmlFor={id}
                            className="text-xs font-medium cursor-pointer whitespace-nowrap"
                          >
                            {label}
                          </label>
                        </div>
                      ))}
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
                  setNextCourseOption("");
                  setNextCourseComment("");
                  setJoinSoonTime("");
                  setIsEditingNextCourse(false);
                }}
                aria-label="Close"
              >
                ×
              </button>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {isEditingNextCourse ? "Edit Follow Up" : "Follow Up"}
              </h3>
              <p className="text-gray-600 mb-5">
                {isEditingNextCourse
                  ? "Update the next course for this student"
                  : "Specify what course the student should take next"}
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How is the student interested in the next course?
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="enrolling"
                      name="nextCourseOption"
                      className="h-4 w-4 text-red-600 focus:ring-red-500"
                      checked={nextCourseOption === "enrolling"}
                      onChange={() => setNextCourseOption("enrolling")}
                    />
                    <label
                      htmlFor="enrolling"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Enrolling in New Course - Specify what course the student
                      should take next
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="not-interested"
                      name="nextCourseOption"
                      className="h-4 w-4 text-red-600 focus:ring-red-500"
                      checked={nextCourseOption === "not-interested"}
                      onChange={() => setNextCourseOption("not-interested")}
                    />
                    <label
                      htmlFor="not-interested"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Not Enrolling - Comment why
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="join-soon"
                      name="nextCourseOption"
                      className="h-4 w-4 text-red-600 focus:ring-red-500"
                      checked={nextCourseOption === "join-soon"}
                      onChange={() => setNextCourseOption("join-soon")}
                    />
                    <label
                      htmlFor="join-soon"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Join Soon - Specify when student will join
                    </label>
                  </div>
                </div>
              </div>

              {nextCourseOption === "enrolling" && (
                <div className="mb-4">
                  <label
                    htmlFor="next-course-modal"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Course Name
                  </label>
                  <input
                    id="next-course-modal"
                    type="text"
                    placeholder="Enter next course name"
                    className="px-4 py-2.5 text-gray-900 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm w-full"
                    value={nextCourseInput}
                    onChange={(e) => setNextCourseInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSaveNextCourse();
                      }
                    }}
                  />
                </div>
              )}

              {nextCourseOption === "not-interested" && (
                <div className="mb-4">
                  <label
                    htmlFor="next-course-comment"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Why is the student not interested?
                  </label>
                  <textarea
                    id="next-course-comment"
                    placeholder="Enter comment explaining why the student is not interested"
                    className="px-4 py-2.5 text-gray-900 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm w-full"
                    value={nextCourseComment}
                    onChange={(e) => setNextCourseComment(e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              {nextCourseOption === "join-soon" && (
                <div className="mb-4">
                  <label
                    htmlFor="join-soon-time"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Select expected joining date
                  </label>
                  <input
                    id="join-soon-time"
                    type="date"
                    className="px-4 py-2.5 text-gray-900 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm w-full"
                    value={joinSoonTime}
                    onChange={(e) => setJoinSoonTime(e.target.value)}
                  />
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2.5 rounded-xl bg-red-700 text-white font-semibold text-sm hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSaveNextCourse}
                  disabled={
                    (nextCourseOption === "enrolling" &&
                      !nextCourseInput.trim()) ||
                    (nextCourseOption === "not-interested" &&
                      !nextCourseComment.trim()) ||
                    (nextCourseOption === "join-soon" &&
                      !joinSoonTime.trim()) ||
                    nextCourseOption === ""
                  }
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

        {selectedPhoto && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <div
              className="relative flex h-[min(80vw,24rem)] w-[min(80vw,24rem)] items-center justify-center"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="relative h-full w-full overflow-hidden rounded-full border-1 border-gray-100/10 shadow-2xl">
                <Image
                  fill
                  src={selectedPhoto}
                  alt={student?.fullName || student?.username || "Student"}
                  sizes="100vw"
                  className="object-cover"
                  priority
                />
              </div>
              <button
                type="button"
                className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-800 text-gray-700 shadow-md transition-colors "
                onClick={() => setSelectedPhoto(null)}
                aria-label="Close photo preview"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        )}

        {selectedMediaIndex !== null && student.imageUrls && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setSelectedMediaIndex(null)}
          >
            <div
              className="relative max-h-[85vh] max-w-[85vw] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {isVideoUrl(student.imageUrls[selectedMediaIndex]) ? (
                <video
                  src={student.imageUrls[selectedMediaIndex]}
                  controls
                  autoPlay
                  className="max-h-[85vh] max-w-[85vw] rounded-lg shadow-2xl"
                />
              ) : (
                <Image
                  src={student.imageUrls[selectedMediaIndex]}
                  alt={`Media ${selectedMediaIndex + 1}`}
                  width={900}
                  height={700}
                  className="max-h-[85vh] max-w-[85vw] w-auto h-auto object-contain rounded-lg shadow-2xl"
                />
              )}

              {selectedMediaIndex > 0 && (
                <button
                  onClick={() =>
                    setSelectedMediaIndex((i) => (i !== null ? i - 1 : i))
                  }
                  className="absolute left-2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full"
                  aria-label="Previous media"
                >
                  <ArrowLeftCircle className="w-6 h-6" />
                </button>
              )}
              {selectedMediaIndex < student.imageUrls.length - 1 && (
                <button
                  onClick={() =>
                    setSelectedMediaIndex((i) => (i !== null ? i + 1 : i))
                  }
                  className="absolute right-2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full"
                  aria-label="Next media"
                >
                  <ArrowLeftCircle className="w-6 h-6 rotate-180" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setSelectedMediaIndex(null)}
                className="absolute -top-3 -right-3 flex h-9 w-9 items-center justify-center rounded-full bg-red-800 text-white shadow-md"
                aria-label="Close media preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Task Edit Modal */}
        {editingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold"
                onClick={handleCancelEdit}
                aria-label="Close"
              >
                ×
              </button>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Edit Task
              </h3>
              <p className="text-gray-600 mb-5">
                Modify the task details below
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter task name"
                    className="px-4 py-2.5 text-gray-900 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm w-full"
                    value={editedTask.task}
                    onChange={(e) =>
                      setEditedTask({ ...editedTask, task: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course
                  </label>
                  <input
                    type="text"
                    placeholder="Course cannot be edited"
                    className="px-4 py-2.5 text-gray-500 bg-gray-100 rounded-xl border border-gray-300 text-sm w-full"
                    value={editingTask.task.course}
                    readOnly
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    className="px-4 py-2.5 text-gray-900 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm w-full"
                    value={editedTask.dateTime}
                    onChange={(e) =>
                      setEditedTask({ ...editedTask, dateTime: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    className="px-4 py-2.5 text-gray-900 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm w-full"
                    value={editedTask.status}
                    onChange={(e) =>
                      setEditedTask({ ...editedTask, status: e.target.value })
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="complete">Complete</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  className="px-4 py-2.5 rounded-xl bg-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-400 transition-colors"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2.5 rounded-xl bg-red-700 text-white font-semibold text-sm hover:bg-red-800 transition-colors"
                  onClick={handleSaveEdit}
                >
                  Save Changes
                </button>
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
            {student?.nextCourse ? "Edit Follow Up" : "Follow Up"}
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
              {canViewOngoingTab && (
                <button
                  className={`px-4 py-3 text-base font-medium rounded-t-lg focus:outline-none transition-colors flex items-center gap-2 ${
                    activeTab === 2
                      ? "text-red-700 border-b-2 border-red-700"
                      : "text-gray-500 hover:text-red-700"
                  }`}
                  onClick={() => setActiveTab(2)}
                >
                  <Clock className="w-5 h-5" />
                  Ongoing Classes
                </button>
              )}
              <button
                className={`px-4 py-3 text-base font-medium rounded-t-lg focus:outline-none transition-colors flex items-center gap-2 ${
                  activeTab === 3
                    ? "text-red-700 border-b-2 border-red-700"
                    : "text-gray-500 hover:text-red-700"
                }`}
                onClick={() => setActiveTab(3)}
              >
                <ClipboardCheck className="w-5 h-5" />
                Media ({student.imageUrls?.length || 0})
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
                      {student?.nextCourse ? (
                        <div>
                          {student.nextCourse.startsWith("Not Enrolling: ") ? (
                            <div className="mt-1">
                              <span className="inline-block px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">
                                Not Enrolling
                              </span>
                              <p className="text-sm text-gray-600 mt-1">
                                {student.nextCourse.substring(
                                  "Not Enrolling: ".length,
                                )}
                              </p>
                            </div>
                          ) : student.nextCourse.startsWith("Join Soon: ") ? (
                            <div className="mt-1">
                              <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
                                Join Soon
                              </span>
                              <p className="text-sm text-gray-600 mt-1">
                                {(() => {
                                  const dateString =
                                    student.nextCourse.substring(
                                      "Join Soon: ".length,
                                    );
                                  try {
                                    const date = new Date(dateString);
                                    if (!isNaN(date.getTime())) {
                                      return date.toLocaleDateString();
                                    }
                                    return dateString; // fallback if not a valid date
                                  } catch (e) {
                                    return dateString; // fallback if parsing fails
                                  }
                                })()}
                              </p>
                            </div>
                          ) : (
                            <p className="text-lg font-bold text-gray-900 mt-1 truncate max-w-[120px]">
                              {student.nextCourse}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-lg font-bold text-gray-900 mt-1">
                          Not Set
                        </p>
                      )}
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
                {/* Pie Chart - Assigned Classes */}
                <div className="bg-white rounded-2xl shadow-md p-5">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b flex items-center gap-2">
                    <div className="w-1.5 h-5 bg-red-700 rounded-full"></div>
                    Assigned Classes Status
                  </h2>
                  {assignedClassesData.length > 0 ? (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={assignedClassesData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            innerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, value }: any) =>
                              `${name}: ${value || 0}`
                            }
                            paddingAngle={5}
                          >
                            {assignedClassesData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  entry.name === "Completed"
                                    ? "#10B981"
                                    : "#EF4444"
                                }
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
                      <p>No assigned classes data available</p>
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
                        <div className="mr-4 flex-shrink-0">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-800 font-bold text-sm">
                            {index + 1}
                          </div>
                        </div>
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
                          {/* Edit and Delete buttons for admin */}

                          <div className="flex space-x-2 mt-2">
                            <button
                              onClick={() => handleEditTask(index, task)}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTask(index, task)}
                              className="text-red-600 hover:text-red-800 text-xs font-medium"
                            >
                              Delete
                            </button>
                          </div>
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

          {canViewOngoingTab && activeTab === 2 && (
            <div className="bg-white rounded-2xl shadow-md p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Ongoing Classes ({ongoingTasks.length})
              </h2>

              {ongoingTasks.length > 0 ? (
                <div className="space-y-4">
                  {ongoingTasks.map((task, index) => {
                    const taskDate = new Date(task.dateTime);
                    const isValid = !isNaN(taskDate.getTime());
                    const today = new Date();
                    const isToday =
                      isValid &&
                      today.toDateString() === taskDate.toDateString();
                    const statusColor = STATUS_COLORS[task.status] || "#FBBF24";
                    return (
                      <div
                        key={index}
                        className="flex items-center p-4 border-l-4 rounded-r-lg bg-gradient-to-r from-gray-50 to-white shadow-sm transition-all hover:shadow-md"
                        style={{ borderLeftColor: statusColor }}
                      >
                        <div className="mr-4 flex-shrink-0">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-800 font-bold text-sm">
                            {index + 1}
                          </div>
                        </div>
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
                            {task.status || "ongoing"}
                          </span>
                          <div className="flex flex-wrap justify-end gap-2 mt-2">
                            {canCompleteOngoingTask && (
                              <button
                                type="button"
                                onClick={() => handleCompleteOngoingTask(task)}
                                className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors"
                              >
                                Quick Complete
                              </button>
                            )}
                            <button
                              onClick={() => handleEditTask(index, task)}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteTask(index, task)}
                              className="text-red-600 hover:text-red-800 text-xs font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <Clock className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    No ongoing classes
                  </h3>
                  <p className="mt-1 text-gray-500">
                    Ongoing classes will appear here once available.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 3 && (
            <div className="bg-white rounded-2xl shadow-md p-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
                Media for PRN: {student.PrnNumber} (
                {student.imageUrls?.length || 0})
              </h2>

              {student.imageUrls && student.imageUrls.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {student.imageUrls.map((url, index) => {
                    const isVideo = isVideoUrl(url);
                    return (
                      <div
                        key={index}
                        className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setSelectedMediaIndex(index)}
                      >
                        {isVideo ? (
                          <video
                            src={url}
                            muted
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <Image
                            src={url}
                            alt={`Media ${index + 1}`}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = "/api/placeholder/300/300";
                            }}
                          />
                        )}
                        {isVideo && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <svg
                              className="w-8 h-8 text-white drop-shadow-lg"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <ClipboardCheck className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    No media uploaded yet
                  </h3>
                  <p className="mt-1 text-gray-500">
                    Photos and videos for this student will appear here once
                    uploaded.
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
