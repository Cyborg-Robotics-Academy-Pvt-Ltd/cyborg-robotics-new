"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, { useEffect, useState, ChangeEvent, useRef } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { app } from "../../lib/firebase";
import {
  UsersRound,
  Search,
  ChevronDown,
  Download,
  MoreHorizontal,
  UserPlus,
  XCircle,
  Filter,
  Eye,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MdAdd, MdClose } from "react-icons/md";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import courses from "../../../utils/courses";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
// Remove heavy ESM imports from initial bundle and lazy-load them in handler
// import ExcelJS from "exceljs";
// import { saveAs } from "file-saver"; // You may need to install file-saver as well

const Page = () => {
  interface Task {
    course: string;
    dateTime: string;
    status: string;
    task: string;
  }

  interface Course {
    name?: string;
    completed?: boolean;
    status?: string;
    classNumber?: string;
    level?: string;
    startDate?: string;
  }

  interface Student {
    id: string;
    PrnNumber: string;
    username: string;
    email: string;
    completedTasks: number;
    ongoingTasks: number;
    tasks: Task[];
    courses: Course[];
    classes?: string;
    createdAt?: string | null;
    createdBy?: string;
    createdByRole?: string;
    lastLogin?: string | null;
    role?: string;
    nextCourse?: string;
  }

  interface StudentData {
    PrnNumber: string;
    username: string;
    email?: string;
    tasks?: Task[];
  }

  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<
    "PrnNumber" | "username" | "email" | "completedTasks"
  >("PrnNumber");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [task, setTask] = useState("");
  const [dateTime, setDateTime] = useState(
    format(new Date(), "yyyy-MM-dd'T'HH:mm")
  );
  const [status, setStatus] = useState<"ongoing" | "complete">("complete");
  const [course, setCourse] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const router = useRouter();
  const [showNewCourseModal, setShowNewCourseModal] = useState(false);
  const [newCourseFields, setNewCourseFields] = useState({
    name: "",
    classNumber: "",
    level: "1",
    status: "ongoing",
    completed: false,
    startDate: format(new Date(), "yyyy-MM-dd"),
  });
  const [courseStudent, setCourseStudent] = useState<Student | null>(null);
  // Store refs for each action button by student id
  const actionBtnRefs = useRef<{
    [studentId: string]: HTMLButtonElement | null;
  }>({});
  const [refreshing, setRefreshing] = useState(false);

  // Extract fetchStudents so it can be called from the refresh button
  const fetchStudents = React.useCallback(async () => {
    setLoading(true);
    try {
      const db = getFirestore(app);
      const studentsCollection = collection(db, "students");
      const studentSnapshot = await getDocs(studentsCollection);

      const studentList = studentSnapshot.docs.map((doc) => {
        const data = doc.data();
        // Robust mapping with fallbacks
        const tasks = data.tasks || [];
        const courses = data.courses || [];
        let completedTasksCount = 0;
        let ongoingTasksCount = 0;
        tasks.forEach((task: Task) => {
          const status = (task.status || "").toLowerCase();
          if (status === "complete") completedTasksCount++;
          else if (status === "ongoing") ongoingTasksCount++;
        });
        return {
          id: doc.id,
          PrnNumber: data.PrnNumber || "",
          username: data.username || data.email?.split("@")[0] || "",
          email: data.email || "",
          completedTasks: completedTasksCount,
          ongoingTasks: ongoingTasksCount,
          tasks: tasks,
          courses: courses,
          // add other fields as needed, with fallbacks
          classes: data.classes || undefined,
          createdAt: data.createdAt || null,
          createdBy: data.createdBy || undefined,
          createdByRole: data.createdByRole || undefined,
          lastLogin: data.lastLogin || null,
          role: data.role || undefined,
          nextCourse: data.nextCourse || undefined,
        };
      });
      setStudents(studentList);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []); // Memoized fetchStudents

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]); // Add fetchStudents as dependency

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest(".dropdown-trigger") &&
        !target.closest(".dropdown-menu")
      ) {
        setShowDropdown(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const filteredStudents = students
    .filter((student) => {
      if (activeTab === "ongoing") {
        // Ongoing: if any course is not completed
        return (
          student.courses.length > 0 &&
          student.courses.some(
            (course) =>
              course.completed !== true &&
              (!course.status || course.status.toLowerCase() !== "complete")
          )
        );
      } else if (activeTab === "hold") {
        // Hold: only if all courses are completed
        return (
          student.courses.length > 0 &&
          student.courses.every(
            (course) =>
              course.completed === true ||
              (course.status && course.status.toLowerCase() === "complete")
          )
        );
      }
      return true;
    })
    .filter((student) => {
      // Search filter (keep your existing logic)
      return (
        student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.PrnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.completedTasks.toString().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (activeTab === "ongoing") {
        // Sort by latest ongoing task date (descending)
        const getLatestOngoingDate = (student: Student) => {
          const ongoingTasks = (student.tasks || []).filter(
            (t: Task) => t.status && t.status.toLowerCase() === "ongoing"
          );
          if (ongoingTasks.length === 0) return 0;
          return Math.max(
            ...ongoingTasks.map((t: Task) => new Date(t.dateTime).getTime())
          );
        };
        return getLatestOngoingDate(b) - getLatestOngoingDate(a);
      }
      let valA, valB;
      if (sortColumn === "completedTasks") {
        valA = a.completedTasks;
        valB = b.completedTasks;
      } else {
        valA = a[sortColumn]?.toLowerCase?.() ?? "";
        valB = b[sortColumn]?.toLowerCase?.() ?? "";
      }
      if (sortColumn === "PrnNumber") {
        // Use localeCompare for PRN Number for numeric sorting
        const cmp = a.PrnNumber.localeCompare(b.PrnNumber, undefined, {
          numeric: true,
        });
        return sortDirection === "asc" ? cmp : -cmp;
      }
      if (sortDirection === "asc") {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });

  const handleSort = (
    column: "PrnNumber" | "username" | "email" | "completedTasks"
  ) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleExport = async () => {
    const [{ default: ExcelJS }, { saveAs }] = await Promise.all([
      import("exceljs"),
      import("file-saver"),
    ]);

    const isOngoing = (student: Student) =>
      student.courses.length > 0 &&
      student.courses.some(
        (course) =>
          course.completed !== true &&
          (!course.status || course.status.toLowerCase() !== "complete")
      );

    const isHold = (student: Student) =>
      student.courses.length > 0 &&
      student.courses.every(
        (course) =>
          course.completed === true ||
          (course.status && course.status.toLowerCase() === "complete")
      );

    const matchesSearch = (student: Student) => {
      const term = searchTerm.toLowerCase();
      return (
        student.username.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term) ||
        student.PrnNumber.toLowerCase().includes(term) ||
        student.completedTasks.toString().includes(term)
      );
    };

    const baseStudents = searchTerm ? students.filter(matchesSearch) : students;

    const allStudents = baseStudents;
    const ongoingStudents = baseStudents.filter(isOngoing);
    const holdStudents = baseStudents.filter(isHold);

    const headers = [
      "PRN Number",
      "Student Name",
      "Email",
      "Course",
      "Level",
      "Class Number",
      "Course Status",
      "Course Completed",
      "Assigned Classes",
      "Completed Classes",
      "Ongoing Classes",
      "Completed Classes List",
    ];

    const buildRows = (list: Student[]) =>
      list.flatMap((student) =>
        (student.courses && student.courses.length > 0
          ? student.courses
          : [
              {
                name: "",
                level: "",
                classNumber: "",
                status: "",
                completed: "",
              },
            ]
        ).map((course) => {
          const assignedTasks = (student.tasks || [])
            .filter((task) =>
              typeof course === "string"
                ? task.course === course
                : task.course === course?.name
            )
            .map((task) => task.task)
            .join(", ");

          const completedTasks = (student.tasks || [])
            .filter(
              (task) =>
                task.status &&
                task.status.toLowerCase() === "complete" &&
                (typeof course === "string"
                  ? task.course === course
                  : task.course === course?.name)
            )
            .map((task) => task.task)
            .join(", ");

          return {
            "PRN Number": student.PrnNumber,
            "Student Name": student.username,
            Email: student.email,
            Course: typeof course === "string" ? course : course?.name || "",
            Level: typeof course === "string" ? "" : course?.level || "",
            "Class Number":
              typeof course === "string" ? "" : course?.classNumber || "",
            "Course Status":
              typeof course === "string" ? "" : course?.status || "",
            "Course Completed":
              typeof course === "string"
                ? ""
                : course?.completed
                  ? "Yes"
                  : "No",
            "Assigned Classes": assignedTasks,
            "Completed Classes": student.completedTasks,
            "Ongoing Classes": student.ongoingTasks,
            "Completed Classes List": completedTasks,
          } as Record<string, string | number>;
        })
      );

    const workbook = new ExcelJS.Workbook();

    const buildSheet = (name: string, data: Student[]) => {
      const ws = workbook.addWorksheet(name);
      const rows = buildRows(data);
      ws.addRow(headers);
      rows.forEach((row) => {
        ws.addRow(headers.map((h) => row[h] ?? ""));
      });
      ws.getRow(1).eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF991B1B" },
        };
        cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });
      ws.columns.forEach((column) => {
        column.width = 22;
      });
    };

    buildSheet("All", allStudents);
    buildSheet("Ongoing", ongoingStudents);
    buildSheet("Hold", holdStudents);

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "students.xlsx");
  };

  const toggleDropdown = (studentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDropdown(showDropdown === studentId ? null : studentId);
  };

  const handleTaskChange = (e: ChangeEvent<HTMLInputElement>) =>
    setTask(e.target.value);
  const handleDateTimeChange = (e: ChangeEvent<HTMLInputElement>) =>
    setDateTime(e.target.value);
  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) =>
    setStatus(e.target.value as "ongoing" | "complete");
  const handleCourseChange = (e: ChangeEvent<HTMLSelectElement>) =>
    setCourse(e.target.value);

  const resetForm = () => {
    setTask("");
    setDateTime(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
    setStatus("complete");
    setCourse("");
    setSelectedStudent(null);
  };

  const handleAddClass = (student: Student) => {
    setSelectedStudent(student);
    // Find the last completed course from student's tasks
    const lastCompletedTask = student.tasks
      .filter((task) => task.status.toLowerCase() === "complete")
      .sort(
        (a, b) =>
          new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
      )[0];

    if (lastCompletedTask) {
      setCourse(lastCompletedTask.course);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (!task.trim()) {
        toast.error("Task cannot be empty");
        return;
      }

      if (!dateTime) {
        toast.error("Date and time are required");
        return;
      }

      if (!course) {
        toast.error("Course is required");
        return;
      }

      if (!selectedStudent) {
        toast.error("No student selected");
        return;
      }

      const db = getFirestore(app);
      const q = query(
        collection(db, "students"),
        where("PrnNumber", "==", selectedStudent.PrnNumber)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const studentDoc = querySnapshot.docs[0];
        const studentRef = doc(db, "students", studentDoc.id);
        const studentData = studentDoc.data() as StudentData;

        const updatedTasks = studentData.tasks
          ? [...studentData.tasks, { task, dateTime, status, course }]
          : [{ task, dateTime, status, course }];

        await updateDoc(studentRef, { tasks: updatedTasks });
        toast.success("Class added successfully!");
        setIsModalOpen(false);
        resetForm();
        // Refresh the student list
        const updatedStudentSnapshot = await getDocs(
          collection(db, "students")
        );
        const updatedStudentList = updatedStudentSnapshot.docs.map((doc) => {
          const data = doc.data();
          const tasks: Task[] = data.tasks || [];
          let completedTasksCount = 0;
          let ongoingTasksCount = 0;

          tasks.forEach((task: Task) => {
            const status = (task.status || "").toLowerCase();
            if (status === "complete") {
              completedTasksCount++;
            } else if (status === "ongoing") {
              ongoingTasksCount++;
            }
          });

          return {
            id: doc.id,
            PrnNumber: data.PrnNumber || "",
            username: data.username || data.email?.split("@")[0] || "",
            email: data.email || "",
            completedTasks: completedTasksCount,
            ongoingTasks: ongoingTasksCount,
            tasks: tasks,
            courses: data.courses || [],
            nextCourse: data.nextCourse || undefined,
          } as Student;
        });
        setStudents(updatedStudentList);
      } else {
        toast.error("Student not found");
      }
    } catch (error) {
      console.error("Error adding class: ", error);
      toast.error("Error adding class. Please try again.");
    }
  };

  type PortalDropdownProps = {
    open: boolean;
    anchorRef: React.RefObject<HTMLButtonElement>;
    children: React.ReactNode;
  };
  function PortalDropdown({ open, anchorRef, children }: PortalDropdownProps) {
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (open && anchorRef?.current && dropdownRef.current) {
        const anchorRect = anchorRef.current.getBoundingClientRect();
        dropdownRef.current.style.position = "absolute";
        dropdownRef.current.style.top = `${anchorRect.bottom + window.scrollY}px`;
        dropdownRef.current.style.left = `${anchorRect.left + window.scrollX}px`;
        dropdownRef.current.style.zIndex = "9999";
      }
    }, [open, anchorRef]);

    if (!open || typeof window === "undefined" || !document.body) return null;
    return createPortal(<div ref={dropdownRef}>{children}</div>, document.body);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 font-sans">
      <header className="bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] text-white shadow-xl -mt-10 md:mt-1 ">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                <UsersRound className="md:h-7 md:w-7 h-4 w-4" />
              </div>
              <h1 className="text-xl md:text-3xl font-bold tracking-tight">
                Student Record
              </h1>
            </div>

            <Link
              href="/create-user"
              className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Student
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight sm:text-4xl">
              Student Record
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Manage and view all registered students in the system
            </p>
          </div>
          <div className="mt-6 sm:mt-0 sm:ml-6">
            <button
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] text-white rounded-xl shadow-lg text-base font-semibold uppercase tracking-wide hover:scale-105 hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
              onClick={handleExport}
              aria-label="Export student data to Excel"
            >
              <Download className="h-5 w-5 mr-3" />
              Export to Excel
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-12 pr-12 py-3 bg-gray-50 border outline-none border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-300"
                  placeholder="Search by name, email, PRN, or classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search students"
                />
                {searchTerm && (
                  <button
                    className="absolute inset-y-0 right-0 flex items-center pr-4"
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear search"
                  >
                    <XCircle className="h-5 w-5 text-gray-400 hover:text-red-500 transition-colors" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="bg-[#991b1b] bg-opacity-10 text-[#991b1b] px-4 py-2 rounded-full font-semibold flex items-center shadow-sm">
                <UsersRound className="h-4 w-4 mr-2" />
                Students: {students.length}
              </div>
              <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full font-medium flex items-center ">
                <Filter className="h-4 w-4 mr-2" />
                Showing: {filteredStudents.length}
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("all")}
                className={`py-1.5 px-3 text-xs rounded-full font-semibold transition-all duration-200 shadow-sm ${
                  activeTab === "all"
                    ? "bg-red-800 text-white shadow"
                    : "bg-red-800/10 text-red-800 hover:bg-red-800/20"
                }`}
              >
                All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("ongoing")}
                className={`py-1.5 px-3 text-xs rounded-full font-semibold transition-all duration-200 shadow-sm ${
                  activeTab === "ongoing"
                    ? "bg-red-800 text-white shadow"
                    : "bg-red-800/10 text-red-800 hover:bg-red-800/20"
                }`}
              >
                Ongoing
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("hold")}
                className={`py-1.5 px-3 text-xs rounded-full font-semibold transition-all duration-200 shadow-sm ${
                  activeTab === "hold"
                    ? "bg-red-800 text-white shadow"
                    : "bg-red-800/10 text-red-800 hover:bg-red-800/20"
                }`}
              >
                Hold
              </Button>
            </div>
            <Button
              size="sm"
              className="inline-flex items-center px-3 py-1.5 text-xs bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] text-white rounded-full shadow-md font-semibold tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
              onClick={async () => {
                setRefreshing(true);
                await fetchStudents();
              }}
              aria-label="Refresh student list"
              disabled={refreshing || loading}
            >
              {refreshing ? (
                <svg
                  className="animate-spin h-4 w-4 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="h-4 w-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582M20 20v-5h-.581M5.635 19A9 9 0 003 12c0-5 4-9 9-9s9 4 9 9a9 9 0 01-2.635 6.364M19 5l-7 7-7-7"
                  />
                </svg>
              )}
              Refresh
            </Button>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-3xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center">
              <div className="animate-pulse space-y-6 w-full max-w-5xl">
                <div className="h-10 bg-gray-100 rounded w-full"></div>
                <div className="space-y-3">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-gray-100 rounded w-full"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="overflow-x-auto overflow-visible rounded-xl shadow-lg border border-gray-200">
              <Table className="min-w-full divide-y divide-gray-200">
                <colgroup>
                  <col className="w-36 md:w-44" />
                  <col className="w-36 md:w-52" />
                  <col className="w-52 md:w-72" />
                  <col className="w-36 md:w-52" />
                  {activeTab === "hold" && <col className="w-36 md:w-52" />}
                  <col className="w-36 md:w-52" />
                  <col className="w-24 md:w-28" />
                </colgroup>
                <TableHeader>
                  <TableRow className="bg-gray-50 border-b border-gray-200">
                    <TableHead
                      className="font-semibold text-gray-700 py-6 px-4 md:px-8 cursor-pointer hover:text-red-600 transition-colors text-sm md:text-base"
                      onClick={() => handleSort("PrnNumber")}
                    >
                      <div className="flex items-center">
                        PRN Number
                        {sortColumn === "PrnNumber" && (
                          <ChevronDown
                            className={`ml-3 h-5 w-5 transform transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`}
                          />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="font-semibold text-gray-700 py-6 px-4 md:px-8 cursor-pointer hover:text-red-600 transition-colors text-sm md:text-base"
                      onClick={() => handleSort("username")}
                    >
                      <div className="flex items-center">
                        Student Name
                        {sortColumn === "username" && (
                          <ChevronDown
                            className={`ml-3 h-5 w-5 transform transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`}
                          />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="font-semibold text-gray-700 py-6 px-4 md:px-8 cursor-pointer hover:text-red-600 transition-colors text-sm md:text-base hidden md:table-cell"
                      onClick={() => handleSort("email")}
                    >
                      <div className="flex items-center">
                        Email Address
                        {sortColumn === "email" && (
                          <ChevronDown
                            className={`ml-3 h-5 w-5 transform transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`}
                          />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-6 px-4 md:px-8 text-sm md:text-base">
                      Courses
                    </TableHead>
                    {activeTab === "hold" && (
                      <TableHead className="font-semibold text-gray-700 py-6 px-4 md:px-8 text-sm md:text-base">
                        Suggested Course
                      </TableHead>
                    )}
                    <TableHead
                      className="font-semibold text-gray-700 py-6 px-4 md:px-8 cursor-pointer hover:text-red-600 transition-colors text-sm md:text-base"
                      onClick={() => handleSort("completedTasks")}
                    >
                      <div className="flex items-center">
                        Classes
                        {sortColumn === "completedTasks" && (
                          <ChevronDown
                            className={`ml-3 h-5 w-5 transform transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`}
                          />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-6 px-4 md:px-8 text-right text-sm md:text-base sticky right-0 bg-gray-50 z-10">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student, idx) => (
                    <TableRow
                      key={student.id}
                      className={`transition-colors duration-200 cursor-pointer ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100`}
                      onClick={() => router.push(`/${student.PrnNumber}`)}
                    >
                      <TableCell className="font-mono text-gray-800 py-6 px-4 md:px-8 text-sm md:text-base">
                        {student.PrnNumber}
                      </TableCell>
                      <TableCell className="font-medium text-gray-900 py-6 px-4 md:px-8 text-sm md:text-base">
                        {student.username}
                      </TableCell>
                      <TableCell className="text-gray-600 py-6 px-4 md:px-8 text-sm md:text-base hidden md:table-cell">
                        {student.email}
                      </TableCell>
                      <TableCell className="text-gray-600 py-6 px-4 md:px-8 text-sm md:text-base">
                        {student.courses && student.courses.length > 0
                          ? student.courses
                              .map((course) =>
                                typeof course === "string"
                                  ? course
                                  : course?.name || ""
                              )
                              .filter(Boolean)
                              .join(", ")
                          : "-"}
                      </TableCell>
                      {activeTab === "hold" && (
                        <TableCell className="text-gray-600 py-6 px-4 md:px-8 text-sm md:text-base">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              {student.nextCourse || "No next course assigned"}
                            </span>
                          </div>
                        </TableCell>
                      )}
                      <TableCell className="text-gray-600 py-6 px-4 md:px-8 text-sm md:text-base">
                        <div className="space-y-3">
                          <span
                            className={`${
                              student.completedTasks > 15
                                ? "bg-gradient-to-r from-[#991b1b]/10 to-[#7f1d1d]/10 text-[#991b1b] shadow"
                                : "bg-green-100 text-green-700"
                            } px-3 py-2 rounded-full text-sm font-semibold tracking-wide`}
                          >
                            Completed: {student.completedTasks}
                          </span>
                          {student.tasks
                            .filter(
                              (t) => t.status.toLowerCase() === "complete"
                            )
                            .sort(
                              (a, b) =>
                                new Date(b.dateTime).getTime() -
                                new Date(a.dateTime).getTime()
                            )
                            .slice(0, 1)
                            .map((task, i) => (
                              <div
                                key={i}
                                className="text-sm text-gray-500 mt-2 hidden md:block"
                              >
                                Latest Completed: {task.course} - {task.task}
                              </div>
                            ))}
                        </div>
                      </TableCell>
                      <TableCell
                        className="text-right py-6 px-4 md:px-8 sticky right-0 bg-white z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          ref={(el) => {
                            actionBtnRefs.current[student.id] = el;
                          }}
                          className="text-gray-500 hover:text-gray-700 focus:outline-none p-2 md:p-3 rounded-full transition-colors dropdown-trigger shadow-xl"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDropdown(student.id, e);
                          }}
                          aria-label={`More actions for ${student.username}`}
                        >
                          <MoreHorizontal className="h-5 w-5 md:h-6 md:w-6" />
                        </button>
                        {actionBtnRefs.current[student.id] &&
                          (() => {
                            const anchorRef = {
                              current: actionBtnRefs.current[student.id]!,
                            };
                            return (
                              <PortalDropdown
                                open={showDropdown === student.id}
                                anchorRef={anchorRef}
                              >
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                  transition={{
                                    duration: 0.15,
                                    ease: "easeOut",
                                  }}
                                  className="mt-2 w-40 md:w-48 z-50 bg-white rounded-2xl shadow-2xl border border-[#991b1b]/20 py-1 dropdown-menu"
                                >
                                  <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                  >
                                    <button
                                      onClick={() => handleAddClass(student)}
                                      className="flex items-center w-full text-left px-3 md:px-4 py-2 text-xs md:text-sm text-gray-700 hover:bg-[#991b1b] hover:bg-opacity-10 hover:text-[#991b1b] transition-colors rounded-xl"
                                    >
                                      <UserPlus className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                      Add Student Class
                                    </button>
                                  </motion.div>
                                  <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.12 }}
                                  >
                                    <button
                                      onClick={() => {
                                        setShowDropdown(null);
                                        setCourseStudent(student);
                                        setShowNewCourseModal(true);
                                      }}
                                      className="flex items-center w-full text-left px-3 md:px-4 py-2 text-xs md:text-sm text-blue-700 hover:bg-blue-50 hover:text-blue-900 transition-colors"
                                    >
                                      <MdAdd className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                      Add New Course
                                    </button>
                                  </motion.div>
                                  <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15 }}
                                  >
                                    <button
                                      onClick={() =>
                                        router.push(`/${student.PrnNumber}`)
                                      }
                                      className="flex items-center px-3 md:px-4 py-2 text-xs md:text-sm text-gray-700 hover:bg-[#991b1b] hover:bg-opacity-10 hover:text-[#991b1b] transition-colors w-full text-left rounded-xl"
                                    >
                                      <Eye className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                      View Details
                                    </button>
                                  </motion.div>
                                  <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                  >
                                    <button
                                      className="flex items-center w-full text-left px-3 md:px-4 py-2 text-xs md:text-sm text-[#991b1b] hover:bg-[#991b1b] hover:bg-opacity-10 transition-colors rounded-xl"
                                      onClick={() => {
                                        if (
                                          window.confirm(
                                            `Are you sure you want to delete ${student.username}?`
                                          )
                                        ) {
                                          // Add delete functionality here
                                          console.log(
                                            `Deleting student: ${student.id}`
                                          );
                                        }
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                      Delete Student
                                    </button>
                                  </motion.div>
                                </motion.div>
                              </PortalDropdown>
                            );
                          })()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
                <UsersRound className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                No Students Found
              </h3>
              <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
                {searchTerm
                  ? "Try adjusting your search terms or  if the student is registered."
                  : "No students are currently registered in the system."}
              </p>
              <div className="mt-6 flex justify-center gap-3">
                {searchTerm && (
                  <button
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] text-white rounded-xl shadow-lg text-sm font-semibold uppercase tracking-wide hover:scale-105 hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
                    onClick={() => setSearchTerm("")}
                  >
                    Clear Search
                  </button>
                )}
                <Link
                  href="/admin/create-user"
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-xl shadow-sm text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Student
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Modal for Adding Classes */}
      {isModalOpen && (
        <div className="fixed z-50 inset-0 bg-black bg-opacity-60 flex items-center justify-center  transition-opacity duration-300 overflow-y-auto p-2 md:p-4">
          <div className="relative min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-8rem)] flex items-center justify-center py-6 md:py-12">
            <div className="bg-white  rounded-2xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden transform transition-all duration-300 scale-95 animate-in">
              {/* Modal Header */}
              <div className="sticky top-0 z-50 flex justify-between items-center border-b px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-[#991b1b]/10 to-[#7f1d1d]/10">
                <h2 className="text-lg md:text-xl font-bold text-[#991b1b] flex items-center tracking-tight">
                  <MdAdd className="mr-2 text-[#991b1b]" size={20} />
                  Add New Class
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-[#991b1b] p-1.5 md:p-2 rounded-full hover:bg-[#991b1b] hover:bg-opacity-10 transition-colors duration-200 shadow"
                  aria-label="Close modal"
                >
                  <MdClose size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="px-4 md:px-6 py-4 md:py-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
                <div className="space-y-4 md:space-y-6">
                  {/* Add PRN Number field */}
                  <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                      PRN Number
                    </label>
                    <input
                      type="text"
                      value={selectedStudent?.PrnNumber || ""}
                      readOnly
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-gray-50 border border-gray-200 rounded-xl text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="form-group">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                        Date and Time
                      </label>
                      <input
                        type="datetime-local"
                        value={dateTime}
                        onChange={handleDateTimeChange}
                        className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-white border border-[#991b1b] rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-[#991b1b] focus:border-[#991b1b] hover:border-[#991b1b] transition-all duration-200"
                      />
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                        Status
                      </label>
                      <select
                        value={status}
                        onChange={handleStatusChange}
                        className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-white border border-[#991b1b] rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-[#991b1b] focus:border-[#991b1b] hover:border-[#991b1b] transition-all duration-200"
                      >
                        <option value="ongoing">Ongoing</option>
                        <option value="complete">Complete</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                      Course
                    </label>
                    <select
                      value={course}
                      onChange={handleCourseChange}
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-white border border-[#991b1b] rounded-xl shadow focus:outline-none  focus:ring-[#991b1b] focus:border-[#991b1b] hover:border-[#991b1b] transition-all duration-200"
                    >
                      <option value="" className="text-gray-400 font-semibold">
                        Select Course
                      </option>
                      {selectedStudent?.courses?.map((c, idx) => {
                        if (typeof c === "string") {
                          return (
                            <option key={c + idx} value={c}>
                              {c}
                            </option>
                          );
                        } else {
                          // If there are multiple courses with the same name, show level
                          const sameNameCount = selectedStudent.courses.filter(
                            (cc) => typeof cc !== "string" && cc.name === c.name
                          ).length;
                          return (
                            <option
                              key={(c.name || "") + (c.level || "") + idx}
                              value={c.name + (c.level ? `|${c.level}` : "")}
                            >
                              {c.name}
                              {sameNameCount > 1 && c.level
                                ? ` (Level ${c.level})`
                                : ""}
                            </option>
                          );
                        }
                      })}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                      Task Description
                    </label>
                    <input
                      type="text"
                      value={task}
                      onChange={handleTaskChange}
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-white border border-[#991b1b] rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-[#991b1b] focus:border-[#991b1b] hover:border-[#991b1b] transition-all duration-200"
                      placeholder="Enter task description"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 px-4 md:px-6 py-3 md:py-4 flex justify-end space-x-3 border-t">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 md:px-5 py-2 md:py-2.5 bg-white border border-[#991b1b] text-[#991b1b] text-sm md:text-base rounded-xl hover:bg-[#991b1b] hover:bg-opacity-10 transition-all duration-200 font-semibold shadow"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 md:px-5 py-2 md:py-2.5 bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] text-white text-sm md:text-base rounded-xl hover:bg-[#7f1d1d] transition-all duration-200 font-semibold flex items-center shadow-lg uppercase tracking-wide"
                >
                  <MdAdd className="mr-1.5 md:mr-2" size={16} />
                  Add Class
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal for Adding New Course */}
      {showNewCourseModal && (
        <div className="fixed z-50 inset-0 bg-black bg-opacity-60 flex items-center justify-center transition-opacity duration-300 overflow-y-auto p-2 md:p-4">
          <div className="relative min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-8rem)] flex items-center justify-center py-6 md:py-12">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden transform transition-all duration-300 scale-95 animate-in mt-44">
              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex justify-between items-center border-b px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-blue-50 to-blue-100 ">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center">
                  <MdAdd className="mr-2 text-blue-700" size={20} />
                  Add New Course
                </h2>
                <button
                  onClick={() => {
                    setShowNewCourseModal(false);
                    setCourseStudent(null);
                    setNewCourseFields({
                      name: "",
                      classNumber: "",
                      level: "1",
                      status: "ongoing",
                      completed: false,
                      startDate: format(new Date(), "yyyy-MM-dd"),
                    });
                  }}
                  className="text-gray-500 hover:text-blue-700 p-1.5 md:p-2 rounded-full hover:bg-blue-50 transition-colors duration-200"
                  aria-label="Close modal"
                >
                  <MdClose size={20} />
                </button>
              </div>
              {/* Modal Content */}
              <div className="px-8 md:px-6  md:py-6 h-auto w-96  overflow-y-auto  ">
                <div className="space-y-4 md:space-y-6  ">
                  <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                      Course Name
                    </label>
                    <select
                      value={newCourseFields.name}
                      onChange={(e) =>
                        setNewCourseFields((f) => ({
                          ...f,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700 hover:border-blue-700 transition-all duration-200"
                    >
                      <option value="">Select Course</option>
                      {courses.map((course) => (
                        <option key={course} value={course}>
                          {course}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={newCourseFields.startDate}
                      onChange={(e) =>
                        setNewCourseFields((f) => ({
                          ...f,
                          startDate: e.target.value,
                        }))
                      }
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700 hover:border-blue-700 transition-all duration-200"
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                      Class Number
                    </label>
                    <input
                      type="text"
                      value={newCourseFields.classNumber}
                      onChange={(e) =>
                        setNewCourseFields((f) => ({
                          ...f,
                          classNumber: e.target.value,
                        }))
                      }
                      placeholder="Enter class number"
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700 hover:border-blue-700 transition-all duration-200"
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                      Level
                    </label>
                    <input
                      type="text"
                      value={newCourseFields.level}
                      onChange={(e) =>
                        setNewCourseFields((f) => ({
                          ...f,
                          level: e.target.value,
                        }))
                      }
                      placeholder="Enter level"
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700 hover:border-blue-700 transition-all duration-200"
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                      Status
                    </label>
                    <select
                      value={newCourseFields.status}
                      onChange={(e) =>
                        setNewCourseFields((f) => ({
                          ...f,
                          status: e.target.value,
                          completed: e.target.value === "complete",
                        }))
                      }
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-blue-700 hover:border-blue-700 transition-all duration-200"
                    >
                      <option value="ongoing">Ongoing</option>
                      <option value="complete">Complete</option>
                    </select>
                  </div>
                </div>
              </div>
              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 px-4 md:px-6 py-3 md:py-4 flex justify-end space-x-3 border-t">
                <button
                  onClick={() => {
                    setShowNewCourseModal(false);
                    setCourseStudent(null);
                    setNewCourseFields({
                      name: "",
                      classNumber: "",
                      level: "1",
                      status: "ongoing",
                      completed: false,
                      startDate: format(new Date(), "yyyy-MM-dd"),
                    });
                  }}
                  className="px-4 md:px-5 py-2 md:py-2.5 bg-white border border-[#991b1b] text-[#991b1b] text-sm md:text-base rounded-xl hover:bg-[#991b1b] hover:bg-opacity-10 transition-all duration-200 font-semibold shadow"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (
                      !newCourseFields.name.trim() ||
                      !newCourseFields.classNumber.trim() ||
                      !newCourseFields.level.trim()
                    ) {
                      toast.error("All fields are required");
                      return;
                    }
                    if (!courseStudent) {
                      toast.error("No student selected");
                      return;
                    }
                    try {
                      const db = getFirestore(app);
                      const q = query(
                        collection(db, "students"),
                        where("PrnNumber", "==", courseStudent.PrnNumber)
                      );
                      const querySnapshot = await getDocs(q);
                      if (!querySnapshot.empty) {
                        const studentDoc = querySnapshot.docs[0];
                        const studentRef = doc(db, "students", studentDoc.id);
                        // Fetch the latest courses array from Firestore (to avoid stale data)
                        const studentData = studentDoc.data();
                        const existingCourses = studentData.courses || [];
                        const courseExists = existingCourses.some(
                          (c: Course) =>
                            typeof c === "object" &&
                            c !== null &&
                            c.name?.toLowerCase() ===
                              newCourseFields.name.trim().toLowerCase() &&
                            c.level === newCourseFields.level.trim()
                        );
                        if (courseExists) {
                          alert("Course already exists for this student!");
                          return;
                        }
                        const newCourse = {
                          name: newCourseFields.name.trim(),
                          classNumber: newCourseFields.classNumber.trim(),
                          level: newCourseFields.level.trim(),
                          status: newCourseFields.status,
                          completed: newCourseFields.completed,
                          startDate: newCourseFields.startDate,
                        };
                        // Add to Firestore
                        await updateDoc(studentRef, {
                          courses: arrayUnion(newCourse),
                        });
                        // Add to local dropdown for future use
                        toast.success("Course added to student!");
                        setShowNewCourseModal(false);
                        setCourseStudent(null);
                        setNewCourseFields({
                          name: "",
                          classNumber: "",
                          level: "1",
                          status: "ongoing",
                          completed: false,
                          startDate: format(new Date(), "yyyy-MM-dd"),
                        });
                        // Optionally, refresh students list here
                        const updatedStudentSnapshot = await getDocs(
                          collection(db, "students")
                        );
                        const updatedStudentList =
                          updatedStudentSnapshot.docs.map((doc) => {
                            const data = doc.data();
                            const tasks: Task[] = data.tasks || [];
                            let completedTasksCount = 0;
                            let ongoingTasksCount = 0;
                            tasks.forEach((task: Task) => {
                              const status = (task.status || "").toLowerCase();
                              if (status === "complete") {
                                completedTasksCount++;
                              } else if (status === "ongoing") {
                                ongoingTasksCount++;
                              }
                            });
                            return {
                              id: doc.id,
                              PrnNumber: data.PrnNumber || "",
                              username:
                                data.username ||
                                data.email?.split("@")[0] ||
                                "",
                              email: data.email || "",
                              completedTasks: completedTasksCount,
                              ongoingTasks: ongoingTasksCount,
                              tasks: tasks,
                              courses: data.courses || [],
                              nextCourse: data.nextCourse || undefined,
                            } as Student;
                          });
                        setStudents(updatedStudentList);
                      } else {
                        toast.error("Student not found");
                      }
                    } catch (error) {
                      console.error("Error adding course: ", error);
                      toast.error("Error adding course. Please try again.");
                    }
                  }}
                  className="px-4 md:px-5 py-2 md:py-2.5 bg-red-800 text-white text-sm md:text-base rounded-xl hover:bg-red-700 transition-all duration-200 font-semibold flex items-center shadow-lg uppercase tracking-wide"
                >
                  <MdAdd className="mr-1.5 md:mr-2" size={16} />
                  Add Course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
