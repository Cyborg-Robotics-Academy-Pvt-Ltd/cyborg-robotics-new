"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import {
  User,
  Mail,
  Shield,
  GraduationCap,
  UserCog,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import AuthLoadingSpinner from "@/components/AuthLoadingSpinner";

const CreateUserPage = () => {
  const router = useRouter();
  const { user, userRole, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student",
    status: "active",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Check if user is admin
  useEffect(() => {
    if (authLoading) return;

    if (!user || userRole !== "admin") {
      router.push("/login");
      return;
    }
  }, [user, userRole, authLoading, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Validate form data
      if (!formData.name.trim()) {
        setError("Name is required");
        setIsSubmitting(false);
        return;
      }

      if (!formData.email.trim()) {
        setError("Email is required");
        setIsSubmitting(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address");
        setIsSubmitting(false);
        return;
      }

      // Create user document based on role
      const collectionName = `${formData.role}s`; // students, trainers, admins
      const userDocRef = doc(collection(db, collectionName));

      // Create user data
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        status: formData.status,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Save user document
      await setDoc(userDocRef, userData);

      // Show success message
      toast.success(
        `${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} created successfully!`
      );

      // Reset form
      setFormData({
        name: "",
        email: "",
        role: "student",
        status: "active",
      });
    } catch (error) {
      console.error("Error creating user:", error);
      setError("Failed to create user. Please try again.");
      toast.error("Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return <AuthLoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <User className="text-blue-600" />
                Create New User
              </h1>
              <p className="mt-2 text-gray-600">
                Add new users to the system with appropriate roles and
                permissions
              </p>
            </div>
            <button
              onClick={() => router.push("/admin-dashboard")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <UserCog className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter full name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    value: "student",
                    label: "Student",
                    icon: GraduationCap,
                    color: "bg-blue-100 text-blue-800",
                  },
                  {
                    value: "trainer",
                    label: "Trainer",
                    icon: UserCog,
                    color: "bg-green-100 text-green-800",
                  },
                  {
                    value: "admin",
                    label: "Administrator",
                    icon: Shield,
                    color: "bg-purple-100 text-purple-800",
                  },
                ].map((role) => {
                  const Icon = role.icon;
                  return (
                    <div
                      key={role.value}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        formData.role === role.value
                          ? "border-blue-500 ring-2 ring-blue-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, role: role.value }))
                      }
                    >
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg ${role.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="ml-3 font-medium text-gray-900">
                          {role.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center p-4 bg-red-50 rounded-lg text-red-700">
                <XCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating User...
                  </>
                ) : (
                  <>
                    <User className="h-5 w-5 mr-2" />
                    Create User
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Eye className="h-5 w-5 text-blue-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                User Creation Information
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  When you create a user, they will be added to the appropriate
                  collection in Firestore:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>
                    <span className="font-medium">Students</span> - Added to the
                    "students" collection
                  </li>
                  <li>
                    <span className="font-medium">Trainers</span> - Added to the
                    "trainers" collection
                  </li>
                  <li>
                    <span className="font-medium">Administrators</span> - Added
                    to the "admins" collection
                  </li>
                </ul>
                <p className="mt-2">
                  Users will need to sign in with their email and password to
                  access the system.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUserPage;
