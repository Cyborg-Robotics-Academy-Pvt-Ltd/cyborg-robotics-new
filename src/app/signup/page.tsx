"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  User,
  Mail,
  Lock,
  GraduationCap,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

const SignUpPage = () => {
  const router = useRouter();
  const { user, userRole, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    grade: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Redirect if already authenticated
  useEffect(() => {
    if (authLoading) return;

    if (user && userRole) {
      switch (userRole) {
        case "student":
          router.push("/student-dashboard");
          break;
        case "trainer":
          router.push("/trainer-dashboard");
          break;
        case "admin":
          router.push("/admin-dashboard");
          break;
      }
    } else if (user) {
      // Check if user exists but role is not set
      checkStudentData();
    } else {
      setLoading(false);
    }
  }, [user, userRole, authLoading, router]);

  const checkStudentData = async () => {
    if (!user) return;

    try {
      // Check if student document exists
      const studentDocRef = doc(db, "students", user.uid);
      const studentDoc = await getDoc(studentDocRef);

      if (studentDoc.exists()) {
        const data = studentDoc.data();
        setStudentData(data);

        // If student has courses, redirect to dashboard
        if (data.courses && data.courses.length > 0) {
          router.push("/student-dashboard");
        }
      }
    } catch (error) {
      console.error("Error checking student data:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Grade validation
    if (!formData.grade) {
      newErrors.grade = "Grade is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      // Update user profile with display name
      await updateProfile(user, {
        displayName: formData.fullName,
      });

      // Create student document in Firestore with explicit role
      const studentData = {
        uid: user.uid,
        email: formData.email,
        fullName: formData.fullName,
        grade: formData.grade,
        createdAt: new Date(),
        lastLogin: new Date(),
        courses: [], // Initially no courses assigned
        role: "student", // Explicitly set role as student
      };

      await setDoc(doc(db, "students", user.uid), studentData);

      // Send email verification
      await sendEmailVerification(user);

      // Store role in localStorage
      localStorage.setItem("userRole", "student");

      toast.success(
        "Account created successfully! Please check your email for verification."
      );

      // Redirect to dashboard
      router.push("/student-dashboard");
    } catch (error: any) {
      console.error("Signup error:", error);
      let errorMessage = "Failed to create account. Please try again.";

      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "An account with this email already exists.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address.";
          break;
        case "auth/operation-not-allowed":
          errorMessage = "Email/password accounts are not enabled.";
          break;
        case "auth/weak-password":
          errorMessage =
            "Password is too weak. Please use a stronger password.";
          break;
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading indicator while checking auth status
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden mt-12">
        {/* Animated background elements */}
        <div className="absolute inset-0 ">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-1/4 left-1/4 w-64 h-64   "
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 "
          />
        </div>
        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            <Card className="bg-white border border-gray-300 shadow-lg overflow-hidden">
              {/* Top accent line */}
              <div className="h-[4px] bg-gradient-to-r from-red-700 to-red-800"></div>

              <CardHeader className="space-y-3 pb-3 pt-4 px-6">
                {/* Logo section */}
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex justify-center"
                >
                  <div className="relative">
                    <Image
                      src="/assets/Cyborg-logo.png"
                      alt="Logo"
                      width={200}
                      height={200}
                      className="relative z-10 mx-auto"
                    />
                  </div>
                </motion.div>
              </CardHeader>

              <CardContent className="px-6 pb-6">
                <div className="text-center py-8">
                  <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading...</p>
                </div>
              </CardContent>
            </Card>

            {/* Footer text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="text-center text-gray-600 text-xs mt-4"
            >
              Secure authentication
            </motion.p>
          </motion.div>
        </div>
      </div>
    );
  }

  // If student data exists but no courses, show enrollment message
  if (
    studentData &&
    (!studentData.courses || studentData.courses.length === 0)
  ) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden mt-12">
        {/* Animated background elements */}
        <div className="absolute inset-0 ">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute top-1/4 left-1/4 w-64 h-64   "
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 "
          />
        </div>

        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            <Card className="bg-white border border-gray-300 shadow-lg overflow-hidden">
              {/* Top accent line */}
              <div className="h-[4px] bg-gradient-to-r from-red-700 to-red-800"></div>

              <CardHeader className="space-y-3 pb-3 pt-4 px-6">
                {/* Logo section */}
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex justify-center"
                >
                  <div className="relative">
                    <Image
                      src="/assets/Cyborg-logo.png"
                      alt="Logo"
                      width={200}
                      height={200}
                      className="relative z-10 mx-auto"
                    />
                  </div>
                </motion.div>
              </CardHeader>

              <CardContent className="px-6 pb-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="space-y-6"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <h3 className="text-gray-800 text-md font-semibold">
                        Enroll in Cyborg Robotics
                      </h3>
                    </div>

                    <div className="text-center py-4">
                      <p className="text-gray-600 mb-4">
                        Welcome, {studentData.fullName}! Your account has been
                        created successfully, but you haven't been enrolled in
                        any courses yet.
                      </p>

                      <div className="bg-yellow-50 border border-yellow-200 p-4 mb-6 text-left rounded-xl">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                              <strong>Next Steps:</strong> Please contact our
                              admissions team to enroll in our robotics courses.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="h-6 w-6 text-red-600 mx-auto mb-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                          </div>
                          <h3 className="font-semibold text-gray-800">
                            Call Us
                          </h3>
                          <p className="text-sm text-gray-600">
                            +91 9876543210
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="h-6 w-6 text-red-600 mx-auto mb-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <h3 className="font-semibold text-gray-800">
                            Email Us
                          </h3>
                          <p className="text-sm text-gray-600">
                            info@cyborgrobotics.in
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/contact-us">
                          <Button className="w-full sm:w-auto bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] hover:from-red-700 hover:to-red-800 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                            Contact Us
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          onClick={() => auth.signOut()}
                          className="w-full sm:w-auto border-red-600 text-red-600 hover:bg-red-50 font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-300"
                        >
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>

            {/* Footer text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="text-center text-gray-600 text-xs mt-4"
            >
              Secure authentication
            </motion.p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show signup form
  return (
    <div className="min-h-screen bg-white relative overflow-hidden mt-12">
      {/* Animated background elements */}
      <div className="absolute inset-0 ">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64   "
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 "
        />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <Card className="bg-white border border-gray-300 shadow-lg overflow-hidden">
            {/* Top accent line */}
            <div className="h-[4px] bg-gradient-to-r from-red-700 to-red-800"></div>

            <CardHeader className="space-y-1 pb-1.5 pt-2 px-4">
              {/* Logo section */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex justify-center"
              >
                <div className="relative">
                  <Image
                    src="/assets/Cyborg-logo.png"
                    alt="Logo"
                    width={200}
                    height={200}
                    className="relative z-10 mx-auto"
                  />
                </div>
              </motion.div>

              {/* Registration buttons section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-center space-y-2"
              >
                <h2 className="text-gray-800 text-lg font-semibold">
                  Registration
                </h2>
                <div className="flex justify-center gap-2">
                  <Link href="/registration/new">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] text-white text-sm font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:from-red-700 hover:to-red-800"
                    >
                      New Registration
                    </motion.button>
                  </Link>
                  <Link href="/registration/renewal">
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] text-white text-sm font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:from-red-700 hover:to-red-800"
                    >
                      Renewal
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </CardHeader>

            <CardContent className="px-4 pb-4">
              <motion.form
                onSubmit={handleSubmit}
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                {/* Existing user section */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-red-700" />
                    <h3 className="text-gray-800 text-md font-semibold">
                      Student Sign Up
                    </h3>
                  </div>

                  {/* Full Name */}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="space-y-1"
                  >
                    <Label
                      htmlFor="fullName"
                      className="text-gray-600 text-sm font-medium"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gray-200 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                      <div className="relative flex items-center">
                        <User className="absolute left-3 h-4 w-4 text-gray-400 z-10" />
                        <Input
                          id="fullName"
                          name="fullName"
                          type="text"
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="Enter your full name"
                          className={`pl-10 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:bg-gray-100 focus:border-gray-400 focus:ring-2 focus:ring-gray-400 transition-all duration-300 ${errors.fullName ? "border-red-500" : ""}`}
                        />
                      </div>
                    </div>
                    {errors.fullName && (
                      <motion.div
                        className="text-red-600 text-sm bg-red-100 py-2 rounded-xl border border-red-300 px-3"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {errors.fullName}
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Email */}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="space-y-1"
                  >
                    <Label
                      htmlFor="email"
                      className="text-gray-600 text-sm font-medium"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gray-200 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                      <div className="relative flex items-center">
                        <Mail className="absolute left-3 h-4 w-4 text-gray-400 z-10" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your email address"
                          className={`pl-10 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:bg-gray-100 focus:border-gray-400 focus:ring-2 focus:ring-gray-400 transition-all duration-300 ${errors.email ? "border-red-500" : ""}`}
                        />
                      </div>
                    </div>
                    {errors.email && (
                      <motion.div
                        className="text-red-600 text-sm bg-red-100 py-2 rounded-xl border border-red-300 px-3"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {errors.email}
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Grade */}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.85, duration: 0.5 }}
                    className="space-y-1"
                  >
                    <Label
                      htmlFor="grade"
                      className="text-gray-600 text-sm font-medium"
                    >
                      Grade <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gray-200 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                      <div className="relative flex items-center">
                        <GraduationCap className="absolute left-3 h-4 w-4 text-gray-400 z-10" />
                        <Input
                          id="grade"
                          name="grade"
                          type="text"
                          value={formData.grade}
                          onChange={handleChange}
                          placeholder="e.g., Grade 5"
                          className={`pl-10 pr-3 py-2 text-sm bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:bg-gray-100 focus:border-gray-400 focus:ring-2 focus:ring-gray-400 transition-all duration-300 ${errors.grade ? "border-red-500" : ""}`}
                        />
                      </div>
                    </div>
                    {errors.grade && (
                      <motion.div
                        className="text-red-600 text-sm bg-red-100 py-2 rounded-xl border border-red-300 px-3"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {errors.grade}
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Password */}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                    className="space-y-1"
                  >
                    <Label
                      htmlFor="password"
                      className="text-gray-600 text-sm font-medium"
                    >
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gray-200 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                      <div className="relative flex items-center">
                        <Lock className="absolute left-3 h-4 w-4 text-gray-400 z-10" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Create a password"
                          className={`pl-10 pr-10 py-2 text-sm bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:bg-gray-100 focus:border-gray-400 focus:ring-2 focus:ring-gray-400 transition-all duration-300 ${errors.password ? "border-red-500" : ""}`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    {errors.password && (
                      <motion.div
                        className="text-red-600 text-sm bg-red-100 py-2 rounded-xl border border-red-300 px-3"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {errors.password}
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Confirm Password */}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.95, duration: 0.5 }}
                    className="space-y-1"
                  >
                    <Label
                      htmlFor="confirmPassword"
                      className="text-gray-600 text-sm font-medium"
                    >
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gray-200 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                      <div className="relative flex items-center">
                        <Lock className="absolute left-3 h-4 w-4 text-gray-400 z-10" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm your password"
                          className={`pl-10 pr-10 py-2 text-sm bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:bg-gray-100 focus:border-gray-400 focus:ring-2 focus:ring-gray-400 transition-all duration-300 ${errors.confirmPassword ? "border-red-500" : ""}`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    {errors.confirmPassword && (
                      <motion.div
                        className="text-red-600 text-sm bg-red-100 py-2 rounded-xl border border-red-300 px-3"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {errors.confirmPassword}
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Terms and Conditions */}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.0, duration: 0.5 }}
                    className="space-y-1"
                  >
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="terms"
                            name="terms"
                            type="checkbox"
                            required
                            className="focus:ring-red-500 h-4 w-4 text-red-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <Label htmlFor="terms" className="text-gray-700">
                            I agree to the{" "}
                            <Link
                              href="/terms-conditions"
                              className="text-red-600 hover:underline"
                            >
                              Terms and Conditions
                            </Link>{" "}
                            and{" "}
                            <Link
                              href="/privacy-policy"
                              className="text-red-600 hover:underline"
                            >
                              Privacy Policy
                            </Link>
                          </Label>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Submit Button */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.1, duration: 0.5 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-10 rounded-xl text-md font-semibold bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] hover:from-red-700 hover:to-red-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center space-x-3">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="rounded-full h-4 w-4 border-2 border-transparent border-t-white"
                          />
                          <span>Creating Account...</span>
                        </div>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <User className="h-4 w-4" />
                          Create Account
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>

                {/* Sign in link */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="text-center pt-2"
                >
                  <p className="text-gray-600 text-sm">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="text-red-600 font-medium hover:underline transition-colors duration-200"
                    >
                      Sign in
                    </Link>
                  </p>
                </motion.div>
              </motion.form>
            </CardContent>
          </Card>

          {/* Footer text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.5 }}
            className="text-center text-gray-600 text-xs mt-4"
          >
            Secure authentication
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUpPage;
