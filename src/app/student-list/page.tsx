"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React, {
  useEffect,
  useState,
  ChangeEvent,
  useRef,
  useMemo,
  useCallback,
} from "react";
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
  Search,
  Download,
  MoreHorizontal,
  UserPlus,
  XCircle,
  Eye,
  Trash2,
  RefreshCw,
  GraduationCap,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Users,
  AlertCircle,
  Clock,
  CheckCircle2,
  UserCheck,
  BookPlus,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MdAdd, MdClose } from "react-icons/md";
import { format } from "date-fns";
import toast, { Toaster } from "react-hot-toast";
import courses from "../../../utils/courses";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import AssignPrnModal from "@/components/AssignPrnModal";
import { useAuth } from "@/lib/auth-context";

// ─── TYPES ────────────────────────────────────────────────────────────────────
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
  profileimage?: string;
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

// ─── DERIVED STATUS LOGIC ─────────────────────────────────────────────────────
type DerivedStatus = "active" | "pending_trainer" | "no_course" | "completed";

function getDerivedStatus(student: Student): DerivedStatus {
  if (!student.courses || student.courses.length === 0) return "no_course";
  const ongoingCourses = student.courses.filter(
    (c) =>
      c.completed !== true &&
      (!c.status || c.status.toLowerCase() !== "complete"),
  );
  if (ongoingCourses.length === 0) return "completed";
  const hasUnassignedTrainer = ongoingCourses.some(
    (c) => !c.trainerName || c.trainerName.trim() === "",
  );
  if (hasUnassignedTrainer) return "pending_trainer";
  return "active";
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  DerivedStatus,
  { label: string; cls: string; dot: string }
> = {
  active: {
    label: "Active",
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  pending_trainer: {
    label: "Needs Trainer",
    cls: "bg-[#9F0712]/10 text-[#9F0712] border-[#9F0712]/20",
    dot: "bg-[#9F0712]",
  },
  no_course: {
    label: "Not Enrolled",
    cls: "bg-gray-100 text-gray-500 border-gray-200",
    dot: "bg-gray-400",
  },
  completed: {
    label: "Hold",
    cls: "bg-[#9F0712]/10 text-[#9F0712] border-[#9F0712]/20",
    dot: "bg-[#9F0712]",
  },
};

function StatusBadge({ status }: { status: DerivedStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-medium ${cfg.cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── MODAL PRIMITIVES ─────────────────────────────────────────────────────────
const inputCls =
  "w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9F0712]/20 focus:border-[#9F0712] transition-all placeholder-gray-400";
const labelCls =
  "block text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1";

function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = "max-w-md",
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`bg-white rounded-2xl shadow-2xl w-full ${width} overflow-hidden flex flex-col max-h-[90vh]`}
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 flex-shrink-0">
              <div className="text-sm font-bold text-gray-900">{title}</div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <MdClose size={16} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-5 py-4">{children}</div>
            {footer && (
              <div className="flex justify-end gap-2 px-5 py-3 bg-gray-50 border-t border-gray-100 flex-shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Btn({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  size = "md",
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const base =
    "inline-flex items-center gap-1.5 font-semibold rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm" };
  const variants = {
    primary: "bg-[#9F0712] text-white hover:bg-[#9F0712]/90",
    ghost: "bg-white text-gray-700 border border-gray-200 hover:bg-[#9F0712]/5",
    danger:
      "bg-[#9F0712]/10 text-[#9F0712] border border-[#9F0712]/20 hover:bg-[#9F0712]/15",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

// ─── PAGE SIZES ───────────────────────────────────────────────────────────────
const PAGE_SIZES = [20, 50, 100];

// ══════════════════════════════════════════════════════════════════════════════
const Page = () => {
  const { user, userRole } = useAuth();
  const router = useRouter();
  const canAssignTrainer = userRole === "admin";

  // ── State ──────────────────────────────────────────────────────────────────
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trainers, setTrainers] = useState<Trainer[]>([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [trainerFilter, setTrainerFilter] = useState("");
  const [centerFilter, setCenterFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<DerivedStatus | "">("");
  const [activeTab, setActiveTab] = useState("all");

  // Sort
  const [sortColumn, setSortColumn] = useState<
    "PrnNumber" | "username" | "completedTasks"
  >("PrnNumber");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Selection (bulk)
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Dropdown
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const actionBtnRefs = useRef<{ [id: string]: HTMLButtonElement | null }>({});

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showNewCourseModal, setShowNewCourseModal] = useState(false);
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [showAssignPrnModal, setShowAssignPrnModal] = useState(false);
  const [assignTrainerModalOpen, setAssignTrainerModalOpen] = useState(false);
  const [bulkAssignTrainerModalOpen, setBulkAssignTrainerModalOpen] =
    useState(false);

  // Add Class form
  const [task, setTask] = useState("");
  const [dateTime, setDateTime] = useState(
    format(new Date(), "yyyy-MM-dd'T'HH:mm"),
  );
  const [status, setStatus] = useState<"ongoing" | "complete">("complete");
  const [course, setCourse] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Course forms
  const [courseStudent, setCourseStudent] = useState<Student | null>(null);
  const [newCourseFields, setNewCourseFields] = useState({
    name: "",
    classNumber: "",
    level: "1",
    status: "ongoing",
    completed: false,
    startDate: format(new Date(), "yyyy-MM-dd"),
  });
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

  // Trainer assignment
  const [selectedStudentForTrainer, setSelectedStudentForTrainer] =
    useState<Student | null>(null);
  const [selectedCourseForTrainer, setSelectedCourseForTrainer] =
    useState<Course | null>(null);
  const [selectedTrainer, setSelectedTrainer] = useState("");
  const [bulkSelectedTrainer, setBulkSelectedTrainer] = useState("");

  // ── Data functions (ALL PRESERVED) ──────────────────────────────────────────
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, "students"));
      const list = snap.docs.map((doc) => {
        const d = doc.data();
        const tasks: Task[] = d.tasks || [];
        let completed = 0,
          ongoing = 0;
        tasks.forEach((t) => {
          const s = (t.status || "").toLowerCase();
          if (s === "complete") completed++;
          else if (s === "ongoing") ongoing++;
        });
        return {
          id: doc.id,
          PrnNumber: d.PrnNumber || "",
          username: d.name || d.fullName || d.username,
          profileimage:
            d.profileimage || d.imageUrl || d.imageUrls?.[0] || undefined,
          completedTasks: completed,
          ongoingTasks: ongoing,
          tasks,
          courses: d.courses || [],
          classes: d.classes,
          createdAt: d.createdAt || null,
          createdBy: d.createdBy,
          createdByRole: d.createdByRole,
          lastLogin: d.lastLogin || null,
          role: d.role,
          nextCourse: d.nextCourse,
          trainerId: d.trainerId,
          trainerName: d.trainerName,
          status: d.status || "active",
        } as Student;
      });
      setStudents(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchTrainers = useCallback(async () => {
    try {
      const db = getFirestore(app);
      const snap = await getDocs(collection(db, "trainers"));
      setTrainers(
        snap.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            name: d.name || d.fullName || d.displayName || d.username || "",
            email: d.email || "",
            username: d.username || "",
          };
        }),
      );
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
    fetchTrainers();
  }, [fetchStudents, fetchTrainers]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (!t.closest(".dropdown-trigger") && !t.closest(".dropdown-menu"))
        setShowDropdown(null);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [
    searchTerm,
    trainerFilter,
    centerFilter,
    statusFilter,
    activeTab,
    sortColumn,
    sortDirection,
  ]);

  // ── Filtering + sorting (PRESERVED logic, extended) ───────────────────────
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => s.status !== "pending")
      .filter((s) => {
        if (activeTab === "ongoing")
          return (
            s.courses.length > 0 &&
            s.courses.some(
              (c) =>
                c.completed !== true &&
                (!c.status || c.status.toLowerCase() !== "complete"),
            )
          );
        if (activeTab === "hold")
          return (
            s.courses.length > 0 &&
            s.courses.every(
              (c) =>
                c.completed === true ||
                (c.status && c.status.toLowerCase() === "complete"),
            )
          );
        return true;
      })
      .filter((s) => {
        if (!searchTerm) return true;
        const t = searchTerm.toLowerCase();
        return (
          s.username?.toLowerCase().includes(t) ||
          s.PrnNumber?.toLowerCase().includes(t) ||
          s.completedTasks.toString().includes(t)
        );
      })
      .filter((s) => {
        if (!trainerFilter) return true;
        if (trainerFilter === "None Assigned")
          return s.courses.some(
            (c) =>
              typeof c !== "string" &&
              (!c.trainerName || c.trainerName.trim() === "") &&
              c.completed !== true &&
              (!c.status || c.status.toLowerCase() !== "complete"),
          );
        return s.courses.some(
          (c) =>
            typeof c !== "string" &&
            c.trainerName === trainerFilter &&
            c.completed !== true &&
            (!c.status || c.status.toLowerCase() !== "complete"),
        );
      })
      .filter((s) => {
        if (!centerFilter) return true;
        if (centerFilter === "Kalyani Nagar")
          return s.PrnNumber.startsWith("CRAKN");
        if (centerFilter === "Viman Nagar")
          return s.PrnNumber.startsWith("CRAVN");
        return true;
      })
      .filter((s) => {
        if (!statusFilter) return true;
        return getDerivedStatus(s) === statusFilter;
      })
      .sort((a, b) => {
        if (activeTab === "ongoing") {
          const latest = (s: Student) =>
            s.tasks.length === 0
              ? 0
              : Math.max(...s.tasks.map((t) => new Date(t.dateTime).getTime()));
          return latest(b) - latest(a);
        }
        if (sortColumn === "completedTasks")
          return sortDirection === "asc"
            ? a.completedTasks - b.completedTasks
            : b.completedTasks - a.completedTasks;
        if (sortColumn === "PrnNumber") {
          const c = a.PrnNumber.localeCompare(b.PrnNumber, undefined, {
            numeric: true,
          });
          return sortDirection === "asc" ? c : -c;
        }
        const va = a[sortColumn]?.toLowerCase?.() ?? "";
        const vb = b[sortColumn]?.toLowerCase?.() ?? "";
        return sortDirection === "asc" ? (va > vb ? 1 : -1) : va < vb ? 1 : -1;
      });
  }, [
    students,
    activeTab,
    searchTerm,
    trainerFilter,
    centerFilter,
    statusFilter,
    sortColumn,
    sortDirection,
  ]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const paginatedStudents = useMemo(
    () => filteredStudents.slice((page - 1) * pageSize, page * pageSize),
    [filteredStudents, page, pageSize],
  );

  // ── Selection ──────────────────────────────────────────────────────────────
  const pageIds = paginatedStudents.map((s) => s.id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const someSelected = selected.size > 0;

  const toggleSelectAll = () => {
    if (allPageSelected)
      setSelected((prev) => {
        const n = new Set(prev);
        pageIds.forEach((id) => n.delete(id));
        return n;
      });
    else
      setSelected((prev) => {
        const n = new Set(prev);
        pageIds.forEach((id) => n.add(id));
        return n;
      });
  };
  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  // ── Sort helper ────────────────────────────────────────────────────────────
  const handleSort = (col: "PrnNumber" | "username" | "completedTasks") => {
    if (sortColumn === col)
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortColumn(col);
      setSortDirection("asc");
    }
  };
  const SortIcon = ({
    col,
  }: {
    col: "PrnNumber" | "username" | "completedTasks";
  }) =>
    sortColumn === col ? (
      sortDirection === "asc" ? (
        <ChevronUp className="h-3 w-3" />
      ) : (
        <ChevronDown className="h-3 w-3" />
      )
    ) : (
      <ChevronDown className="h-3 w-3 opacity-30" />
    );

  // ── ALL data mutation functions PRESERVED ──────────────────────────────────
  const handleAssignTrainerToCourse = async () => {
    if (
      !selectedStudentForTrainer ||
      !selectedCourseForTrainer ||
      !selectedTrainer
    ) {
      toast.error("Please select all fields");
      return;
    }
    try {
      const db = getFirestore(app);
      const updatedCourses = selectedStudentForTrainer.courses.map((c) => {
        if (
          (c.name || "") === (selectedCourseForTrainer.name || "") &&
          (c.level || "") === (selectedCourseForTrainer.level || "")
        ) {
          const trainer = trainers.find((t) => t.id === selectedTrainer);
          return {
            ...c,
            trainerId: selectedTrainer,
            trainerName:
              trainer?.name || trainer?.username || trainer?.email || "",
          };
        }
        return c;
      });
      await updateDoc(doc(db, "students", selectedStudentForTrainer.id), {
        courses: updatedCourses,
      });
      setStudents((prev) =>
        prev.map((s) =>
          s.id === selectedStudentForTrainer.id
            ? { ...s, courses: updatedCourses }
            : s,
        ),
      );
      toast.success("Trainer assigned!");
      setAssignTrainerModalOpen(false);
      setSelectedStudentForTrainer(null);
      setSelectedCourseForTrainer(null);
      setSelectedTrainer("");
    } catch (e) {
      toast.error("Failed to assign trainer");
    }
  };

  const handleBulkAssignTrainer = async () => {
    if (!bulkSelectedTrainer || selected.size === 0) {
      toast.error("Please select a trainer and at least one student");
      return;
    }

    try {
      const db = getFirestore(app);
      const trainer = trainers.find((t) => t.id === bulkSelectedTrainer);
      const trainerName =
        trainer?.name || trainer?.username || trainer?.email || "";
      const ids = Array.from(selected);
      const updates = ids.map(async (studentId) => {
        const student = students.find((s) => s.id === studentId);
        if (!student) return;

        const updatedCourses = student.courses.map((c) => {
          if (
            typeof c === "string" ||
            c.completed === true ||
            (c.status && c.status.toLowerCase() === "complete")
          ) {
            return c;
          }
          return {
            ...c,
            trainerId: bulkSelectedTrainer,
            trainerName,
          };
        });

        await updateDoc(doc(db, "students", studentId), {
          courses: updatedCourses,
        });
      });

      await Promise.all(updates);
      setStudents((prev) =>
        prev.map((student) =>
          selected.has(student.id)
            ? {
                ...student,
                courses: student.courses.map((c) => {
                  if (
                    typeof c === "string" ||
                    c.completed === true ||
                    (c.status && c.status.toLowerCase() === "complete")
                  ) {
                    return c;
                  }
                  return {
                    ...c,
                    trainerId: bulkSelectedTrainer,
                    trainerName,
                  };
                }),
              }
            : student,
        ),
      );

      toast.success(`Trainer assigned to ${selected.size} student(s)`);
      setBulkAssignTrainerModalOpen(false);
      setBulkSelectedTrainer("");
      setSelected(new Set());
    } catch (e) {
      toast.error("Failed to assign trainer in bulk");
    }
  };

  const handleExport = async () => {
    const [{ default: ExcelJS }, { saveAs }] = await Promise.all([
      import("exceljs"),
      import("file-saver"),
    ]);
    const isOngoing = (s: Student) =>
      s.courses.length > 0 &&
      s.courses.some(
        (c) =>
          c.completed !== true &&
          (!c.status || c.status.toLowerCase() !== "complete"),
      );
    const isHold = (s: Student) =>
      s.courses.length > 0 &&
      s.courses.every(
        (c) =>
          c.completed === true ||
          (c.status && c.status.toLowerCase() === "complete"),
      );
    const base = searchTerm
      ? students.filter(
          (s) =>
            s.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.PrnNumber?.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      : students;
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
      list.flatMap((s) =>
        (s.courses?.length
          ? s.courses
          : [
              {
                name: "",
                level: "",
                classNumber: "",
                status: "",
                completed: "",
              },
            ]
        ).map(
          (c) =>
            ({
              "PRN Number": s.PrnNumber,
              "Student Name": s.username,
              Course: typeof c === "string" ? c : c?.name || "",
              Level: typeof c === "string" ? "" : c?.level || "",
              "Class Number": typeof c === "string" ? "" : c?.classNumber || "",
              "Course Status": typeof c === "string" ? "" : c?.status || "",
              "Course Completed":
                typeof c === "string" ? "" : c?.completed ? "Yes" : "No",
              "Assigned Classes": (s.tasks || [])
                .filter(
                  (t) => t.course === (typeof c === "string" ? c : c?.name),
                )
                .map((t) => t.task)
                .join(", "),
              "Completed Classes": s.completedTasks,
              "Ongoing Classes": s.ongoingTasks,
              "Completed Classes List": (s.tasks || [])
                .filter(
                  (t) =>
                    t.status?.toLowerCase() === "complete" &&
                    t.course === (typeof c === "string" ? c : c?.name),
                )
                .map((t) => t.task)
                .join(", "),
            }) as Record<string, string | number>,
        ),
      );
    const wb = new ExcelJS.Workbook();
    const addSheet = (name: string, data: Student[]) => {
      const ws = wb.addWorksheet(name);
      ws.addRow(headers);
      buildRows(data).forEach((r) => ws.addRow(headers.map((h) => r[h] ?? "")));
      ws.getRow(1).eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF7F1D1D" },
        };
        cell.font = { color: { argb: "FFFFFFFF" }, bold: true };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });
      ws.columns.forEach((col) => {
        col.width = 22;
      });
    };
    addSheet("All", base);
    addSheet("Ongoing", base.filter(isOngoing));
    addSheet("Hold", base.filter(isHold));
    saveAs(new Blob([await wb.xlsx.writeBuffer()]), "students.xlsx");
  };

  const resetForm = () => {
    setTask("");
    setDateTime(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
    setStatus("complete");
    setCourse("");
    setSelectedStudent(null);
  };

  const handleAddClass = (student: Student) => {
    if (!student.PrnNumber) {
      toast.error("Contact admin for PRN");
      return;
    }
    setSelectedStudent(student);
    const last = student.tasks
      .filter((t) => t.status.toLowerCase() === "complete")
      .sort(
        (a, b) =>
          new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime(),
      )[0];
    if (last) setCourse(last.course);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!task.trim()) {
      toast.error("Task cannot be empty");
      return;
    }
    if (!dateTime) {
      toast.error("Date and time required");
      return;
    }
    if (!course) {
      toast.error("Course required");
      return;
    }
    if (!selectedStudent) {
      toast.error("No student selected");
      return;
    }
    try {
      const db = getFirestore(app);
      const q = query(
        collection(db, "students"),
        where("PrnNumber", "==", selectedStudent.PrnNumber),
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const ref = doc(db, "students", snap.docs[0].id);
        const d = snap.docs[0].data() as StudentData;
        await updateDoc(ref, {
          tasks: [...(d.tasks || []), { task, dateTime, status, course }],
        });
        toast.success("Class added!");
        setIsModalOpen(false);
        resetForm();
        await fetchStudents();
      } else {
        toast.error("Student not found");
      }
    } catch (e) {
      toast.error("Error adding class");
    }
  };

  const handleEditStudent = (student: Student) => {
    if (!student.PrnNumber) {
      toast.error("Contact admin for PRN");
      return;
    }
    if (!student.courses?.length) {
      toast.error("No courses to edit");
      return;
    }
    setEditingStudent(student);
    setShowEditCourseModal(true);
    setShowDropdown(null);
  };

  const handleEditCourse = (idx: number) => {
    if (!editingStudent) return;
    const c = editingStudent.courses[idx];
    if (typeof c === "string") {
      toast.error("Cannot edit basic format");
      return;
    }
    setEditingCourseIndex(idx);
    setEditCourseFields({
      name: c.name || "",
      classNumber: c.classNumber || "",
      level: c.level || "1",
      status: c.status || "ongoing",
      completed: c.completed || false,
      startDate: c.startDate || format(new Date(), "yyyy-MM-dd"),
    });
  };

  const handleSaveEditedCourse = async () => {
    if (!editingStudent || editingCourseIndex === null) return;
    if (
      !editCourseFields.name.trim() ||
      !editCourseFields.classNumber.trim() ||
      !editCourseFields.level.trim()
    ) {
      toast.error("All fields required");
      return;
    }
    try {
      const db = getFirestore(app);
      const snap = await getDocs(
        query(
          collection(db, "students"),
          where("PrnNumber", "==", editingStudent.PrnNumber),
        ),
      );
      if (!snap.empty) {
        const current = [...(snap.docs[0].data().courses || [])];
        current[editingCourseIndex] = {
          name: editCourseFields.name.trim(),
          classNumber: editCourseFields.classNumber.trim(),
          level: editCourseFields.level.trim(),
          status: editCourseFields.status,
          completed: editCourseFields.completed,
          startDate: editCourseFields.startDate,
        };
        await updateDoc(doc(db, "students", snap.docs[0].id), {
          courses: current,
        });
        toast.success("Course updated!");
        setEditingCourseIndex(null);
        await fetchStudents();
      } else {
        toast.error("Student not found");
      }
    } catch (e) {
      toast.error("Error updating course");
    }
  };

  const handleDeleteCourse = async (idx: number) => {
    if (!editingStudent || !confirm("Delete this course?")) return;
    try {
      const db = getFirestore(app);
      const snap = await getDocs(
        query(
          collection(db, "students"),
          where("PrnNumber", "==", editingStudent.PrnNumber),
        ),
      );
      console.log(snap);
      if (!snap.empty) {
        const current = [...(snap.docs[0].data().courses || [])];
        current.splice(idx, 1);
        await updateDoc(doc(db, "students", snap.docs[0].id), {
          courses: current,
        });
        toast.success("Course deleted!");
        setEditingStudent((prev) => {
          if (!prev) return prev;
          const u = [...prev.courses];
          u.splice(idx, 1);
          return { ...prev, courses: u };
        });
        await fetchStudents();
      } else {
        toast.error("Student not found");
      }
    } catch (e) {
      toast.error("Error deleting course");
    }
  };

  // Portal dropdown
  function PortalDropdown({
    open,
    anchorRef,
    children,
  }: {
    open: boolean;
    anchorRef: React.RefObject<HTMLButtonElement>;
    children: React.ReactNode;
  }) {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (open && anchorRef?.current && ref.current) {
        const r = anchorRef.current.getBoundingClientRect();
        ref.current.style.position = "absolute";
        ref.current.style.top = `${r.bottom + window.scrollY + 4}px`;
        ref.current.style.left = `${r.right + window.scrollX - 192}px`;
        ref.current.style.zIndex = "9999";
      }
    }, [open, anchorRef]);
    if (!open || typeof window === "undefined") return null;
    return createPortal(<div ref={ref}>{children}</div>, document.body);
  }

  // ── Stat counts ────────────────────────────────────────────────────────────
  const statCounts = useMemo(() => {
    const active = students.filter((s) => s.status !== "pending");
    return {
      total: active.length,
      active: active.filter((s) => getDerivedStatus(s) === "active").length,
      needsTrainer: active.filter(
        (s) => getDerivedStatus(s) === "pending_trainer",
      ).length,
      noCourse: active.filter((s) => getDerivedStatus(s) === "no_course")
        .length,
    };
  }, [students]);

  // ── Trainer list for filter dropdown ──────────────────────────────────────
  const trainerNames = useMemo(
    () =>
      Array.from(
        new Set(
          students.flatMap((s) =>
            s.courses
              .filter(
                (c) =>
                  typeof c !== "string" &&
                  c.trainerName &&
                  c.completed !== true &&
                  (!c.status || c.status.toLowerCase() !== "complete"),
              )
              .map((c) => c.trainerName)
              .filter(Boolean),
          ),
        ),
      ).sort(),
    [students],
  );

  const getActiveTrainerAllocations = useCallback((student: Student) => {
    return (student.courses || [])
      .filter(
        (c): c is Course =>
          typeof c !== "string" &&
          c.completed !== true &&
          (!c.status || c.status.toLowerCase() !== "complete"),
      )
      .map((c) => ({
        courseLabel: `${c.name || "Untitled course"}${c.level ? ` L${c.level}` : ""}`,
        trainerLabel: c.trainerName?.trim() || "",
      }));
  }, []);

  // ── Tabs ───────────────────────────────────────────────────────────────────
  const TABS = [
    { key: "all", label: "All" },
    { key: "ongoing", label: "Ongoing" },
    { key: "hold", label: "Completed" },
  ];

  // ══════════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <div
      className="min-h-screen bg-[#f9f9f8]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* ── TOPBAR ─────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div
          className="max-w-screen-xl mx-auto px-5 h-13 flex items-center justify-between"
          style={{ height: 52 }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#9F0712] rounded-lg flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm tracking-tight">
              Student Management
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Btn variant="ghost" size="sm" onClick={handleExport}>
              <Download className="h-3.5 w-3.5" /> Export
            </Btn>
            {userRole === "admin" && (
              <Btn
                variant="primary"
                size="sm"
                onClick={() => setShowAssignPrnModal(true)}
              >
                <UserPlus className="h-3.5 w-3.5" /> Assign PRN
              </Btn>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-5 py-5">
        {/* ── STAT CARDS ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            {
              label: "Total Students",
              value: statCounts.total,
              icon: Users,
              color: "text-gray-700",
              bg: "bg-white",
            },

            {
              label: "Needs Trainer",
              value: statCounts.needsTrainer,
              icon: AlertCircle,
              color: "text-[#9F0712]",
              bg: "bg-[#9F0712]/10",
            },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div
              key={label}
              className={`${bg} border border-gray-200 rounded-xl p-3.5 flex items-start gap-3`}
            >
              <div className={`mt-0.5 ${color} opacity-80`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium leading-none mb-1">
                  {label}
                </p>
                <p className={`text-2xl font-bold leading-none ${color}`}>
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── FILTER TOOLBAR ───────────────────────────────────────────────── */}
        <div className="bg-white border border-[#9F0712]/10 rounded-xl p-3 mb-3 flex flex-col gap-3">
          {/* Row 1: Search + dropdowns */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search name or PRN…"
                className="w-full pl-8 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:bg-white focus:border-[#9F0712] transition-all"
              />
              {searchTerm && (
                <button
                  className="absolute right-2.5 top-1/2 -translate-y-1/2"
                  onClick={() => setSearchTerm("")}
                >
                  <XCircle className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            <select
              value={centerFilter}
              onChange={(e) => setCenterFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#9F0712] min-w-[140px]"
            >
              <option value="">All Centers</option>
              <option value="Kalyani Nagar">Kalyani Nagar</option>
              <option value="Viman Nagar">Viman Nagar</option>
            </select>
            <select
              value={trainerFilter}
              onChange={(e) => setTrainerFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#9F0712] min-w-[140px]"
            >
              <option value="">All Trainers</option>
              <option value="None Assigned">None Assigned</option>
              {trainerNames.map((n, i) => (
                <option key={i} value={n || ""}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {/* Row 2: Tabs + quick filters + refresh */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 flex-wrap">
              {/* Enrollment tabs */}
              <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${activeTab === t.key ? "bg-white text-[#9F0712] shadow-sm" : "text-gray-500 hover:text-[#9F0712]"}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Status quick filters */}
              <div className="flex gap-1 ml-1 flex-wrap">
                {(
                  Object.entries(STATUS_CONFIG) as [
                    DerivedStatus,
                    (typeof STATUS_CONFIG)[DerivedStatus],
                  ][]
                )
                  .filter(([key]) => key !== "active" && key !== "no_course")
                  .map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() =>
                        setStatusFilter(statusFilter === key ? "" : key)
                      }
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${statusFilter === key ? cfg.cls + " shadow-sm" : "bg-white text-gray-500 border-gray-200 hover:border-[#9F0712]/20 hover:text-[#9F0712]"}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </button>
                  ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {filteredStudents.length} results
              </span>
              <button
                onClick={async () => {
                  setRefreshing(true);
                  await fetchStudents();
                }}
                disabled={refreshing || loading}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-40"
              >
                <RefreshCw
                  className={`h-3 w-3 ${refreshing ? "animate-spin" : ""}`}
                />{" "}
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* ── BULK ACTION BAR ──────────────────────────────────────────────── */}
        <AnimatePresence>
          {someSelected && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-gradient-to-r from-[#9F0712] to-[#9F0712] text-white rounded-xl px-4 py-2.5 mb-3 flex items-center justify-between"
            >
              <span className="text-sm font-semibold">
                {selected.size} student{selected.size > 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center gap-2">
                {canAssignTrainer && (
                  <button
                    onClick={() => setBulkAssignTrainerModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg text-xs font-medium transition-colors"
                  >
                    <UserCheck className="h-3.5 w-3.5" /> Assign Trainer
                  </button>
                )}
                <button
                  onClick={() => {
                    toast("Bulk course assignment — implement with modal");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg text-xs font-medium transition-colors"
                >
                  <BookPlus className="h-3.5 w-3.5" /> Assign Course
                </button>
                <button
                  onClick={() => setSelected(new Set())}
                  className="flex items-center gap-1 px-2 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs transition-colors"
                >
                  <XCircle className="h-3.5 w-3.5" /> Clear
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── TABLE ────────────────────────────────────────────────────────── */}
        <div className="bg-white border border-[#9F0712]/10 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="flex gap-4 items-center py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="w-4 h-4 rounded bg-gray-100 animate-pulse flex-shrink-0" />
                  <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-100 rounded-full animate-pulse w-40" />
                    <div className="h-2.5 bg-gray-50 rounded-full animate-pulse w-24" />
                  </div>
                  <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse" />
                  <div className="h-5 w-28 bg-gray-100 rounded-full animate-pulse hidden md:block" />
                  <div className="h-5 w-24 bg-gray-100 rounded-full animate-pulse hidden lg:block" />
                </div>
              ))}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-20 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-100 mb-4">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-800">
                No students found
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Try adjusting your filters or search term.
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 px-4 py-2 bg-[#9F0712] text-white text-xs font-semibold rounded-lg hover:bg-[#9F0712]/90"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100  bg-gradient-to-r from-[#991b1b] to-[#7f1d1d]  text-white">
                    <th className="w-10 px-4 py-2.5">
                      <input
                        type="checkbox"
                        checked={allPageSelected}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 accent-[#9F0712] cursor-pointer"
                      />
                    </th>
                    <th className="px-3 py-2.5 text-left">
                      <button
                        onClick={() => handleSort("username")}
                        className="flex items-center gap-1 text-[11px] font-semibold text-white uppercase tracking-wider "
                      >
                        Student <SortIcon col="username" />
                      </button>
                    </th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-white uppercase tracking-wider hidden md:table-cell">
                      Course
                    </th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-white uppercase tracking-wider hidden lg:table-cell">
                      Trainer
                    </th>
                    <th className="px-3 py-2.5 text-left ">
                      <button
                        onClick={() => handleSort("completedTasks")}
                        className="flex items-center gap-1 text-[11px] font-semibold text-white uppercase tracking-wider hover:text-white"
                      >
                        Last Class <SortIcon col="completedTasks" />
                      </button>
                    </th>
                    <th className="px-3 py-2.5 text-right text-[11px] font-semibold  uppercase tracking-wider sticky right-0 bg-gradient-to-r from-[#991b1b] to-[#7f1d1d]  text-white ">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedStudents.map((student) => {
                    const derivedStatus = getDerivedStatus(student);
                    const lastTask = student.tasks
                      .filter((t) => t.status.toLowerCase() === "complete")
                      .sort(
                        (a, b) =>
                          new Date(b.dateTime).getTime() -
                          new Date(a.dateTime).getTime(),
                      )[0];
                    const activeCourses = student.courses.filter(
                      (c) =>
                        c.completed !== true &&
                        (!c.status || c.status.toLowerCase() !== "complete"),
                    );
                    const isChecked = selected.has(student.id);

                    return (
                      <tr
                        key={student.id}
                        onClick={() => {
                          if (!student.PrnNumber) {
                            toast.error("Contact admin for PRN");
                            return;
                          }
                          router.push(`/${student.PrnNumber}`);
                        }}
                        className={`cursor-pointer transition-colors hover:bg-gray-50 ${isChecked ? "bg-[#9F0712]/[0.03]" : ""}`}
                      >
                        {/* Checkbox */}
                        <td
                          className="w-10 px-4 py-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelect(student.id)}
                            className="w-4 h-4 rounded border-gray-300 accent-[#9F0712] cursor-pointer"
                          />
                        </td>

                        {/* Student */}
                        <td className="px-3 py-3 min-w-[180px]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#991b1b] to-[#7f1d1d]  text-white flex items-center justify-center flex-shrink-0">
                              {student.profileimage ? (
                                <Image
                                  src={student.profileimage}
                                  alt={student.username}
                                  width={32}
                                  height={32}
                                  className="w-full h-full object-cover rounded-full"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = "/assets/logo1.png";
                                  }}
                                />
                              ) : (
                                <span className="text-xs font-bold text-white">
                                  {student.username?.charAt(0)?.toUpperCase() ||
                                    "?"}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {student.username}
                              </p>
                              <p className="text-xs text-gray-400 font-mono truncate">
                                {student.PrnNumber || (
                                  <span className="text-red-500 font-sans font-medium not-italic">
                                    No PRN
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Courses */}
                        <td className="px-3 py-3 hidden md:table-cell">
                          {activeCourses.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-[220px]">
                              {activeCourses.slice(0, 2).map((c, i) => (
                                <span
                                  key={i}
                                  className="text-xs bg-gradient-to-r from-[#991b1b] to-[#7f1d1d]  text-white px-2 py-0.5 rounded-md font-medium whitespace-nowrap"
                                >
                                  {c.name}
                                  {c.level ? ` L${c.level}` : ""}
                                </span>
                              ))}
                              {activeCourses.length > 2 && (
                                <span className="text-xs text-gray-400 font-medium">
                                  +{activeCourses.length - 2}
                                </span>
                              )}
                            </div>
                          ) : student.courses.length > 0 ? (
                            <span className="text-xs text-gray-400 italic">
                              All completed
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">
                              —
                            </span>
                          )}
                        </td>

                        {/* Trainer */}
                        <td className="px-3 py-3 hidden lg:table-cell">
                          {getActiveTrainerAllocations(student).some(
                            (item) => item.trainerLabel,
                          ) ? (
                            <div className="space-y-0.5">
                              {getActiveTrainerAllocations(student)
                                .slice(0, 2)
                                .map((c, i) => (
                                  <p
                                    key={i}
                                    className="text-xs text-gray-700 font-medium"
                                    title={
                                      c.trainerLabel
                                        ? `${c.courseLabel} - ${c.trainerLabel}`
                                        : c.courseLabel
                                    }
                                  >
                                    <span className="font-semibold text-gray-900">
                                      {c.courseLabel}
                                    </span>
                                    {" - "}
                                    {c.trainerLabel || "Unassigned"}
                                  </p>
                                ))}
                              {getActiveTrainerAllocations(student).length >
                                2 && (
                                <p className="text-[11px] text-gray-400 font-medium">
                                  +
                                  {getActiveTrainerAllocations(student).length -
                                    2}{" "}
                                  more
                                </p>
                              )}
                            </div>
                          ) : activeCourses.length > 0 ? (
                            canAssignTrainer ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedStudentForTrainer(student);
                                  setAssignTrainerModalOpen(true);
                                }}
                                className="text-xs text-[#9F0712] font-semibold hover:text-[#9F0712]/90 hover:underline transition-colors"
                              >
                                + Assign
                              </button>
                            ) : (
                              <span className="text-xs text-gray-300">—</span>
                            )
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>

                        {/* Last class */}
                        <td className="px-3 py-3 max-w-[200px]">
                          {lastTask ? (
                            <div>
                              <p className="text-xs text-gray-700 truncate">
                                <span className="font-medium">
                                  {lastTask.course}:
                                </span>{" "}
                                {lastTask.task}
                              </p>
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                {format(
                                  new Date(lastTask.dateTime),
                                  "dd MMM yyyy",
                                )}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-300 italic">
                              No activity
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td
                          className="px-3 py-3 text-right sticky right-0 bg-white"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Inline quick actions */}
                          <div className="flex items-center justify-end gap-1">
                            {derivedStatus === "no_course" && (
                              <button
                                onClick={() => {
                                  setCourseStudent(student);
                                  setShowNewCourseModal(true);
                                }}
                                className="hidden sm:flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-white bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] transition-colors rounded-full"
                              >
                                <BookPlus className="h-3 w-3" /> Enroll
                              </button>
                            )}
                            {derivedStatus === "pending_trainer" &&
                              canAssignTrainer && (
                                <button
                                  onClick={() => {
                                    setSelectedStudentForTrainer(student);
                                    setAssignTrainerModalOpen(true);
                                  }}
                                  className="hidden sm:flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-[#9F0712] bg-[#9F0712]/10 hover:bg-[#9F0712]/15 rounded-md transition-colors"
                                >
                                  <UserCheck className="h-3 w-3" /> Assign
                                </button>
                              )}
                            <button
                              onClick={() => {
                                if (!student.PrnNumber) {
                                  toast.error("Contact admin for PRN");
                                  return;
                                }
                                router.push(`/${student.PrnNumber}`);
                              }}
                              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              ref={(el) => {
                                actionBtnRefs.current[student.id] = el;
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDropdown(
                                  showDropdown === student.id
                                    ? null
                                    : student.id,
                                );
                              }}
                              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors dropdown-trigger"
                            >
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Portal dropdown */}
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
                                  <AnimatePresence>
                                    {showDropdown === student.id && (
                                      <motion.div
                                        initial={{
                                          opacity: 0,
                                          scale: 0.96,
                                          y: -4,
                                        }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{
                                          opacity: 0,
                                          scale: 0.96,
                                          y: -4,
                                        }}
                                        transition={{ duration: 0.1 }}
                                        className="w-48 bg-white border border-[#9F0712]/10 rounded-xl shadow-xl py-1 dropdown-menu overflow-hidden"
                                      >
                                        {[
                                          {
                                            label: "Add Class",
                                            icon: MdAdd,
                                            onClick: () => {
                                              handleAddClass(student);
                                              setShowDropdown(null);
                                            },
                                          },
                                          {
                                            label: "Edit Profile",
                                            icon: UserPlus,
                                            onClick: () =>
                                              handleEditStudent(student),
                                          },
                                          {
                                            label: "Add Course",
                                            icon: BookPlus,
                                            onClick: () => {
                                              if (!student.PrnNumber) {
                                                toast.error(
                                                  "Contact admin for PRN",
                                                );
                                                return;
                                              }
                                              setCourseStudent(student);
                                              setShowNewCourseModal(true);
                                              setShowDropdown(null);
                                            },
                                          },
                                          ...(canAssignTrainer
                                            ? [
                                                {
                                                  label: "Assign Trainer",
                                                  icon: UserCheck,
                                                  onClick: () => {
                                                    setSelectedStudentForTrainer(
                                                      student,
                                                    );
                                                    setAssignTrainerModalOpen(
                                                      true,
                                                    );
                                                    setShowDropdown(null);
                                                  },
                                                },
                                              ]
                                            : []),
                                          {
                                            label: "View Details",
                                            icon: Eye,
                                            onClick: () => {
                                              if (!student.PrnNumber) return;
                                              router.push(
                                                `/${student.PrnNumber}`,
                                              );
                                            },
                                          },
                                        ].map(
                                          ({ label, icon: Icon, onClick }) => (
                                            <button
                                              key={label}
                                              onClick={onClick}
                                              className="flex items-center w-full gap-2.5 px-3.5 py-2 text-xs text-gray-700 hover:bg-[#9F0712]/5 hover:text-[#9F0712] transition-colors"
                                            >
                                              <Icon className="h-3.5 w-3.5 opacity-60 flex-shrink-0" />
                                              {label}
                                            </button>
                                          ),
                                        )}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </PortalDropdown>
                              );
                            })()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── PAGINATION ───────────────────────────────────────────────── */}
          {!loading && filteredStudents.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Rows per page:</span>
                {PAGE_SIZES.map((n) => (
                  <button
                    key={n}
                    onClick={() => {
                      setPageSize(n);
                      setPage(1);
                    }}
                    className={`px-2 py-0.5 rounded font-semibold transition-colors ${pageSize === n ? "bg-[#9F0712] text-white" : "hover:bg-[#9F0712]/5 text-gray-600 hover:text-[#9F0712]"}`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>
                  {(page - 1) * pageSize + 1}–
                  {Math.min(page * pageSize, filteredStudents.length)} of{" "}
                  {filteredStudents.length}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const start = Math.max(
                      1,
                      Math.min(page - 2, totalPages - 4),
                    );
                    const p = start + i;
                    if (p > totalPages) return null;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${p === page ? "bg-[#9F0712] text-white" : "hover:bg-[#9F0712]/5 text-gray-600 hover:text-[#9F0712]"}`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1f2937",
            color: "white",
            fontSize: "13px",
            borderRadius: "10px",
          },
          success: { style: { background: "#065f46" } },
          error: { style: { background: "#9F0712" } },
        }}
      />

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MODALS                                                               */}
      {/* ════════════════════════════════════════════════════════════════════ */}

      {/* Add Class */}
      <Modal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title="Add Class"
        footer={
          <>
            <Btn
              variant="ghost"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Btn>
            <Btn onClick={handleSubmit}>
              <MdAdd size={14} /> Add Class
            </Btn>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className={labelCls}>PRN</label>
            <input
              className={inputCls + " bg-gray-50 cursor-not-allowed"}
              readOnly
              value={selectedStudent?.PrnNumber || ""}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Date & Time</label>
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "ongoing" | "complete")
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
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className={inputCls}
            >
              <option value="">Select course</option>
              {selectedStudent?.courses?.map((c, i) =>
                typeof c === "string" ? (
                  <option key={i} value={c}>
                    {c}
                  </option>
                ) : (
                  <option
                    key={i}
                    value={c.name + (c.level ? `|${c.level}` : "")}
                  >
                    {c.name}
                    {c.level ? ` (Level ${c.level})` : ""}
                  </option>
                ),
              )}
            </select>
          </div>
          <div>
            <label className={labelCls}>Task Description</label>
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Describe the task"
              className={inputCls}
            />
          </div>
        </div>
      </Modal>

      {/* Add Course */}
      <Modal
        open={showNewCourseModal}
        onClose={() => {
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
        title="Add New Course"
        footer={
          <>
            <Btn
              variant="ghost"
              onClick={() => {
                setShowNewCourseModal(false);
                setCourseStudent(null);
              }}
            >
              Cancel
            </Btn>
            <Btn
              onClick={async () => {
                if (
                  !newCourseFields.name.trim() ||
                  !newCourseFields.classNumber.trim() ||
                  !newCourseFields.level.trim()
                ) {
                  toast.error("All fields required");
                  return;
                }
                if (!courseStudent) {
                  toast.error("No student selected");
                  return;
                }
                try {
                  const db = getFirestore(app);
                  const snap = await getDocs(
                    query(
                      collection(db, "students"),
                      where("PrnNumber", "==", courseStudent.PrnNumber),
                    ),
                  );
                  if (!snap.empty) {
                    const existing = snap.docs[0].data().courses || [];
                    if (
                      existing.some(
                        (c: Course) =>
                          typeof c === "object" &&
                          c?.name?.toLowerCase() ===
                            newCourseFields.name.trim().toLowerCase() &&
                          c.level === newCourseFields.level.trim(),
                      )
                    ) {
                      alert("Course already exists!");
                      return;
                    }
                    await updateDoc(doc(db, "students", snap.docs[0].id), {
                      courses: arrayUnion({
                        name: newCourseFields.name.trim(),
                        classNumber: newCourseFields.classNumber.trim(),
                        level: newCourseFields.level.trim(),
                        status: newCourseFields.status,
                        completed: newCourseFields.completed,
                        startDate: newCourseFields.startDate,
                      }),
                    });
                    toast.success("Course added!");
                    setShowNewCourseModal(false);
                    setCourseStudent(null);
                    await fetchStudents();
                  } else {
                    toast.error("Student not found");
                  }
                } catch (e) {
                  toast.error("Error adding course");
                }
              }}
            >
              <MdAdd size={14} /> Add Course
            </Btn>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Course Name</label>
            <select
              value={newCourseFields.name}
              onChange={(e) =>
                setNewCourseFields((f) => ({ ...f, name: e.target.value }))
              }
              className={inputCls}
            >
              <option value="">Select course</option>
              {courses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Start Date</label>
              <input
                type="date"
                value={newCourseFields.startDate}
                onChange={(e) =>
                  setNewCourseFields((f) => ({
                    ...f,
                    startDate: e.target.value,
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
                onChange={(e) =>
                  setNewCourseFields((f) => ({
                    ...f,
                    classNumber: e.target.value,
                  }))
                }
                placeholder="e.g. 24"
                className={inputCls}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Level</label>
              <input
                type="text"
                value={newCourseFields.level}
                onChange={(e) =>
                  setNewCourseFields((f) => ({ ...f, level: e.target.value }))
                }
                placeholder="e.g. 1"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select
                value={newCourseFields.status}
                onChange={(e) =>
                  setNewCourseFields((f) => ({
                    ...f,
                    status: e.target.value,
                    completed: e.target.value === "complete",
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
      </Modal>

      {/* Assign PRN */}
      {showAssignPrnModal && (
        <AssignPrnModal
          isOpen={showAssignPrnModal}
          onClose={() => setShowAssignPrnModal(false)}
          onAssign={fetchStudents}
        />
      )}

      {/* Edit Course */}
      <Modal
        open={showEditCourseModal && !!editingStudent}
        onClose={() => {
          setShowEditCourseModal(false);
          setEditingStudent(null);
          setEditingCourseIndex(null);
        }}
        title={`Edit Courses — ${editingStudent?.username}`}
        width="max-w-3xl"
      >
        {editingStudent && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Current Courses
              </p>
              <div className="space-y-2">
                {editingStudent.courses.map((c, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border transition-colors ${editingCourseIndex === i ? "border-[#9F0712]/40 bg-[#9F0712]/[0.03]" : "border-gray-200 hover:border-[#9F0712]/20"}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {typeof c === "string" ? c : c.name}
                        </p>
                        {typeof c !== "string" && (
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs text-gray-400">
                              Lvl {c.level || "—"}
                            </span>
                            <span className="text-xs text-gray-400">·</span>
                            <span className="text-xs text-gray-400">
                              {c.classNumber || "—"} classes
                            </span>
                            <span
                              className={`text-xs px-1.5 py-0 rounded ${c.status === "complete" ? "bg-[#9F0712]/10 text-[#9F0712]" : "bg-[#9F0712]/10 text-[#9F0712]"}`}
                            >
                              {c.status || "ongoing"}
                            </span>
                          </div>
                        )}
                      </div>
                      {typeof c !== "string" && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditCourse(i)}
                            className="p-1.5 text-[#9F0712] hover:bg-[#9F0712]/5 rounded-lg transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5"
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
                            onClick={() => handleDeleteCourse(i)}
                            className="p-1.5 text-[#9F0712] hover:bg-[#9F0712]/5 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {editingCourseIndex !== null
                  ? "Edit Details"
                  : "Select a course to edit"}
              </p>
              {editingCourseIndex !== null ? (
                <div className="space-y-3">
                  <div>
                    <label className={labelCls}>Course *</label>
                    <select
                      value={editCourseFields.name}
                      onChange={(e) =>
                        setEditCourseFields({
                          ...editCourseFields,
                          name: e.target.value,
                        })
                      }
                      className={inputCls}
                    >
                      <option value="">Select</option>
                      {courses.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Class No. *</label>
                      <input
                        value={editCourseFields.classNumber}
                        onChange={(e) =>
                          setEditCourseFields({
                            ...editCourseFields,
                            classNumber: e.target.value,
                          })
                        }
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Level *</label>
                      <input
                        value={editCourseFields.level}
                        onChange={(e) =>
                          setEditCourseFields({
                            ...editCourseFields,
                            level: e.target.value,
                          })
                        }
                        className={inputCls}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Start Date</label>
                      <input
                        type="date"
                        value={editCourseFields.startDate}
                        onChange={(e) =>
                          setEditCourseFields({
                            ...editCourseFields,
                            startDate: e.target.value,
                          })
                        }
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Status</label>
                      <select
                        value={editCourseFields.status}
                        onChange={(e) =>
                          setEditCourseFields({
                            ...editCourseFields,
                            status: e.target.value,
                            completed: e.target.value === "complete",
                          })
                        }
                        className={inputCls}
                      >
                        <option value="ongoing">Ongoing</option>
                        <option value="complete">Complete</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Btn
                      variant="ghost"
                      onClick={() => setEditingCourseIndex(null)}
                    >
                      Cancel
                    </Btn>
                    <Btn
                      onClick={handleSaveEditedCourse}
                      className="flex-1 justify-center"
                    >
                      Save Changes
                    </Btn>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 mt-4">
                  Click the edit icon on any course →
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Bulk Assign Trainer */}
      <Modal
        open={bulkAssignTrainerModalOpen}
        onClose={() => {
          setBulkAssignTrainerModalOpen(false);
          setBulkSelectedTrainer("");
        }}
        title="Bulk Assign Trainer"
        footer={
          <>
            <Btn
              variant="ghost"
              onClick={() => {
                setBulkAssignTrainerModalOpen(false);
                setBulkSelectedTrainer("");
              }}
            >
              Cancel
            </Btn>
            <Btn
              onClick={handleBulkAssignTrainer}
              disabled={!bulkSelectedTrainer || selected.size === 0}
            >
              Assign Trainer
            </Btn>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-[#9F0712]/10 bg-[#9F0712]/5 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">
              {selected.size} student{selected.size > 1 ? "s" : ""} selected
            </p>
            <p className="text-xs text-gray-500 mt-1">
              The chosen trainer will be applied to all active courses for these
              students.
            </p>
          </div>

          <div>
            <label className={labelCls}>Trainer</label>
            <select
              value={bulkSelectedTrainer}
              onChange={(e) => setBulkSelectedTrainer(e.target.value)}
              className={inputCls}
            >
              <option value="">Select trainer</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name || t.username || t.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Selected Students</label>
            <div className="max-h-44 overflow-y-auto rounded-xl border border-gray-200 bg-white divide-y divide-gray-100">
              {students
                .filter((student) => selected.has(student.id))
                .map((student) => (
                  <div
                    key={student.id}
                    className="px-3 py-2 text-sm text-gray-700"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] text-white flex items-center justify-center overflow-hidden flex-shrink-0">
                        {student.profileimage ? (
                          <Image
                            src={student.profileimage}
                            alt={student.username}
                            width={24}
                            height={24}
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = "/assets/logo1.png";
                            }}
                          />
                        ) : (
                          <span className="text-[10px] font-bold text-white">
                            {student.username?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        )}
                      </div>
                      <div className="font-medium text-gray-900">
                        {student.username}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {student.PrnNumber || "No PRN"}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Assign Trainer */}
      <Modal
        open={assignTrainerModalOpen && !!selectedStudentForTrainer}
        onClose={() => {
          setAssignTrainerModalOpen(false);
          setSelectedStudentForTrainer(null);
          setSelectedCourseForTrainer(null);
          setSelectedTrainer("");
        }}
        title="Assign Trainer"
        footer={
          <>
            <Btn
              variant="ghost"
              onClick={() => {
                setAssignTrainerModalOpen(false);
                setSelectedStudentForTrainer(null);
                setSelectedCourseForTrainer(null);
                setSelectedTrainer("");
              }}
            >
              Cancel
            </Btn>
            <Btn
              onClick={handleAssignTrainerToCourse}
              disabled={!selectedCourseForTrainer || !selectedTrainer}
            >
              Assign Trainer
            </Btn>
          </>
        }
      >
        {selectedStudentForTrainer && (
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Student</label>
              <input
                readOnly
                className={inputCls + " bg-gray-50 cursor-not-allowed"}
                value={`${selectedStudentForTrainer.username} (${selectedStudentForTrainer.PrnNumber})`}
              />
            </div>
            <div>
              <label className={labelCls}>Course</label>
              <select
                value={
                  selectedCourseForTrainer
                    ? `${selectedCourseForTrainer.name}_${selectedCourseForTrainer.level}`
                    : ""
                }
                onChange={(e) => {
                  const [n, l] = e.target.value.split("_");
                  setSelectedCourseForTrainer(
                    selectedStudentForTrainer.courses.find(
                      (c) => (c.name || "") === n && (c.level || "") === l,
                    ) || null,
                  );
                }}
                className={inputCls}
              >
                <option value="">Select course</option>
                {selectedStudentForTrainer.courses.map((c, i) => (
                  <option key={i} value={`${c.name || ""}_${c.level || ""}`}>
                    {c.name}
                    {c.level ? ` (Level ${c.level})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Trainer</label>
              <select
                value={selectedTrainer}
                onChange={(e) => setSelectedTrainer(e.target.value)}
                className={inputCls}
              >
                <option value="">Select trainer</option>
                {trainers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name || t.username || t.email}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Page;
