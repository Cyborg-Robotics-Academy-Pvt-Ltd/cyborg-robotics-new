"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Shield } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const VerifyOTPContent = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get email from URL params
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    } else {
      router.push("/forgot-password");
    }
  }, [searchParams, router]);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, action: "generate" }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setTimer(300); // Reset timer to 5 minutes
        toast.success("New OTP sent to your email!");
      } else {
        setError(data.error || "Failed to resend OTP");
        toast.error(data.error || "Failed to resend OTP");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      setError("Failed to resend OTP. Please try again.");
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError("Please enter a 6-digit OTP");
      toast.error("Please enter a 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp, action: "verify" }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("OTP verified successfully!");
        // Redirect to reset password page with email and OTP token
        router.push(
          `/reset-password?email=${encodeURIComponent(email)}&token=${otp}`
        );
      } else {
        setError(data.message || "Invalid OTP. Please try again.");
        toast.error(data.message || "Invalid OTP. Please try again.");
        setOtp(""); // Clear OTP field
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("Failed to verify OTP. Please try again.");
      toast.error("Failed to verify OTP. Please try again.");
      setOtp(""); // Clear OTP field
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (value: string) => {
    setOtp(value);
    if (value.length === 6) {
      // Auto-submit when 6 digits are entered
      handleVerifyOTP();
    }
  };

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
                  We've sent a 6-digit code to{" "}
                  <span className="font-semibold">{email}</span>. Please enter
                  the code below to reset your password.
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
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={handleOTPChange}
                        disabled={isLoading}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
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

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        Expires in:{" "}
                        <span className="font-semibold text-red-600">
                          {formatTime(timer)}
                        </span>
                      </span>
                      <button
                        onClick={handleResendOTP}
                        disabled={isLoading || timer > 0}
                        className={`font-medium ${timer > 0 ? "text-gray-400 cursor-not-allowed" : "text-red-600 hover:underline"}`}
                      >
                        Resend OTP
                      </button>
                    </div>
                  </motion.div>
                </div>

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
                      onClick={handleVerifyOTP}
                      className="w-full h-11 rounded-xl text-md font-semibold bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] hover:from-red-700 hover:to-red-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      disabled={isLoading || otp.length !== 6}
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
                          <span>Verifying...</span>
                        </div>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Shield className="h-4 w-4" />
                          Verify OTP
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
                    href="/forgot-password"
                    className="text-red-600 font-medium hover:underline transition-colors duration-200"
                  >
                    Back to Forgot Password
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

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOTPContent />
    </Suspense>
  );
}
