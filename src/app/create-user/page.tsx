"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../lib/firebase";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";
import {
  BookOpen,
  CheckCircle,
  GraduationCap,
  Loader2,
  Mail,
  ShieldCheckIcon,
  UserCog,
  UserIcon,
  XCircle,
} from "lucide-react";
import Dropdown, { DropdownOption } from "../../components/ui/dropdown";
import courses from "../../../utils/courses";
import Head from "next/head";
import Image from "next/image";

const CreateUser = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState("student");
  const [email, setEmail] = useState("");
  const [PrnNumber, setPrnNumber] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [courseDetails, setCourseDetails] = useState<{
    [key: string]: { level: string; classNumber: string; status: string };
  }>({});
  const [emailExists, setEmailExists] = useState(false);
  const [prnExists, setPrnExists] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [prnChecking, setPrnChecking] = useState(false);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");
  const [studentId, setStudentId] = useState("");
  const [username, setUsername] = useState("");

  // Role options for dropdown
  const roleOptions: DropdownOption[] = [
    {
      value: "student",
      label: "Student",
      icon: <GraduationCap className="h-4 w-4" />,
    },
    {
      value: "trainer",
      label: "Trainer",
      icon: <UserCog className="h-4 w-4" />,
    },
    {
      value: "admin",
      label: "Administrator",
      icon: <ShieldCheckIcon className="h-4 w-4" />,
    },
  ];

  const checkEmailExists = async (email: string) => {
    if (!email || email.trim() === "") {
      setEmailExists(false);
      setEmailChecking(false);
      return;
    }

    setEmailChecking(true);
    try {
      // Query students collection to check if email already exists
      const studentsRef = collection(db, "students");
      const emailTrimmed = email.trim().toLowerCase();

      const q = query(studentsRef, where("email", "==", emailTrimmed));
      const querySnapshot = await getDocs(q);

      const exists = !querySnapshot.empty;

      if (exists) {
        // Get the student ID and username for later use
        const doc = querySnapshot.docs[0];
        setStudentId(doc.id);
        setUsername(doc.data().username || "");
      }

      setEmailExists(exists);
    } catch (error) {
      console.error("Error checking email:", error);
      setEmailExists(false);
    } finally {
      setEmailChecking(false);
    }
  };

  const checkPrnExists = async (prn: string) => {
    if (!prn || prn.trim() === "") {
      setPrnExists(false);
      setPrnChecking(false);
      return;
    }

    setPrnChecking(true);
    try {
      // Query students collection to check if PRN already exists (case-insensitive)
      const studentsRef = collection(db, "students");
      const prnTrimmed = prn.trim();

      // Check for both uppercase and lowercase versions
      const q1 = query(studentsRef, where("PrnNumber", "==", prnTrimmed));
      const q2 = query(
        studentsRef,
        where("PrnNumber", "==", prnTrimmed.toUpperCase())
      );
      const q3 = query(
        studentsRef,
        where("PrnNumber", "==", prnTrimmed.toLowerCase())
      );

      const [querySnapshot1, querySnapshot2, querySnapshot3] =
        await Promise.all([getDocs(q1), getDocs(q2), getDocs(q3)]);

      const exists =
        !querySnapshot1.empty || !querySnapshot2.empty || !querySnapshot3.empty;
      setPrnExists(exists);
    } catch (error) {
      console.error("Error checking PRN:", error);
      setPrnExists(false);
    } finally {
      setPrnChecking(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/login");
        return;
      }

      const adminDoc = await getDoc(doc(db, "admins", user.uid));
      const trainerDoc = await getDoc(doc(db, "trainers", user.uid));

      if (!adminDoc.exists() && !trainerDoc.exists()) {
        router.push("/login");
        return;
      }

      if (adminDoc.exists()) {
        setUserRole("admin");
      } else {
        setUserRole("trainer");
      }
    };

    checkAuth();
  }, [router]);

  // Debounced email checking
  useEffect(() => {
    if (email) {
      const timeoutId = setTimeout(() => {
        checkEmailExists(email);
      }, 500); // Wait 500ms after user stops typing

      return () => clearTimeout(timeoutId);
    } else {
      setEmailExists(false);
      setEmailChecking(false);
    }
  }, [email]);

  // Debounced PRN checking
  useEffect(() => {
    if (PrnNumber) {
      const timeoutId = setTimeout(() => {
        checkPrnExists(PrnNumber);
      }, 500); // Wait 500ms after user stops typing

      return () => clearTimeout(timeoutId);
    } else {
      setPrnExists(false);
      setPrnChecking(false);
    }
  }, [PrnNumber]);

  const handleEnrollCourses = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setEnrollmentSuccess(false);
    setEnrolling(true);

    if (!email) {
      setError("Email is required");
      setEnrolling(false);
      return;
    }

    if (!PrnNumber) {
      setError("PRN Number is required");
      setEnrolling(false);
      return;
    }

    if (selectedCourses.length === 0) {
      setError("Please select at least one course");
      setEnrolling(false);
      return;
    }

    // Check if PRN already exists for another student
    try {
      const studentsRef = collection(db, "students");
      const prnTrimmed = PrnNumber.trim();

      // Check for both uppercase and lowercase versions
      const q1 = query(studentsRef, where("PrnNumber", "==", prnTrimmed));
      const q2 = query(
        studentsRef,
        where("PrnNumber", "==", prnTrimmed.toUpperCase())
      );
      const q3 = query(
        studentsRef,
        where("PrnNumber", "==", prnTrimmed.toLowerCase())
      );

      const [querySnapshot1, querySnapshot2, querySnapshot3] =
        await Promise.all([getDocs(q1), getDocs(q2), getDocs(q3)]);

      if (
        !querySnapshot1.empty ||
        !querySnapshot2.empty ||
        !querySnapshot3.empty
      ) {
        setError("This PRN number is already assigned to another student");
        setEnrolling(false);
        return;
      }
    } catch (error) {
      console.error("Error checking PRN existence:", error);
      setError("Error checking PRN number. Please try again.");
      setEnrolling(false);
      return;
    }

    let studentDocId = studentId;

    // If we don't have studentId, we need to find it
    if (!studentDocId) {
      try {
        // Find by email
        const studentsRef = collection(db, "students");
        const emailTrimmed = email.trim().toLowerCase();

        const q = query(studentsRef, where("email", "==", emailTrimmed));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          studentDocId = querySnapshot.docs[0].id;
        } else {
          setError("No student found with this email");
          setEnrolling(false);
          return;
        }
      } catch (error) {
        console.error("Error finding student:", error);
        setError("Error finding student. Please try again.");
        setEnrolling(false);
        return;
      }
    }

    try {
      // Prepare course data for enrollment
      const coursesToEnroll = selectedCourses.map((courseName) => ({
        name: courseName,
        level: courseDetails[courseName]?.level || "1",
        classNumber: courseDetails[courseName]?.classNumber || "",
        status: courseDetails[courseName]?.status || "ongoing",
      }));

      // Update student document with PRN number and courses
      await setDoc(
        doc(db, "students", studentDocId),
        {
          PrnNumber: PrnNumber,
          courses: coursesToEnroll,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      setEnrollmentSuccess(true);
      toast.success("PRN assigned and courses enrolled successfully!");

      // Reset form
      setSelectedCourses([]);
      setCourseDetails({});
      setEmail("");
      setPrnNumber("");
      setStudentId("");
      setUsername("");
    } catch (error) {
      console.error("Error enrolling courses:", error);
      setError("Failed to assign PRN and enroll courses. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <>
      <Head>
        <title>Assign PRN & Enroll Courses | Cyborg Robotics Academy</title>
        <meta
          name="description"
          content="Assign PRN number and enroll courses for newly signed up students at Cyborg Robotics Academy."
        />
        <meta
          property="og:title"
          content="Assign PRN & Enroll Courses | Cyborg Robotics Academy"
        />
        <meta
          property="og:description"
          content="Assign PRN number and enroll courses for newly signed up students at Cyborg Robotics Academy."
        />
        <meta property="og:type" content="website" />
      </Head>
      <main
        role="main"
        aria-label="Assign PRN & Enroll Courses Page"
        className="min-h-screen bg-white mt-8"
      >
        <div className="min-h-screen py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              duration: 5000,
              style: {
                background: "#FFF",
                color: "#333",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                borderRadius: "16px",
                padding: "20px",
                border: "1px solid rgba(255,255,255,0.2)",
              },
              success: {
                iconTheme: {
                  primary: "#10B981",
                  secondary: "#FFF",
                },
              },
              error: {
                iconTheme: {
                  primary: "#EF4444",
                  secondary: "#FFF",
                },
              },
            }}
          />

          {/* Header Section */}
          <div className="max-w-7xl mx-auto mb-6 sm:mb-8 md:mb-12 md:mt-4">
            <div className="text-center transform transition-all duration-500">
              {/* Main Icon */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight gradient-text mb-3 sm:mb-4">
                Assign PRN & Enroll Courses
              </h2>

              <div className="mt-3 sm:mt-4 md:mt-6 p-3 sm:p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-xs sm:text-sm md:text-base text-red-800 font-medium">
                  Note: This page is for assigning PRN numbers and enrolling
                  courses for existing students. To create new users with
                  different roles, please use the "Create New User" option in
                  the Admin Dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* Form Container */}
          <div className="max-w-6xl mx-auto">
            <form
              className="space-y-8 sm:space-y-10 md:space-y-12"
              onSubmit={handleEnrollCourses}
            >
              {/* Student Information Section */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-3 sm:p-4 md:p-6 lg:p-8">
                <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 mb-4 sm:mb-6 md:mb-8">
                  <div className="bg-gradient-to-r from-[#AB2F30] to-[#8B1A1B] p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl">
                    <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
                    Student Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                  <div className="group">
                    <label
                      htmlFor="email-address"
                      className="block text-xs sm:text-sm md:text-base font-semibold text-gray-700 mb-1.5 sm:mb-2 md:mb-3 group-hover:text-[#AB2F30] transition-colors duration-200"
                    >
                      Email Address *
                    </label>
                    <div className="relative transform transition-all duration-300 hover:scale-[1.02]">
                      <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none z-10">
                        <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 group-hover:text-[#AB2F30] transition-colors duration-200" />
                      </div>
                      <input
                        id="email-address"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className={`block w-full pl-8 sm:pl-10 md:pl-12 pr-8 sm:pr-10 md:pr-12 py-2.5 sm:py-3 md:py-4 border-2 rounded-xl sm:rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 bg-white ${
                          emailExists
                            ? "border-green-500 focus:ring-green-500/20 focus:border-green-500"
                            : emailChecking
                              ? "border-yellow-500 focus:ring-yellow-500/20 focus:border-yellow-500"
                              : email && !emailExists
                                ? "border-[#AB2F30] focus:ring-[#AB2F30]/20 focus:border-[#AB2F30]"
                                : "border-gray-200 focus:ring-[#AB2F30]/20 focus:border-[#AB2F30] hover:border-[#AB2F30]/50"
                        }`}
                        placeholder="Enter student email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4">
                        {emailChecking ? (
                          <Loader2 className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                        ) : emailExists ? (
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                        ) : email && !emailExists ? (
                          <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#AB2F30]" />
                        ) : null}
                      </div>
                    </div>
                    {emailChecking && (
                      <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-yellow-600 flex items-center space-x-1.5 sm:space-x-2">
                        <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                        <span>Checking email...</span>
                      </p>
                    )}
                    {emailExists && (
                      <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-green-600 flex items-center space-x-1.5 sm:space-x-2">
                        <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span>Student found: {username}</span>
                      </p>
                    )}
                    {email && !emailExists && !emailChecking && (
                      <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-[#AB2F30] flex items-center space-x-1.5 sm:space-x-2">
                        <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span>No student found with this email</span>
                      </p>
                    )}
                  </div>

                  <div className="group">
                    <label
                      htmlFor="prn-number"
                      className="block text-xs sm:text-sm md:text-base font-semibold text-gray-700 mb-1.5 sm:mb-2 md:mb-3 group-hover:text-red-600 transition-colors duration-200"
                    >
                      PRN Number *
                    </label>
                    <div className="relative transform transition-all duration-300 hover:scale-[1.02]">
                      <input
                        id="prn-number"
                        name="prn"
                        type="text"
                        required
                        className={`block w-full pl-3 sm:pl-4 pr-8 sm:pr-10 md:pr-12 py-2.5 sm:py-3 md:py-4 border-2 rounded-xl sm:rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 bg-white ${
                          prnExists
                            ? "border-[#AB2F30] focus:ring-[#AB2F30]/20 focus:border-[#AB2F30]"
                            : prnChecking
                              ? "border-yellow-500 focus:ring-yellow-500/20 focus:border-yellow-500"
                              : PrnNumber && !prnExists
                                ? "border-green-500 focus:ring-green-500/20 focus:border-green-500"
                                : "border-gray-200 focus:ring-[#AB2F30]/20 focus:border-[#AB2F30] hover:border-[#AB2F30]/50"
                        }`}
                        placeholder="Enter student PRN number"
                        value={PrnNumber}
                        onChange={(e) => setPrnNumber(e.target.value)}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4">
                        {prnChecking ? (
                          <Loader2 className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                        ) : prnExists ? (
                          <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#AB2F30]" />
                        ) : PrnNumber && !prnExists ? (
                          <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                        ) : null}
                      </div>
                    </div>
                    {prnChecking && (
                      <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-yellow-600 flex items-center space-x-1.5 sm:space-x-2">
                        <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                        <span>Checking PRN availability...</span>
                      </p>
                    )}
                    {prnExists && (
                      <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-[#AB2F30] flex items-center space-x-1.5 sm:space-x-2">
                        <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span>This PRN number is already assigned</span>
                      </p>
                    )}
                    {PrnNumber && !prnExists && !prnChecking && (
                      <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-green-600 flex items-center space-x-1.5 sm:space-x-2">
                        <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span>PRN number is available</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Course Selection Section */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-3 sm:p-4 md:p-6 lg:p-8">
                <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 mb-4 sm:mb-6 md:mb-8">
                  <div className="bg-gradient-to-r from-[#AB2F30] to-[#8B1A1B] p-1.5 sm:p-2 md:p-3 rounded-lg sm:rounded-xl">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
                    Course Enrollment
                  </h3>
                </div>

                {/* Course Selection */}
                <div className="group">
                  <label
                    htmlFor="course"
                    className="block text-xs sm:text-sm md:text-base font-semibold text-gray-700 mb-2 sm:mb-3 md:mb-4 group-hover:text-[#AB2F30] transition-colors duration-200"
                  >
                    Select Courses *
                  </label>
                  <div className="relative transform transition-all duration-300">
                    <div className="max-h-48 sm:max-h-56 md:max-h-64 overflow-y-auto border-2 border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 bg-white scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                        {courses.map((courseName) => (
                          <div
                            key={courseName}
                            className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 hover:bg-gray-50 rounded-lg sm:rounded-xl transition-colors duration-200"
                          >
                            <input
                              type="checkbox"
                              id={`course-${courseName}`}
                              checked={selectedCourses.includes(courseName)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCourses((prev) => [
                                    ...prev,
                                    courseName,
                                  ]);
                                  setCourseDetails((prev) => ({
                                    ...prev,
                                    [courseName]: {
                                      level: "1",
                                      classNumber: "",
                                      status: "ongoing",
                                    },
                                  }));
                                } else {
                                  setSelectedCourses((prev) =>
                                    prev.filter((c) => c !== courseName)
                                  );
                                  setCourseDetails((prev) => {
                                    const newState = { ...prev };
                                    delete newState[courseName];
                                    return newState;
                                  });
                                }
                              }}
                              className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#AB2F30] focus:ring-[#AB2F30] border-gray-300 rounded transition-all duration-200"
                              disabled={!emailExists}
                            />
                            <label
                              htmlFor={`course-${courseName}`}
                              className="text-xs sm:text-sm text-gray-700 cursor-pointer select-none flex-grow hover:text-[#AB2F30] transition-colors duration-200"
                            >
                              {courseName}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Selected Courses Details */}
                  {selectedCourses.length > 0 && (
                    <div className="mt-4 sm:mt-6 md:mt-8 space-y-3 sm:space-y-4 md:space-y-6">
                      <h4 className="text-base sm:text-lg md:text-xl font-semibold text-gray-700 flex items-center space-x-2 sm:space-x-3">
                        <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                        <span>
                          Course Details ({selectedCourses.length} selected)
                        </span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                        {selectedCourses.map((courseName) => (
                          <div
                            key={courseName}
                            className="p-3 sm:p-4 md:p-6 border-2 border-gray-200 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-50 to-white shadow-sm hover:shadow-md transition-all duration-300"
                          >
                            <div className="flex justify-between items-start mb-2 sm:mb-3 md:mb-4">
                              <h5 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">
                                {courseName}
                              </h5>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCourses((prev) =>
                                    prev.filter((c) => c !== courseName)
                                  );
                                  setCourseDetails((prev) => {
                                    const newState = { ...prev };
                                    delete newState[courseName];
                                    return newState;
                                  });
                                }}
                                className="ml-1.5 sm:ml-2 inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full hover:bg-[#AB2F30]/10 focus:outline-none transition-colors duration-200"
                              >
                                <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-500 hover:text-[#AB2F30]" />
                              </button>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-3 w-full">
                              <Dropdown
                                options={[
                                  { value: "1", label: "Level 1" },
                                  { value: "2", label: "Level 2" },
                                  { value: "3", label: "Level 3" },
                                ]}
                                value={courseDetails[courseName]?.level || "1"}
                                onChange={(value) =>
                                  setCourseDetails((prev) => ({
                                    ...prev,
                                    [courseName]: {
                                      ...prev[courseName],
                                      level: value,
                                    },
                                  }))
                                }
                                size="sm"
                                className="w-full"
                              />
                              <input
                                type="text"
                                value={
                                  courseDetails[courseName]?.classNumber || ""
                                }
                                onChange={(e) =>
                                  setCourseDetails((prev) => ({
                                    ...prev,
                                    [courseName]: {
                                      ...prev[courseName],
                                      classNumber: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="Class #"
                                className="w-full px-2 py-1.5 sm:px-2.5 sm:py-2 md:px-3 md:py-2.5 text-xs sm:text-sm border border-gray-300 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                              />
                              <Dropdown
                                options={[
                                  { value: "ongoing", label: "Ongoing" },
                                  { value: "complete", label: "Complete" },
                                ]}
                                value={
                                  courseDetails[courseName]?.status || "ongoing"
                                }
                                onChange={(value) =>
                                  setCourseDetails((prev) => ({
                                    ...prev,
                                    [courseName]: {
                                      ...prev[courseName],
                                      status: value,
                                    },
                                  }))
                                }
                                size="sm"
                                className="w-full"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Success Message */}
              {enrollmentSuccess && (
                <div className="text-green-600 text-xs sm:text-sm md:text-base bg-gradient-to-r from-green-500/10 to-green-600/10 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border-2 border-green-500/20 flex items-start space-x-3 sm:space-x-4">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="font-medium">
                    PRN assigned and courses enrolled successfully! Student has
                    been updated with the PRN number and selected courses.
                  </span>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="text-[#AB2F30] text-xs sm:text-sm md:text-base bg-gradient-to-r from-[#AB2F30]/10 to-[#8B1A1B]/10 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border-2 border-[#AB2F30]/20 flex items-start space-x-3 sm:space-x-4 animate-pulse">
                  <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-[#AB2F30] mt-0.5 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4 sm:pt-6 md:pt-8 text-center">
                <button
                  type="submit"
                  disabled={
                    enrolling ||
                    !email ||
                    !PrnNumber ||
                    selectedCourses.length === 0 ||
                    !emailExists ||
                    prnExists
                  }
                  className="group relative w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto flex justify-center py-2.5 sm:py-3.5 md:py-4 px-4 sm:px-6 md:px-8 border border-transparent rounded-xl sm:rounded-2xl text-white bg-gradient-to-r from-red-700 via-red-800 to-[#6B1516] hover:from-[#8B1A1B] hover:via-[#6B1516] hover:to-[#4B0F10] focus:outline-none focus:ring-4 focus:ring-[#AB2F30]/30 transition-all duration-300 font-semibold text-sm sm:text-base md:text-lg shadow-lg disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-4 sm:pl-6 md:pl-8">
                    {enrolling ? (
                      <Loader2 className="animate-spin h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white/80" />
                    ) : (
                      <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white/80 group-hover:text-white transition-colors duration-200" />
                    )}
                  </span>
                  <span className="pl-6 sm:pl-8 md:pl-10">
                    {enrolling
                      ? "Processing..."
                      : "Assign PRN & Enroll Courses"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
};

export default CreateUser;
