"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import AuthLoadingSpinner from "@/components/AuthLoadingSpinner";
import Image from "next/image";
import { User, Mail, Phone, Calendar, Award, BookOpen } from "lucide-react";

const UserProfile = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const fetchProfileData = async () => {
      try {
        setLoading(true);
        // Determine which collection to look in based on user role
        let collectionName = "";
        switch (userRole) {
          case "admin":
            collectionName = "admins";
            break;
          case "trainer":
            collectionName = "trainers";
            break;
          case "student":
            collectionName = "students";
            break;
          default:
            collectionName = "students";
        }

        // Fetch user data from the appropriate collection
        const userDocRef = doc(db, collectionName, user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setProfileData(userDoc.data());
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user, userRole, authLoading, router]);

  if (authLoading || loading) {
    return <AuthLoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] h-32"></div>

          <div className="px-6 pb-6 -mt-16">
            {/* Profile Picture */}
            <div className="flex items-end justify-between">
              <div className="flex items-end">
                <div className="bg-white p-1 rounded-full">
                  <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-white flex items-center justify-center overflow-hidden">
                    {profileData?.imageUrls && profileData.imageUrls[0] ? (
                      <Image
                        src={profileData.imageUrls[0]}
                        alt="Profile"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <User className="w-12 h-12 text-gray-500" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="ml-4 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profileData?.username ||
                      profileData?.name ||
                      user.displayName ||
                      "User"}
                  </h1>
                  <p className="text-gray-600 capitalize">
                    {userRole || "User"} Profile
                  </p>
                </div>
              </div>

              <button
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition-colors"
                onClick={() => router.push("/")}
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Personal Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Personal Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">
                      {profileData?.username ||
                        profileData?.name ||
                        user.displayName ||
                        "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-medium">
                      {user.email || "Not provided"}
                    </p>
                  </div>
                </div>

                {profileData?.phoneNumber && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium">{profileData.phoneNumber}</p>
                    </div>
                  </div>
                )}

                {profileData?.PrnNumber && (
                  <div className="flex items-center">
                    <Award className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">PRN Number</p>
                      <p className="font-medium">{profileData.PrnNumber}</p>
                    </div>
                  </div>
                )}

                {profileData?.dateOfBirth && (
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Date of Birth</p>
                      <p className="font-medium">{profileData.dateOfBirth}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Courses Section (for students) */}
            {userRole === "student" &&
              profileData?.courses &&
              profileData.courses.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Enrolled Courses
                  </h2>
                  <div className="space-y-4">
                    {profileData.courses.map((course: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="font-medium text-gray-900">
                            {course.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Level: {course.level}
                          </p>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {course.classNumber || "N/A"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Right Column - Account Information */}
          <div className="space-y-8">
            {/* Account Information Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Account Information
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Account ID</p>
                  <p className="font-mono text-sm font-medium break-all">
                    {user.uid}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Account Type</p>
                  <p className="font-medium capitalize">
                    {userRole || "Standard User"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">
                    {user.metadata.creationTime
                      ? new Date(
                          user.metadata.creationTime
                        ).toLocaleDateString()
                      : "Unknown"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Last Sign In</p>
                  <p className="font-medium">
                    {user.metadata.lastSignInTime
                      ? new Date(
                          user.metadata.lastSignInTime
                        ).toLocaleDateString()
                      : "Unknown"}
                  </p>
                </div>
              </div>
            </div>

            {/* Security Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Security</h2>
              <div className="space-y-4">
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <p className="font-medium text-gray-900">Change Password</p>
                  <p className="text-sm text-gray-500">
                    Update your password regularly
                  </p>
                </button>

                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <p className="font-medium text-gray-900">
                    Two-Factor Authentication
                  </p>
                  <p className="text-sm text-gray-500">
                    Add an extra layer of security
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
