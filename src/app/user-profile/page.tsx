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
  Edit,
  Save,
  X,
  Camera,
} from "lucide-react";

const UserProfile = () => {
  const { user: authUser, userRole, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [editedUsername, setEditedUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
          const data = userDoc.data();
          setProfileData(data);
          setEditedUsername(data.username || "");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [authUser, userRole, authLoading, router]);

  const handleSaveUsername = async () => {
    if (!authUser || !userRole || !editedUsername.trim()) return;

    try {
      setSaving(true);
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
        username: editedUsername.trim(),
      });

      // Update local state
      setProfileData({ ...profileData, username: editedUsername.trim() });
      setIsEditingUsername(false);
    } catch (error) {
      console.error("Error updating username:", error);
      alert("Failed to update username. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !authUser) return;

    try {
      setIsUploading(true);

      // Create FormData for the file upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", authUser.uid);
      formData.append("userType", userRole || "student");

      // Upload to Cloudinary via your API route
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.imageUrl) {
        throw new Error(data.error || "Failed to upload image");
      }

      // Update Firestore with the new image URL
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

      // Update with the new image URL in the profileimage field
      const updateData = { profileimage: data.imageUrl };

      await updateDoc(userDocRef, updateData);

      // Update local state with the profile image
      setProfileData({
        ...profileData,
        profileimage: data.imageUrl,
      });
    } catch (error: any) {
      console.error("Error uploading profile picture:", error);
      alert("Failed to upload profile picture. Please try again.");
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  if (authLoading || loading) {
    return <AuthLoadingSpinner />;
  }

  if (!authUser) {
    return null;
  }

  // Format the creation date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Determine display name with proper fallback for all user roles
  const getDisplayName = () => {
    // Check for username field first (consistent with admin dashboard)
    if (profileData?.username && profileData.username.trim()) {
      return profileData.username.trim();
    }

    // Fallback to name field
    if (profileData?.name && profileData.name.trim()) {
      return profileData.name.trim();
    }

    // Fallback to auth user display name
    if (authUser.displayName && authUser.displayName.trim()) {
      return authUser.displayName.trim();
    }

    // Extract name from email if available
    if (authUser.email) {
      const emailName = authUser.email.split("@")[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }

    // Default fallback
    return "User";
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-xs">
        {/* ID Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden relative">
          {/* Decorative Background Pattern - Reduced height */}
          <div className="absolute top-0 left-0 w-full h-32 overflow-hidden">
            <div className="absolute -top-10 -left-10 w-24 h-24 bg-red-400 opacity-20 transform rotate-45"></div>
            <div className="absolute top-5 -right-5 w-20 h-20 bg-red-500 opacity-20 transform rotate-12"></div>
            <div className="absolute -top-5 right-10 w-16 h-16 bg-red-300 opacity-20 transform -rotate-45"></div>
          </div>

          {/* Header with Logo */}
          <div className="relative bg-gradient-to-r from-red-800 to-red-700 p-4 pb-12">
            <div className="text-white text-lg font-bold">CYBORG ROBOTICS</div>
          </div>

          {/* Photo */}
          <div className="relative -mt-12 flex justify-center">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-200 relative group">
              {profileData?.profileimage ? (
                <Image
                  src={profileData.profileimage}
                  alt={profileData?.username || profileData?.name || "User"}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : profileData?.imageUrls && profileData.imageUrls[0] ? (
                <Image
                  src={profileData.imageUrls[0]}
                  alt={profileData?.username || profileData?.name || "User"}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : profileData?.imageUrl ? (
                <Image
                  src={profileData.imageUrl}
                  alt={profileData?.username || profileData?.name || "User"}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}

              {/* Camera icon overlay for uploading */}
              <label
                className="absolute inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                htmlFor="profile-picture-upload"
              >
                <Camera className="w-6 h-6 text-white" />
              </label>

              {/* Hidden file input */}
              <input
                id="profile-picture-upload"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                className="hidden"
                disabled={isUploading}
              />

              {/* Upload indicator */}
              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <div className="text-center mt-3 px-4">
            {isEditingUsername ? (
              <div className="flex flex-col items-center gap-3 py-2">
                <input
                  type="text"
                  value={editedUsername}
                  onChange={(e) => setEditedUsername(e.target.value)}
                  className="text-lg font-bold text-gray-800 bg-gray-100 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-red-500 text-center"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveUsername}
                    disabled={saving || !editedUsername.trim()}
                    className="px-3 py-1 rounded-lg bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                  >
                    <Save className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-medium">Save</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingUsername(false);
                      setEditedUsername(profileData?.username || "");
                    }}
                    className="px-3 py-1 rounded-lg bg-gray-500 hover:bg-gray-600 flex items-center gap-1 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-medium">
                      Cancel
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 py-2">
                <h2 className="text-xl font-bold text-gray-800">
                  {getDisplayName()}
                </h2>
                <button
                  onClick={() => setIsEditingUsername(true)}
                  className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                  aria-label="Edit username"
                >
                  <Edit className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            )}
          </div>

          {/* Details - Reduced padding */}
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Award className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium">ROLE</p>
                <p className="text-sm text-gray-800 font-semibold uppercase">
                  {userRole || "User"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium">EMAIL</p>
                <p className="text-sm text-gray-800 font-semibold truncate">
                  {authUser.email}
                </p>
              </div>
            </div>

            {profileData?.phoneNumber && (
              <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium">PHONE</p>
                  <p className="text-sm text-gray-800 font-semibold">
                    {profileData.phoneNumber}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-medium">
                  MEMBER SINCE
                </p>
                <p className="text-sm text-gray-800 font-semibold">
                  {formatDate(authUser.metadata?.creationTime)}
                </p>
              </div>
            </div>

            {profileData?.PrnNumber && (
              <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg">
                <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-cyan-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500 font-medium">
                    PRN NUMBER
                  </p>
                  <p className="text-sm text-gray-800 font-semibold truncate">
                    {profileData.PrnNumber}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-red-800 to-red-700 p-3 text-center">
            <p className="text-white text-sm font-medium">
              www.cyborgrobotics.in
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
