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
  Building,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  ShieldCheckIcon,
  UserCog,
  UserIcon,
  XCircle,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import Dropdown, { DropdownOption } from "../../components/ui/dropdown";
import courses from "../../../utils/courses";
import { enhancedCourseData } from "../../data/enhancedCourseData";
import Head from "next/head";
import Image from "next/image";
import {
  generatePrnNumber,
  getCenterPrefix,
  type CenterLocation,
} from "../../lib/prn-utils";

const SectionCard = ({
  icon,
  title,
  subtitle,
  badge,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-white rounded-t-2xl">
      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#AB2F30] shadow-sm shadow-[#AB2F30]/30">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
        <p className="text-xs text-gray-400">{subtitle}</p>
      </div>
      {badge}
    </div>
    <div className="p-6 overflow-visible">{children}</div>
  </div>
);

const CreateUser = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState("student");
  const [email, setEmail] = useState("");
  const [studentName, setStudentName] = useState("");
  const [password, setPassword] = useState("");
  const [PrnNumber, setPrnNumber] = useState("");
  const [selectedCenter, setSelectedCenter] = useState("KALYANI NAGAR");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [courseDetails, setCourseDetails] = useState<{
    [key: string]: { level: string; classNumber: string; status: string };
  }>({});
  const [emailExists, setEmailExists] = useState(false);
  const [prnExists, setPrnExists] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [prnChecking, setPrnChecking] = useState(false);
  const [prnAutoGenerating, setPrnAutoGenerating] = useState(false);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");
  const [studentId, setStudentId] = useState("");
  const [username, setUsername] = useState("");
  const [searchingStudents, setSearchingStudents] = useState(false);
  const [studentSuggestions, setStudentSuggestions] = useState<
    Array<{ id: string; name: string; email: string }>
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [courseSearchQuery, setCourseSearchQuery] = useState("");
  const [filteredCourses, setFilteredCourses] = useState<string[]>(courses);
  const [showPassword, setShowPassword] = useState(false);

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

  const centerOptions: DropdownOption[] = [
    {
      value: "KALYANI NAGAR",
      label: "Kalyani Nagar",
      icon: <Building className="h-4 w-4" />,
    },
    {
      value: "VIMAN NAGAR",
      label: "Viman Nagar",
      icon: <Building className="h-4 w-4" />,
    },
    {
      value: "MAGARPATTA",
      label: "Magarpatta",
      icon: <Building className="h-4 w-4" />,
    },
    {
      value: "KHARADI",
      label: "Kharadi",
      icon: <Building className="h-4 w-4" />,
    },
  ];

  const getCenterLocationFromPrefix = (
    prefix: ReturnType<typeof getCenterPrefix>,
  ): CenterLocation => {
    if (prefix === "VN") return "VIMAN NAGAR";
    if (prefix === "MG") return "MAGARPATTA";
    if (prefix === "KH") return "KHARADI";
    return "KALYANI NAGAR";
  };

  const handleCenterChange = async (center: string) => {
    setSelectedCenter(center);
    await generateNextPrnForCenter(center);
  };

  const generateNextPrnForCenter = async (center?: string | null) => {
    setPrnAutoGenerating(true);
    try {
      const prefix = getCenterPrefix(center || "");
      const centerLocation = getCenterLocationFromPrefix(prefix);
      const nextPrn = await generatePrnNumber(centerLocation);
      setPrnNumber(nextPrn);
      setPrnExists(false);
    } catch (error) {
      console.error("Error auto-generating PRN:", error);
    } finally {
      setPrnAutoGenerating(false);
    }
  };

  const populateStudentContext = async (
    student: { id: string; name: string; email: string },
    options?: { skipPrnGeneration?: boolean },
  ) => {
    setStudentName(student.name);
    setEmail(student.email);
    setUsername(student.name);
    setStudentId(student.id);
    setEmailExists(true);
    setShowSuggestions(false);
    if (options?.skipPrnGeneration) return;
    try {
      const studentDoc = await getDoc(doc(db, "students", student.id));
      if (!studentDoc.exists()) {
        await generateNextPrnForCenter();
        return;
      }
      const studentData = studentDoc.data();
      const studentCenter = studentData?.center || studentData?.location;
      if (studentCenter) {
        const prefix = getCenterPrefix(studentCenter);
        setSelectedCenter(getCenterLocationFromPrefix(prefix));
      }
      if (studentData?.PrnNumber) {
        setPrnNumber(studentData.PrnNumber);
        setPrnExists(false);
        return;
      }
      await generateNextPrnForCenter(studentCenter);
    } catch (error) {
      console.error("Error loading student context:", error);
      await generateNextPrnForCenter();
    }
  };

  const searchStudentsByName = async (name: string) => {
    if (!name || name.trim() === "") {
      setStudentSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setSearchingStudents(true);
    try {
      const studentsRef = collection(db, "students");
      const nameTrimmed = name.trim().toLowerCase();
      const querySnapshot = await getDocs(studentsRef);
      const suggestions: Array<{ id: string; name: string; email: string }> =
        [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const fullName = data.fullName || data.name || "";
        const username = data.username || "";
        const email = data.email || "";
        const nameToCheck = (fullName || username).toLowerCase();
        if (nameToCheck.includes(nameTrimmed))
          suggestions.push({ id: doc.id, name: fullName || username, email });
      });
      const limitedSuggestions = suggestions.slice(0, 10);
      setStudentSuggestions(limitedSuggestions);
      setShowSuggestions(limitedSuggestions.length > 0);
    } catch (error) {
      console.error("Error searching students by name:", error);
      setStudentSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setSearchingStudents(false);
    }
  };

  const checkEmailExists = async (emailValue: string) => {
    if (!emailValue || emailValue.trim() === "") {
      setEmailExists(false);
      setEmailChecking(false);
      return;
    }
    setEmailChecking(true);
    try {
      const studentsRef = collection(db, "students");
      const emailTrimmed = emailValue.trim().toLowerCase();
      const q = query(studentsRef, where("email", "==", emailTrimmed));
      const querySnapshot = await getDocs(q);
      const exists = !querySnapshot.empty;
      setEmailExists(exists);
      if (exists) {
        const existingStudent = querySnapshot.docs[0];
        setStudentId(existingStudent.id);
        setUsername(
          existingStudent.data().fullName ||
            existingStudent.data().username ||
            "",
        );
      } else {
        setStudentId("");
      }
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
      const studentsRef = collection(db, "students");
      const prnTrimmed = prn.trim();
      const q1 = query(studentsRef, where("PrnNumber", "==", prnTrimmed));
      const q2 = query(
        studentsRef,
        where("PrnNumber", "==", prnTrimmed.toUpperCase()),
      );
      const q3 = query(
        studentsRef,
        where("PrnNumber", "==", prnTrimmed.toLowerCase()),
      );
      const [querySnapshot1, querySnapshot2, querySnapshot3] =
        await Promise.all([getDocs(q1), getDocs(q2), getDocs(q3)]);
      setPrnExists(
        !querySnapshot1.empty || !querySnapshot2.empty || !querySnapshot3.empty,
      );
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
      if (adminDoc.exists()) setUserRole("admin");
      else setUserRole("trainer");
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    void generateNextPrnForCenter();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void checkEmailExists(email);
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [email]);

  useEffect(() => {
    if (studentName) {
      const timeoutId = setTimeout(() => {
        searchStudentsByName(studentName);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setStudentSuggestions([]);
      setShowSuggestions(false);
    }
  }, [studentName]);

  useEffect(() => {
    if (PrnNumber) {
      const timeoutId = setTimeout(() => {
        checkPrnExists(PrnNumber);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setPrnExists(false);
      setPrnChecking(false);
    }
  }, [PrnNumber]);

  useEffect(() => {
    if (!courseSearchQuery.trim()) {
      setFilteredCourses(courses);
    } else {
      const q = courseSearchQuery.toLowerCase();
      const filtered = courses.filter((courseName) => {
        if (courseName.toLowerCase().includes(q)) return true;
        const matchingCourseKey = Object.keys(enhancedCourseData).find(
          (key) => {
            const courseData = enhancedCourseData[key];
            return (
              courseData.title.toLowerCase() === courseName.toLowerCase() ||
              courseData.title.toLowerCase() + " course" ===
                courseName.toLowerCase() ||
              courseName
                .toLowerCase()
                .includes(courseData.title.toLowerCase()) ||
              courseData.title.toLowerCase().includes(courseName.toLowerCase())
            );
          },
        );
        if (matchingCourseKey) {
          const courseData = enhancedCourseData[matchingCourseKey];
          return (
            courseData.title.toLowerCase().includes(q) ||
            courseData.description.toLowerCase().includes(q) ||
            courseData.category.toLowerCase().includes(q) ||
            courseData.ageRange.toLowerCase().includes(q)
          );
        }
        return false;
      });
      setFilteredCourses(filtered);
    }
  }, [courseSearchQuery]);

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
    if (!studentName) {
      setError("Student name is required");
      setEnrolling(false);
      return;
    }
    if (!password) {
      setError("Password is required");
      setEnrolling(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setEnrolling(false);
      return;
    }
    if (emailExists) {
      setError(
        "This email already has an account. You can't create another one.",
      );
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

    for (const courseName of selectedCourses) {
      const classNumberStr = courseDetails[courseName]?.classNumber || "";
      if (classNumberStr.trim() !== "") {
        const classNumber = parseInt(classNumberStr, 10);
        if (isNaN(classNumber) || classNumber < 1 || classNumber > 30) {
          setError(`Class number for ${courseName} must be between 1 and 30`);
          setEnrolling(false);
          return;
        }
      }
    }

    try {
      const studentsRef = collection(db, "students");
      const prnTrimmed = PrnNumber.trim();
      const q1 = query(studentsRef, where("PrnNumber", "==", prnTrimmed));
      const q2 = query(
        studentsRef,
        where("PrnNumber", "==", prnTrimmed.toUpperCase()),
      );
      const q3 = query(
        studentsRef,
        where("PrnNumber", "==", prnTrimmed.toLowerCase()),
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

    try {
      const coursesToEnroll = selectedCourses.map((courseName) => ({
        name: courseName,
        level: courseDetails[courseName]?.level || "1",
        classNumber: courseDetails[courseName]?.classNumber || "",
        status: courseDetails[courseName]?.status || "ongoing",
      }));

      const currentAdminUid = auth.currentUser?.uid;
      if (!currentAdminUid) {
        setError("Admin session not found. Please log in again.");
        setEnrolling(false);
        return;
      }

      const createResponse = await fetch("/api/create-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          users: [
            {
              fullName: studentName.trim(),
              email: email.trim().toLowerCase(),
              password,
              role: "student",
              center: selectedCenter,
            },
          ],
          adminUid: currentAdminUid,
        }),
      });

      const createResult = await createResponse.json();
      if (!createResponse.ok)
        throw new Error(createResult.error || "Failed to create account");

      const createdStudentUid = createResult?.createdUsers?.[0]?.uid;
      if (!createdStudentUid)
        throw new Error("Student account was created without a valid UID");

      await setDoc(
        doc(db, "students", createdStudentUid),
        {
          email: email.trim().toLowerCase(),
          fullName: studentName.trim(),
          username: studentName.trim(),
          PrnNumber: PrnNumber,
          center: selectedCenter,
          courses: coursesToEnroll,
          status: "active",
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      setEnrollmentSuccess(true);
      toast.success("PRN assigned and courses enrolled successfully!");

      setSelectedCourses([]);
      setCourseDetails({});
      setEmail("");
      setPassword("");
      setPrnNumber("");
      setStudentId("");
      setUsername("");
      setStudentName("");
      void generateNextPrnForCenter();
    } catch (error) {
      console.error("Error enrolling courses:", error);
      setError("Failed to assign PRN and enroll courses. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  /* ─── Shared input helpers ─────────────────── */
  const inputBase =
    "block w-full py-3 px-4 text-sm text-gray-900 placeholder-gray-400 bg-gray-50/80 border rounded-xl transition-all duration-200 focus:outline-none focus:bg-white focus:ring-2";

  const inputState = (state: "error" | "warn" | "ok" | "default") => {
    if (state === "error")
      return "border-red-400 focus:ring-red-200 focus:border-red-500";
    if (state === "warn")
      return "border-amber-400 focus:ring-amber-200 focus:border-amber-500";
    if (state === "ok")
      return "border-emerald-400 focus:ring-emerald-200 focus:border-emerald-500";
    return "border-gray-200 hover:border-[#AB2F30]/40 focus:ring-[#AB2F30]/15 focus:border-[#AB2F30]";
  };

  /* ─── Section card wrapper ─────────────────── */
  return (
    <>
      <main
        role="main"
        aria-label="Assign PRN & Enroll Courses Page"
        className="min-h-screen bg-[#f8f8f8]"
      >
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            duration: 5000,
            style: {
              background: "#fff",
              color: "#1f2937",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              borderRadius: "14px",
              padding: "14px 18px",
              fontSize: "13.5px",
              fontWeight: 500,
              border: "1px solid #f0f0f0",
            },
            success: { iconTheme: { primary: "#10B981", secondary: "#fff" } },
            error: { iconTheme: { primary: "#EF4444", secondary: "#fff" } },
          }}
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-4">
          {/* ── Page Header ─────────────────── */}
          <div className="mb-10 text-center">
            <span className="inline-flex items-center gap-1.5 bg-[#AB2F30]/8 text-[#AB2F30] text-[11px] font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full border border-[#AB2F30]/15 mb-5">
              <Sparkles className="h-3 w-3" />
              Admin Portal
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-3 leading-tight">
              Assign PRN &amp;{" "}
              <span className="text-[#AB2F30]">Enroll Courses</span>
            </h1>
            <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
              Create a student account, assign a unique PRN, and select courses
              — all in one step.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleEnrollCourses}>
            {/* ── Student Information ──────── */}
            <SectionCard
              icon={<UserIcon className="h-4 w-4 text-white" />}
              title="Student Information"
              subtitle="Basic account and identity details"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Student Name */}
                <div className="relative">
                  <label
                    htmlFor="student-name"
                    className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2"
                  >
                    Student Name <span className="text-[#AB2F30]">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <input
                      id="student-name"
                      name="studentName"
                      type="text"
                      autoComplete="name"
                      required
                      className={`${inputBase} pl-10 pr-10 ${
                        searchingStudents
                          ? inputState("warn")
                          : studentSuggestions.length > 0
                            ? inputState("ok")
                            : inputState("default")
                      }`}
                      placeholder="Search or enter name"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      onFocus={() =>
                        studentSuggestions.length > 0 &&
                        setShowSuggestions(true)
                      }
                      onBlur={() =>
                        setTimeout(() => setShowSuggestions(false), 200)
                      }
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      {searchingStudents ? (
                        <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
                      ) : studentSuggestions.length > 0 ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      ) : null}
                    </span>
                  </div>
                  {searchingStudents && (
                    <p className="mt-1.5 text-[11px] text-amber-600 flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" /> Searching…
                    </p>
                  )}

                  {/* Autocomplete suggestions */}
                  {showSuggestions && studentSuggestions.length > 0 && (
                    <div className="absolute z-30 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-52 overflow-y-auto divide-y divide-gray-50">
                      {studentSuggestions.map((student) => (
                        <div
                          key={student.id}
                          className="flex items-center justify-between px-4 py-3 hover:bg-[#AB2F30]/4 cursor-pointer transition-colors duration-100"
                          onMouseDown={() =>
                            void populateStudentContext(student)
                          }
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {student.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {student.email}
                            </p>
                          </div>
                          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email-address"
                    className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2"
                  >
                    Email Address <span className="text-[#AB2F30]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <input
                      id="email-address"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className={`${inputBase} pl-10 pr-10 ${
                        emailExists
                          ? inputState("error")
                          : emailChecking
                            ? inputState("warn")
                            : inputState("default")
                      }`}
                      placeholder="student@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      {emailChecking ? (
                        <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
                      ) : emailExists ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : null}
                    </span>
                  </div>
                  {emailChecking && (
                    <p className="mt-1.5 text-[11px] text-amber-600 flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" /> Checking
                      availability…
                    </p>
                  )}
                  {emailExists && !emailChecking && (
                    <p className="mt-1.5 text-[11px] text-red-500 flex items-center gap-1">
                      <XCircle className="h-3 w-3" /> Account already exists
                      with this email.
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2"
                  >
                    Password <span className="text-[#AB2F30]">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className={`${inputBase} pl-10 pr-10 ${inputState("default")}`}
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1.5 text-[11px] text-gray-400">
                    Student will use this password to log in.
                  </p>
                </div>

                {/* PRN Number */}
                <div>
                  <label
                    htmlFor="prn-number"
                    className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2"
                  >
                    PRN Number <span className="text-[#AB2F30]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="prn-number"
                      name="prn"
                      type="text"
                      required
                      className={`${inputBase} pl-4 pr-10 font-mono tracking-wide ${
                        prnExists
                          ? inputState("error")
                          : prnChecking || prnAutoGenerating
                            ? inputState("warn")
                            : PrnNumber && !prnExists
                              ? inputState("ok")
                              : inputState("default")
                      }`}
                      placeholder="Auto-generated…"
                      value={PrnNumber}
                      onChange={(e) => setPrnNumber(e.target.value)}
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      {prnChecking || prnAutoGenerating ? (
                        <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
                      ) : prnExists ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : PrnNumber && !prnExists ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      ) : null}
                    </span>
                  </div>
                  {(prnChecking || prnAutoGenerating) && (
                    <p className="mt-1.5 text-[11px] text-amber-600 flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      {prnAutoGenerating
                        ? "Generating PRN…"
                        : "Checking availability…"}
                    </p>
                  )}
                  {prnExists && (
                    <p className="mt-1.5 text-[11px] text-red-500 flex items-center gap-1">
                      <XCircle className="h-3 w-3" /> Already assigned to
                      another student.
                    </p>
                  )}
                  {PrnNumber &&
                    !prnExists &&
                    !prnChecking &&
                    !prnAutoGenerating && (
                      <p className="mt-1.5 text-[11px] text-emerald-600 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Available — editable
                        if needed.
                      </p>
                    )}
                </div>

                {/* Center */}
                <div className="md:col-span-2 sm:max-w-xs">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Center <span className="text-[#AB2F30]">*</span>
                  </label>
                  <Dropdown
                    options={centerOptions}
                    value={selectedCenter}
                    onChange={(value) => void handleCenterChange(value)}
                    placeholder="Select center"
                    size="md"
                    className="w-full"
                  />
                  <p className="mt-1.5 text-[11px] text-gray-400">
                    PRN prefix is determined by the selected center.
                  </p>
                </div>
              </div>
            </SectionCard>

            {/* ── Course Enrollment ────────── */}
            <SectionCard
              icon={<BookOpen className="h-4 w-4 text-white" />}
              title="Course Enrollment"
              subtitle="Select one or more courses to enroll"
              badge={
                selectedCourses.length > 0 ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#AB2F30]/10 text-[#AB2F30] text-[11px] font-bold">
                    {selectedCourses.length} selected
                  </span>
                ) : undefined
              }
            >
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search courses by name or category…"
                    value={courseSearchQuery}
                    onChange={(e) => setCourseSearchQuery(e.target.value)}
                    className={`${inputBase} pl-4 pr-10 ${inputState("default")}`}
                  />
                  {courseSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setCourseSearchQuery("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Course checklist */}
                <div className="border border-gray-100 rounded-xl max-h-56 overflow-y-auto bg-gray-50/40 p-3 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                  {filteredCourses.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-8">
                      No courses match your search.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
                      {filteredCourses.map((courseName) => {
                        const checked = selectedCourses.includes(courseName);
                        return (
                          <label
                            key={courseName}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer select-none text-xs leading-tight transition-all duration-150 border ${
                              checked
                                ? "bg-[#AB2F30]/6 border-[#AB2F30]/25 text-[#AB2F30] font-semibold"
                                : "bg-white border-gray-100 text-gray-600 hover:border-[#AB2F30]/25 hover:bg-[#AB2F30]/3"
                            } ${!email.trim() ? "opacity-40 cursor-not-allowed" : ""}`}
                          >
                            <input
                              type="checkbox"
                              id={`course-${courseName}`}
                              checked={checked}
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
                                    prev.filter((c) => c !== courseName),
                                  );
                                  setCourseDetails((prev) => {
                                    const newState = { ...prev };
                                    delete newState[courseName];
                                    return newState;
                                  });
                                }
                              }}
                              disabled={!email.trim()}
                              className="h-3.5 w-3.5 rounded accent-[#AB2F30] shrink-0"
                            />
                            {courseName}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {!email.trim() && (
                  <p className="text-[11px] text-amber-600 flex items-center gap-1.5">
                    <Loader2 className="h-3 w-3" /> Enter an email address first
                    to enable course selection.
                  </p>
                )}

                {/* Course detail cards */}
                {selectedCourses.length > 0 && (
                  <div className="pt-1 space-y-3">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="h-3 w-3" /> Configure enrolled
                      courses
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedCourses.map((courseName) => (
                        <div
                          key={courseName}
                          className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 hover:border-[#AB2F30]/15 transition-colors duration-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <p className="text-sm font-semibold text-gray-800 leading-snug pr-2">
                              {courseName}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCourses((prev) =>
                                  prev.filter((c) => c !== courseName),
                                );
                                setCourseDetails((prev) => {
                                  const newState = { ...prev };
                                  delete newState[courseName];
                                  return newState;
                                });
                              }}
                              className="shrink-0 p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors duration-150"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <Dropdown
                              options={[
                                { value: "1", label: "Level 1" },
                                { value: "2", label: "Level 2" },
                                { value: "3", label: "Level 3" },
                                { value: "4", label: "Level 4" },
                                { value: "5", label: "Level 5" },
                                { value: "6", label: "Level 6" },
                                { value: "7", label: "Level 7" },
                                { value: "8", label: "Level 8" },
                                { value: "9", label: "Level 9" },
                                { value: "10", label: "Level 10" },
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
                              type="number"
                              min="1"
                              max="30"
                              value={
                                courseDetails[courseName]?.classNumber || ""
                              }
                              onChange={(e) => {
                                const value = e.target.value;
                                if (
                                  value === "" ||
                                  (parseInt(value) >= 1 &&
                                    parseInt(value) <= 30)
                                ) {
                                  setCourseDetails((prev) => ({
                                    ...prev,
                                    [courseName]: {
                                      ...prev[courseName],
                                      classNumber: value,
                                    },
                                  }));
                                }
                              }}
                              placeholder="Classes"
                              className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#AB2F30]/15 focus:border-[#AB2F30] placeholder-gray-400 transition-all duration-150"
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
            </SectionCard>

            {/* ── Feedback ─────────────────── */}
            {enrollmentSuccess && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
                <CheckCircle className="h-5 w-5 shrink-0 mt-0.5 text-emerald-500" />
                PRN assigned and courses enrolled successfully! Student account
                is now active.
              </div>
            )}

            {error && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                <XCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
                {error}
              </div>
            )}

            {/* ── Submit ───────────────────── */}
            <div className="flex justify-center pt-2 pb-6">
              <button
                type="submit"
                disabled={
                  enrolling ||
                  !email ||
                  !password ||
                  !studentName ||
                  !PrnNumber ||
                  selectedCourses.length === 0 ||
                  emailExists ||
                  emailChecking ||
                  prnExists ||
                  prnAutoGenerating
                }
                className="inline-flex items-center justify-center gap-2.5 px-10 py-3.5 rounded-xl text-sm font-semibold text-white bg-[#AB2F30] hover:bg-[#8B1A1B] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#AB2F30]/20 hover:shadow-lg hover:shadow-[#AB2F30]/25 transition-all duration-200 min-w-[200px]"
              >
                {enrolling ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <BookOpen className="h-4 w-4" />
                    Create Account
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default CreateUser;
