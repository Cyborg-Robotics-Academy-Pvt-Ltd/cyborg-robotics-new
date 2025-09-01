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
import { createUserWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import toast, { Toaster } from "react-hot-toast";
import {
  EyeIcon,
  EyeOffIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  GraduationCap,
  UserIcon,
  XCircle,
  CheckCircle,
  ArrowLeft,
  Loader2,
  Mail,
  Lock,
  BookOpen,
  Users,
  Star,
} from "lucide-react";
import Dropdown, { DropdownOption } from "../../components/ui/dropdown";
import courses from "../../../utils/courses";
import Head from "next/head";
import Image from "next/image";

const CreateUser = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("student");
  const [PrnNumber, setPrnNumber] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [currentUser, setCurrentUser] = useState<
    import("firebase/auth").User | null
  >(null);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [courseDetails, setCourseDetails] = useState<{
    [key: string]: { level: string; classNumber: string; status: string };
  }>({});
  const [prnExists, setPrnExists] = useState(false);
  const [prnChecking, setPrnChecking] = useState(false);

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
      icon: <UserIcon className="h-4 w-4" />,
    },
    {
      value: "admin",
      label: "Admin",
      icon: <ShieldCheckIcon className="h-4 w-4" />,
    },
  ];

  const calculatePasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 8) strength += 1;
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1;
    return strength;
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

      // Store current user info
      setCurrentUser(user);

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

  // Debounced PRN checking
  useEffect(() => {
    if (role === "student" && PrnNumber) {
      const timeoutId = setTimeout(() => {
        checkPrnExists(PrnNumber);
      }, 500); // Wait 500ms after user stops typing

      return () => clearTimeout(timeoutId);
    } else {
      setPrnExists(false);
      setPrnChecking(false);
    }
  }, [PrnNumber, role]);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (userRole === "trainer" && role !== "student") {
      setError("As a trainer, you can only create student accounts");
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (passwordStrength < 2) {
      setError(
        "Password must be at least medium strength (8+ chars, uppercase, numbers)"
      );
      setIsLoading(false);
      return;
    }

    // Check if PRN already exists for students (case-insensitive)
    if (role === "student" && PrnNumber) {
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
          setError(
            "This PRN number is already registered with another account"
          );
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error checking PRN existence:", error);
        setError("Error checking PRN number. Please try again.");
        setIsLoading(false);
        return;
      }
    }

    try {
      // Create the user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const newUser = userCredential.user;

      // Store user data in appropriate Firestore collection
      const userDocRef = doc(db, role + "s", newUser.uid);
      await setDoc(userDocRef, {
        email: newUser.email,
        username,
        role,
        createdAt: serverTimestamp(),
        lastLogin: null,
        uid: newUser.uid,
        createdBy: currentUser?.uid,
        createdByRole: userRole,
        PrnNumber: PrnNumber,
        emailVerified: newUser.emailVerified,
        status: "ongoing",
        courses: selectedCourses.map((courseName) => ({
          name: courseName,
          level: courseDetails[courseName]?.level || "1",
          classNumber: courseDetails[courseName]?.classNumber || "",
          status: courseDetails[courseName]?.status || "ongoing",
        })),
      });

      // PRN is already stored in the student document, no need for separate mapping

      // Clear form
      setEmail("");
      setPassword("");
      setUsername("");
      setRole("student");
      setPrnNumber("");
      setPasswordStrength(0);
      setSelectedCourses([]);
      setCourseDetails({});

      toast.success(
        `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully!`
      );
    } catch (error) {
      console.error("Error creating user:", error);
      if (error instanceof FirebaseError) {
        // Handle specific Firebase Auth errors
        switch (error.code) {
          case "auth/email-already-in-use":
            setError("This email address is already registered");
            break;
          case "auth/invalid-email":
            setError("Please enter a valid email address");
            break;
          case "auth/operation-not-allowed":
            setError("Email/password accounts are not enabled");
            break;
          case "auth/weak-password":
            setError("Password is too weak. Please choose a stronger password");
            break;
          case "auth/too-many-requests":
            setError("Too many attempts. Please try again later");
            break;
          default:
            setError(error.message || "Failed to create user account");
        }
      } else {
        setError("Failed to create user account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
        return "Very Weak";
      case 1:
        return "Weak";
      case 2:
        return "Medium";
      case 3:
        return "Strong";
      case 4:
        return "Very Strong";
      default:
        return "Very Weak";
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
        return "text-[#AB2F30]";
      case 1:
        return "text-[#AB2F30]";
      case 2:
        return "text-[#AB2F30]";
      case 3:
        return "text-[#AB2F30]";
      case 4:
        return "text-[#AB2F30]";
      default:
        return "text-[#AB2F30]";
    }
  };

  return (
    <>
      <Head>
        <title>Create User | Cyborg Robotics Academy</title>
        <meta
          name="description"
          content="Create a new user account for Cyborg Robotics Academy."
        />
        <meta
          property="og:title"
          content="Create User | Cyborg Robotics Academy"
        />
        <meta
          property="og:description"
          content="Create a new user account for Cyborg Robotics Academy."
        />
        <meta property="og:type" content="website" />
      </Head>
      <main
        role="main"
        aria-label="Create User Page"
        className="min-h-screen bg-gradient-to-br from-gray-50 to-white"
      >
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 md:mt-14">
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
          <div className="max-w-7xl mx-auto mb-12">
            <div className="text-center transform transition-all duration-500">
              {/* Logo */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="relative p-3">
                    <Image
                      src="/assets/logo.png"
                      alt="Cyborg Robotics Academy Logo"
                      width={200}
                      height={200}
                      className=""
                      priority={true}
                    />
                  </div>
                </div>
              </div>

              {/* Main Icon */}
              <h2 className="text-5xl font-bold text-gray-900 tracking-tight bg-gradient-to-r from-[#AB2F30] via-[#8B1A1B] to-[#6B1516] bg-clip-text text-transparent mb-4">
                Create New User
              </h2>

              {userRole === "trainer" && (
                <div className="mt-6 inline-flex items-center space-x-2 bg-gradient-to-r from-[#AB2F30]/10 to-[#8B1A1B]/10 py-4 px-6 rounded-2xl border border-[#AB2F30]/20 animate-pulse">
                  <Star className="h-6 w-6 text-[#AB2F30]" />
                  <span className="text-base text-[#AB2F30] font-medium">
                    Trainer Mode: You can only create student accounts
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Form Container */}
          <div className="max-w-6xl mx-auto">
            <form className="space-y-12" onSubmit={handleSignup}>
              {/* Basic Information Section */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="bg-gradient-to-r from-[#AB2F30] to-[#8B1A1B] p-3 rounded-xl">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800">
                    Basic Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="group">
                    <label
                      htmlFor="username"
                      className="block text-base font-semibold text-gray-700 mb-3"
                    >
                      {role === "student"
                        ? "Student Name *"
                        : role === "trainer"
                          ? "Trainer Name *"
                          : "Admin Name *"}
                    </label>
                    <div className="relative transform transition-all duration-300 hover:scale-[1.02]">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <UserIcon className="h-5 w-5 text-gray-400 group-hover:text-[#AB2F30] transition-colors duration-200" />
                      </div>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        required
                        minLength={3}
                        className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#AB2F30]/20 focus:border-[#AB2F30] transition-all duration-300 hover:border-[#AB2F30]/50 bg-white"
                        placeholder={
                          role === "student"
                            ? "Enter student name "
                            : role === "trainer"
                              ? "Enter trainer name "
                              : "Enter admin name "
                        }
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label
                      htmlFor="email-address"
                      className="block text-base font-semibold text-gray-700 mb-3 group-hover:text-[#AB2F30] transition-colors duration-200"
                    >
                      Email Address *
                    </label>
                    <div className="relative transform transition-all duration-300 hover:scale-[1.02]">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <Mail className="h-5 w-5 text-gray-400 group-hover:text-[#AB2F30] transition-colors duration-200" />
                      </div>
                      <input
                        id="email-address"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#AB2F30]/20 focus:border-[#AB2F30] transition-all duration-300 hover:border-[#AB2F30]/50 bg-white"
                        placeholder={
                          role === "student"
                            ? "Enter student email address"
                            : role === "trainer"
                              ? "Enter trainer email address"
                              : "Enter admin email address"
                        }
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Password Section */}
                <div className="mt-8 group">
                  <label
                    htmlFor="password"
                    className="block text-base font-semibold text-gray-700 mb-3 group-hover:text-[#AB2F30] transition-colors duration-200"
                  >
                    Password *
                  </label>
                  <div className="relative transform transition-all duration-300 hover:scale-[1.02] max-w-2xl">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                      <Lock className="h-5 w-5 text-gray-400 group-hover:text-[#AB2F30] transition-colors duration-200" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      minLength={8}
                      className="block w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#AB2F30]/20 focus:border-[#AB2F30] transition-all duration-300 hover:border-[#AB2F30]/50 bg-white"
                      placeholder={
                        role === "student"
                          ? "Enter student password (min 8 characters)"
                          : role === "trainer"
                            ? "Enter trainer password (min 8 characters)"
                            : "Enter admin password (min 8 characters)"
                      }
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordStrength(
                          calculatePasswordStrength(e.target.value)
                        );
                      }}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 focus:outline-none hover:bg-gray-50 rounded-r-2xl transition-colors duration-200"
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-5 w-5 text-gray-500 hover:text-[#AB2F30] transition-colors duration-200" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-500 hover:text-[#AB2F30] transition-colors duration-200" />
                      )}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  <div className="mt-4 space-y-3 max-w-2xl">
                    <div className="flex gap-2">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-3 w-full rounded-full transition-all duration-500 ${
                            i < passwordStrength
                              ? passwordStrength === 1
                                ? "bg-gradient-to-r from-[#AB2F30] to-[#8B1A1B]"
                                : passwordStrength === 2
                                  ? "bg-gradient-to-r from-[#AB2F30] to-[#6B1516]"
                                  : passwordStrength === 3
                                    ? "bg-gradient-to-r from-[#AB2F30] to-[#4B0F10]"
                                    : "bg-gradient-to-r from-[#AB2F30] to-[#2B090A]"
                              : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-base font-medium ${getPasswordStrengthColor()}`}
                      >
                        Password strength: {getPasswordStrengthText()}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>8+ chars</span>
                        <span>•</span>
                        <span>Uppercase</span>
                        <span>•</span>
                        <span>Numbers</span>
                        <span>•</span>
                        <span>Special</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Role and Additional Information Section */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="bg-gradient-to-r from-[#AB2F30] to-[#8B1A1B] p-3 rounded-xl">
                    <ShieldCheckIcon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800">
                    Role & Permissions
                  </h3>
                </div>

                <div className="group max-w-md">
                  <Dropdown
                    options={
                      userRole === "admin"
                        ? roleOptions
                        : roleOptions.filter((opt) => opt.value === "student")
                    }
                    value={role}
                    onChange={setRole}
                    placeholder="Select role"
                    label="Select Role"
                    required
                    disabled={userRole === "trainer"}
                    className="transform transition-all duration-300 hover:scale-[1.02] z-50"
                  />
                </div>

                {role === "student" && (
                  <div className="mt-8 space-y-8">
                    <div className="flex items-center space-x-4 mb-8">
                      <div className="bg-gradient-to-r from-[#AB2F30] to-[#8B1A1B] p-3 rounded-xl">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-800">
                        Student Details
                      </h3>
                    </div>

                    <div className="group max-w-md">
                      <label
                        htmlFor="prn-number"
                        className="block text-base font-semibold text-gray-700 mb-3 group-hover:text-red-600 transition-colors duration-200"
                      >
                        PRN Number *
                      </label>
                      <div className="relative transform transition-all duration-300 hover:scale-[1.02]">
                        <input
                          id="prn-number"
                          name="prn"
                          type="text"
                          required
                          className={`block w-full pl-4 pr-12 py-4 border-2 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 transition-all duration-300 bg-white ${
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
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                          {prnChecking ? (
                            <Loader2 className="animate-spin h-5 w-5 text-yellow-500" />
                          ) : prnExists ? (
                            <XCircle className="h-5 w-5 text-[#AB2F30]" />
                          ) : PrnNumber && !prnExists ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : null}
                        </div>
                      </div>
                      {prnChecking && (
                        <p className="mt-3 text-sm text-yellow-600 flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Checking PRN availability...</span>
                        </p>
                      )}
                      {prnExists && (
                        <p className="mt-3 text-sm text-[#AB2F30] flex items-center space-x-2">
                          <XCircle className="h-4 w-4" />
                          <span>This PRN number is already registered</span>
                        </p>
                      )}
                      {PrnNumber && !prnExists && !prnChecking && (
                        <p className="mt-3 text-sm text-green-600 flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4" />
                          <span>PRN number is available</span>
                        </p>
                      )}
                    </div>

                    {/* Course Selection */}
                    <div className="group">
                      <label
                        htmlFor="course"
                        className="block text-base font-semibold text-gray-700 mb-4 group-hover:text-[#AB2F30] transition-colors duration-200"
                      >
                        Enroll in Courses *
                      </label>
                      <div className="relative transform transition-all duration-300 ">
                        <div className="max-h-64 overflow-y-auto border-2 border-gray-200 rounded-2xl p-6 bg-white scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {courses.map((courseName) => (
                              <div
                                key={courseName}
                                className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-xl transition-colors duration-200"
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
                                  className="h-4 w-4 text-[#AB2F30] focus:ring-[#AB2F30] border-gray-300 rounded transition-all duration-200"
                                />
                                <label
                                  htmlFor={`course-${courseName}`}
                                  className="text-sm text-gray-700 cursor-pointer select-none flex-grow hover:text-[#AB2F30] transition-colors duration-200"
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
                        <div className="mt-8 space-y-6">
                          <h4 className="text-lg font-semibold text-gray-700 flex items-center space-x-3">
                            <BookOpen className="h-5 w-5" />
                            <span>
                              Course Details ({selectedCourses.length} selected)
                            </span>
                          </h4>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {selectedCourses.map((courseName) => (
                              <div
                                key={courseName}
                                className="p-6 border-2 border-gray-200 rounded-2xl bg-gradient-to-br from-gray-50 to-white shadow-sm hover:shadow-md transition-all duration-300"
                              >
                                <div className="flex justify-between items-start mb-4">
                                  <h5 className="text-base font-semibold text-gray-800">
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
                                    className="ml-2 inline-flex items-center justify-center w-7 h-7 rounded-full hover:bg-[#AB2F30]/10 focus:outline-none transition-colors duration-200"
                                  >
                                    <XCircle className="h-5 w-5 text-gray-500 hover:text-[#AB2F30]" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-3 gap-3 w-full">
                                  <Dropdown
                                    options={[
                                      { value: "1", label: "Level 1" },
                                      { value: "2", label: "Level 2" },
                                      { value: "3", label: "Level 3" },
                                    ]}
                                    value={
                                      courseDetails[courseName]?.level || "1"
                                    }
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
                                      courseDetails[courseName]?.classNumber ||
                                      ""
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
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                                  />
                                  <Dropdown
                                    options={[
                                      { value: "ongoing", label: "Ongoing" },
                                      { value: "complete", label: "Complete" },
                                    ]}
                                    value={
                                      courseDetails[courseName]?.status ||
                                      "ongoing"
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
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="text-[#AB2F30] text-base bg-gradient-to-r from-[#AB2F30]/10 to-[#8B1A1B]/10 p-6 rounded-2xl border-2 border-[#AB2F30]/20 flex items-start space-x-4 animate-pulse">
                  <XCircle className="h-6 w-6 text-[#AB2F30] mt-0.5 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-8 text-center">
                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    passwordStrength < 2 ||
                    (role === "student" && prnExists)
                  }
                  className="group relative w-full max-w-md mx-auto flex justify-center py-5 px-8 border border-transparent rounded-2xl text-white bg-gradient-to-r from-[#AB2F30] via-[#8B1A1B] to-[#6B1516] hover:from-[#8B1A1B] hover:via-[#6B1516] hover:to-[#4B0F10] focus:outline-none focus:ring-4 focus:ring-[#AB2F30]/30 transition-all duration-300 font-semibold text-xl shadow-lg disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-8">
                    {isLoading ? (
                      <Loader2 className="animate-spin h-7 w-7 text-white/80" />
                    ) : (
                      <UserPlusIcon className="h-7 w-7 text-white/80 group-hover:text-white transition-colors duration-200" />
                    )}
                  </span>
                  {isLoading ? "Creating User..." : "Create User Account"}
                </button>
              </div>
            </form>

            {/* Back Button */}
            <div className="flex justify-center pt-8">
              <button
                onClick={() => router.back()}
                className="text-base text-gray-600 hover:text-[#AB2F30] transition-all duration-300 flex items-center space-x-3 group transform hover:scale-105 bg-white px-6 py-3 rounded-xl border border-gray-200 hover:border-[#AB2F30]/50 hover:shadow-md"
              >
                <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform duration-300" />
                <span className="font-medium">Go back</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default CreateUser;
