"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Lock,
  Plus,
  X,
  BookOpen,
  Users,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

interface UserFormData {
  fullName: string;
  email: string;
  password: string;
  role: string;
  center?: string;
}

const CreateMultipleUsersPage = () => {
  const router = useRouter();
  const { user: currentUser, userRole, loading: authLoading } = useAuth();
  const [userForms, setUserForms] = useState<UserFormData[]>([
    { fullName: "", email: "", password: "", role: "student", center: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswords, setShowPasswords] = useState<boolean[]>([false]);

  // Role options for dropdown
  const roleOptions = [
    { value: "student", label: "Student" },
    { value: "trainer", label: "Trainer" },
    { value: "admin", label: "Admin" },
  ];

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

  const addNewUserForm = () => {
    setUserForms([
      ...userForms,
      { fullName: "", email: "", password: "", role: "student", center: "" },
    ]);
    setShowPasswords([...showPasswords, false]);
  };

  const removeUserForm = (index: number) => {
    if (userForms.length > 1) {
      const newForms = [...userForms];
      newForms.splice(index, 1);
      setUserForms(newForms);

      const newShowPasswords = [...showPasswords];
      newShowPasswords.splice(index, 1);
      setShowPasswords(newShowPasswords);
    }
  };

  const handleFormChange = (
    index: number,
    field: keyof UserFormData,
    value: string
  ) => {
    const newForms = [...userForms];
    newForms[index] = { ...newForms[index], [field]: value };
    setUserForms(newForms);
  };

  const validateForm = (formData: UserFormData) => {
    const errors: Record<string, string> = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = "Full name must be at least 2 characters";
    } else if (/\d/.test(formData.fullName)) {
      errors.fullName = "Full name cannot contain numbers";
    }

    // Email validation
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email address is invalid";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    }

    // Center validation for students
    if (formData.role === "student" && !formData.center) {
      errors.center = "Center is required for student accounts";
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate all forms
      const allErrors = userForms.map((form) => validateForm(form));
      const hasErrors = allErrors.some(
        (errors) => Object.keys(errors).length > 0
      );

      if (hasErrors) {
        toast.error("Please fix errors in the forms before submitting");
        return;
      }

      // Check for duplicate emails
      const emails = userForms.map((form) => form.email.toLowerCase());
      const uniqueEmails = new Set(emails);
      if (uniqueEmails.size !== emails.length) {
        toast.error(
          "Duplicate email addresses found. Please use unique emails."
        );
        return;
      }

      // Check if any user already exists
      for (const form of userForms) {
        const userExists = await checkExistingUser(form.email);
        if (userExists) {
          toast.error(`User with email ${form.email} already exists`);
          return;
        }
      }

      // Show warning about session switching
      toast(
        "Note: After creating accounts, you may need to refresh the page to maintain your session",
        {
          icon: "⚠️",
          duration: 5000,
        }
      );

      // Create users via API call
      const response = await fetch("/api/create-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          users: userForms,
          adminUid: currentUser?.uid, // Pass admin UID to verify permissions
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(
          result.message ||
            `Successfully created ${userForms.length} account(s)!`
        );
        // Reset forms
        setUserForms([
          { fullName: "", email: "", password: "", role: "student" },
        ]);
        setShowPasswords([false]);

        // Suggest page refresh to maintain session
        setTimeout(() => {
          if (
            confirm(
              "To maintain your admin session, you may need to refresh the page. Would you like to refresh now?"
            )
          ) {
            window.location.reload();
          }
        }, 2000);
      } else {
        throw new Error(result.error || "Failed to create users");
      }
    } catch (error: any) {
      console.error("Error creating users:", error);
      toast.error(error.message || "Failed to create users. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!currentUser || userRole !== "admin") {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create Multiple Accounts
          </h1>
          <p className="text-gray-600 mt-2">
            Create multiple user accounts without requiring email verification.
            These accounts will be created with verified status.
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {userForms.map((form, index) => (
                <div
                  key={index}
                  className="mb-8 p-6 border rounded-lg bg-gray-50 relative"
                >
                  <div className="absolute top-2 right-2">
                    <button
                      type="button"
                      onClick={() => removeUserForm(index)}
                      className="p-1 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-100"
                      disabled={userForms.length <= 1}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <h3 className="text-lg font-semibold mb-4">
                    User {index + 1}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Role Selection */}
                    <div>
                      <Label htmlFor={`role-${index}`}>
                        Role <span className="text-red-500">*</span>
                      </Label>
                      <select
                        id={`role-${index}`}
                        value={form.role}
                        onChange={(e) =>
                          handleFormChange(index, "role", e.target.value)
                        }
                        className="w-full p-2 border border-gray-300 rounded-md mt-1"
                      >
                        {roleOptions.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Center Selection - Only for students */}
                    {form.role === "student" && (
                      <div>
                        <Label htmlFor={`center-${index}`}>
                          Center <span className="text-red-500">*</span>
                        </Label>
                        <select
                          id={`center-${index}`}
                          value={form.center || ""}
                          onChange={(e) =>
                            handleFormChange(index, "center", e.target.value)
                          }
                          className="w-full p-2 border border-gray-300 rounded-md mt-1"
                        >
                          <option value="">Select Center</option>
                          <option value="KALYANI NAGAR">
                            Kalyani Nagar (KN)
                          </option>
                          <option value="VIMAN NAGAR">Viman Nagar (VN)</option>
                        </select>
                      </div>
                    )}

                    {/* Full Name */}
                    <div>
                      <Label htmlFor={`fullName-${index}`}>
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id={`fullName-${index}`}
                          type="text"
                          value={form.fullName}
                          onChange={(e) =>
                            handleFormChange(index, "fullName", e.target.value)
                          }
                          placeholder="Enter full name"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <Label htmlFor={`email-${index}`}>
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id={`email-${index}`}
                          type="email"
                          value={form.email}
                          onChange={(e) =>
                            handleFormChange(index, "email", e.target.value)
                          }
                          placeholder="Enter email address"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <Label htmlFor={`password-${index}`}>
                        Password <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id={`password-${index}`}
                          type={showPasswords[index] ? "text" : "password"}
                          value={form.password}
                          onChange={(e) =>
                            handleFormChange(index, "password", e.target.value)
                          }
                          placeholder="Enter password"
                          className="pl-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newShowPasswords = [...showPasswords];
                            newShowPasswords[index] = !newShowPasswords[index];
                            setShowPasswords(newShowPasswords);
                          }}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords[index] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex flex-wrap gap-4 mb-6">
                <Button
                  type="button"
                  onClick={addNewUserForm}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Another User
                </Button>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center text-white gap-2 bg-red-600 hover:bg-red-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Creating Accounts...
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4" />
                      Create {userForms.length} Account
                      {userForms.length !== 1 ? "s" : ""}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateMultipleUsersPage;
