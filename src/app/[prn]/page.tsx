"use client";
import React, { use } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  FileText,
  GraduationCap,
  Mail,
  MessageSquare,
  MessageSquarePlus,
  MoreVertical,
  Pencil,
  Phone,
  Plus,
  Shield,
  Trash2,
  Trophy,
  UserCheck,
  Users,
  User as UserIcon,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import courseOptions from "../../../utils/courses";

interface Task {
  course: string;
  dateTime: string;
  status: "ongoing" | "complete";
  task: string;
}

interface CourseData {
  classNumber: string;
  level: string;
  name: string;
  certificate?: boolean;
  completed?: boolean;
  trainer?: string;
  trainerName?: string;
  batchTime?: string;
  batch?: string;
  startedOn?: unknown;
  startDate?: unknown;
  lastClass?: unknown;
  lastClassDate?: unknown;
  attendance?: string | number;
  remarks?: string | number;
  assignments?: string | number;
  pendingAssignments?: string | number;
  totalClasses?: string | number;
  status?: string;
  trainerImage?: string | null;
}

interface Student {
  PrnNumber: string;
  username?: string;
  name?: string;
  fullName?: string;
  profileimage?: string;
  courses: CourseData[];
  courseClassNumbers?: {
    [key: string]: string;
  };
  status?: string;
  phone?: string;
  phoneNumber?: string;
  mobile?: string;
  email?: string;
  joined?: unknown;
  joinedOn?: unknown;
  createdAt?: unknown;
  center?: string;
  branch?: string;
  age?: string | number;
  tasks?: Task[];
  remark?: string;
  remarkUpdatedAt?: string | null;
}

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#061341] outline-none transition-all placeholder:text-gray-400 focus:border-[#A81B1E] focus:ring-2 focus:ring-[#A81B1E]/20";
const labelCls =
  "mb-1 block text-[11px] font-semibold uppercase tracking-widest text-gray-400";

async function getStudentData(prn: string) {
  const studentsRef = collection(db, "students");
  const q = query(studentsRef, where("PrnNumber", "==", prn));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  const d = querySnapshot.docs[0].data();
  return {
    ...d,
    profileimage: d.profileimage || d.imageUrl || d.imageUrls?.[0] || undefined,
  } as Student;
}

function getStudentDisplayName(student: Student) {
  return (
    student.username ||
    student.fullName ||
    student.name ||
    "Student"
  ).trim();
}

function toSlug(courseName: string, level?: string) {
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
}

function getLevelConfig(level: string) {
  switch (level.toLowerCase()) {
    case "1":
    case "beginner":
      return {
        label: "Beginner",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        dot: "bg-emerald-500",
      };
    case "2":
    case "intermediate":
      return {
        label: "Intermediate",
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        dot: "bg-blue-500",
      };
    case "3":
    case "advanced":
      return {
        label: "Advanced",
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200",
        dot: "bg-purple-500",
      };
    case "4":
    case "expert":
      return {
        label: "Expert",
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        dot: "bg-amber-500",
      };
    default:
      return {
        label: `Level ${level}`,
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
        dot: "bg-gray-500",
      };
  }
}

function getStatusConfig(status?: string) {
  switch (status?.toLowerCase()) {
    case "active":
      return {
        label: "Active",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        dot: "bg-emerald-500",
      };
    case "inactive":
      return {
        label: "Inactive",
        bg: "bg-red-50",
        text: "text-[#9F0712]",
        border: "border-red-200",
        dot: "bg-red-500",
      };
    default:
      return {
        label: "Active",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        dot: "bg-emerald-500",
      };
  }
}

function formatDisplayValue(value: unknown, fallback = "Not set") {
  if (!value) return fallback;

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (value instanceof Date) {
    return value.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  if (
    typeof value === "object" &&
    "seconds" in value &&
    typeof (value as { seconds?: unknown }).seconds === "number"
  ) {
    return new Date(
      (value as { seconds: number }).seconds * 1000,
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return fallback;
}

function formatInputDate(value = new Date()) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatInputDateTime(value = new Date()) {
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");
  return `${formatInputDate(value)}T${hours}:${minutes}`;
}

function normalizeCourseTaskName(value?: string | null) {
  return String(value || "")
    .split("|")[0]
    .trim()
    .toLowerCase();
}

function extractCourseAndLevel(courseString: string): {
  courseName: string;
  level: string | null;
} {
  if (!courseString) return { courseName: "", level: null };

  const normalized = courseString.trim().toLowerCase();
  const pipeMatch = courseString.match(/^(.+?)\|(\d+)$/);
  if (pipeMatch) {
    return {
      courseName: pipeMatch[1].trim(),
      level: pipeMatch[2],
    };
  }

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

  const courseName = courseString
    .replace(/\s+Level\s+\d+\b/gi, "")
    .replace(/\s+Level\s+(beginner|intermediate|advanced|expert)\b/gi, "")
    .trim();

  return { courseName, level };
}

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

function getAssignedClassCount(student: Student, course: CourseData) {
  const courseLabel = course.level
    ? `${course.name} Level ${course.level}`
    : course.name;
  const { courseName: currentCourseName, level: currentLevel } =
    extractCourseAndLevel(courseLabel);

  if (
    student.courseClassNumbers &&
    typeof student.courseClassNumbers === "object"
  ) {
    const courseKey = Object.keys(student.courseClassNumbers).find((key) => {
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
      return Number(student.courseClassNumbers[courseKey]) || 0;
    }
  }

  return Number(course.classNumber) || 0;
}

function getCompletedTasksForCourse(student: Student, course: CourseData) {
  const currentCourseName = course.name;
  const currentLevel = course.level || null;

  return (student.tasks || []).filter((studentTask) => {
    if (!studentTask.course) return false;
    const { courseName: taskCourseName, level: taskLevel } =
      extractCourseAndLevel(studentTask.course);
    return (
      studentTask.status?.toLowerCase() === "complete" &&
      isSameCourseAndLevel(
        taskCourseName,
        taskLevel,
        currentCourseName,
        currentLevel,
      )
    );
  });
}

function DashboardModal({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm sm:p-4">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-5 sm:py-4">
          <h2 className="text-sm font-bold text-[#061341]">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-5 sm:py-4">
          {children}
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 px-4 py-3 sm:flex-row sm:justify-end sm:gap-2 sm:px-5">
          {footer}
        </div>
      </div>
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ prn: string }> }) {
  const { prn } = use(params);
  const [student, setStudent] = React.useState<Student | null>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [userChecked, setUserChecked] = React.useState(false);
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [newClassNumber, setNewClassNumber] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [classNumberError, setClassNumberError] = React.useState<string | null>(
    null,
  );
  const [deletingIndex, setDeletingIndex] = React.useState<number | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    React.useState(false);
  const [showAddClassModal, setShowAddClassModal] = React.useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = React.useState(false);
  const [showRemarkModal, setShowRemarkModal] = React.useState(false);
  const [task, setTask] = React.useState("");
  const [taskDateTime, setTaskDateTime] = React.useState(formatInputDateTime());
  const [taskStatus, setTaskStatus] = React.useState<"ongoing" | "complete">(
    "complete",
  );
  const [taskCourse, setTaskCourse] = React.useState("");
  const [remarkDraft, setRemarkDraft] = React.useState("");
  const [newCourseFields, setNewCourseFields] = React.useState({
    name: "",
    classNumber: "",
    level: "1",
    status: "ongoing",
    completed: false,
    startDate: formatInputDate(),
  });
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [actionSaving, setActionSaving] = React.useState(false);

  React.useEffect(() => {
    getStudentData(prn).then(setStudent);
  }, [prn]);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      setUserChecked(true);
      if (!user) {
        setIsAdmin(false);
        return;
      }
      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const adminDocRef = doc(db, "admins", user.uid);
        const adminDoc = await getDoc(adminDocRef);
        setIsAdmin(adminDoc.exists());
      } catch {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleEditClick = (index: number, currentClassNumber: string) => {
    setEditingIndex(index);
    setNewClassNumber(currentClassNumber || "");
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setNewClassNumber("");
    setClassNumberError(null);
  };

  const setActionNotice = (message: string, type: "success" | "error") => {
    setActionMessage(type === "success" ? message : null);
    setActionError(type === "error" ? message : null);
  };

  const refreshStudent = async () => {
    const freshStudent = await getStudentData(prn);
    setStudent(freshStudent);
  };

  const resetAddClassForm = () => {
    setTask("");
    setTaskDateTime(formatInputDateTime());
    setTaskStatus("complete");
    setTaskCourse("");
  };

  const resetAddCourseForm = () => {
    setNewCourseFields({
      name: "",
      classNumber: "",
      level: "1",
      status: "ongoing",
      completed: false,
      startDate: formatInputDate(),
    });
  };

  const openAddClassModal = () => {
    if (!student?.PrnNumber) {
      setActionNotice("Contact admin for PRN", "error");
      return;
    }

    const lastCompletedTask = (student.tasks || [])
      .filter((studentTask) => studentTask.status?.toLowerCase() === "complete")
      .sort(
        (a, b) =>
          new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime(),
      )[0];
    const latestCourseForTask = student.courses?.[student.courses.length - 1];
    setTaskCourse(
      lastCompletedTask?.course ||
        (latestCourseForTask
          ? latestCourseForTask.name +
            (latestCourseForTask.level ? `|${latestCourseForTask.level}` : "")
          : ""),
    );
    setShowAddClassModal(true);
  };

  const handleAddClassSubmit = async () => {
    if (!student) return;
    const taskLines = task
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (taskLines.length === 0) {
      setActionNotice("Task cannot be empty", "error");
      return;
    }
    if (!taskDateTime) {
      setActionNotice("Date and time required", "error");
      return;
    }
    if (!taskCourse) {
      setActionNotice("Course required", "error");
      return;
    }

    const newTasks: Task[] = [];
    for (let index = 0; index < taskLines.length; index += 1) {
      const line = taskLines[index];
      const separatorIndex = line.indexOf("|");
      const taskText =
        separatorIndex >= 0 ? line.slice(0, separatorIndex).trim() : line;
      const rawDate =
        separatorIndex >= 0 ? line.slice(separatorIndex + 1).trim() : "";

      if (!taskText) {
        setActionNotice(
          `Task description required on line ${index + 1}`,
          "error",
        );
        return;
      }

      let lineDateTime = taskDateTime;
      if (rawDate) {
        const parsed = new Date(rawDate.replace(" ", "T"));
        if (Number.isNaN(parsed.getTime())) {
          setActionNotice(`Invalid date/time on line ${index + 1}`, "error");
          return;
        }
        lineDateTime = formatInputDateTime(parsed);
      }

      newTasks.push({
        task: taskText,
        dateTime: lineDateTime,
        status: taskStatus,
        course: taskCourse,
      });
    }

    setActionSaving(true);
    try {
      const studentsRef = collection(db, "students");
      const q = query(studentsRef, where("PrnNumber", "==", student.PrnNumber));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setActionNotice("Student not found", "error");
        return;
      }

      const studentDocRef = doc(db, "students", querySnapshot.docs[0].id);
      const currentTasks = (querySnapshot.docs[0].data().tasks || []) as Task[];
      await updateDoc(studentDocRef, {
        tasks: [...currentTasks, ...newTasks],
      });
      setStudent({
        ...student,
        tasks: [...(student.tasks || []), ...newTasks],
      });
      setShowAddClassModal(false);
      resetAddClassForm();
      setActionNotice(
        newTasks.length === 1
          ? `Class "${newTasks[0].task}" added`
          : `${newTasks.length} classes added`,
        "success",
      );
    } catch (error) {
      console.error("Error adding class:", error);
      setActionNotice("Error adding class", "error");
    } finally {
      setActionSaving(false);
    }
  };

  const handleAddCourseSubmit = async () => {
    if (!student) return;
    if (
      !newCourseFields.name.trim() ||
      !newCourseFields.classNumber.trim() ||
      !newCourseFields.level.trim()
    ) {
      setActionNotice("All course fields are required", "error");
      return;
    }

    const newCourse: CourseData = {
      name: newCourseFields.name.trim(),
      classNumber: newCourseFields.classNumber.trim(),
      level: newCourseFields.level.trim(),
      status: newCourseFields.status,
      completed: newCourseFields.completed,
      startDate: newCourseFields.startDate,
    };

    setActionSaving(true);
    try {
      const studentsRef = collection(db, "students");
      const q = query(studentsRef, where("PrnNumber", "==", student.PrnNumber));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setActionNotice("Student not found", "error");
        return;
      }

      const existing = (querySnapshot.docs[0].data().courses ||
        []) as CourseData[];
      const duplicate = existing.some(
        (courseItem) =>
          typeof courseItem === "object" &&
          courseItem?.name?.toLowerCase() === newCourse.name.toLowerCase() &&
          courseItem.level === newCourse.level,
      );
      if (duplicate) {
        setActionNotice("Course already exists", "error");
        return;
      }

      const studentDocRef = doc(db, "students", querySnapshot.docs[0].id);
      await updateDoc(studentDocRef, {
        courses: arrayUnion(newCourse),
      });
      setStudent({
        ...student,
        courses: [...(student.courses || []), newCourse],
      });
      setShowAddCourseModal(false);
      resetAddCourseForm();
      setActionNotice("Course added", "success");
    } catch (error) {
      console.error("Error adding course:", error);
      setActionNotice("Error adding course", "error");
    } finally {
      setActionSaving(false);
    }
  };

  const openRemarkModal = () => {
    if (!student?.PrnNumber) {
      setActionNotice("Contact admin for PRN", "error");
      return;
    }
    setRemarkDraft(student.remark || "");
    setShowRemarkModal(true);
  };

  const handleSaveRemark = async () => {
    if (!student) return;

    setActionSaving(true);
    try {
      const trimmedRemark = remarkDraft.trim();
      const remarkUpdatedAt = new Date().toISOString();
      const studentsRef = collection(db, "students");
      const q = query(studentsRef, where("PrnNumber", "==", student.PrnNumber));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setActionNotice("Student not found", "error");
        return;
      }

      const studentDocRef = doc(db, "students", querySnapshot.docs[0].id);
      await updateDoc(studentDocRef, {
        remark: trimmedRemark,
        remarkUpdatedAt,
      });
      setStudent({
        ...student,
        remark: trimmedRemark,
        remarkUpdatedAt,
      });
      setShowRemarkModal(false);
      setRemarkDraft("");
      setActionNotice("Remark saved", "success");
    } catch (error) {
      console.error("Failed to save remark:", error);
      setActionNotice("Failed to save remark", "error");
    } finally {
      setActionSaving(false);
    }
  };

  const handleSave = async (index: number) => {
    if (!student) return;
    const classNumberValue = parseInt(newClassNumber, 10);
    if (
      isNaN(classNumberValue) ||
      classNumberValue < 1 ||
      classNumberValue > 30
    ) {
      setClassNumberError("Class number must be between 1 and 30");
      return;
    }
    setClassNumberError(null);
    setLoading(true);
    try {
      const updatedCourses = [...student.courses];
      updatedCourses[index] = {
        ...updatedCourses[index],
        classNumber: newClassNumber,
      };
      const studentsRef = collection(db, "students");
      const q = query(studentsRef, where("PrnNumber", "==", student.PrnNumber));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const studentDocRef = doc(db, "students", querySnapshot.docs[0].id);
        await updateDoc(studentDocRef, { courses: updatedCourses });
        setStudent({ ...student, courses: updatedCourses });
        setEditingIndex(null);
        setNewClassNumber("");
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (index: number) => {
    setDeletingIndex(index);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    if (!student || deletingIndex === null) return;
    setLoading(true);
    try {
      const updatedCourses = [...student.courses];
      updatedCourses.splice(deletingIndex, 1);
      const studentsRef = collection(db, "students");
      const q = query(studentsRef, where("PrnNumber", "==", student.PrnNumber));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const studentDocRef = doc(db, "students", querySnapshot.docs[0].id);
        await updateDoc(studentDocRef, { courses: updatedCourses });
        setStudent({ ...student, courses: updatedCourses });
      }
      setDeletingIndex(null);
      setShowDeleteConfirmation(false);
    } catch (error) {
      console.error("Error deleting course:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingIndex(null);
    setShowDeleteConfirmation(false);
  };

  if (student === null) return null;

  if (!student) {
    return (
      <main
        role="main"
        aria-label="Student Not Found"
        className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4"
      >
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-10">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-red-50">
              <AlertTriangle className="w-8 h-8 text-[#A81B1E]" />
            </div>
            <h2
              className="text-xl sm:text-2xl font-bold mb-2 text-[#061341]"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Student Not Found
            </h2>
            <p className="text-gray-500 mb-6 break-words">
              No student found with PRN:{" "}
              <code className="font-mono font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                {prn}
              </code>
            </p>
            <Link href="/student-list">
              <button className="px-6 py-2.5 bg-[#D71920] text-white text-sm font-semibold rounded-lg hover:bg-[#A81B1E] transition-colors">
                Back to Student List
              </button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const statusConfig = getStatusConfig(student.status);
  const completedCount =
    student.courses?.filter((c) => c.completed).length || 0;
  const certCount = student.courses?.filter((c) => c.certificate).length || 0;
  const courses = student.courses || [];
  const totalCourses = courses.length;
  const attendanceAverage = totalCourses
    ? Math.round(
        courses.reduce((sum, course) => {
          const value =
            typeof course.attendance === "number"
              ? course.attendance
              : parseInt(String(course.attendance || "92"), 10);
          return sum + (Number.isNaN(value) ? 92 : value);
        }, 0) / totalCourses,
      )
    : 0;
  const contactPhone =
    student.phone || student.phoneNumber || student.mobile || "+91 98765 43210";
  const contactEmail = student.email || "shrikant@example.com";
  const studentDisplayName = getStudentDisplayName(student);
  const studentInitial = studentDisplayName.charAt(0).toUpperCase();
  const joinedDate = formatDisplayValue(
    student.joined || student.joinedOn || student.createdAt,
    "10 May 2026",
  );
  const centerName = student.center || student.branch || "Pune";
  const studentAge = student.age || "16";
  const latestCourse = courses[courses.length - 1];
  const nextClassDate = formatDisplayValue(
    latestCourse?.lastClassDate,
    "3 Aug",
  );
  const latestCompletedTask = [...(student.tasks || [])]
    .filter((studentTask) => studentTask.status?.toLowerCase() === "complete")
    .sort(
      (a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime(),
    )[0];
  const latestCompletedTaskDate = latestCompletedTask?.dateTime
    ? new Date(latestCompletedTask.dateTime)
    : null;
  const latestCompletedTaskDateLabel =
    latestCompletedTaskDate && !Number.isNaN(latestCompletedTaskDate.getTime())
      ? latestCompletedTaskDate.toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })
      : "Date not specified";
  const latestCompletedTaskCourse = latestCompletedTask?.course
    ? (() => {
        const { courseName, level } = extractCourseAndLevel(
          latestCompletedTask.course,
        );
        return level ? `${courseName} Level ${level}` : courseName;
      })()
    : "";

  return (
    <>
      <main
        role="main"
        aria-label="Student Dashboard"
        className="relative min-h-screen overflow-hidden bg-[#f8fafc] text-[#061341]"
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-70"
          style={{
            background:
              "radial-gradient(60% 100% at 15% 0%, rgba(168,27,30,0.08) 0%, rgba(168,27,30,0) 60%), radial-gradient(50% 90% at 90% 0%, rgba(8,85,171,0.07) 0%, rgba(8,85,171,0) 60%)",
          }}
        />
        <div className="relative mx-auto w-full max-w-[1500px] px-3 py-4 sm:px-6 sm:py-5 lg:px-8">
          {(actionMessage || actionError) && (
            <div
              className={`mb-4 rounded-xl border px-4 py-3 text-sm font-semibold ${
                actionError
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {actionError || actionMessage}
            </div>
          )}

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/student-list" className="w-full sm:w-auto">
              <button className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-violet-300 bg-white px-4 text-sm font-semibold text-[#061341] shadow-sm transition-all duration-150 hover:border-violet-500 hover:text-violet-700 active:scale-[0.98] sm:w-auto sm:justify-start">
                <ArrowLeft className="h-4 w-4" />
                Back to Student Record
              </button>
            </Link>
          </div>

          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-[0_1px_2px_rgba(6,19,65,0.04),0_8px_24px_-12px_rgba(6,19,65,0.08)] sm:p-5">
            <div className="grid gap-5 xl:grid-cols-[1fr_660px]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative mx-auto h-24 w-24 shrink-0 rounded-full bg-gradient-to-br from-[#D71920] via-[#A81B1E] to-[#062341] p-[3px] sm:mx-0">
                  <div className="h-full w-full overflow-hidden rounded-full bg-white">
                    {student.profileimage ? (
                      <Image
                        src={student.profileimage}
                        alt={studentDisplayName}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = "/assets/logo1.png";
                        }}
                      />
                    ) : (
                      <span
                        className="flex h-full w-full items-center justify-center bg-red-50 text-3xl font-bold text-[#A81B1E]"
                        style={{ fontFamily: "Syne, sans-serif" }}
                      >
                        {studentInitial}
                      </span>
                    )}
                  </div>
                </div>

                <div className="min-w-0 text-center sm:text-left">
                  <div className="mb-2 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                    <h1
                      className="text-xl font-bold leading-tight text-[#061341] sm:text-2xl lg:text-3xl"
                      style={{ fontFamily: "Syne, sans-serif" }}
                    >
                      {studentDisplayName}
                    </h1>
                  </div>
                  <p className="mb-3 text-base font-semibold text-[#061341]">
                    PRN: {student.PrnNumber}
                  </p>
                  <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                    {userChecked && isAdmin && (
                      <span className="inline-flex items-center justify-center gap-2 sm:justify-start">
                        <Phone className="h-4 w-4 shrink-0 text-slate-500" />
                        <span className="truncate">{contactPhone}</span>
                      </span>
                    )}
                    <span className="inline-flex items-center justify-center gap-2 sm:justify-start">
                      <Mail className="h-4 w-4 shrink-0 text-slate-500" />
                      <span className="truncate">{contactEmail}</span>
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-500 sm:justify-start">
                    <span>Joined: {joinedDate}</span>
                    <span className="hidden h-4 w-px bg-slate-300 sm:block" />
                    <span>Center: {centerName}</span>
                    <span className="hidden h-4 w-px bg-slate-300 sm:block" />
                    <span>Age: {studentAge}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-gray-100 bg-gray-50/40 p-3 sm:gap-3 sm:grid-cols-4">
                {[
                  {
                    icon: GraduationCap,
                    value: totalCourses,
                    label: "Courses",
                    sublabel: "Enrolled",
                    color: "text-blue-600",
                    bg: "bg-blue-50",
                  },
                  {
                    icon: CheckCircle2,
                    value: completedCount,
                    label: "Completed",
                    sublabel: "Courses",
                    color: "text-emerald-600",
                    bg: "bg-emerald-50",
                  },
                  {
                    icon: Trophy,
                    value: certCount,
                    label: "Certificates",
                    sublabel: "Issued",
                    color: "text-orange-500",
                    bg: "bg-orange-50",
                  },

                  {
                    icon: CalendarDays,
                    value: nextClassDate,
                    label: "Next Class",
                    sublabel: "In 2 days",
                    color: "text-blue-600",
                    bg: "bg-blue-50",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="group rounded-xl border border-gray-200 bg-white p-3 text-center shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md sm:p-4"
                  >
                    <div
                      className={`mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110 sm:h-9 sm:w-9 ${item.bg}`}
                    >
                      <item.icon
                        className={`h-4 w-4 sm:h-5 sm:w-5 ${item.color}`}
                      />
                    </div>
                    <p
                      className="truncate text-lg font-bold leading-none text-[#061341] sm:text-2xl"
                      style={{ fontFamily: "Syne, sans-serif" }}
                    >
                      {item.value}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-[#061341] sm:text-sm">
                      {item.label}
                    </p>
                    <p className="text-[10px] text-slate-500 sm:text-xs">
                      {item.sublabel}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50/60 p-2">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <button
                  onClick={openAddClassModal}
                  className="flex h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-[#061341] shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 hover:shadow active:translate-y-0 active:scale-[0.98] sm:gap-2 sm:px-3 sm:text-sm"
                >
                  <Plus className="h-4 w-4 shrink-0 text-[#D71920] sm:h-5 sm:w-5" />
                  <span className="truncate">Add Class</span>
                </button>
                <button
                  onClick={openRemarkModal}
                  className="flex h-11 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-[#061341] shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50 hover:shadow active:translate-y-0 active:scale-[0.98] sm:gap-2 sm:px-3 sm:text-sm"
                >
                  <MessageSquarePlus className="h-4 w-4 shrink-0 text-orange-500 sm:h-5 sm:w-5" />
                  <span className="truncate">Add Remark</span>
                </button>
                <button
                  onClick={() => setShowAddCourseModal(true)}
                  className="flex h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2 text-xs font-semibold text-[#061341] shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:shadow active:translate-y-0 active:scale-[0.98] sm:gap-2 sm:px-3 sm:text-sm"
                >
                  <BookOpen className="h-4 w-4 shrink-0 text-blue-600 sm:h-5 sm:w-5" />
                  <span className="truncate">Add Course</span>
                </button>
              </div>
            </div>
          </section>

          {!student.courses || student.courses.length === 0 ? (
            <section className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center sm:p-16">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-50 to-orange-50">
                <BookOpen className="h-8 w-8 text-[#A81B1E]" />
              </div>
              <h2
                className="mb-2 text-xl font-bold text-[#061341]"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                No Courses Enrolled
              </h2>
              <p className="mx-auto mb-6 max-w-sm text-gray-500">
                This student is not currently enrolled in any courses.
              </p>
              <Link href="/all-courses">
                <button className="rounded-lg bg-gradient-to-r from-[#D71920] to-[#A81B1E] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:shadow-md hover:brightness-110 active:scale-[0.98]">
                  Browse Courses
                </button>
              </Link>
            </section>
          ) : (
            <section className="mt-6 grid gap-5 xl:grid-cols-[1fr_320px]">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1 sm:px-2">
                  <h2
                    className="text-lg font-bold text-[#061341] sm:text-xl"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    Enrolled Courses ({student.courses.length})
                  </h2>
                  {userChecked && isAdmin && (
                    <div className="flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-3 py-1.5">
                      <Shield className="h-3.5 w-3.5 text-[#A81B1E]" />
                      <span className="text-xs font-semibold text-[#A81B1E]">
                        Admin Mode
                      </span>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-gray-100 bg-gray-50/40 p-2 sm:p-3">
                  <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
                    {[...(student.courses || [])]
                      .reverse()
                      .map((course, index) => {
                        const realIndex =
                          (student.courses?.length || 0) - 1 - index;
                        const levelConfig = getLevelConfig(course.level);
                        const assignedClassCount = getAssignedClassCount(
                          student,
                          course,
                        );
                        const completedTasksForCourse =
                          getCompletedTasksForCourse(student, course);
                        const completedClassCount =
                          completedTasksForCourse.length;
                        const courseProgress = assignedClassCount
                          ? Math.min(
                              100,
                              Math.round(
                                (completedClassCount / assignedClassCount) *
                                  100,
                              ),
                            )
                          : 0;
                        const trainer =
                          course.trainer || course.trainerName || "";
                        const batchTime =
                          course.batchTime || course.batch || "Sun, 5:00 PM";
                        const startedOn = formatDisplayValue(
                          course.startedOn || course.startDate,
                          "10 May 2026",
                        );
                        const lastClassDate = formatDisplayValue(
                          course.lastClassDate || course.lastClass,
                          "29 Jul 2026",
                        );
                        const totalClassCount = assignedClassCount || 0;
                        course.pendingAssignments || course.assignments || 1;

                        return (
                          <article
                            key={`${course.name}-${index}`}
                            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-lg sm:p-5"
                          >
                            <div
                              className={`absolute inset-x-0 top-0 h-1 ${levelConfig.dot} opacity-80`}
                            />
                            {course.completed && (
                              <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-white/55">
                                <Image
                                  src="/completed.png"
                                  alt="Course Completed"
                                  width={220}
                                  height={220}
                                  className="w-40 max-w-[60%] object-contain drop-shadow-xl sm:w-[220px]"
                                />
                              </div>
                            )}

                            {course.certificate && (
                              <div className="absolute right-10 top-4 z-20 sm:right-12">
                                <Image
                                  src="/assets/certificate.png"
                                  alt="Certificate"
                                  width={44}
                                  height={44}
                                  className="h-9 w-9 object-contain drop-shadow-md sm:h-11 sm:w-11"
                                />
                              </div>
                            )}

                            <div className="mb-4 flex items-start justify-between gap-2 sm:gap-3">
                              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3 sm:h-12 sm:w-12">
                                  <BookOpen className="h-6 w-6 text-[#D71920] sm:h-7 sm:w-7" />
                                </div>
                                <div className="min-w-0">
                                  <span
                                    className={`mb-2 inline-flex items-center rounded-lg px-2.5 py-1 text-[11px] font-semibold sm:px-3 sm:text-xs ${levelConfig.bg} ${levelConfig.text}`}
                                  >
                                    {levelConfig.label}
                                  </span>
                                  <Link
                                    href={`/${student.PrnNumber}/${toSlug(
                                      course.name,
                                      course.level,
                                    )}`}
                                  >
                                    <h3
                                      className="truncate text-lg font-bold text-[#061341] transition-colors hover:text-[#D71920] sm:text-xl"
                                      style={{ fontFamily: "Syne, sans-serif" }}
                                    >
                                      {course.name}
                                    </h3>
                                  </Link>
                                </div>
                              </div>
                            </div>

                            <div className="text-sm mt-2 flex items-center gap-2">
                              <span className="font-medium text-gray-500">
                                Assigned Trainer:
                              </span>
                              <div className="flex items-center gap-2">
                                {course.trainerName ? (
                                  <>
                                    {course.trainerImage ? (
                                      <Image
                                        width={50}
                                        height={50}
                                        src={course.trainerImage}
                                        alt={course.trainerName}
                                        className="w-6 h-6 rounded-full object-cover border border-gray-200"
                                      />
                                    ) : (
                                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#A81B1E] to-[#062341] flex items-center justify-center text-xs font-medium text-white">
                                        {(
                                          course.trainerName?.charAt(0) || "?"
                                        ).toUpperCase()}
                                      </div>
                                    )}
                                    <span className="font-medium text-[#A81B1E]">
                                      {course.trainerName}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200"></div>
                                    <span className="font-medium italic text-gray-400">
                                      Not Assigned
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="py-5">
                              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                                <p className="text-sm font-semibold text-[#061341]">
                                  Progress
                                </p>
                                <p className="flex items-center gap-2 text-xs font-bold text-[#061341] sm:text-sm">
                                  {completedClassCount} / {totalClassCount}{" "}
                                  Classes
                                  <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 sm:px-3 sm:text-xs">
                                    {courseProgress}%
                                  </span>
                                </p>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-[width] duration-500 ease-out"
                                  style={{ width: `${courseProgress}%` }}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-y-4 text-xs text-[#061341]">
                              <div className="border-r border-gray-200 pr-3">
                                <div className="mb-1 flex items-center gap-2">
                                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
                                    <CalendarDays className="h-4 w-4 text-blue-600" />
                                  </span>
                                  <span className="font-semibold">
                                    Last Class
                                  </span>
                                </div>
                                <p className="pl-9 text-slate-600">
                                  {lastClassDate}
                                </p>
                              </div>
                            </div>

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <Link
                                href={`/${student.PrnNumber}/${toSlug(
                                  course.name,
                                  course.level,
                                )}`}
                                className="w-full sm:w-auto"
                              >
                                <button className="group/btn inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-5 text-sm font-bold text-[#D71920] transition-all duration-150 hover:border-red-300 hover:bg-red-50 hover:shadow-sm active:scale-[0.98] sm:w-auto sm:min-w-48">
                                  Continue Course
                                  <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover/btn:translate-x-0.5" />
                                </button>
                              </Link>

                              <div className="flex flex-wrap items-center gap-2">
                                {userChecked &&
                                isAdmin &&
                                editingIndex === realIndex ? (
                                  <div className="flex flex-wrap items-center gap-2">
                                    <input
                                      type="text"
                                      className={`h-10 w-20 rounded-lg border px-2.5 text-sm font-mono outline-none transition-all focus:border-[#A81B1E] focus:ring-2 focus:ring-[#A81B1E]/30 ${
                                        classNumberError
                                          ? "border-red-400 bg-red-50"
                                          : "border-gray-200"
                                      }`}
                                      value={newClassNumber}
                                      onChange={(e) => {
                                        setNewClassNumber(e.target.value);
                                        if (classNumberError)
                                          setClassNumberError(null);
                                      }}
                                      disabled={loading}
                                      aria-label="Class number"
                                    />
                                    <button
                                      className="inline-flex h-10 items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleSave(realIndex);
                                      }}
                                      disabled={loading}
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                      {loading ? "Saving..." : "Save"}
                                    </button>
                                    <button
                                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-600 transition-colors hover:bg-gray-100"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleCancel();
                                      }}
                                      disabled={loading}
                                      aria-label="Cancel edit"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                    {classNumberError && (
                                      <p className="basis-full text-xs text-red-500">
                                        {classNumberError}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  userChecked &&
                                  isAdmin && (
                                    <button
                                      className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleEditClick(
                                          realIndex,
                                          course.classNumber,
                                        );
                                      }}
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                      Edit Class {course.classNumber || ""}
                                    </button>
                                  )
                                )}

                                {userChecked && isAdmin && (
                                  <button
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-red-600 transition-colors hover:bg-red-50"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleDeleteClick(realIndex);
                                    }}
                                    aria-label="Delete course"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </article>
                        );
                      })}
                  </div>
                </div>
              </div>

              <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:sticky sm:top-5 sm:self-start sm:p-6">
                <h2
                  className="mb-6 text-lg font-bold text-[#061341] sm:text-xl"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  Recent Activity
                </h2>
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 ring-4 ring-emerald-50/50">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#061341]">Last Class</p>
                    <p className="text-sm text-slate-600 break-words">
                      {latestCompletedTask?.task || "No class completed yet"}
                    </p>
                    {latestCompletedTask && (
                      <div className="mt-1 space-y-0.5 text-xs text-slate-500">
                        {latestCompletedTaskCourse && (
                          <p>{latestCompletedTaskCourse}</p>
                        )}
                        <p>{latestCompletedTaskDateLabel}</p>
                      </div>
                    )}
                  </div>
                </div>
              </aside>
            </section>
          )}
        </div>

        <DashboardModal
          open={showAddClassModal}
          title="Add Class"
          onClose={() => {
            setShowAddClassModal(false);
            resetAddClassForm();
          }}
          footer={
            <>
              <button
                onClick={() => {
                  setShowAddClassModal(false);
                  resetAddClassForm();
                }}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-150 hover:bg-gray-100 active:scale-[0.98] sm:w-auto"
                disabled={actionSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleAddClassSubmit}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#A81B1E] px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:bg-[#8a1518] hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 sm:w-auto"
                disabled={actionSaving}
              >
                <Plus className="h-4 w-4" />
                {actionSaving ? "Adding..." : "Add Class"}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className={labelCls}>PRN</label>
              <input
                className={`${inputCls} cursor-not-allowed bg-gray-50`}
                readOnly
                value={student.PrnNumber}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Date & Time</label>
                <input
                  type="datetime-local"
                  value={taskDateTime}
                  onChange={(event) => setTaskDateTime(event.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select
                  value={taskStatus}
                  onChange={(event) =>
                    setTaskStatus(event.target.value as "ongoing" | "complete")
                  }
                  className={inputCls}
                >
                  <option value="ongoing">Ongoing</option>
                  <option value="complete">Complete</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Course</label>
              <select
                value={taskCourse}
                onChange={(event) => setTaskCourse(event.target.value)}
                className={inputCls}
              >
                <option value="">Select course</option>
                {student.courses?.map((courseItem, index) => (
                  <option
                    key={`${courseItem.name}-${courseItem.level}-${index}`}
                    value={
                      courseItem.name +
                      (courseItem.level ? `|${courseItem.level}` : "")
                    }
                  >
                    {courseItem.name}
                    {courseItem.level ? ` (Level ${courseItem.level})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Task Description(s)</label>
              <textarea
                value={task}
                onChange={(event) => setTask(event.target.value)}
                placeholder="Enter one task per line"
                rows={5}
                className={`${inputCls} h-auto resize-none`}
              />
              <p className="mt-2 text-xs text-gray-400">
                Add multiple tasks by placing each task on a new line. Use{" "}
                <span className="font-mono">| YYYY-MM-DD HH:mm</span> after a
                task to set a custom date/time.
              </p>
            </div>
          </div>
        </DashboardModal>

        <DashboardModal
          open={showRemarkModal}
          title={`Remark - ${studentDisplayName}`}
          onClose={() => {
            setShowRemarkModal(false);
            setRemarkDraft("");
          }}
          footer={
            <>
              <button
                onClick={() => {
                  setShowRemarkModal(false);
                  setRemarkDraft("");
                }}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-150 hover:bg-gray-100 active:scale-[0.98] sm:w-auto"
                disabled={actionSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRemark}
                className="w-full rounded-lg bg-[#A81B1E] px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:bg-[#8a1518] hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 sm:w-auto"
                disabled={actionSaving}
              >
                {actionSaving ? "Saving..." : "Save Remark"}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className={labelCls}>PRN</label>
              <input
                className={`${inputCls} cursor-not-allowed bg-gray-50`}
                readOnly
                value={student.PrnNumber}
              />
            </div>
            <div>
              <label className={labelCls}>Current Date & Time</label>
              <input
                className={`${inputCls} cursor-not-allowed bg-gray-50`}
                readOnly
                value={new Date().toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              />
            </div>
            <div>
              <label className={labelCls}>Remark</label>
              <textarea
                value={remarkDraft}
                onChange={(event) => setRemarkDraft(event.target.value)}
                placeholder="Why absent or not joined new"
                rows={4}
                className={`${inputCls} h-auto resize-none`}
              />
            </div>
          </div>
        </DashboardModal>

        <DashboardModal
          open={showAddCourseModal}
          title="Add New Course"
          onClose={() => {
            setShowAddCourseModal(false);
            resetAddCourseForm();
          }}
          footer={
            <>
              <button
                onClick={() => {
                  setShowAddCourseModal(false);
                  resetAddCourseForm();
                }}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-150 hover:bg-gray-100 active:scale-[0.98] sm:w-auto"
                disabled={actionSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleAddCourseSubmit}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#A81B1E] px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:bg-[#8a1518] hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 sm:w-auto"
                disabled={actionSaving}
              >
                <Plus className="h-4 w-4" />
                {actionSaving ? "Adding..." : "Add Course"}
              </button>
            </>
          }
        >
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Course Name</label>
              <select
                value={newCourseFields.name}
                onChange={(event) =>
                  setNewCourseFields((fields) => ({
                    ...fields,
                    name: event.target.value,
                  }))
                }
                className={inputCls}
              >
                <option value="">Select course</option>
                {courseOptions.map((courseName) => (
                  <option key={courseName} value={courseName}>
                    {courseName}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Start Date</label>
                <input
                  type="date"
                  value={newCourseFields.startDate}
                  onChange={(event) =>
                    setNewCourseFields((fields) => ({
                      ...fields,
                      startDate: event.target.value,
                    }))
                  }
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Total Classes</label>
                <input
                  type="text"
                  value={newCourseFields.classNumber}
                  onChange={(event) =>
                    setNewCourseFields((fields) => ({
                      ...fields,
                      classNumber: event.target.value,
                    }))
                  }
                  placeholder="e.g. 24"
                  className={inputCls}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Level</label>
                <input
                  type="text"
                  value={newCourseFields.level}
                  onChange={(event) =>
                    setNewCourseFields((fields) => ({
                      ...fields,
                      level: event.target.value,
                    }))
                  }
                  placeholder="e.g. 1"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <select
                  value={newCourseFields.status}
                  onChange={(event) =>
                    setNewCourseFields((fields) => ({
                      ...fields,
                      status: event.target.value,
                      completed: event.target.value === "complete",
                    }))
                  }
                  className={inputCls}
                >
                  <option value="ongoing">Ongoing</option>
                  <option value="complete">Complete</option>
                </select>
              </div>
            </div>
          </div>
        </DashboardModal>

        {showDeleteConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 ring-4 ring-red-50/60">
                    <Trash2 className="h-5 w-5 text-red-600" />
                  </div>
                  <h3
                    className="text-base font-bold text-[#061341]"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    Delete Course
                  </h3>
                </div>
                <button
                  onClick={handleDeleteCancel}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Close delete confirmation"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mb-6 text-sm leading-relaxed text-gray-600">
                Are you sure you want to remove this course? This action{" "}
                <span className="font-semibold text-gray-800">
                  cannot be undone
                </span>
                .
              </p>
              <div className="flex gap-3">
                <button
                  className="flex-1 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all duration-150 hover:bg-gray-200 active:scale-[0.98] disabled:opacity-50"
                  onClick={handleDeleteCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-red-700 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
                  onClick={handleDeleteConfirm}
                  disabled={loading}
                >
                  {loading ? (
                    <span>Deleting...</span>
                  ) : (
                    <>
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
