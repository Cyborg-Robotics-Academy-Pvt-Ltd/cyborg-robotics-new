"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import Link from "next/link";
import AuthLoadingSpinner from "@/components/AuthLoadingSpinner";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email) {
      setError("Please enter your email address");
      toast.error("Please enter your email address");
      setIsLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setIsSuccess(true);
      toast.success("Password reset email sent! Please check your inbox.");
    } catch (error: any) {
      console.error("Password reset error:", error);
      let errorMessage =
        "Failed to send password reset email. Please try again.";

      switch (error.code) {
        case "auth/invalid-email":
          errorMessage = "Invalid email address.";
          break;
        case "auth/user-not-found":
          errorMessage = "No account found with this email address.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many requests. Please try again later.";
          break;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden mt-12">
        <div className="absolute inset-0">
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
            className="absolute top-1/4 left-1/4 w-64 h-64"
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
            className="absolute bottom-1/4 right-1/4 w-80 h-80"
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
              <div className="h-[4px] bg-gradient-to-r from-red-700 to-red-800"></div>

              <CardHeader className="space-y-2 pb-2 pt-3 px-5">
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

              <CardContent className="px-5 pb-5">
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  <div className="text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                      </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800">
                      Check Your Email
                    </h2>
                    <p className="text-gray-600">
                      We've sent a password reset link to{" "}
                      <span className="font-semibold">{email}</span>. Please
                      check your inbox and follow the instructions to reset your
                      password.
                    </p>

                    <div className="pt-4">
                      <Button
                        onClick={() => router.push("/login")}
                        className="w-full h-11 rounded-xl text-md font-semibold bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] hover:from-red-700 hover:to-red-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
                      >
                        Back to Login
                      </Button>
                    </div>

                    <p className="text-sm text-gray-500 mt-4">
                      Didn't receive the email? Check your spam folder or{" "}
                      <button
                        onClick={() => setIsSuccess(false)}
                        className="text-red-600 font-medium hover:underline"
                      >
                        try again
                      </button>
                    </p>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden mt-12">
      <div className="absolute inset-0">
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
          className="absolute top-1/4 left-1/4 w-64 h-64"
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
          className="absolute bottom-1/4 right-1/4 w-80 h-80"
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
            <div className="h-[4px] bg-gradient-to-r from-red-700 to-red-800"></div>

            <CardHeader className="space-y-2 pb-2 pt-3 px-5">
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

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-center space-y-2"
              >
                <h2 className="text-gray-800 text-lg font-semibold">
                  Reset Your Password
                </h2>
                <p className="text-gray-600 text-sm">
                  Enter your email address and we'll send you a link to reset
                  your password.
                </p>
              </motion.div>
            </CardHeader>

            <CardContent className="px-5 pb-5">
              <motion.form
                onSubmit={handleResetPassword}
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <div className="space-y-2">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
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
                          className="pl-10 pr-3 py-2 text-sm bg-white rounded-xl text-gray-800 placeholder-gray-400 focus:bg-gray-100 focus:ring-2 focus:ring-gray-400 transition-all duration-300 border-0"
                        />
                      </div>
                    </div>
                  </motion.div>
                </div>

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

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
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
                          <span>Sending...</span>
                        </div>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Mail className="h-4 w-4" />
                          Send Reset Link
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                  className="text-center pt-2"
                >
                  <Link
                    href="/login"
                    className="text-red-600 font-medium hover:underline transition-colors duration-200"
                  >
                    Back to Login
                  </Link>
                </motion.div>
              </motion.form>
            </CardContent>
          </Card>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="text-center text-gray-600 text-xs mt-4"
          >
            Secure authentication
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
