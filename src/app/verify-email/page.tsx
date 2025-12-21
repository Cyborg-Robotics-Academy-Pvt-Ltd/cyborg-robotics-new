"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, RefreshCw, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, reload } from "firebase/auth";

const VerifyEmailContent = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get email from URL params
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    } else {
      router.push("/signup");
    }
  }, [searchParams, router]);

  // Check email verification status
  useEffect(() => {
    if (!email) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Reload user to get latest email verification status
        try {
          await reload(user);
          if (user.emailVerified) {
            setIsVerified(true);
            toast.success("Email verified successfully!");

            // Get user role from localStorage
            const userRole = localStorage.getItem("userRole");

            // Wait a moment then redirect to home page
            setTimeout(() => {
              router.push("/");
            }, 3000);
          }
        } catch (err) {
          console.error("Error reloading user:", err);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [email, router]);

  const handleCheckVerification = async () => {
    setIsLoading(true);
    setError("");

    try {
      const user = auth.currentUser;
      if (user) {
        await reload(user);
        if (user.emailVerified) {
          setIsVerified(true);
          toast.success("Email verified successfully!");

          // Get user role from localStorage
          const userRole = localStorage.getItem("userRole");

          // Wait a moment then redirect to home page
          setTimeout(() => {
            router.push("/");
          }, 10000);
        } else {
          setError(
            "Email not verified yet. Please check your inbox and click the verification link."
          );
          toast.error("Email not verified yet. Please check your inbox.");
        }
      }
    } catch (err) {
      console.error("Error checking verification status:", err);
      setError("Failed to check verification status. Please try again.");
      toast.error("Failed to check verification status.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Verification email resent! Please check your inbox.");
      } else {
        throw new Error(data.error || "Failed to resend verification email");
      }
    } catch (err) {
      console.error("Error resending email:", err);
      setError("Failed to resend verification email.");
      toast.error("Failed to resend verification email.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
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
                    Email Verified Successfully!
                  </h2>
                </motion.div>
              </CardHeader>

              <CardContent className="px-5 pb-5">
                <motion.div
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  <div className="space-y-2">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                      className="space-y-3"
                    >
                      <div className="flex justify-center">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                      </div>

                      <div className="text-center py-4">
                        <p className="text-gray-600 mb-4">
                          Congratulations! Your email{" "}
                          <span className="font-semibold">{email}</span> has
                          been verified successfully.
                        </p>

                        <div className="bg-green-50 border border-green-200 p-4 rounded-xl mb-6">
                          <p className="text-green-700">
                            Cyborg will review your account then you will be
                            able to see your dashboard.
                          </p>
                        </div>

                        <p className="text-gray-500 text-sm">
                          If you are not redirected automatically,{" "}
                          <Link
                            href="/"
                            className="text-red-600 hover:underline"
                          >
                            click here to go to home page
                          </Link>
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
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
                  Verify Your Email
                </h2>
                <p className="text-gray-600 text-sm">
                  We've sent a verification link to{" "}
                  <span className="font-semibold">{email}</span>. Please check
                  your inbox and click the link to verify your email address.
                </p>
              </motion.div>
            </CardHeader>

            <CardContent className="px-5 pb-5">
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <div className="space-y-2">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="space-y-3"
                  >
                    {isLoading ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4 text-gray-600">
                          Checking verification status...
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-6">
                          <p className="text-yellow-700">
                            <strong>Didn't receive the email?</strong> Check
                            your spam folder or click the button below to check
                            verification status.
                          </p>
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

                        <div className="grid grid-cols-1 gap-3">
                          <Button
                            onClick={handleCheckVerification}
                            className="w-full h-11 rounded-xl text-md font-semibold bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] hover:from-red-700 hover:to-red-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
                          >
                            <span className="flex items-center justify-center gap-2">
                              <RefreshCw className="h-4 w-4" />
                              Check Verification Status
                            </span>
                          </Button>

                          <Button
                            variant="outline"
                            onClick={handleResendEmail}
                            className="w-full h-11 rounded-xl text-md font-semibold border-red-600 text-red-600 hover:bg-red-50 shadow-xl transition-all duration-300"
                          >
                            <span className="flex items-center justify-center gap-2">
                              <Mail className="h-4 w-4" />
                              Resend Verification Email
                            </span>
                          </Button>
                        </div>
                      </>
                    )}
                  </motion.div>
                </div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                  className="text-center pt-2"
                >
                  <Link
                    href="/"
                    className="text-red-600 font-medium hover:underline transition-colors duration-200"
                  >
                    Already verified? Go to home page
                  </Link>
                </motion.div>
              </motion.div>
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
