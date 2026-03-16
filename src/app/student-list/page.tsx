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
  getDoc,
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
import toast, { Toaster } from "react-hot-toast";
import courses from "../../../utils/courses";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

import AssignPrnModal from "@/components/AssignPrnModal";
import { useAuth } from "@/lib/auth-context";
// Remove heavy ESM imports from initial bundle and lazy-load them in handler
// import ExcelJS from "exceljs";
// import { saveAs } from "file-saver"; // You may need to install file-saver as well

const Page = () => {
  const { user, userRole, loading: authLoading } = useAuth();

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
    trainerId?: string;
    trainerName?: string;
  }

  interface Student {
    id: string;
    PrnNumber: string;
    username: string;
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
    trainerId?: string;
    trainerName?: string;
    status?: string;
  }

  interface Trainer {
    id: string;
    name?: string;
    email?: string;
    username?: string;
  }

  interface StudentData {
    PrnNumber: string;
    username: string;
    tasks?: Task[];
  }

  interface Trainer {
    id: string;
    name?: string;
    email?: string;
    username?: string;
  }

  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [trainerFilter, setTrainerFilter] = useState("");
  const [centerFilter, setCenterFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState<
    "PrnNumber" | "username" | "completedTasks"
  >("PrnNumber");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [task, setTask] = useState("");
  const [dateTime, setDateTime] = useState(
    format(new Date(), "yyyy-MM-dd'T'HH:mm"),
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

  // State for edit student functionality
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingCourseIndex, setEditingCourseIndex] = useState<number | null>(
    null,
  );
  const [editCourseFields, setEditCourseFields] = useState({
    name: "",
    classNumber: "",
    level: "1",
    status: "ongoing",
    completed: false,
    startDate: format(new Date(), "yyyy-MM-dd"),
  });
  // Store refs for each action button by student id
  const actionBtnRefs = useRef<{
    [studentId: string]: HTMLButtonElement | null;
  }>({});
  const [refreshing, setRefreshing] = useState(false);

  // State for assign trainer functionality
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [assignTrainerModalOpen, setAssignTrainerModalOpen] = useState(false);
  const [selectedStudentForTrainer, setSelectedStudentForTrainer] =
    useState<Student | null>(null);
  const [selectedCourseForTrainer, setSelectedCourseForTrainer] =
    useState<Course | null>(null);
  const [selectedTrainer, setSelectedTrainer] = useState<string>("");
  const [loadingTrainers, setLoadingTrainers] = useState(false);

  // State for assign PRN modal
  const [showAssignPrnModal, setShowAssignPrnModal] = useState(false);

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
        console.log(data);
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
          username: data.name || data.fullName || data.username,
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
          trainerId: data.trainerId || undefined,
          trainerName: data.trainerName || undefined,
          status: data.status || "active", // Default to active if no status is set
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

  // Fetch trainers
  const fetchTrainers = React.useCallback(async () => {
    setLoadingTrainers(true);
    try {
      const db = getFirestore(app);
      const trainersCollection = collection(db, "trainers");
      const trainerSnapshot = await getDocs(trainersCollection);

      const trainerList = trainerSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name:
            data.name ||
            data.fullName ||
            data.displayName ||
            data.username ||
            "",
          email: data.email || "",
          username: data.username || "",
        };
      });

      setTrainers(trainerList);
    } catch (error) {
      console.error("Error fetching trainers:", error);
    } finally {
      setLoadingTrainers(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
    fetchTrainers();
  }, [fetchStudents, fetchTrainers]); // Add fetchTrainers as dependency

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
      // Filter out students with pending status - only show active and inactive students
      return student.status !== "pending";
    })
    .filter((student) => {
      if (activeTab === "ongoing") {
        // Ongoing: if any course is not completed
        return (
          student.courses.length > 0 &&
          student.courses.some(
            (course) =>
              course.completed !== true &&
              (!course.status || course.status.toLowerCase() !== "complete"),
          )
        );
      } else if (activeTab === "hold") {
        // Hold: only if all courses are completed
        return (
          student.courses.length > 0 &&
          student.courses.every(
            (course) =>
              course.completed === true ||
              (course.status && course.status.toLowerCase() === "complete"),
          )
        );
      }
      return true;
    })
    .filter((student) => {
      // Search filter (keep your existing logic)
      const matchesSearch =
        student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.PrnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.completedTasks.toString().includes(searchTerm.toLowerCase());

      // Trainer filter
      let matchesTrainer = true;
      if (trainerFilter) {
        if (trainerFilter === "None Assigned") {
          // Check if any non-completed course has no assigned trainer
          matchesTrainer = student.courses.some(
            (course) =>
              typeof course !== "string" &&
              (!course.trainerName || course.trainerName.trim() === "") &&
              course.completed !== true &&
              (!course.status || course.status.toLowerCase() !== "complete"),
          );
        } else {
          // Check if any non-completed course has the selected trainer
          matchesTrainer = student.courses.some(
            (course) =>
              typeof course !== "string" &&
              course.trainerName === trainerFilter &&
              course.completed !== true &&
              (!course.status || course.status.toLowerCase() !== "complete"),
          );
        }
      }

      // Center filter
      let matchesCenter = true;
      if (centerFilter) {
        if (centerFilter === "Kalyani Nagar") {
          matchesCenter = student.PrnNumber.startsWith("CRAKN");
        } else if (centerFilter === "Viman Nagar") {
          matchesCenter = student.PrnNumber.startsWith("CRAVN");
        }
      }

      return matchesSearch && matchesTrainer && matchesCenter;
    })
    .sort((a, b) => {
      if (activeTab === "ongoing") {
        // Sort by most recent task update time to reflect real-time progress
        const getLatestTaskDate = (student: Student) => {
          const allTasks = student.tasks || [];
          if (allTasks.length === 0) return 0;
          return Math.max(
            ...allTasks.map((t: Task) => new Date(t.dateTime).getTime()),
          );
        };
        return getLatestTaskDate(b) - getLatestTaskDate(a);
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

  const handleSort = (column: "PrnNumber" | "username" | "completedTasks") => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Function to handle trainer assignment to a specific course
  const handleAssignTrainerToCourse = async () => {
    if (
      !selectedStudentForTrainer ||
      !selectedCourseForTrainer ||
      !selectedTrainer
    ) {
      toast.error("Please select a student, course, and trainer");
      return;
    }

    try {
      const db = getFirestore(app);
      const studentDocRef = doc(db, "students", selectedStudentForTrainer.id);

      // Find the specific course in the student's courses array
      const updatedCourses = selectedStudentForTrainer.courses.map((course) => {
        if (
          (course.name || "") === (selectedCourseForTrainer.name || "") &&
          (course.level || "") === (selectedCourseForTrainer.level || "")
        ) {
          // Find the selected trainer to get their name
          const trainer = trainers.find((t) => t.id === selectedTrainer);
          return {
            ...course,
            trainerId: selectedTrainer,
            trainerName:
              trainer?.name || trainer?.username || trainer?.email || "",
          };
        }
        return course;
      });

      await updateDoc(studentDocRef, {
        courses: updatedCourses,
      });

      // Update local state
      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student.id === selectedStudentForTrainer.id
            ? { ...student, courses: updatedCourses }
            : student,
        ),
      );

      toast.success("Trainer assigned to course successfully!");
      setAssignTrainerModalOpen(false);
      setSelectedStudentForTrainer(null);
      setSelectedCourseForTrainer(null);
      setSelectedTrainer("");
    } catch (error) {
      console.error("Error assigning trainer to course:", error);
      toast.error("Failed to assign trainer to course");
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
          (!course.status || course.status.toLowerCase() !== "complete"),
      );

    const isHold = (student: Student) =>
      student.courses.length > 0 &&
      student.courses.every(
        (course) =>
          course.completed === true ||
          (course.status && course.status.toLowerCase() === "complete"),
      );

    const matchesSearch = (student: Student) => {
      const term = searchTerm.toLowerCase();
      return (
        student.username.toLowerCase().includes(term) ||
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
                : task.course === course?.name,
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
                  : task.course === course?.name),
            )
            .map((task) => task.task)
            .join(", ");

          return {
            "PRN Number": student.PrnNumber,
            "Student Name": student.username,
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
        }),
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

  // Handle edit student - opens course editing modal
  const handleEditStudent = (student: Student) => {
    // Check if PRN is not assigned
    if (!student.PrnNumber) {
      toast.error("Contact to admin for PRN");
      return;
    }

    // Check if student has courses to edit
    if (!student.courses || student.courses.length === 0) {
      toast.error("No courses available to edit");
      return;
    }

    setEditingStudent(student);
    setShowEditCourseModal(true);
    setShowDropdown(null); // Close dropdown
  };

  // Handle editing a specific course
  const handleEditCourse = (courseIndex: number) => {
    if (!editingStudent) return;

    const course = editingStudent.courses[courseIndex];
    if (typeof course === "string") {
      toast.error("Cannot edit basic course format");
      return;
    }

    setEditingCourseIndex(courseIndex);
    setEditCourseFields({
      name: course.name || "",
      classNumber: course.classNumber || "",
      level: course.level || "1",
      status: course.status || "ongoing",
      completed: course.completed || false,
      startDate: course.startDate || format(new Date(), "yyyy-MM-dd"),
    });
  };

  // Save edited course
  const handleSaveEditedCourse = async () => {
    if (!editingStudent || editingCourseIndex === null) return;

    if (
      !editCourseFields.name.trim() ||
      !editCourseFields.classNumber.trim() ||
      !editCourseFields.level.trim()
    ) {
      toast.error("All fields are required");
      return;
    }

    try {
      const db = getFirestore(app);
      const q = query(
        collection(db, "students"),
        where("PrnNumber", "==", editingStudent.PrnNumber),
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const studentDoc = querySnapshot.docs[0];
        const studentRef = doc(db, "students", studentDoc.id);

        // Get current courses
        const studentData = studentDoc.data();
        const currentCourses = [...(studentData.courses || [])];

        // Update the specific course
        const updatedCourse = {
          name: editCourseFields.name.trim(),
          classNumber: editCourseFields.classNumber.trim(),
          level: editCourseFields.level.trim(),
          status: editCourseFields.status,
          completed: editCourseFields.completed,
          startDate: editCourseFields.startDate,
        };

        currentCourses[editingCourseIndex] = updatedCourse;

        // Update in Firestore
        await updateDoc(studentRef, {
          courses: currentCourses,
        });

        toast.success("Course updated successfully!");

        // Reset form and close modal
        setEditingCourseIndex(null);
        setEditCourseFields({
          name: "",
          classNumber: "",
          level: "1",
          status: "ongoing",
          completed: false,
          startDate: format(new Date(), "yyyy-MM-dd"),
        });

        // Refresh student list
        await fetchStudents();
      } else {
        toast.error("Student not found");
      }
    } catch (error) {
      console.error("Error updating course: ", error);
      toast.error("Error updating course. Please try again.");
    }
  };

  // Delete a course
  const handleDeleteCourse = async (courseIndex: number) => {
    if (!editingStudent) return;

    if (!confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      const db = getFirestore(app);
      const q = query(
        collection(db, "students"),
        where("PrnNumber", "==", editingStudent.PrnNumber),
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const studentDoc = querySnapshot.docs[0];
        const studentRef = doc(db, "students", studentDoc.id);

        // Get current courses and remove the selected one
        const studentData = studentDoc.data();
        const currentCourses = [...(studentData.courses || [])];
        currentCourses.splice(courseIndex, 1);

        // Update in Firestore
        await updateDoc(studentRef, {
          courses: currentCourses,
        });

        toast.success("Course deleted successfully!");

        // Update the local editingStudent state immediately
        setEditingStudent((prev) => {
          if (!prev) return prev;
          const updatedCourses = [...prev.courses];
          updatedCourses.splice(courseIndex, 1);
          return { ...prev, courses: updatedCourses };
        });

        // Refresh student list
        await fetchStudents();
      } else {
        toast.error("Student not found");
      }
    } catch (error) {
      console.error("Error deleting course: ", error);
      toast.error("Error deleting course. Please try again.");
    }
  };

  const handleAddClass = (student: Student) => {
    // Check if PRN is not assigned
    if (!student.PrnNumber) {
      toast.error("Contact to admin for PRN");
      return;
    }
    setSelectedStudent(student);
    // Find the last completed course from student's tasks
    const lastCompletedTask = student.tasks
      .filter((task) => task.status.toLowerCase() === "complete")
      .sort(
        (a, b) =>
          new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime(),
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
        where("PrnNumber", "==", selectedStudent.PrnNumber),
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
          collection(db, "students"),
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
            username: data.username,
            completedTasks: completedTasksCount,
            ongoingTasks: ongoingTasksCount,
            tasks: tasks,
            courses: data.courses || [],
            nextCourse: data.nextCourse || undefined,
            trainerId: data.trainerId || undefined,
            trainerName: data.trainerName || undefined,
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
        // Move dropdown slightly to the left (adjust as needed)
        dropdownRef.current.style.left = `${anchorRect.left + window.scrollX - 150}px`;
        dropdownRef.current.style.zIndex = "9999";
      }
    }, [open, anchorRef]);

    if (!open || typeof window === "undefined" || !document.body) return null;
    return createPortal(<div ref={dropdownRef}>{children}</div>, document.body);
  }

  return (
    <div className="min-h-screen  bg-gradient-to-br from-gray-50 via-white to-gray-100 font-sans">
      <header className="bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] text-white shadow-xl  ">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                <UsersRound className="md:h-4 md:w-4 h-4 w-4" color="black" />
              </div>
              <h1 className="text-xl md:text-3xl font-bold tracking-tight">
                Student Record
              </h1>
            </div>

            {userRole === "admin" && (
              <button
                onClick={() => setShowAssignPrnModal(true)}
                className="inline-flex items-center px-4 py-2 bg-white text-black bg-opacity-20 hover:bg-opacity-30 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105"
              >
                <UserPlus className="h-4 w-4 mr-2" color="black" />
                Assign PRN
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between md:mb-12">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight sm:text-4xl">
              Student Record
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Manage and view all registered students in the system
            </p>
          </div>
          <div className="mt-3 md:mt-6 sm:mt-0 sm:ml-6">
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

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-4 md:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-12 pr-12 py-3 bg-gray-50 border outline-none border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-300"
                  placeholder="Search by name, PRN, or classes..."
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
            <div className="flex-1 max-w-xs">
              <div className="relative rounded-xl shadow-sm ">
                <select
                  className="block w-full  pl-4 pr-10 py-3 bg-gray-50 border outline-none border-gray-200 rounded-xl text-gray-800 focus:outline-none transition-all duration-300"
                  value={centerFilter}
                  onChange={(e) => setCenterFilter(e.target.value)}
                  aria-label="Filter by center"
                >
                  <option value="">All Centers</option>
                  <option value="Kalyani Nagar">Kalyani Nagar</option>
                  <option value="Viman Nagar">Viman Nagar</option>
                </select>
              </div>
            </div>
            <div className="flex-1 max-w-xs">
              <div className="relative rounded-xl shadow-sm">
                <select
                  className="block w-full pl-4 pr-10 py-3 bg-gray-50 border outline-none border-gray-200 rounded-xl text-gray-800 focus:outline-none transition-all duration-300"
                  value={trainerFilter}
                  onChange={(e) => setTrainerFilter(e.target.value)}
                  aria-label="Filter by trainer"
                >
                  <option value="">All Trainers</option>
                  <option value="None Assigned">None Assigned</option>
                  {Array.from(
                    new Set(
                      students.flatMap((s) =>
                        s.courses
                          .filter(
                            (course) =>
                              typeof course !== "string" &&
                              course.trainerName &&
                              course.completed !== true &&
                              (!course.status ||
                                course.status.toLowerCase() !== "complete"),
                          )
                          .map((course) => course.trainerName)
                          .filter(Boolean),
                      ),
                    ),
                  )
                    .sort()
                    .map((trainerName, index) => (
                      <option key={index} value={trainerName || ""}>
                        {trainerName}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="bg-[#991b1b] bg-opacity-10 text-white px-4 py-2 rounded-full font-semibold flex items-center shadow-sm">
                <UsersRound className="h-4 w-4 mr-2" color="white" />
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
                      className="h-10 bg-gray-100 rounded w-full"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="overflow-x-auto overflow-visible rounded-xl shadow-lg border border-gray-200">
              <Table className="min-w-full divide-y divide-gray-200">
                <colgroup>
                  <col className="w-2 md:w-2" />
                  <col className="w-28 md:w-36" />
                  <col className="w-64 md:w-80 hidden md:table-cell" />
                  <col className="w-56 md:w-72" />
                  <col className="w-40 md:w-48" />
                  {activeTab === "hold" && <col className="w-28 md:w-36" />}
                </colgroup>
                <TableHeader>
                  <TableRow className="bg-red-800 border-b border-gray-200 ">
                    <TableHead
                      className="font-semibold text-white py-3 px-3 md:px-4 cursor-pointer  transition-colors text-xs md:text-sm"
                      onClick={() => handleSort("PrnNumber")}
                    >
                      <div className="flex items-center">
                        PRN Number
                        {sortColumn === "PrnNumber" && (
                          <ChevronDown
                            className={`ml-2 h-4 w-4 transform transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`}
                          />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="font-semibold text-white py-3 px-3 md:px-4 cursor-pointer  transition-colors text-xs md:text-sm"
                      onClick={() => handleSort("username")}
                    >
                      <div className="flex items-center">
                        Student Name
                        {sortColumn === "username" && (
                          <ChevronDown
                            className={`ml-2 h-4 w-4 transform transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`}
                          />
                        )}
                      </div>
                    </TableHead>

                    <TableHead className="font-semibold text-white py-3 px-3 md:px-4 text-xs md:text-sm">
                      Courses
                    </TableHead>
                    <TableHead className="font-semibold text-white py-3 px-3 md:px-4 text-xs md:text-sm">
                      Assigned Trainer
                    </TableHead>
                    {activeTab === "hold" && (
                      <TableHead className="font-semibold text-white py-3 px-3 md:px-4 text-xs md:text-sm">
                        Next Course
                      </TableHead>
                    )}
                    <TableHead
                      className="font-semibold text-white  py-3 px-3 md:px-4 cursor-pointer  transition-colors text-xs md:text-sm"
                      onClick={() => handleSort("completedTasks")}
                    >
                      <div className="flex items-center">
                        Classes
                        {sortColumn === "completedTasks" && (
                          <ChevronDown
                            className={`ml-2 h-4 w-4 transform transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`}
                          />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-white py-3 px-3 md:px-4 text-right text-xs md:text-sm sticky right-0 bg-red-800 z-10 border-l border-gray-200">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student, idx) => (
                    <TableRow
                      key={student.id}
                      className={`transition-colors duration-200 cursor-pointer ${
                        idx % 2 === 0 ? "bg-white" : "bg-red-50"
                      } hover:bg-red-50`}
                      onClick={() => {
                        // Check if PRN is not assigned
                        if (!student.PrnNumber) {
                          toast.error("Contact to admin for PRN");
                          return;
                        }
                        router.push(`/${student.PrnNumber}`);
                      }}
                    >
                      <TableCell className="font-mono text-gray-900 py-3 px-3 md:px-4 text-xs md:text-sm">
                        {student.PrnNumber ? (
                          student.PrnNumber
                        ) : (
                          <span className="text-red-600 font-semibold">
                            Assign PRN
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium text-gray-900 py-3 px-3 md:px-4 text-xs md:text-sm">
                        {student.username}
                      </TableCell>

                      <TableCell className="text-gray-600 py-3 px-3 md:px-4 text-xs md:text-sm">
                        <div className="relative group">
                          <span className="inline-block text-wrap max-w-md">
                            {student.courses && student.courses.length > 0 ? (
                              student.courses
                                .map((course) =>
                                  typeof course === "string"
                                    ? course
                                    : course?.name +
                                        (course?.level
                                          ? ` (Lvl ${course.level})`
                                          : "") || "",
                                )
                                .filter(Boolean)
                                .slice(0, 2)
                                .join(", ") +
                              (student.courses.length > 2 ? "..." : "")
                            ) : (
                              <span className="text-red-600 font-semibold">
                                No courses
                              </span>
                            )}
                          </span>
                          {student.courses && student.courses.length > 0 && (
                            <div className="absolute left-0  bottom-full mb-2 hidden group-hover:block w-auto bg-red-800 text-white text-xs rounded-xl py-2 px-3 z-50 shadow-lg">
                              <div className="font-medium mb-1">Courses:</div>
                              {student.courses
                                .map((course) =>
                                  typeof course === "string"
                                    ? course
                                    : course?.name +
                                        (course?.level
                                          ? ` (Lvl ${course.level})`
                                          : "") || "",
                                )
                                .filter(Boolean)
                                .join(", ")}
                              <div className="absolute bottom-0 left-4 transform translate-y-full border-4 border-transparent border-t-red-800"></div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 py-3 px-3 md:px-4 text-xs md:text-sm">
                        <div className="relative group">
                          <span className="inline-block text-wrap max-w-md">
                            {student.courses && student.courses.length > 0 ? (
                              <div className="space-y-1">
                                {student.courses
                                  .filter((course) => course)
                                  .slice(0, 2)
                                  .map(
                                    (course, index) =>
                                      !course.completed &&
                                      !(
                                        course.status &&
                                        course.status.toLowerCase() ===
                                          "complete"
                                      ) && (
                                        <div
                                          key={index}
                                          className="flex justify-between"
                                        >
                                          <span className="ml-2">
                                            {course.trainerName ? (
                                              <span className="text-blue-600 font-medium">
                                                {course.trainerName}
                                              </span>
                                            ) : (
                                              <span className="text-red-600 font-semibold">
                                                No Trainer
                                              </span>
                                            )}
                                          </span>
                                        </div>
                                      ),
                                  )}
                                {student.courses.length > 2 && (
                                  <div className="text-gray-500 text-xs">
                                    +{student.courses.length - 2} more...
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-red-600 font-semibold">
                                None Assigned
                              </span>
                            )}
                          </span>
                          {student.courses && student.courses.length > 0 && (
                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-auto bg-red-800 text-white text-xs rounded-xl py-2 px-3 z-50 shadow-lg max-w-xs">
                              <div className="font-medium mb-1">
                                Course-Trainer Assignments:
                              </div>
                              {student.courses
                                .filter(
                                  (course) =>
                                    course &&
                                    !course.completed &&
                                    !(
                                      course.status &&
                                      course.status.toLowerCase() === "complete"
                                    ),
                                )
                                .map((course, index) => (
                                  <div
                                    key={index}
                                    className="flex justify-between"
                                  >
                                    <span className="ml-2">
                                      {course.trainerName ? (
                                        <span className="text-blue-300">
                                          {course.trainerName}
                                        </span>
                                      ) : (
                                        <span className="text-red-200">
                                          No Trainer
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                ))}
                              <div className="absolute bottom-0 left-4 transform translate-y-full border-4 border-transparent border-t-red-800"></div>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      {activeTab === "hold" && (
                        <TableCell className="text-gray-600 py-3 px-3 md:px-4 text-xs md:text-sm">
                          <div className="flex items-center">
                            {student.nextCourse ? (
                              <div className="flex flex-col">
                                {student.nextCourse.startsWith(
                                  "Not Enrolling: ",
                                ) ? (
                                  <div className="flex items-center gap-1">
                                    <span className="inline-block px-2 py-0.5 text-xs font-semibold text-red-800 bg-red-100 rounded-full">
                                      Not Enrolling
                                    </span>
                                    <span className="text-xs text-gray-600 ml-1">
                                      {student.nextCourse.substring(
                                        "Not Enrolling: ".length,
                                      )}
                                    </span>
                                  </div>
                                ) : student.nextCourse.startsWith(
                                    "Join Soon: ",
                                  ) ? (
                                  <div className="flex items-center gap-1">
                                    <span className="inline-block px-2 py-0.5 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">
                                      Join Soon
                                    </span>
                                    <span className="text-xs text-gray-600 ml-1">
                                      {student.nextCourse.substring(
                                        "Join Soon: ".length,
                                      )}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-xs">
                                    {student.nextCourse}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span>-</span>
                            )}
                          </div>
                        </TableCell>
                      )}
                      <TableCell className="text-gray-600 py-4 px-3 md:px-4 text-xs md:text-sm">
                        <div className="space-y-1 relative group ">
                          {student.tasks
                            .filter(
                              (t) => t.status.toLowerCase() === "complete",
                            )
                            .sort(
                              (a, b) =>
                                new Date(b.dateTime).getTime() -
                                new Date(a.dateTime).getTime(),
                            )
                            .slice(0, 1).length > 0 ? (
                            student.tasks
                              .filter(
                                (t) => t.status.toLowerCase() === "complete",
                              )
                              .sort(
                                (a, b) =>
                                  new Date(b.dateTime).getTime() -
                                  new Date(a.dateTime).getTime(),
                              )
                              .slice(0, 1)
                              .map((task, i) => (
                                <div
                                  key={i}
                                  className="text-xs text-gray-500 max-w-md"
                                >
                                  {task.course}: {task.task}
                                </div>
                              ))
                          ) : (
                            <div className="text-xs text-red-600 font-semibold max-w-md">
                              No latest classes
                            </div>
                          )}
                          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-auto  text-wrap bg-red-800 text-white text-xs rounded-xl py-2 px-3 z-50 shadow-lg">
                            <div className="font-medium mb-1">
                              Recent Class:
                            </div>
                            {student.tasks
                              .sort(
                                (a, b) =>
                                  new Date(b.dateTime).getTime() -
                                  new Date(a.dateTime).getTime(),
                              )
                              .slice(0, 1)
                              .map((task, i) => (
                                <div key={i} className="mt-1 truncate">
                                  • {task.course}: {task.task} ({task.status})
                                </div>
                              ))}
                            <div className="absolute bottom-0 left-4 transform translate-y-full border-4 border-transparent border-t-red-800"></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell
                        className="text-right py-3 px-3 md:px-4 sticky right-0 bg-white z-10"
                        variant="action"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          ref={(el) => {
                            actionBtnRefs.current[student.id] = el;
                          }}
                          className="text-white hover:white bg-red-800 focus:outline-none p-1.2 md:p-1 rounded-full transition-colors dropdown-trigger shadow-md"
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
                                      className="flex items-center w-full text-left px-3 md:px-4 py-2 text-xs md:text-sm text-gray-700 hover:bg-[#991b1b] hover:bg-opacity-10 hover:text-white transition-colors rounded-xl"
                                    >
                                      <UserPlus className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                      Add Student Class
                                    </button>
                                  </motion.div>
                                  <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                  >
                                    <button
                                      onClick={() => handleEditStudent(student)}
                                      className="flex items-center w-full text-left px-3 md:px-4 py-2 text-xs md:text-sm text-gray-700 hover:bg-[#991b1b] hover:bg-opacity-10 hover:text-white transition-colors rounded-xl"
                                    >
                                      <UserPlus className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                      Edit Student Profile
                                    </button>
                                  </motion.div>
                                  <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.12 }}
                                  >
                                    <button
                                      onClick={() => {
                                        // Check if PRN is not assigned
                                        if (!student.PrnNumber) {
                                          toast.error("contact to admin for");
                                          return;
                                        }
                                        setShowDropdown(null);
                                        setCourseStudent(student);
                                        setShowNewCourseModal(true);
                                      }}
                                      className="flex items-center hover:bg-[#991b1b] hover:bg-opacity-10 hover:text-white w-full text-left px-3 md:px-4 py-2 text-xs md:text-sm text-blue-700  transition-colors"
                                    >
                                      <MdAdd className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                      Add New Course
                                    </button>
                                  </motion.div>

                                  <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15 }}
                                  ></motion.div>
                                  <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15 }}
                                  >
                                    <button
                                      onClick={() => {
                                        // Check if PRN is not assigned
                                        if (!student.PrnNumber) {
                                          toast.error(
                                            "Contact to admin for PRN",
                                          );
                                          return;
                                        }
                                        router.push(`/${student.PrnNumber}`);
                                      }}
                                      className="flex items-center px-3 md:px-4  hover:bg-opacity-10 hover:text-white py-2 text-xs md:text-sm text-gray-700 hover:bg-[#991b1b] hover:bg-opacity-10  transition-colors w-full text-left rounded-xl"
                                    >
                                      <Eye className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                      View Details
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
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#991b1b",
              color: "white",
              zIndex: 9999,
            },
            success: {
              style: {
                background: "#16a34a",
                color: "white",
              },
            },
            error: {
              style: {
                background: "#dc2626",
                color: "white",
              },
            },
          }}
        />
      </main>

      {/* Add Modal for Adding Classes */}
      {isModalOpen && (
        <div className="fixed z-50 inset-0 bg-black bg-opacity-60 flex items-center justify-center  transition-opacity duration-300 overflow-y-auto p-2 md:p-4">
          <div className="relative min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-8rem)] flex items-center justify-center py-6 md:py-12">
            <div className="bg-white  rounded-2xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden transform transition-all duration-300 scale-95 animate-in">
              {/* Modal Header */}
              <div className="sticky top-0 z-50 flex justify-between items-center border-b  px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-[#991b1b]/10 to-[#7f1d1d]/10">
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
                            (cc) =>
                              typeof cc !== "string" && cc.name === c.name,
                          ).length;
                          return (
                            <option
                              key={(c.name || "") + (c.level || "") + idx}
                              value={c.name + (c.level ? `|${c.level}` : "")}
                            >
                              {c.name}
                              {c.level ? ` (Level ${c.level})` : ""}
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
              <div className="sticky top-0 z-10 flex justify-between items-center border-b px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-red-800 to-red-700 ">
                <h2 className="text-lg md:text-xl font-bold text-white flex items-center ">
                  <MdAdd className="mr-2 text-white" size={20} />
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
                  className="text-white hover:text-blue-700 p-1.5 md:p-2 rounded-full hover:bg-blue-50 transition-colors duration-200"
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
                      Total No Of Classes
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
                        where("PrnNumber", "==", courseStudent.PrnNumber),
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
                            c.level === newCourseFields.level.trim(),
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
                          collection(db, "students"),
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
                                data.name || data.fullName || data.username,
                              email: data.email || "",
                              completedTasks: completedTasksCount,
                              ongoingTasks: ongoingTasksCount,
                              tasks: tasks,
                              courses: data.courses || [],
                              nextCourse: data.nextCourse || undefined,
                              trainerId: data.trainerId || undefined,
                              trainerName: data.trainerName || undefined,
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

      {/* Assign PRN Modal */}
      {showAssignPrnModal && (
        <AssignPrnModal
          isOpen={showAssignPrnModal}
          onClose={() => setShowAssignPrnModal(false)}
          onAssign={fetchStudents} // Refresh the student list after assigning PRN
        />
      )}

      {/* Edit Course Modal */}
      {showEditCourseModal && editingStudent && (
        <div className="fixed z-50 inset-0 bg-black/70 flex items-center justify-center transition-opacity duration-300 overflow-y-auto p-2 md:p-4">
          <div className="relative min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-8rem)] flex items-center justify-center py-6 md:py-12">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto overflow-hidden transform transition-all duration-300 scale-95 animate-in">
              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex justify-between items-center border-b px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-red-800 to-red-700">
                <h2 className="text-lg md:text-xl font-bold text-white flex items-center">
                  <UserPlus className="mr-2 text-white" size={20} />
                  Edit Courses for {editingStudent.username}
                </h2>
                <button
                  onClick={() => {
                    setShowEditCourseModal(false);
                    setEditingStudent(null);
                    setEditingCourseIndex(null);
                    setEditCourseFields({
                      name: "",
                      classNumber: "",
                      level: "1",
                      status: "ongoing",
                      completed: false,
                      startDate: format(new Date(), "yyyy-MM-dd"),
                    });
                  }}
                  className="text-gray-500 hover:text-red-700 p-1.5 md:p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
                  aria-label="Close modal"
                >
                  <MdClose size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="px-4 md:px-6 py-4 md:py-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Course List Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300">
                      Current Courses
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {editingStudent.courses.map((course, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-xl border-1 border-gray-300 transition-all duration-200 $[
                            editingCourseIndex === index 
                              ? 'border-red-500 bg-red-50' 
                              : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              {typeof course === "string" ? (
                                <div>
                                  <h4 className="font-semibold text-gray-800">
                                    {course}
                                  </h4>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Basic course format - limited editing
                                  </p>
                                </div>
                              ) : (
                                <div>
                                  <h4 className="font-semibold text-gray-800">
                                    {course.name}
                                  </h4>
                                  <div className="text-sm text-gray-600 mt-1 space-y-1">
                                    <p>
                                      <span className="font-medium">
                                        Level:
                                      </span>{" "}
                                      {course.level || "N/A"}
                                    </p>
                                    <p>
                                      <span className="font-medium">
                                        Class:
                                      </span>{" "}
                                      {course.classNumber || "N/A"}
                                    </p>
                                    <p>
                                      <span className="font-medium">
                                        Status:
                                      </span>
                                      <span
                                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold $[
                                        course.status === 'complete' 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-blue-100 text-blue-800'
                                      ]`}
                                      >
                                        {course.status || "ongoing"}
                                      </span>
                                    </p>
                                    <p>
                                      <span className="font-medium">
                                        Start Date:
                                      </span>{" "}
                                      {course.startDate || "N/A"}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 ml-3">
                              {typeof course !== "string" && (
                                <>
                                  <button
                                    onClick={() => handleEditCourse(index)}
                                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                    title="Edit Course"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCourse(index)}
                                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                    title="Delete Course"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Edit Form Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300">
                      {editingCourseIndex !== null
                        ? "Edit Course"
                        : "Select a course to edit"}
                    </h3>

                    {editingCourseIndex !== null ? (
                      <div className="space-y-4">
                        <div className="form-group">
                          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                            Course Name *
                          </label>
                          <select
                            value={editCourseFields.name}
                            onChange={(e) =>
                              setEditCourseFields({
                                ...editCourseFields,
                                name: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2.5 text-sm bg-white border border-red-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-600 transition-all duration-200"
                          >
                            <option value="">Select Course</option>
                            {courses.map((course) => (
                              <option key={course} value={course}>
                                {course}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="form-group">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                              Class Number *
                            </label>
                            <input
                              type="text"
                              value={editCourseFields.classNumber}
                              onChange={(e) =>
                                setEditCourseFields({
                                  ...editCourseFields,
                                  classNumber: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2.5 text-sm bg-white border border-red-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                              placeholder="Enter class number"
                            />
                          </div>

                          <div className="form-group">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                              Level *
                            </label>
                            <input
                              type="text"
                              value={editCourseFields.level}
                              onChange={(e) =>
                                setEditCourseFields({
                                  ...editCourseFields,
                                  level: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2.5 text-sm bg-white border border-red-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                              placeholder="Enter level"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="form-group">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                              Start Date
                            </label>
                            <input
                              type="date"
                              value={editCourseFields.startDate}
                              onChange={(e) =>
                                setEditCourseFields({
                                  ...editCourseFields,
                                  startDate: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2.5 text-sm bg-white border border-red-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                            />
                          </div>

                          <div className="form-group">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                              Status
                            </label>
                            <select
                              value={editCourseFields.status}
                              onChange={(e) =>
                                setEditCourseFields({
                                  ...editCourseFields,
                                  status: e.target.value,
                                  completed: e.target.value === "complete",
                                })
                              }
                              className="w-full px-3 py-2.5 text-sm bg-white border border-red-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                            >
                              <option value="ongoing">Ongoing</option>
                              <option value="complete">Complete</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={() => {
                              setEditingCourseIndex(null);
                              setEditCourseFields({
                                name: "",
                                classNumber: "",
                                level: "1",
                                status: "ongoing",
                                completed: false,
                                startDate: format(new Date(), "yyyy-MM-dd"),
                              });
                            }}
                            className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveEditedCourse}
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold flex items-center justify-center shadow-lg"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">
                          Select a Course
                        </h4>
                        <p className="text-gray-600">
                          Click the edit icon next to any course to modify its
                          details
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Trainer to Course Modal */}
      {assignTrainerModalOpen && selectedStudentForTrainer && (
        <div className="fixed z-50 inset-0 bg-black bg-opacity-60 flex items-center justify-center transition-opacity duration-300 overflow-y-auto p-2 md:p-4">
          <div className="relative min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-8rem)] flex items-center justify-center py-6 md:py-12">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden transform transition-all duration-300 scale-95 animate-in">
              {/* Modal Header */}

              {/* Modal Content */}
              <div className="px-6 py-6 h-96 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Student
                    </label>
                    <input
                      type="text"
                      value={`${selectedStudentForTrainer.username} (${selectedStudentForTrainer.PrnNumber})`}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Course
                    </label>
                    <select
                      value={
                        selectedCourseForTrainer
                          ? `${selectedCourseForTrainer.name || ""}_${selectedCourseForTrainer.level || ""}`
                          : ""
                      }
                      onChange={(e) => {
                        const [name, level] = e.target.value.split("_");
                        const course = selectedStudentForTrainer.courses.find(
                          (c) =>
                            (c.name || "") === name &&
                            (c.level || "") === level,
                        );
                        setSelectedCourseForTrainer(course || null);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" disabled>
                        Select a course
                      </option>
                      {selectedStudentForTrainer.courses.map(
                        (course, index) => (
                          <option
                            key={index}
                            value={`${course.name || ""}_${course.level || ""}`}
                          >
                            {course.name}{" "}
                            {course.level ? `(Level ${course.level})` : ""}
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Trainer
                    </label>
                    <select
                      value={selectedTrainer}
                      onChange={(e) => setSelectedTrainer(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" disabled>
                        Select a trainer
                      </option>
                      {trainers.map((trainer) => (
                        <option key={trainer.id} value={trainer.id}>
                          {trainer.name || trainer.username || trainer.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setAssignTrainerModalOpen(false);
                        setSelectedStudentForTrainer(null);
                        setSelectedCourseForTrainer(null);
                        setSelectedTrainer("");
                      }}
                      className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAssignTrainerToCourse}
                      disabled={!selectedCourseForTrainer || !selectedTrainer}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Assign Trainer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
