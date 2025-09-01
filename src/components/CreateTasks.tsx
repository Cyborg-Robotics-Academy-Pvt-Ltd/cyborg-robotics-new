"use client";
import React, { useState, useEffect, ChangeEvent, useCallback } from "react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";

import { useRouter } from "next/navigation";

import toast, { Toaster } from "react-hot-toast";
import {
  MdEditSquare,
  MdAdd,
  MdClose,
  MdDashboard,
  MdAssignment,
} from "react-icons/md";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Search, Trash, Edit, PlusCircle } from "lucide-react";
import courses from "../../utils/courses";
import { app, auth } from "../lib/firebase";
import { format } from "date-fns";
import Link from "next/link";

interface Task {
  task: string;
  dateTime: string;
  status: "ongoing" | "complete";
  prn?: string;
  username?: string;
  course?: string;
}

interface StudentData {
  PrnNumber: string;
  username: string;
  tasks?: Task[];
}

interface PrnSuggestion {
  prn: string;
  username: string;
}
const CreateTasks = () => {
  const [task, setTask] = useState("");
  const [prn, setPrn] = useState("");

  const [dateTime, setDateTime] = useState(
    format(new Date(), "yyyy-MM-dd'T'HH:mm")
  );
  const [status, setStatus] = useState<Task["status"]>("complete");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<{
    index: number;
    prn: string;
    task: string;
    dateTime: string;
    status: Task["status"];
  } | null>(null);
  const [course, setCourse] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [prnSuggestions, setPrnSuggestions] = useState<PrnSuggestion[]>([]);
  const [allPrns, setAllPrns] = useState<PrnSuggestion[]>([]);
  const router = useRouter();
  const db = getFirestore(app);

  const handleTaskChange = (e: ChangeEvent<HTMLInputElement>) =>
    setTask(e.target.value);
  const handlePrnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrn(value);
    if (value.trim()) {
      const filteredSuggestions = allPrns.filter(
        (suggestion) =>
          suggestion.prn.toLowerCase().includes(value.toLowerCase()) ||
          suggestion.username.toLowerCase().includes(value.toLowerCase())
      );
      setPrnSuggestions(filteredSuggestions);
    } else {
      setPrnSuggestions([]);
    }
  };
  const handleDateTimeChange = (e: ChangeEvent<HTMLInputElement>) =>
    setDateTime(e.target.value);
  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) =>
    setStatus(e.target.value as Task["status"]);
  const handleCourseChange = (e: ChangeEvent<HTMLSelectElement>) =>
    setCourse(e.target.value);
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) =>
    setSearchTerm(e.target.value);

  const fetchPrns = useCallback(async () => {
    try {
      const studentsCollection = collection(db, "students");
      const querySnapshot = await getDocs(studentsCollection);
      const prnList: PrnSuggestion[] = [];
      querySnapshot.forEach((doc) => {
        const studentData = doc.data() as StudentData;
        prnList.push({
          prn: studentData.PrnNumber,
          username: studentData.username,
        });
      });
      setAllPrns(prnList);
    } catch (error) {
      console.error("Error fetching PRN numbers: ", error);
      toast.error("Failed to fetch PRN numbers. Please try again.");
    }
  }, [db]);

  const fetchTasks = useCallback(async () => {
    try {
      const tasksCollection = collection(db, "students");
      const querySnapshot = await getDocs(tasksCollection);
      const allTasks: Task[] = [];
      querySnapshot.forEach((doc) => {
        const studentData = doc.data() as StudentData;
        if (studentData.tasks) {
          studentData.tasks.forEach((task: Task) => {
            allTasks.push({
              ...task,
              prn: studentData.PrnNumber,
              username: studentData.username,
            });
          });
        }
      });
      setTasks(allTasks);
    } catch (error) {
      console.error("Error fetching tasks: ", error);
      toast.error("Failed to fetch tasks. Please try again.");
    }
  }, [db]);
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const db = getFirestore(app);
        const studentsCollection = collection(db, "students");
        await getDocs(studentsCollection); // Just checking if we can access the collection
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, []);
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          router.push("/login");
          return;
        }

        const adminDoc = await getDoc(doc(db, "admins", user.uid));
        const trainerDoc = await getDoc(doc(db, "trainers", user.uid));

        if (
          !adminDoc.exists() &&
          !trainerDoc.exists() &&
          adminDoc.data()?.role !== "admin" &&
          trainerDoc.data()?.role !== "trainers"
        ) {
          router.push("/login");
          return;
        }

        await Promise.all([fetchTasks(), fetchPrns()]);
      } catch (error) {
        console.error("Error during authentication check:", error);
        toast.error("Authentication failed. Please try again.");
      }
    };

    checkAuth();
  }, [router, db, fetchTasks, fetchPrns]);
  useEffect(() => {
    setDateTime(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
  }, [isModalOpen]);
  const handleSubmit = async () => {
    try {
      if (!task.trim()) {
        toast.error("Task cannot be empty");
        return;
      }

      if (!prn.trim()) {
        toast.error("PRN number is required");
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

      const q = query(
        collection(db, "students"),
        where("PrnNumber", "==", prn)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const studentDoc = querySnapshot.docs[0];
        const studentRef = doc(db, "students", studentDoc.id);
        const studentData = studentDoc.data() as StudentData;

        let updatedTasks;
        if (editingTask !== null) {
          const taskIndex =
            studentData.tasks?.findIndex(
              (t) =>
                t.task === editingTask.task &&
                t.dateTime === editingTask.dateTime &&
                t.status === editingTask.status
            ) ?? -1;

          if (taskIndex === -1) {
            throw new Error("Task not found");
          }

          updatedTasks = [...(studentData.tasks || [])];
          updatedTasks[taskIndex] = { task, dateTime, status, course };
        } else {
          updatedTasks = studentData.tasks
            ? [...studentData.tasks, { task, dateTime, status, course }]
            : [{ task, dateTime, status, course }];
        }

        await updateDoc(studentRef, { tasks: updatedTasks });
        toast.success(
          editingTask
            ? "Task updated successfully!"
            : "Task added successfully!"
        );
        setIsModalOpen(false);
        setEditingTask(null);
        resetForm();
        fetchTasks();
      } else {
        toast.error("No student found with the provided PRN number.");
      }
    } catch (error) {
      console.error("Error handling task: ", error);
      toast.error("Error handling task. Please try again.");
    }
  };
  const resetForm = () => {
    setTask("");
    setPrn("");
    setDateTime(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
    setStatus("complete");
    setPrnSuggestions([]);
    // Don't reset course to maintain the suggestion
  };

  const handleEdit = (taskData: Task, index: number) => {
    setTask(taskData.task);
    setPrn(taskData.prn || "");
    setDateTime(taskData.dateTime);
    setStatus(taskData.status);
    setCourse(taskData.course || "");
    setEditingTask({
      index: index,
      prn: taskData.prn || "",
      task: taskData.task,
      dateTime: taskData.dateTime,
      status: taskData.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (taskData: Task) => {
    try {
      if (!taskData.prn) {
        toast.error("PRN number not found");
        return;
      }

      const q = query(
        collection(db, "students"),
        where("PrnNumber", "==", taskData.prn)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const studentDoc = querySnapshot.docs[0];
        const studentRef = doc(db, "students", studentDoc.id);
        const studentData = studentDoc.data() as StudentData;

        const updatedTasks =
          studentData.tasks?.filter(
            (t) =>
              t.task !== taskData.task ||
              t.dateTime !== taskData.dateTime ||
              t.status !== taskData.status
          ) || [];

        await updateDoc(studentRef, { tasks: updatedTasks });
        toast.success("Task deleted successfully!");
        fetchTasks();
      } else {
        toast.error("Student not found");
      }
    } catch (error) {
      console.error("Error deleting task: ", error);
      toast.error("Error deleting task. Please try again.");
    }
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.task.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.course?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortTasksByDate = () => {
    const sortedTasks = [...tasks].sort((a, b) => {
      const dateA = new Date(a.dateTime).getTime();
      const dateB = new Date(b.dateTime).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
    setTasks(sortedTasks);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };
  const handlePrnSelect = async (selectedPrn: string) => {
    setPrn(selectedPrn);
    setPrnSuggestions([]);

    // Find the most recent task and course for this PRN
    const studentTasks = tasks.filter((task) => task.prn === selectedPrn);
    if (studentTasks.length > 0) {
      // Sort tasks by date, most recent first
      const sortedTasks = studentTasks.sort(
        (a, b) =>
          new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
      );
      const mostRecentTask = sortedTasks[0];

      // Set the course if it exists
      if (mostRecentTask.course) {
        setCourse(mostRecentTask.course);
      }
    }
  };

  const groupTasksByDate = (tasks: Task[]) => {
    return tasks.reduce((acc: { [key: string]: Task[] }, task) => {
      const date = new Date(task.dateTime).toLocaleDateString(); // Format the date as needed
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(task);
      return acc;
    }, {});
  };

  const groupedTasks = groupTasksByDate(filteredTasks);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-6 md:pt-8 mt-20 ">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#1F2937",
            color: "#fff",
            borderRadius: "8px",
            padding: "16px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
          },
          success: {
            iconTheme: {
              primary: "#10B981",
              secondary: "white",
            },
          },
          error: {
            iconTheme: {
              primary: "#EF4444",
              secondary: "white",
            },
          },
        }}
      />

      <div className="max-w-full mx-auto bg-white px-4  rounded-xl shadow-xl ">
        <div className="mb-6 md:mb-8 mt-4 md:mt-2 py-2">
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 flex items-center">
            <MdDashboard className="mr-2 md:mr-3 text-red-700" size={36} />
            Task Management Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-base md:text-lg font-medium">
            Seamlessly manage student tasks and monitor progress with ease
          </p>
        </div>

        {/* Search and Action Buttons */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center mb-6 gap-4">
          <div className="w-full md:w-1/2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tasks, students, or courses..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-2.5 md:py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 text-sm md:text-base text-gray-700 placeholder-gray-400"
              />
              <div className="absolute left-4 top-3 md:top-3.5 text-gray-400">
                <Search className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 md:gap-4 w-full md:w-auto">
            <button
              onClick={sortTasksByDate}
              className="px-4 md:px-6 py-2.5 md:py-3 bg-white text-gray-700 text-sm md:text-base font-semibold rounded-xl shadow-sm hover:bg-gray-100 hover:shadow-md transition-all duration-300 w-full sm:w-auto"
            >
              Sort by Date ({sortOrder === "asc" ? "↑" : "↓"})
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 md:px-6 py-2.5 md:py-3 bg-red-700 text-white text-sm md:text-base font-semibold rounded-xl shadow-sm hover:bg-indigo-700 hover:shadow-md transition-all duration-300 flex items-center justify-center w-full sm:w-auto"
            >
              <PlusCircle size={18} className="mr-2" />
              Add New Class
            </button>
            <Link href="/student-list" className="w-full sm:w-auto">
              <button className="px-4 md:px-6 py-2.5 md:py-3 bg-red-700 text-white text-sm md:text-base font-semibold rounded-xl shadow-sm hover:bg-indigo-700 hover:shadow-md transition-all duration-300 flex items-center justify-center w-full">
                Student List
              </button>
            </Link>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="py-3 md:py-4 px-3 md:px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Student Name
                  </TableHead>
                  <TableHead className="py-3 md:py-4 px-3 md:px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Class
                  </TableHead>
                  <TableHead className="py-3 md:py-4 px-3 md:px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Date & Time
                  </TableHead>
                  <TableHead className="py-3 md:py-4 px-3 md:px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Status
                  </TableHead>
                  <TableHead className="py-3 md:py-4 px-3 md:px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Course
                  </TableHead>
                  <TableHead className="py-3 md:py-4 px-3 md:px-6 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(groupedTasks).map(([date, tasks]) => (
                  <React.Fragment key={date}>
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-gray-500 px-3 md:px-6 py-2 md:py-3 text-sm"
                      >
                        {date}
                      </TableCell>
                    </TableRow>
                    {tasks.map((task, index) => (
                      <TableRow
                        key={index}
                        className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                        onClick={() => router.push(`/${task.prn}`)}
                      >
                        <TableCell className="py-3 md:py-4 px-3 md:px-6 text-xs md:text-sm text-gray-900 font-medium whitespace-nowrap">
                          {task.username}
                        </TableCell>
                        <TableCell className="py-3 md:py-4 px-3 md:px-6 text-xs md:text-sm text-gray-900 whitespace-nowrap">
                          <div className="flex items-center">
                            <MdAssignment
                              className="mr-2 text-indigo-600 flex-shrink-0"
                              size={16}
                            />
                            <span className="truncate max-w-[150px] md:max-w-[200px]">
                              {task.task}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 md:py-4 px-3 md:px-6 text-xs md:text-sm text-gray-600 whitespace-nowrap">
                          {new Date(task.dateTime).toLocaleString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell className="py-3 md:py-4 px-3 md:px-6 text-xs md:text-sm whitespace-nowrap">
                          <span
                            className={`px-2 md:px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                              task.status === "complete"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {task.status}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 md:py-4 px-3 md:px-6 text-xs md:text-sm text-gray-600 whitespace-nowrap">
                          <span className="truncate max-w-[100px] md:max-w-[150px] block">
                            {task.course}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 md:py-4 px-3 md:px-6 text-xs md:text-sm whitespace-nowrap">
                          <div className="flex gap-2 md:gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(task, index);
                              }}
                              className="p-1.5 md:p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-[5px] transition-colors duration-200"
                              title="Edit Task"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  window.confirm(
                                    "Are you sure you want to delete this task?"
                                  )
                                ) {
                                  handleDelete(task);
                                }
                              }}
                              className="p-1.5 md:p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-[5px] transition-colors duration-200"
                              title="Delete Task"
                            >
                              <Trash size={16} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Modal for Adding/Editing Tasks */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100] transition-opacity duration-300 overflow-y-auto p-2 md:p-4">
          <div className="relative min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-8rem)] flex items-center justify-center py-6 md:py-12">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden transform transition-all duration-300 scale-95 animate-in">
              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex justify-between items-center border-b px-4 md:px-6 py-3 md:py-4 bg-gradient-to-r from-red-50 to-red-100">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center">
                  {editingTask ? (
                    <>
                      <MdEditSquare className="mr-2 text-red-700" size={20} />
                      Edit Task
                    </>
                  ) : (
                    <>
                      <MdAdd className="mr-2 text-red-700" size={20} />
                      Add New Task
                    </>
                  )}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTask(null);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-red-700 p-1.5 md:p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
                  aria-label="Close modal"
                >
                  <MdClose size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="px-4 md:px-6 py-4 md:py-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
                <div className="space-y-4 md:space-y-6">
                  {/* Form fields with responsive styles */}
                  <div className="form-group relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                      PRN Number
                    </label>
                    <input
                      type="text"
                      value={prn}
                      onChange={handlePrnChange}
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-red-700 hover:border-red-700 transition-all duration-200"
                      placeholder="Enter student PRN"
                    />
                    {/* PRN suggestions dropdown */}
                    {prnSuggestions.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {prnSuggestions.map((suggestion) => (
                          <div
                            key={suggestion.prn}
                            onClick={() => handlePrnSelect(suggestion.prn)}
                            className="px-3 md:px-4 py-2.5 md:py-3 text-sm hover:bg-red-50 hover:text-red-700 cursor-pointer transition-colors duration-200 border-b last:border-b-0"
                          >
                            <span className="font-medium">
                              {suggestion.prn}
                            </span>
                            <span className="text-gray-500">
                              {" "}
                              - {suggestion.username}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
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
                        className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-red-700 hover:border-red-700 transition-all duration-200"
                      />
                    </div>

                    <div className="form-group">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5 md:mb-2">
                        Status
                      </label>
                      <select
                        value={status}
                        onChange={handleStatusChange}
                        className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-red-700 hover:border-red-700 transition-all duration-200"
                      >
                        <option value="complete">Complete</option>
                        <option value="ongoing">Ongoing</option>
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
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-red-700 hover:border-red-700 transition-all duration-200"
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
                      Task Description
                    </label>
                    <input
                      type="text"
                      value={task}
                      onChange={handleTaskChange}
                      className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-red-700 hover:border-red-700 transition-all duration-200"
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
                    setEditingTask(null);
                    resetForm();
                  }}
                  className="px-4 md:px-5 py-2 md:py-2.5 bg-white border border-gray-200 text-gray-700 text-sm md:text-base rounded-xl hover:bg-gray-100 transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 md:px-5 py-2 md:py-2.5 bg-red-700 text-white text-sm md:text-base rounded-xl hover:bg-red-800 transition-all duration-200 font-semibold flex items-center"
                >
                  {editingTask ? (
                    <>
                      <MdEditSquare className="mr-1.5 md:mr-2" size={16} />
                      Update Task
                    </>
                  ) : (
                    <>
                      <MdAdd className="mr-1.5 md:mr-2" size={16} />
                      Add Task
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTasks;
