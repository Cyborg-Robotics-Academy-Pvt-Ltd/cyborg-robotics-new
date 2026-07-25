"use client";
import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { auth, db } from "@/lib/firebase";
import {
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  limit,
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
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import AuthLoadingSpinner from "@/components/AuthLoadingSpinner";

type Role = "student" | "trainer" | "admin";
const VALID_ROLES: Role[] = ["student", "trainer", "admin"];

const ROLE_META: Record<
  Role,
  { label: string; icon: React.ElementType; color: string }
> = {
  student: { label: "Student", icon: BookOpen, color: "text-red-600" },
  trainer: { label: "Trainer", icon: Users, color: "text-red-700" },
  admin: { label: "Administrator", icon: Shield, color: "text-red-800" },
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, userRole, loading: authLoading } = useAuth();

  // Looks up a user document by email across role-based and intake collections.
  // NOTE: sequential scan across 5 collections per attempt — see migration note.
  const findUserByEmail = async (userEmail: string) => {
    try {
      for (const role of VALID_ROLES) {
        const roleCollectionRef = collection(db, `${role}s`);
        const q = query(
          roleCollectionRef,
          where("email", "==", userEmail),
          limit(1),
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const doc = snap.docs[0];
          return {
            data: doc.data(),
            ref: doc.ref,
            collection: `${role}s`,
            role,
          };
        }
      }

      const fallbackCollections = ["registrations", "renewals"];
      for (const collectionName of fallbackCollections) {
        const collectionRef = collection(db, collectionName);
        const q = query(
          collectionRef,
          where("email", "==", userEmail),
          limit(1),
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const doc = snap.docs[0];
          const data = doc.data();
          return {
            data,
            ref: doc.ref,
            collection: collectionName,
            role: data.role as string | undefined,
          };
        }
      }

      return null;
    } catch (err) {
      console.error("Error finding user by email:", err);
      return null;
    }
  };

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

  const redirectForRole = (role: Role) => {
    setTimeout(() => {
      switch (role) {
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
    }, 300);
  };

  const isValidRole = (role: unknown): role is Role =>
    typeof role === "string" && (VALID_ROLES as string[]).includes(role);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // STEP 1: Look up the account by email — role is derived, not selected.
      const userInfo = await findUserByEmail(email);

      if (!userInfo) {
        const msg = "User not found in the system. Please register first.";
        setError(msg);
        toast.error(msg);
        setIsLoading(false);
        return;
      }

      // STEP 2: Resolve + validate the role that was found.
      if (!isValidRole(userInfo.role)) {
        const msg =
          "Your account role isn't configured correctly. Please contact Cyborg Team.";
        setError(msg);
        toast.error(msg);
        setIsLoading(false);
        return;
      }
      const resolvedRole = userInfo.role;

      // STEP 3: Account status checks
      if (userInfo.data.status === "pending") {
        const msg =
          "Your account is pending admin approval. Please contact Cyborg Team.";
        setError(msg);
        toast.error(msg);
        setIsLoading(false);
        return;
      }
      if (userInfo.data.status === "inactive") {
        const msg =
          "Your account access has been revoked. Please contact Cyborg Team.";
        setError(msg);
        toast.error(msg);
        setIsLoading(false);
        return;
      }

      // STEP 4: Firebase auth
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (authError: unknown) {
        if (authError instanceof FirebaseError) {
          if (
            authError.code === "auth/invalid-credential" ||
            authError.code === "auth/wrong-password"
          ) {
            const msg =
              "Invalid email or password. Please check your credentials.";
            setError(msg);
            toast.error(msg);
          } else if (authError.code === "auth/too-many-requests") {
            const msg = "Too many failed attempts. Please try again later.";
            setError(msg);
            toast.error(msg);
          } else if (authError.code === "auth/network-request-failed") {
            const msg = "Network error. Please check your connection.";
            setError(msg);
            toast.error(msg);
          } else {
            setError(authError.message || "Authentication failed.");
            toast.error(authError.message || "Authentication failed.");
          }
        } else {
          setError("Failed to login. Please try again.");
          toast.error("Failed to login. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      // STEP 5: Update last login (non-blocking on failure)
      try {
        await setDoc(
          userInfo.ref,
          { lastLogin: serverTimestamp() },
          { merge: true },
        );
      } catch (updateError) {
        console.error("Could not update last login time:", updateError);
      }

      // STEP 6: Persist role for client-side UX only (not an auth boundary)
      localStorage.setItem("userRole", resolvedRole);

      const RoleIcon = ROLE_META[resolvedRole].icon;
      toast.success(
        `Welcome back! Redirecting to your ${ROLE_META[resolvedRole].label} dashboard...`,
      );

      redirectForRole(resolvedRole);
    } catch (err: unknown) {
      console.error("Login error:", err);
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to login. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return <AuthLoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden ">
      <div className="absolute inset-0 ">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-64 h-64   "
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 "
        />
      </div>

      <div className="relative z-10 flex min-h-screen">
        <div className="hidden md:flex md:w-1/2 lg:w-2/5 flex-col items-center justify-center p-8 bg-gradient-to-br from-red-50 to-white">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <Link href="/" className="relative cursor-pointer">
              <Image
                src="/assets/Cyborg-logo.png"
                alt="Cyborg Robotics Logo"
                width={200}
                height={200}
                className="relative z-10 mx-auto hover:scale-105 transition-transform duration-300"
              />
            </Link>
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-10"
          >
            <Image
              src="/assets/login-illustration.png"
              alt="Robotics Education Illustration"
              width={450}
              height={450}
              className="mx-auto "
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center space-y-2 w-full max-w-sm"
          >
            <h2 className="text-gray-800 text-xl font-semibold">
              Welcome Back!
            </h2>
            <p className="text-gray-600 text-sm">
              Sign in to access your account and continue your learning journey
            </p>
          </motion.div>
        </div>

        <div className="w-full md:w-1/2 lg:w-3/5 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            <Card className="bg-gradient-to-br from-white to-red-50 border border-red-100 shadow-xl overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-red-600 via-red-700 to-red-800"></div>

              <CardHeader className="space-y-2 pb-2 pt-4 px-6">
                <div className="md:hidden flex justify-center mb-2">
                  <Image
                    src="/assets/Cyborg-logo.png"
                    alt="Cyborg Robotics Logo"
                    width={120}
                    height={120}
                    className="mx-auto"
                  />
                </div>
              </CardHeader>

              <CardContent className="px-5 pb-5">
                <motion.form
                  onSubmit={handleLogin}
                  className="space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  <div className="space-y-4">
                    <div className="text-center">
                      <h2 className="text-gray-800 text-lg font-semibold mb-3">
                        Registration
                      </h2>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <motion.div
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Link
                            href="/registration"
                            className="inline-block px-5 py-2.5 bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] text-white text-sm font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:from-red-700 hover:to-red-800"
                          >
                            New Registration
                          </Link>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Link
                            href="/registration/renewal"
                            className="inline-block px-5 py-2.5 bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] text-white text-sm font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:from-red-700 hover:to-red-800"
                          >
                            Renewal
                          </Link>
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  {/* Existing user section — role selection removed; role is auto-resolved from the account on submit */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-red-700" />
                      <h3 className="text-gray-800 text-md font-semibold">
                        Existing User Login
                      </h3>
                    </div>

                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                      className="space-y-1"
                    >
                      <Label
                        htmlFor="email"
                        className="text-gray-700 text-sm font-medium"
                      >
                        Email Address
                      </Label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-100 to-red-200 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                        <div className="relative flex items-center">
                          <Mail className="absolute left-3 h-4 w-4 text-red-600 z-10" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="pl-10 pr-3 py-3 text-sm bg-white rounded-xl text-gray-800 placeholder-gray-500 focus:bg-red-50 focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all duration-300 border border-red-200 shadow-sm"
                          />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.9, duration: 0.5 }}
                      className="space-y-1"
                    >
                      <Label
                        htmlFor="password"
                        className="text-gray-700 text-sm font-medium"
                      >
                        Password
                      </Label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-100 to-red-200 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                        <div className="relative flex items-center">
                          <Lock className="absolute left-3 h-4 w-4 text-red-600 z-10" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                            className="pl-10 pr-10 py-3 text-sm bg-white rounded-xl text-gray-800 placeholder-gray-500 focus:bg-red-50 focus:ring-2 focus:ring-red-300 focus:border-red-400 transition-all duration-300 border border-red-200 shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 h-4 w-4 text-gray-500 hover:text-red-600 transition-colors duration-200 z-10"
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

                  {error && (
                    <motion.div
                      className="text-red-700 text-sm text-center bg-red-50 py-3 rounded-xl border border-red-200 shadow-sm"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {error}
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.0, duration: 0.5 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        className="w-full h-12 rounded-xl text-md font-semibold bg-gradient-to-r from-red-700 via-red-800 to-red-900 hover:from-red-800 hover:to-red-900 text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                              className="rounded-full h-4 w-4 border-2 border-white border-t-transparent"
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

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.1, duration: 0.5 }}
                    className="text-center pt-3 space-y-2"
                  >
                    <p className="text-gray-700 text-sm">
                      <Link
                        href="/forgot-password"
                        className="text-red-700 font-medium hover:underline transition-colors duration-200 hover:text-red-800"
                      >
                        Forgot your password?
                      </Link>
                    </p>
                    <p className="text-gray-700 text-sm">
                      Don't have an account?{" "}
                      <Link
                        href="/signup"
                        className="text-red-700 font-medium hover:underline transition-colors duration-200 hover:text-red-800"
                      >
                        Sign up
                      </Link>
                    </p>
                  </motion.div>
                </motion.form>
              </CardContent>
            </Card>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="text-center text-gray-600 text-xs mt-4 hidden md:block"
            >
              Secure authentication
            </motion.p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
