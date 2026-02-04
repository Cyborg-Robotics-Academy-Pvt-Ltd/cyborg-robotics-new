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
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  ChevronDown,
  BookOpen,
  Users,
  Shield,
  MapPin,
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
    role: "student", // Default role
    center: "", // Center selection for students
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingExisting, setIsCheckingExisting] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Password strength validation state
  const isLowercasePresent = /(?=.*[a-z])/.test(formData.password);
  const isUppercasePresent = /(?=.*[A-Z])/.test(formData.password);
  const isNumberPresent = /(?=.*[0-9])/.test(formData.password);
  const isSpecialCharPresent =
    /(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(formData.password);
  const isLengthValid = formData.password.length >= 8;

  // Role selection state
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("student");
  const [selectedCenter, setSelectedCenter] = useState("");

  // Role options for dropdown
  const roleOptions = [
    {
      value: "student",
      label: "Student",
      icon: BookOpen,
      description: "Access student dashboard and course materials",
      color: "text-red-600",
    },
    {
      value: "trainer",
      label: "Trainer",
      icon: Users,
      description: "Manage courses and student progress",
      color: "text-red-700",
    },
  ];

  // Handle role selection
  const handleRoleSelect = (roleValue: string) => {
    setSelectedRole(roleValue);
    setIsRoleDropdownOpen(false);
    // Update form data
    setFormData((prev) => ({
      ...prev,
      role: roleValue,
    }));
  };

  const getSelectedRole = () => {
    return roleOptions.find((role) => role.value === selectedRole);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "student":
        return <BookOpen className="h-4 w-4 text-red-600" />;
      case "trainer":
        return <Users className="h-4 w-4 text-red-700" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  // Password strength indicator function
  const renderPasswordStrength = () => {
    const strengthConditions = [
      isLowercasePresent,
      isUppercasePresent,
      isNumberPresent,
      isSpecialCharPresent,
      isLengthValid,
    ];

    const fulfilledConditions = strengthConditions.filter(Boolean).length;
    let strengthLabel = "Very Weak";
    let strengthColor = "bg-red-500";

    if (fulfilledConditions === 0) {
      strengthLabel = "Very Weak";
      strengthColor = "bg-red-500";
    } else if (fulfilledConditions === 1) {
      strengthLabel = "Weak";
      strengthColor = "bg-red-500";
    } else if (fulfilledConditions === 2) {
      strengthLabel = "Fair";
      strengthColor = "bg-yellow-500";
    } else if (fulfilledConditions === 3) {
      strengthLabel = "Good";
      strengthColor = "bg-blue-500";
    } else if (fulfilledConditions === 4) {
      strengthLabel = "Strong";
      strengthColor = "bg-blue-500";
    } else if (fulfilledConditions === 5) {
      strengthLabel = "Very Strong";
      strengthColor = "bg-green-500";
    }

    return (
      <div className="flex items-center gap-2">
        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden flex">
          {[1, 2, 3, 4, 5].map((index) => (
            <div
              key={index}
              className={`h-full ${index <= fulfilledConditions ? strengthColor : "bg-gray-200"}`}
              style={{ width: "20%" }}
            />
          ))}
        </div>
        <span
          className={`text-xs font-medium ${strengthColor.replace("bg-", "text-")}`}
        >
          {strengthLabel}
        </span>
      </div>
    );
  };

  // Check if user already exists with the given email
  const checkExistingUser = async (email: string) => {
    try {
      // Check in standard role-based collections
      const roles = ["student", "trainer", "admin"];
      for (const role of roles) {
        const roleCollectionRef = collection(db, `${role}s`);
        const q = query(roleCollectionRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          return true; // User exists
        }
      }

      // Check in other collections if needed
      const collections = ["registrations", "renewals"];
      for (const collectionName of collections) {
        const collectionRef = collection(db, collectionName);
        const q = query(collectionRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          return true; // User exists
        }
      }

      return false; // User does not exist
    } catch (error) {
      console.error("Error checking existing user:", error);
      return false; // Assume user doesn't exist if there's an error
    }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (authLoading) return;

    if (user && userRole && user.emailVerified) {
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
    } else if (user && !user.emailVerified) {
      // User is signed in but email not verified, redirect to verify email page
      router.push(
        `/verify-email?email=${encodeURIComponent(user.email || "")}`
      );
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

        // If student is pending approval, show pending approval message
        if (data.status === "pending") {
          // We'll handle this in the render condition
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
    } else if (/\d/.test(formData.fullName)) {
      newErrors.fullName = "Full name cannot contain numbers";
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
    } else {
      // Check password strength
      if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters long";
      } else if (!/(?=.*[a-z])/.test(formData.password)) {
        newErrors.password =
          "Password must contain at least one lowercase letter";
      } else if (!/(?=.*[A-Z])/.test(formData.password)) {
        newErrors.password =
          "Password must contain at least one uppercase letter";
      } else if (!/(?=.*[0-9])/.test(formData.password)) {
        newErrors.password = "Password must contain at least one number";
      } else if (
        !/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(formData.password)
      ) {
        newErrors.password =
          "Password must contain at least one special character";
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Center validation for students
    if (formData.role === "student" && !formData.center.trim()) {
      newErrors.center = "Please select a center";
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
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (newErrors[name]) {
        delete newErrors[name];
      }

      // Validate confirm password in real-time when either password field changes
      if (name === "password" || name === "confirmPassword") {
        if (name === "confirmPassword" && value !== formData.password) {
          newErrors.confirmPassword = "Passwords do not match";
        } else if (
          name === "password" &&
          formData.confirmPassword &&
          value !== formData.confirmPassword
        ) {
          newErrors.confirmPassword = "Passwords do not match";
        } else if (
          name === "password" &&
          formData.confirmPassword &&
          value === formData.confirmPassword &&
          newErrors.confirmPassword?.includes("match")
        ) {
          delete newErrors.confirmPassword; // Clear the mismatch error if passwords now match
        }
      }

      return newErrors;
    });
  };

  // Handle center selection
  const handleCenterSelect = (centerValue: string) => {
    setFormData((prev) => ({
      ...prev,
      center: centerValue,
    }));
    setSelectedCenter(centerValue);
    // Clear center error
    if (errors.center) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.center;
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

    setIsCheckingExisting(true);
    const userExists = await checkExistingUser(formData.email);
    setIsCheckingExisting(false);

    if (userExists) {
      toast.error(
        "An account with this email already exists. Please sign in instead."
      );
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

      // Create user document in Firestore with explicit role and pending status
      const userData = {
        uid: user.uid,
        email: formData.email,
        fullName: formData.fullName,
        createdAt: new Date(),
        lastLogin: new Date(),
        status: "pending", // Set status to pending for admin approval
        role: formData.role, // Use selected role
        center: formData.center || null, // Add center information for students
      };

      // Save to appropriate collection based on role
      const collectionName = `${formData.role}s`; // students, trainers
      await setDoc(doc(db, collectionName, user.uid), userData);

      // Send email verification
      await sendEmailVerification(user);

      // Store role in localStorage
      localStorage.setItem("userRole", formData.role);

      toast.success(
        "Account created successfully! Please check your email for verification."
      );

      // Set pending approval state instead of redirecting
      setShowPendingApproval(true);
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

  // If user just signed up and is pending approval, show pending approval message
  const [showPendingApproval, setShowPendingApproval] = useState(false);

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

  // If user just signed up and is pending approval, show pending approval message
  if (studentData && studentData.status === "pending") {
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
                      <Shield className="h-4 w-4 text-blue-600" />
                      <h3 className="text-gray-800 text-md font-semibold">
                        Account Pending Approval
                      </h3>
                    </div>

                    <div className="text-center py-4">
                      <p className="text-gray-600 mb-4">
                        Welcome, {studentData.fullName}! Your account has been
                        created successfully and is pending admin approval.
                      </p>

                      <div className="bg-blue-50 border border-blue-200 p-4 mb-6 text-left rounded-xl">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <Shield className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-blue-700">
                              <strong>Next Steps:</strong> Our admin team will
                              review your account and approve your{" "}
                              {studentData.role} access shortly. You will
                              receive an email notification once approved.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
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

  // If user just signed up and is pending approval, show pending approval message
  if (showPendingApproval) {
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
                      <Shield className="h-4 w-4 text-blue-600" />
                      <h3 className="text-gray-800 text-md font-semibold">
                        Account Pending Approval
                      </h3>
                    </div>

                    <div className="text-center py-4">
                      <p className="text-gray-600 mb-4">
                        Welcome! Your account has been created successfully and
                        is pending admin approval.
                      </p>

                      <div className="bg-blue-50 border border-blue-200 p-4 mb-6 text-left rounded-xl">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <Shield className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-blue-700">
                              <strong>Next Steps:</strong> Our admin team will
                              review your account and approve your access
                              shortly. You will receive an email notification
                              once approved.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
                      Sign Up
                    </h3>
                  </div>

                  {/* Role Selection */}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="space-y-1"
                  >
                    <Label className="text-gray-600 text-sm font-medium">
                      Select your role:
                    </Label>

                    <div className="relative">
                      {/* Dropdown Trigger */}
                      <div
                        onClick={() =>
                          setIsRoleDropdownOpen(!isRoleDropdownOpen)
                        }
                        className={`relative group cursor-pointer`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-red-100 rounded-xl blur opacity-0 group-hover:opacity-50 transition-all duration-300"></div>
                        <div
                          className={`relative flex items-center w-full pl-10 pr-10 py-2.5 bg-white border-2 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md font-medium ${
                            isRoleDropdownOpen
                              ? "border-red-400 ring-2 ring-red-200 bg-red-50"
                              : selectedRole
                                ? "border-red-200 text-gray-800"
                                : "border-gray-300 text-gray-500"
                          }`}
                        >
                          {/* Role icon */}
                          <div className="absolute left-3 z-10">
                            {selectedRole ? (
                              getRoleIcon(selectedRole)
                            ) : (
                              <User className="h-4 w-4 text-gray-400" />
                            )}
                          </div>

                          {/* Selected role display */}
                          <div className="flex-1 text-left text-sm">
                            {selectedRole ? (
                              <span className="flex items-center gap-2 text-gray-800">
                                <span>{getSelectedRole()?.label}</span>
                              </span>
                            ) : (
                              <span className="text-gray-500">
                                Choose your role
                              </span>
                            )}
                          </div>

                          {/* Enhanced chevron with animation */}
                          <motion.div
                            animate={{
                              rotate: isRoleDropdownOpen ? 180 : 0,
                              scale: isRoleDropdownOpen ? 1.1 : 1,
                            }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="absolute right-3"
                          >
                            <ChevronDown
                              className={`h-4 w-4 transition-colors duration-300 ${
                                isRoleDropdownOpen
                                  ? "text-red-600"
                                  : selectedRole
                                    ? "text-red-600"
                                    : "text-gray-400"
                              }`}
                            />
                          </motion.div>
                        </div>

                        {/* Selection indicator */}
                        {selectedRole && !isRoleDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 to-red-700 rounded-full"
                          />
                        )}
                      </div>

                      {/* Dropdown Menu */}
                      {isRoleDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="absolute top-full mt-1 w-full bg-white border-2 border-red-200 rounded-xl shadow-xl z-50 overflow-hidden"
                        >
                          {roleOptions.map((role, index) => (
                            <motion.div
                              key={role.value}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                delay: index * 0.05,
                                duration: 0.2,
                              }}
                              onClick={() => handleRoleSelect(role.value)}
                              className={`flex items-center justify-center gap-3 px-3 py-3 cursor-pointer transition-all duration-200 hover:bg-red-50 hover:border-l-4 hover:border-l-red-500 ${
                                selectedRole === role.value
                                  ? "bg-red-50 border-l-4 border-l-red-600"
                                  : ""
                              } ${index !== roleOptions.length - 1 ? "border-b border-gray-100" : ""}`}
                            >
                              {/* Role Icon */}
                              <div className="flex-shrink-0">
                                <role.icon
                                  className={`h-4 w-4 ${role.color}`}
                                />
                              </div>

                              {/* Role Info */}
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm text-gray-800">
                                    {role.label}
                                  </span>
                                  {selectedRole === role.value && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      className="ml-auto"
                                    >
                                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div>
                                    </motion.div>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {role.description}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </div>

                    {/* Role description for selected item */}
                    {selectedRole && !isRoleDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-xs text-gray-600 pl-1"
                      >
                        {getSelectedRole()?.description}
                      </motion.div>
                    )}

                    {/* Center Selection - Only for students */}
                    {selectedRole === "student" && (
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.75, duration: 0.5 }}
                        className="space-y-1 mt-4"
                      >
                        <Label className="text-gray-600 text-sm font-medium">
                          Select Center <span className="text-red-500">*</span>
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            {
                              value: "KALYANI NAGAR",
                              label: "Kalyani Nagar",
                              code: "KN",
                              icon: MapPin,
                            },
                            {
                              value: "VIMAN NAGAR",
                              label: "Viman Nagar",
                              code: "VN",
                              icon: MapPin,
                            },
                          ].map((center) => (
                            <motion.div
                              key={center.value}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleCenterSelect(center.value)}
                              className={`p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 cursor-pointer ${
                                selectedCenter === center.value
                                  ? "border-red-600 bg-red-50 text-red-700"
                                  : "border-gray-200 hover:border-red-300 hover:bg-red-50"
                              }`}
                            >
                              <center.icon className="h-6 w-6" />
                              <span className="text-sm font-medium">
                                {center.label}
                              </span>
                              <span className="text-xs text-gray-500">
                                {center.code}
                              </span>
                            </motion.div>
                          ))}
                        </div>
                        {errors.center && (
                          <motion.div
                            className="text-red-600 text-sm bg-red-100 py-2 rounded-xl border border-red-300 px-3"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            {errors.center}
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>

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
                          required
                          className={`pl-10 pr-3 py-2 text-sm bg-white rounded-xl text-gray-800 placeholder-gray-400 focus:bg-gray-100 focus:ring-2 focus:ring-gray-400 transition-all duration-300 border-0 ${errors.fullName ? "border-red-500" : ""}`}
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
                          required
                          className={`pl-10 pr-3 py-2 text-sm bg-white rounded-xl text-gray-800 placeholder-gray-400 focus:bg-gray-100 focus:ring-2 focus:ring-gray-400 transition-all duration-300 border-0 ${errors.email ? "border-red-500" : ""}`}
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
                          required
                          className={`pl-10 pr-10 py-2 text-sm bg-white rounded-xl text-gray-800 placeholder-gray-400 focus:bg-gray-100 focus:ring-2 focus:ring-gray-400 transition-all duration-300 border-0 ${errors.password ? "border-red-500" : ""}`}
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
                    {/* Password Strength Indicator */}
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">
                          Password strength:
                        </span>
                        {renderPasswordStrength()}
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        {!isLowercasePresent && (
                          <motion.p
                            className="text-gray-400"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                          >
                            • Lowercase letter ✗
                          </motion.p>
                        )}
                        {!isUppercasePresent && (
                          <motion.p
                            className="text-gray-400"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                          >
                            • Uppercase letter ✗
                          </motion.p>
                        )}
                        {!isNumberPresent && (
                          <motion.p
                            className="text-gray-400"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                          >
                            • Number ✗
                          </motion.p>
                        )}
                        {!isSpecialCharPresent && (
                          <motion.p
                            className="text-gray-400"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                          >
                            • Special character ✗
                          </motion.p>
                        )}
                        {!isLengthValid && (
                          <motion.p
                            className="text-gray-400"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                          >
                            • At least 8 characters ✗
                          </motion.p>
                        )}
                        {isLowercasePresent &&
                          isUppercasePresent &&
                          isNumberPresent &&
                          isSpecialCharPresent &&
                          isLengthValid && (
                            <motion.p
                              className="text-green-600"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              • All requirements met ✓
                            </motion.p>
                          )}
                      </div>
                    </div>
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
                          required
                          className={`pl-10 pr-10 py-2 text-sm bg-white rounded-xl text-gray-800 placeholder-gray-400 focus:bg-gray-100 focus:ring-2 focus:ring-gray-400 transition-all duration-300 border-0 ${errors.confirmPassword ? "border-red-500" : ""}`}
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
                      disabled={isSubmitting || isCheckingExisting}
                      className="w-full h-10 rounded-xl text-md font-semibold bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] hover:from-red-700 hover:to-red-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {isSubmitting || isCheckingExisting ? (
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
                          <span>
                            {isCheckingExisting
                              ? "Checking Account..."
                              : "Creating Account..."}
                          </span>
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
