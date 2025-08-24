"use client";
import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { auth, db } from "../../../firebaseConfig";
import {
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  User,
  BookOpen,
  Users,
  Shield,
  Eye,
  EyeOff,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import AuthLoadingSpinner from "@/components/AuthLoadingSpinner";

const LoginPage = () => {
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const { user, userRole, loading: authLoading } = useAuth();

  // Helper function to find user by email across all collections
  const findUserByEmail = async (userEmail: string) => {
    try {
      // First, try to find in standard role-based collections
      const roles = ["student", "trainer", "admin"];
      for (const role of roles) {
        const roleCollectionRef = collection(db, `${role}s`);
        const q = query(roleCollectionRef, where("email", "==", userEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          return {
            data: userDoc.data(),
            ref: userDoc.ref,
            collection: `${role}s`,
            role: role,
          };
        }
      }

      const collections = ["registrations", "renewals"]; // Add other collection names as needed

      for (const collectionName of collections) {
        const collectionRef = collection(db, collectionName);
        const q = query(collectionRef, where("email", "==", userEmail));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          return {
            data: userData,
            ref: userDoc.ref,
            collection: collectionName,
            role: userData.role || null,
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  };

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
    }
  }, [user, userRole, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!selectedRole) {
      setError("Please select a role");
      toast.error("Please select a role");
      setIsLoading(false);
      return;
    }

    try {
      console.log(`Attempting login with role: ${selectedRole}`);
      console.log(
        `Attempting to sign in with email: ${email} and role: ${selectedRole}`
      );

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log(`User authenticated with ID: ${user.uid}`);

      // Find user by email across all collections
      const userInfo = await findUserByEmail(email);

      if (!userInfo) {
        await signOut(auth);
        toast.error("User not found in the system. Please contact admin.");
        setIsLoading(false);
        return;
      }

      // Check if user's role matches selected role
      if (userInfo.role !== selectedRole) {
        await signOut(auth);
        toast.error(
          `Access denied. You are registered as ${userInfo.role}, not ${selectedRole}.`
        );
        setIsLoading(false);
        return;
      }

      // Check other roles to ensure exclusivity (optional, based on your business logic)
      const roles = ["student", "trainer", "admin"];
      const otherRoles = roles.filter((role) => role !== selectedRole);

      for (const role of otherRoles) {
        const roleCollectionRef = collection(db, `${role}s`);
        const q = query(roleCollectionRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          await signOut(auth);
          toast.error(
            "Access denied. You can only log in with your assigned role."
          );
          setIsLoading(false);
          return;
        }
      }

      // Update last login time
      try {
        await setDoc(
          userInfo.ref,
          { lastLogin: serverTimestamp() },
          { merge: true }
        );
      } catch (updateError) {
        console.log("Could not update last login time:", updateError);
        // Continue with login even if update fails
      }

      // Store role in localStorage
      localStorage.setItem("userRole", selectedRole);
      console.log(`Login successful, redirecting to ${selectedRole}-dashboard`);

      // Show success message
      toast.success(
        `Welcome back! Redirecting to ${selectedRole} dashboard...`
      );

      // Redirect based on role
      switch (selectedRole) {
        case "student":
          router.push("/student-dashboard");
          break;
        case "trainer":
          router.push("/trainer-dashboard");
          break;
        case "admin":
          router.push("/admin-dashboard");
          break;
        default:
          toast.error("Invalid role selected");
      }
    } catch (error: unknown) {
      console.error("Login error:", error);
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/invalid-credential":
            setError(
              "Invalid email or password. Please check your credentials."
            );
            toast.error(
              "Invalid email or password. Please check your credentials."
            );
            break;
          case "auth/user-not-found":
            setError(
              "No account exists with this email. Please register first."
            );
            toast.error(
              "No account exists with this email. Please register first."
            );
            break;
          case "auth/wrong-password":
            setError("Incorrect password. Please try again.");
            toast.error("Incorrect password. Please try again.");
            break;
          case "auth/invalid-email":
            setError("Invalid email format. Please enter a valid email.");
            toast.error("Invalid email format. Please enter a valid email.");
            break;
          case "auth/too-many-requests":
            setError("Too many failed attempts. Please try again later.");
            toast.error("Too many failed attempts. Please try again later.");
            break;
          case "auth/network-request-failed":
            setError("Network error. Please check your connection.");
            toast.error("Network error. Please check your connection.");
            break;
          default:
            setError(error.message || "Failed to login");
            toast.error(error.message || "Failed to login");
        }
      } else {
        setError("Failed to login. Please try again.");
        toast.error("Failed to login. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "student":
        return <BookOpen className="h-4 w-4 text-red-600" />;
      case "trainer":
        return <Users className="h-4 w-4 text-red-700" />;
      case "admin":
        return <Shield className="h-4 w-4 text-red-800" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

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
    {
      value: "admin",
      label: "Administrator",
      icon: Shield,
      description: "Full system administration access",
      color: "text-red-800",
    },
  ];

  const handleRoleSelect = (roleValue: string) => {
    setSelectedRole(roleValue);
    setIsDropdownOpen(false);
  };

  const getSelectedRole = () => {
    return roleOptions.find((role) => role.value === selectedRole);
  };

  // Show loading indicator while checking auth status
  if (authLoading) {
    return <AuthLoadingSpinner />;
  }

  // Only render login form after auth check is complete
  return (
    <div className="min-h-screen bg-white relative overflow-hidden mt-10">
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
                    src="/assets/logo.png"
                    alt="Logo"
                    width={120}
                    height={120}
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

            <CardContent className="px-6 pb-6">
              <motion.form
                onSubmit={handleLogin}
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                {/* Existing user section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-red-700" />
                    <h3 className="text-gray-800 text-md font-semibold">
                      Existing User Login
                    </h3>
                  </div>

                  {/* Custom Role Selection Dropdown */}
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
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`relative group cursor-pointer`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-red-100 rounded-xl blur opacity-0 group-hover:opacity-50 transition-all duration-300"></div>
                        <div
                          className={`relative flex items-center w-full pl-10 pr-10 py-3 bg-white border-2 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md font-medium ${
                            isDropdownOpen
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
                              rotate: isDropdownOpen ? 180 : 0,
                              scale: isDropdownOpen ? 1.1 : 1,
                            }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="absolute right-3"
                          >
                            <ChevronDown
                              className={`h-4 w-4 transition-colors duration-300 ${
                                isDropdownOpen
                                  ? "text-red-600"
                                  : selectedRole
                                    ? "text-red-600"
                                    : "text-gray-400"
                              }`}
                            />
                          </motion.div>
                        </div>

                        {/* Selection indicator */}
                        {selectedRole && !isDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-red-600 to-red-700 rounded-full"
                          />
                        )}
                      </div>

                      {/* Dropdown Menu */}
                      {isDropdownOpen && (
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
                    {selectedRole && !isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-xs text-gray-600 pl-1"
                      >
                        {getSelectedRole()?.description}
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Email input */}
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
                      Email Address
                    </Label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gray-200 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                      <div className="relative flex items-center">
                        <Mail className="absolute left-3 h-4 w-4 text-gray-400 z-10" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="pl-10 pr-3 py-2.5 text-sm bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:bg-gray-100 focus:border-gray-400 focus:ring-2 focus:ring-gray-400 transition-all duration-300"
                        />
                      </div>
                    </div>
                  </motion.div>

                  {/* Password input */}
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
                      Password
                    </Label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gray-200 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                      <div className="relative flex items-center">
                        <Lock className="absolute left-3 h-4 w-4 text-gray-400 z-10" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          placeholder="Enter your password"
                          className="pl-10 pr-10 py-2.5 text-sm bg-white border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:bg-gray-100 focus:border-gray-400 focus:ring-2 focus:ring-gray-400 transition-all duration-300"
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
                  </motion.div>
                </div>

                {/* Error message */}
                {error && (
                  <motion.div
                    className="text-red-600 text-sm text-center bg-red-100 py-2 rounded-xl border border-red-300"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {error}
                  </motion.div>
                )}

                {/* Sign in button */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.0, duration: 0.5 }}
                >
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full h-11 rounded-xl text-md font-semibold bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] hover:from-red-700 hover:to-red-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      disabled={isLoading}
                    >
                      {isLoading ? (
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
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <User className="h-4 w-4" />
                          Sign In
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.form>
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
};

export default LoginPage;
