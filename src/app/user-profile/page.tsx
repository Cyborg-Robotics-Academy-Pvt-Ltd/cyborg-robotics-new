"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import AuthLoadingSpinner from "@/components/AuthLoadingSpinner";
import Image from "next/image";
import {
  Mail,
  Phone,
  Calendar,
  Award,
  Edit,
  Save,
  X,
  Camera,
  User,
} from "lucide-react";

const UserProfile = () => {
  const { user: authUser, userRole, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [editedUsername, setEditedUsername] = useState("");
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showProfilePreview, setShowProfilePreview] = useState(false);
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

  const getCollectionName = () => {
    switch (userRole) {
      case "admin":
        return "admins";
      case "trainer":
        return "trainers";
      case "student":
        return "students";
      default:
        return "students";
    }
  };

  const handleSaveUsername = async () => {
    if (!authUser || !userRole || !editedUsername.trim()) return;
    try {
      setSaving(true);
      const userDocRef = doc(db, getCollectionName(), authUser.uid);
      await updateDoc(userDocRef, { username: editedUsername.trim() });
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
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !authUser) return;
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", authUser.uid);
      formData.append("userType", userRole || "student");
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok || !data.imageUrl)
        throw new Error(data.error || "Failed to upload image");
      const userDocRef = doc(db, getCollectionName(), authUser.uid);
      await updateDoc(userDocRef, { profileimage: data.imageUrl });
      setProfileData({ ...profileData, profileimage: data.imageUrl });
    } catch (error: any) {
      console.error("Error uploading profile picture:", error);
      alert("Failed to upload profile picture. Please try again.");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  if (authLoading || loading) return <AuthLoadingSpinner />;
  if (!authUser) return null;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getDisplayName = () => {
    if (profileData?.username?.trim()) return profileData.username.trim();
    if (profileData?.name?.trim()) return profileData.name.trim();
    if (authUser.displayName?.trim()) return authUser.displayName.trim();
    if (authUser.email) {
      const emailName = authUser.email.split("@")[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return "User";
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const profileImageSrc =
    profileData?.profileimage ||
    profileData?.imageUrl ||
    (Array.isArray(profileData?.imageUrls) ? profileData.imageUrls[0] : null);

  const statusColorMap: Record<string, string> = {
    active: "bg-green-50 text-green-700 border border-green-200",
    inactive: "bg-red-50 text-red-700 border border-red-200",
  };
  const statusColor = profileData?.status
    ? (statusColorMap[profileData.status] ??
      "bg-yellow-50 text-yellow-700 border border-yellow-200")
    : "";

  return (
    <div className="min-h-full bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-xs">
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            border: "0.5px solid rgba(0,0,0,0.1)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          }}
        >
          {/* â”€â”€ Header â”€â”€ */}
          <div
            className="relative p-5 overflow-hidden"
            style={{
              background: "#A81B1E",
              paddingBottom: "44px",
            }}
          >
            {/* Decorative circles */}
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white opacity-[0.06]" />
            <div className="absolute -bottom-5 -left-5 w-16 h-16 rounded-full bg-white opacity-[0.04]" />
            <p
              className="relative text-white font-bold tracking-[2.5px] uppercase"
              style={{ fontFamily: "'Syne', sans-serif", fontSize: "11px" }}
            >
              Cyborg Robotics
            </p>
          </div>

          {/* â”€â”€ Avatar â”€â”€ */}
          <div className="flex justify-center" style={{ marginTop: "-36px" }}>
            <div className="relative w-[76px] h-[76px]">
              {profileImageSrc ? (
                <button
                  type="button"
                  onClick={() => setShowProfilePreview(true)}
                  className="block w-full h-full"
                  aria-label="View profile photo"
                >
                  <Image
                    src={profileImageSrc}
                    alt={getDisplayName()}
                    width={76}
                    height={76}
                    className="w-full h-full object-cover rounded-full"
                    style={{ border: "3px solid white" }}
                    unoptimized
                  />
                </button>
              ) : (
                <label
                  htmlFor="profile-picture-upload"
                  className="flex items-center justify-center w-full h-full rounded-full cursor-pointer"
                  style={{
                    border: "3px solid white",
                    background: "#062341",
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: "20px",
                    color: "white",
                  }}
                >
                  {getInitials()}
                </label>
              )}

              {/* Camera button */}
              <label
                htmlFor="profile-picture-upload"
                className="absolute bottom-0 right-0 flex items-center justify-center cursor-pointer"
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: "#062341",
                  border: "2px solid white",
                }}
              >
                <Camera className="w-[9px] h-[9px] text-white" />
              </label>

              <input
                id="profile-picture-upload"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                className="hidden"
                disabled={isUploading}
              />

              {/* Upload overlay */}
              {isUploading && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* â”€â”€ Name â”€â”€ */}
          <div className="px-5">
            {isEditingUsername ? (
              <div className="flex flex-col items-center gap-3 py-3">
                <input
                  type="text"
                  value={editedUsername}
                  onChange={(e) => setEditedUsername(e.target.value)}
                  autoFocus
                  className="w-full rounded-lg px-3 py-2 text-center text-base font-bold bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-400"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveUsername}
                    disabled={saving || !editedUsername.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-medium disabled:opacity-50 transition-colors"
                  >
                    <Save className="w-3 h-3" /> Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingUsername(false);
                      setEditedUsername(profileData?.username || "");
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium transition-colors"
                  >
                    <X className="w-3 h-3" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 pt-3 pb-1">
                <h2
                  className="text-lg font-bold text-gray-900"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {getDisplayName()}
                </h2>
                <button
                  onClick={() => setIsEditingUsername(true)}
                  className="flex items-center justify-center rounded-full transition-colors"
                  style={{
                    width: "26px",
                    height: "26px",
                    background: "rgba(0,0,0,0.05)",
                    flexShrink: 0,
                  }}
                  aria-label="Edit username"
                >
                  <Edit className="w-3 h-3 text-gray-500" />
                </button>
              </div>
            )}

            {/* Role pill */}
            <div className="flex justify-center pb-3">
              <span
                className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.6px] px-2.5 py-1 rounded-full"
                style={{ background: "rgba(8,85,171,0.09)", color: "#0855AB" }}
              >
                <Award className="w-[9px] h-[9px]" />
                {profileData?.superAdmin ? "Super Admin" : userRole || "User"}
              </span>
            </div>
          </div>

          {/* â”€â”€ Info Rows â”€â”€ */}
          <div className="px-4 pb-4 flex flex-col gap-1.5">
            {/* Email */}
            <div
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
              style={{ background: "rgba(0,0,0,0.03)" }}
            >
              <div
                className="flex items-center justify-center rounded-lg flex-shrink-0"
                style={{
                  width: "30px",
                  height: "30px",
                  background: "rgba(8,85,171,0.09)",
                }}
              >
                <Mail className="w-3.5 h-3.5" style={{ color: "#0855AB" }} />
              </div>
              <div className="min-w-0">
                <p className="text-[9.5px] font-medium uppercase tracking-[0.9px] text-gray-400">
                  Email
                </p>
                <p className="text-[12.5px] font-medium text-gray-800 truncate">
                  {authUser.email}
                </p>
              </div>
            </div>

            {/* Phone */}
            {profileData?.phoneNumber && (
              <div
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                style={{ background: "rgba(0,0,0,0.03)" }}
              >
                <div
                  className="flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{
                    width: "30px",
                    height: "30px",
                    background: "rgba(22,163,74,0.09)",
                  }}
                >
                  <Phone className="w-3.5 h-3.5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9.5px] font-medium uppercase tracking-[0.9px] text-gray-400">
                    Phone
                  </p>
                  <p className="text-[12.5px] font-medium text-gray-800">
                    {profileData.phoneNumber}
                  </p>
                </div>
              </div>
            )}

            {/* Member Since */}
            <div
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
              style={{ background: "rgba(0,0,0,0.03)" }}
            >
              <div
                className="flex items-center justify-center rounded-lg flex-shrink-0"
                style={{
                  width: "30px",
                  height: "30px",
                  background: "rgba(124,58,237,0.09)",
                }}
              >
                <Calendar className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[9.5px] font-medium uppercase tracking-[0.9px] text-gray-400">
                  Member Since
                </p>
                <p className="text-[12.5px] font-medium text-gray-800">
                  {formatDate(authUser.metadata?.creationTime)}
                </p>
              </div>
            </div>

            {/* PRN */}
            {profileData?.PrnNumber && (
              <div
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                style={{ background: "rgba(0,0,0,0.03)" }}
              >
                <div
                  className="flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{
                    width: "30px",
                    height: "30px",
                    background: "rgba(6,148,162,0.09)",
                  }}
                >
                  <User className="w-3.5 h-3.5 text-cyan-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9.5px] font-medium uppercase tracking-[0.9px] text-gray-400">
                    PRN Number
                  </p>
                  <p className="text-[12.5px] font-medium text-gray-800 truncate">
                    {profileData.PrnNumber}
                  </p>
                </div>
              </div>
            )}

            {/* Status */}
            {profileData?.status && (
              <div
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                style={{ background: "rgba(0,0,0,0.03)" }}
              >
                <div
                  className="flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{
                    width: "30px",
                    height: "30px",
                    background: "rgba(124,58,237,0.09)",
                  }}
                >
                  <User className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[9.5px] font-medium uppercase tracking-[0.9px] text-gray-400">
                    Status
                  </p>
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full ${statusColor}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {profileData.status.charAt(0).toUpperCase() +
                      profileData.status.slice(1)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* â”€â”€ Footer â”€â”€ */}
          <div className="p-3 text-center" style={{ background: "#A81B1E" }}>
            <p
              className="text-white font-medium"
              style={{ fontSize: "11.5px", letterSpacing: "0.3px" }}
            >
              www.cyborgrobotics.in
            </p>
          </div>
        </div>
      </div>

      {/* â”€â”€ Profile Preview Modal â”€â”€ */}
      {showProfilePreview && profileImageSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setShowProfilePreview(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowProfilePreview(false)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/80 text-white flex items-center justify-center"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
            <Image
              src={profileImageSrc}
              alt={getDisplayName()}
              width={600}
              height={600}
              className="w-full h-auto object-cover"
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
