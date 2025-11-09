"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import AuthLoadingSpinner from "@/components/AuthLoadingSpinner";
import Image from "next/image";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Award,
  BookOpen,
  Shield,
  Key,
  Bell,
  Settings,
  Edit2,
  Camera,
  CheckCircle,
  Lock,
  Smartphone,
  Clock,
} from "lucide-react";

const UserProfile = () => {
  const { user: authUser, userRole, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    courseUpdates: true,
    marketing: false,
  });
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    if (!authUser) {
      router.push("/login");
      return;
    }

    const fetchProfileData = async () => {
      try {
        setLoading(true);
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

        const userDocRef = doc(db, collectionName, authUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setProfileData(userDoc.data());

          // Initialize notification settings from user data if available
          if (userDoc.data().notifications) {
            setNotificationSettings(userDoc.data().notifications);
          }
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [authUser, userRole, authLoading, router]);

  // Handle profile picture upload
  const handleProfilePictureUpload = () => {
    // Create a file input element
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";

    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      // In a real implementation, you would:
      // 1. Upload the file to storage (e.g., Firebase Storage)
      // 2. Get the download URL
      // 3. Update the user's profile document with the new image URL
      // 4. Update the profileData state

      alert(
        `File selected: ${file.name}. In a real implementation, this would upload the image and update your profile.`
      );

      // Example of what the real implementation might look like:
      /*
      try {
        // Upload to Firebase Storage
        const storageRef = ref(storage, `profile-pictures/${authUser?.uid}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        
        // Update Firestore document
        let collectionName = "";
        switch (userRole) {
          case "admin": collectionName = "admins"; break;
          case "trainer": collectionName = "trainers"; break;
          case "student": collectionName = "students"; break;
          default: collectionName = "students";
        }
        
        const userDocRef = doc(db, collectionName, authUser.uid);
        await updateDoc(userDocRef, {
          imageUrls: [downloadURL]
        });
        
        // Update local state
        setProfileData(prev => ({
          ...prev,
          imageUrls: [downloadURL]
        }));
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        alert("Failed to upload profile picture. Please try again.");
      }
      */
    };

    fileInput.click();
  };

  // Handle notification settings update
  const handleNotificationChange = async (
    setting: string,
    checked: boolean
  ) => {
    // Update local state first for immediate UI feedback
    const updatedSettings = {
      ...notificationSettings,
      [setting]: checked,
    };

    setNotificationSettings(updatedSettings);

    // Update in database
    try {
      if (!authUser) return;

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

      const userDocRef = doc(db, collectionName, authUser.uid);
      await updateDoc(userDocRef, {
        notifications: updatedSettings,
      });

      console.log(`Notification setting ${setting} updated to ${checked}`);
    } catch (error) {
      console.error("Error updating notification settings:", error);
      // Revert local state if database update fails
      setNotificationSettings((prev) => ({
        ...prev,
        [setting]: !checked,
      }));
      alert("Failed to update notification settings. Please try again.");
    }
  };

  // Handle navigation to settings page
  const handleSettingsClick = () => {
    // For now, we'll show an alert since the settings page may not exist
    alert(
      "Navigating to settings page. In a real implementation, this would take you to the settings page."
    );
    // router.push("/settings"); // Uncomment when settings page is created
  };

  // Handle navigation to edit profile page
  const handleEditProfileClick = () => {
    // For now, we'll show an alert since the edit profile page may not exist
    alert(
      "Navigating to edit profile page. In a real implementation, this would take you to the profile editing page."
    );
    // router.push("/edit-profile"); // Uncomment when edit profile page is created
  };

  // Handle navigation to change password page
  const handleChangePasswordClick = () => {
    // For now, we'll show an alert since the change password page may not exist
    alert(
      "Navigating to change password page. In a real implementation, this would take you to the password change page."
    );
    // router.push("/change-password"); // Uncomment when change password page is created
  };

  // Handle navigation to 2FA settings
  const handle2FAClick = () => {
    // For now, we'll show an alert since the 2FA page may not exist
    alert(
      "Navigating to two-factor authentication settings. In a real implementation, this would take you to the 2FA setup page."
    );
    // router.push("/two-factor-auth"); // Uncomment when 2FA page is created
  };

  // Handle navigation to active sessions page
  const handleActiveSessionsClick = () => {
    // For now, we'll show an alert since the active sessions page may not exist
    alert(
      "Navigating to active sessions page. In a real implementation, this would show your active sessions."
    );
    // router.push("/active-sessions"); // Uncomment when active sessions page is created
  };

  const InfoCard = ({ icon: Icon, label, value }: any) => (
    <div className="flex items-start space-x-3 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 group">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center group-hover:scale-110 transition-transform">
        <Icon className="w-5 h-5 text-red-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-900 break-words">
          {value}
        </p>
      </div>
    </div>
  );

  if (authLoading || loading) {
    return <AuthLoadingSpinner />;
  }

  if (!authUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-red-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Profile Header */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border border-gray-100">
          {/* Cover Image with Pattern */}
          <div className="relative h-48 bg-gradient-to-br from-[#991b1b] via-[#7f1d1d] to-[#991b1b] overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: "40px 40px",
                }}
              ></div>
            </div>
            {/* Floating orbs */}
            <div className="absolute top-10 right-20 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          <div className="px-8 pb-8 -mt-20 relative">
            {/* Profile Picture with Upload Button */}
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div className="flex items-end gap-6">
                <div className="relative group">
                  <div className="relative w-32 h-32 rounded-2xl bg-white p-2 shadow-xl ring-4 ring-white">
                    <div className="w-full h-full rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                      {profileData?.imageUrls && profileData.imageUrls[0] ? (
                        <Image
                          src={profileData.imageUrls[0]}
                          alt="Profile"
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    className="absolute bottom-1 right-1 w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                    onClick={handleProfilePictureUpload}
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {profileData?.username ||
                        profileData?.name ||
                        authUser.displayName ||
                        "User"}
                    </h1>
                    <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold rounded-full shadow-sm">
                      {userRole || "User"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {authUser.email}
                    </span>
                    {authUser.emailVerified && (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  className="px-5 py-2.5 bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold transition-all hover:shadow-md flex items-center gap-2"
                  onClick={handleSettingsClick}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold transition-all hover:shadow-lg flex items-center gap-2"
                  onClick={handleEditProfileClick}
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="mt-8 border-b border-gray-200">
              <div className="flex gap-1">
                {["overview", "security", "activity"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 font-semibold capitalize rounded-t-xl transition-all ${
                      activeTab === tab
                        ? "text-red-600 border-b-2 border-red-600 bg-red-50/50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Personal Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information Card */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Personal Information
                  </h2>
                  <button
                    className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1"
                    onClick={handleEditProfileClick}
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  <InfoCard
                    icon={User}
                    label="Full Name"
                    value={
                      profileData?.username ||
                      profileData?.name ||
                      authUser.displayName ||
                      "Not provided"
                    }
                  />
                  <InfoCard
                    icon={Mail}
                    label="Email Address"
                    value={authUser.email || "Not provided"}
                  />
                  {profileData?.phoneNumber && (
                    <InfoCard
                      icon={Phone}
                      label="Phone Number"
                      value={profileData.phoneNumber}
                    />
                  )}
                  {profileData?.PrnNumber && (
                    <InfoCard
                      icon={Award}
                      label="PRN Number"
                      value={profileData.PrnNumber}
                    />
                  )}
                  {profileData?.dateOfBirth && (
                    <InfoCard
                      icon={Calendar}
                      label="Date of Birth"
                      value={profileData.dateOfBirth}
                    />
                  )}
                </div>
              </div>

              {/* Courses Section */}
              {userRole === "student" &&
                profileData?.courses &&
                profileData.courses.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                      Enrolled Courses
                    </h2>
                    <div className="grid gap-4">
                      {profileData.courses.map((course: any, index: number) => (
                        <div
                          key={index}
                          className="group flex items-center p-5 border-2 border-gray-100 rounded-xl hover:border-red-200 hover:shadow-md transition-all duration-200 cursor-pointer bg-gradient-to-r from-white to-gray-50/50"
                        >
                          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <BookOpen className="w-7 h-7 text-white" />
                          </div>
                          <div className="ml-5 flex-1">
                            <h3 className="font-bold text-gray-900 text-lg mb-1">
                              {course.name}
                            </h3>
                            <p className="text-sm text-gray-600 font-medium">
                              Level:{" "}
                              <span className="text-red-600">
                                {course.level}
                              </span>
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-gray-900 bg-gray-100 px-4 py-2 rounded-lg">
                              {course.classNumber || "N/A"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>

            {/* Right Column - Account & Stats */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl shadow-xl p-6 text-white">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Account Status
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-red-100">Profile Completion</span>
                    <span className="font-bold text-xl">85%</span>
                  </div>
                  <div className="w-full bg-red-800/50 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-white h-full rounded-full"
                      style={{ width: "85%" }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Account Information Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Account Details
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Account ID
                    </p>
                    <p className="font-mono text-xs font-medium text-gray-900 break-all bg-white p-2 rounded border border-gray-200">
                      {authUser.uid}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Account Type
                      </p>
                      <p className="font-bold text-gray-900 capitalize">
                        {userRole || "Standard User"}
                      </p>
                    </div>
                    <Shield className="w-8 h-8 text-red-600" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Member Since
                      </p>
                      <p className="font-bold text-gray-900">
                        {authUser.metadata?.creationTime
                          ? new Date(
                              authUser.metadata.creationTime
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Unknown"}
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-red-600" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Last Sign In
                      </p>
                      <p className="font-bold text-gray-900">
                        {authUser.metadata?.lastSignInTime
                          ? new Date(
                              authUser.metadata.lastSignInTime
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Unknown"}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-red-600" />
                  </div>
                </div>
              </div>

              {/* Notifications Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <span className="text-sm font-medium text-gray-700">
                      Email notifications
                    </span>
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-red-600 rounded"
                      checked={notificationSettings.email}
                      onChange={(e) =>
                        handleNotificationChange("email", e.target.checked)
                      }
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <span className="text-sm font-medium text-gray-700">
                      Course updates
                    </span>
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-red-600 rounded"
                      checked={notificationSettings.courseUpdates}
                      onChange={(e) =>
                        handleNotificationChange(
                          "courseUpdates",
                          e.target.checked
                        )
                      }
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <span className="text-sm font-medium text-gray-700">
                      Marketing emails
                    </span>
                    <input
                      type="checkbox"
                      className="w-5 h-5 text-red-600 rounded"
                      checked={notificationSettings.marketing}
                      onChange={(e) =>
                        handleNotificationChange("marketing", e.target.checked)
                      }
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="max-w-3xl">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Security Settings
              </h2>
              <div className="space-y-4">
                <button
                  className="w-full text-left p-5 rounded-xl border-2 border-gray-200 hover:border-red-200 hover:shadow-md transition-all group"
                  onClick={handleChangePasswordClick}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Key className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 mb-1">
                          Change Password
                        </p>
                        <p className="text-sm text-gray-500">
                          Update your password regularly for security
                        </p>
                      </div>
                    </div>
                    <Edit2 className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
                  </div>
                </button>

                <button
                  className="w-full text-left p-5 rounded-xl border-2 border-gray-200 hover:border-red-200 hover:shadow-md transition-all group"
                  onClick={handle2FAClick}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Smartphone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 mb-1">
                          Two-Factor Authentication
                        </p>
                        <p className="text-sm text-gray-500">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                    </div>
                    <Edit2 className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                  </div>
                </button>

                <button
                  className="w-full text-left p-5 rounded-xl border-2 border-gray-200 hover:border-red-200 hover:shadow-md transition-all group"
                  onClick={handleActiveSessionsClick}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Lock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 mb-1">
                          Active Sessions
                        </p>
                        <p className="text-sm text-gray-500">
                          Manage devices and active sessions
                        </p>
                      </div>
                    </div>
                    <Edit2 className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <div className="max-w-3xl">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        Login from new device
                      </p>
                      <p className="text-sm text-gray-500">
                        Chrome on Windows • 2 hours ago
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
