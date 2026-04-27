"use client";

import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  deleteField,
} from "firebase/firestore";
import { getAdminUserData } from "@/lib/admin-utils";
import { autoGenerateAndAssignPrn } from "@/lib/prn-utils";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  User,
  Shield,
  Edit,
  Trash2,
  Save,
  X,
  EyeOff,
  Users,
  UserCog,
  UserCheck,
  Camera,
  Loader2,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Search,
  ArrowLeft,
} from "lucide-react";
import AuthLoadingSpinner from "@/components/AuthLoadingSpinner";

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
  profileimage?: string;
  superAdmin?: boolean;
}

const CROP_PREVIEW_SIZE = 256;
const CROPPED_IMAGE_SIZE = 512;

const getSafeCreatedAt = (value: unknown): Date => {
  if (!value) return new Date();
  if (value instanceof Date) return value;
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate?: unknown }).toDate === "function"
  ) {
    try {
      return (value as { toDate: () => Date }).toDate();
    } catch {
      return new Date();
    }
  }
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

const RoleBadge = ({
  role,
  superAdmin,
}: {
  role: string;
  superAdmin?: boolean;
}) => {
  const config = superAdmin
    ? {
        bg: "bg-amber-50 border-amber-200 text-amber-700",
        dot: "bg-amber-400",
        label: "Super Admin",
      }
    : role === "admin"
      ? {
          bg: "bg-violet-50 border-violet-200 text-violet-700",
          dot: "bg-violet-400",
          label: "Admin",
        }
      : role === "trainer"
        ? {
            bg: "bg-emerald-50 border-emerald-200 text-emerald-700",
            dot: "bg-emerald-400",
            label: "Trainer",
          }
        : {
            bg: "bg-sky-50 border-sky-200 text-sky-700",
            dot: "bg-sky-400",
            label: "Student",
          };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${config.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const config =
    status === "active"
      ? {
          bg: "bg-green-50 border-green-200 text-green-700",
          dot: "bg-green-400",
        }
      : status === "inactive"
        ? { bg: "bg-red-50 border-red-200 text-red-700", dot: "bg-red-400" }
        : {
            bg: "bg-yellow-50 border-yellow-200 text-yellow-700",
            dot: "bg-yellow-400",
          };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${config.bg}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full animate-pulse ${config.dot}`}
      />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const Avatar = ({
  src,
  name,
  size = 10,
}: {
  src?: string;
  name: string;
  size?: number;
}) => (
  <div
    className={`flex-shrink-0 w-${size} h-${size} rounded-xl overflow-hidden ring-2 ring-white shadow-sm bg-gradient-to-br from-red-100 to-rose-200 flex items-center justify-center`}
  >
    {src ? (
      <Image
        src={src}
        alt={name}
        width={40}
        height={40}
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/assets/logo1.png";
        }}
      />
    ) : (
      <User className="w-5 h-5 text-red-700" />
    )}
  </div>
);

const SortIcon = ({
  active,
  direction,
}: {
  active: boolean;
  direction: "asc" | "desc";
}) =>
  active ? (
    direction === "desc" ? (
      <ChevronDown className="w-3.5 h-3.5 text-red-600" />
    ) : (
      <ChevronUp className="w-3.5 h-3.5 text-red-600" />
    )
  ) : (
    <ChevronDown className="w-3.5 h-3.5 text-gray-300" />
  );

const AccessControlPage = () => {
  const router = useRouter();
  const { user, userRole, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<UserData>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fetchError, setFetchError] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [uploadingPhotoForUserId, setUploadingPhotoForUserId] = useState<
    string | null
  >(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [photoSourceMenuUserId, setPhotoSourceMenuUserId] = useState<
    string | null
  >(null);
  const [pendingPhotoUserId, setPendingPhotoUserId] = useState<string | null>(
    null,
  );
  const [cameraError, setCameraError] = useState("");
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [cropScale, setCropScale] = useState(1);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [sourceImageSize, setSourceImageSize] = useState({
    width: CROP_PREVIEW_SIZE,
    height: CROP_PREVIEW_SIZE,
  });
  const cropDragRef = useRef<{
    startX: number;
    startY: number;
    initialCropX: number;
    initialCropY: number;
    dragging: boolean;
  }>({
    startX: 0,
    startY: 0,
    initialCropX: 0,
    initialCropY: 0,
    dragging: false,
  });
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({ key: "createdAt", direction: "desc" });

  useEffect(() => {
    if (authLoading) return;
    if (!user || userRole !== "admin") {
      router.push("/login");
      return;
    }
    const checkAdminDocument = async () => {
      try {
        const adminData = await getAdminUserData(user.uid);
        if (!adminData) {
          router.push("/create-user");
          return;
        }
        fetchUsers();
      } catch (error) {
        console.error("Error checking admin document:", error);
        router.push("/login");
      }
    };
    checkAdminDocument();
  }, [user, userRole, authLoading, router]);

  useEffect(() => {
    if (user && users.length > 0) {
      const currentUser = users.find((u) => u.email === user.email);
      if (currentUser?.superAdmin) setIsSuperAdmin(true);
    }
  }, [user, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setFetchError("");
      const collections = ["students", "trainers", "admins"];
      let allUsers: UserData[] = [];
      for (const collectionName of collections) {
        try {
          const querySnapshot = await getDocs(collection(db, collectionName));
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            allUsers.push({
              id: doc.id,
              name: data.name || data.fullName || data.username || "",
              email: data.email || "",
              role: collectionName.slice(0, -1),
              status: data.status || "active",
              createdAt: getSafeCreatedAt(data.createdAt),
              profileimage:
                data.profileimage ||
                data.imageUrl ||
                data.imageUrls?.[0] ||
                undefined,
              superAdmin: data.superAdmin || false,
            });
          });
        } catch (collectionError) {
          console.error(`Error fetching ${collectionName}:`, collectionError);
        }
      }
      const filteredUsersList = allUsers.filter(
        (user) => user.email !== "shrikantg199@gmail.com",
      );
      setUsers(filteredUsersList);
      setFilteredUsers(filteredUsersList);
    } catch (error) {
      console.error("Error fetching users:", error);
      setFetchError("Unable to load access control users from Firestore.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...users];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (user) =>
          (user.name && user.name.toLowerCase().includes(term)) ||
          (user.email && user.email.toLowerCase().includes(term)),
      );
    }
    if (roleFilter !== "all")
      result = result.filter((user) => user.role === roleFilter);
    if (statusFilter !== "all")
      result = result.filter((user) => user.status === statusFilter);
    result.sort((a, b) => {
      if (sortConfig.key === "createdAt") {
        const dateA = a.createdAt.getTime();
        const dateB = b.createdAt.getTime();
        return sortConfig.direction === "desc" ? dateB - dateA : dateA - dateB;
      } else if (sortConfig.key === "name") {
        const nameA = (a.name || "").toLowerCase();
        const nameB = (b.name || "").toLowerCase();
        return sortConfig.direction === "desc"
          ? nameB.localeCompare(nameA)
          : nameA.localeCompare(nameB);
      } else if (sortConfig.key === "email") {
        const emailA = (a.email || "").toLowerCase();
        const emailB = (b.email || "").toLowerCase();
        return sortConfig.direction === "desc"
          ? emailB.localeCompare(emailA)
          : emailA.localeCompare(emailB);
      } else if (sortConfig.key === "role") {
        const roleA = (a.role || "").toLowerCase();
        const roleB = (b.role || "").toLowerCase();
        return sortConfig.direction === "desc"
          ? roleB.localeCompare(roleA)
          : roleA.localeCompare(roleB);
      } else if (sortConfig.key === "status") {
        const statusA = (a.status || "").toLowerCase();
        const statusB = (b.status || "").toLowerCase();
        return sortConfig.direction === "desc"
          ? statusB.localeCompare(statusA)
          : statusA.localeCompare(statusB);
      }
      return 0;
    });
    setFilteredUsers(result);
  }, [searchTerm, roleFilter, statusFilter, users, sortConfig]);

  const handleEditClick = (user: UserData) => {
    if (user.superAdmin && !isSuperAdmin) {
      alert("You cannot edit super admin users.");
      return;
    }
    setEditingUserId(user.id);
    setEditFormData({ ...user });
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditFormData({});
  };

  const handleSaveChanges = async () => {
    if (!editingUserId) return;
    const userBeingEdited = users.find((user) => user.id === editingUserId);
    if (userBeingEdited?.superAdmin && !isSuperAdmin) {
      alert("You cannot edit super admin users.");
      return;
    }
    try {
      const originalUser = users.find((user) => user.id === editingUserId);
      if (!originalUser) {
        alert(
          "Original user not found. Please refresh the page and try again.",
        );
        return;
      }
      if (editFormData.role && originalUser.role !== editFormData.role) {
        const originalCollectionName = `${originalUser.role}s`;
        const newCollectionName = `${editFormData.role}s`;
        const originalDocRef = doc(db, originalCollectionName, editingUserId);
        const originalDocSnapshot = await getDoc(originalDocRef);
        if (originalDocSnapshot.exists()) {
          const originalData = originalDocSnapshot.data() as DocumentData;
          const newDocRef = doc(db, newCollectionName, editingUserId);
          const newDocData: any = {
            ...originalData,
            name: editFormData.name || originalData.name,
            status: editFormData.status || originalData.status,
            role: editFormData.role,
            updatedAt: new Date(),
          };
          const profileImageValue =
            editFormData.profileimage || originalData.profileimage;
          if (profileImageValue !== undefined)
            newDocData.profileimage = profileImageValue;
          await setDoc(newDocRef, newDocData);
          await deleteDoc(originalDocRef);
        }
      } else {
        const collectionName = `${originalUser.role}s`;
        const userDocRef = doc(db, collectionName, editingUserId);
        const updateData: any = { updatedAt: new Date() };
        if (editFormData.name !== undefined)
          updateData.name = editFormData.name;
        if (editFormData.status !== undefined) {
          updateData.status = editFormData.status;
          if (
            editFormData.status === "active" &&
            originalUser.status === "pending" &&
            originalUser.role === "student"
          )
            updateData.needsPrnGeneration = true;
        }
        if (editFormData.profileimage !== undefined)
          updateData.profileimage = editFormData.profileimage;
        else if (
          editFormData.profileimage === undefined &&
          originalUser.profileimage !== undefined
        )
          updateData.profileimage = originalUser.profileimage;
        if (editFormData.role !== undefined)
          updateData.role = editFormData.role;
        await updateDoc(userDocRef, updateData);
        if (updateData.needsPrnGeneration) {
          try {
            const studentDoc = await getDoc(userDocRef);
            if (studentDoc.exists()) {
              const studentData = studentDoc.data();
              const location = studentData.center || "KALYANI NAGAR";
              await autoGenerateAndAssignPrn(editingUserId, location);
              await updateDoc(userDocRef, {
                needsPrnGeneration: deleteField(),
              });
            }
          } catch (prnError) {
            console.error("Error generating PRN:", prnError);
          }
        }
      }
      setUsers(
        users.map((user) =>
          user.id === editingUserId
            ? ({
                ...user,
                name: editFormData.name || user.name,
                status: editFormData.status || user.status,
                role: editFormData.role || user.role,
                profileimage:
                  editFormData.profileimage !== undefined
                    ? editFormData.profileimage
                    : user.profileimage,
              } as UserData)
            : user,
        ),
      );
      setEditingUserId(null);
      setEditFormData({});
    } catch (error) {
      console.error("Error updating user:", error);
      alert(
        "Error updating user. Please try again. Details: " +
          (error as Error).message,
      );
    }
  };

  const handleDeleteUser = async (userId: string, role: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const collectionName = `${role}s`;
      await deleteDoc(doc(db, collectionName, userId));
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleRoleChange = (role: string) =>
    setEditFormData({ ...editFormData, role });
  const handleStatusChange = (status: string) =>
    setEditFormData({ ...editFormData, status });

  const stopCameraStream = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    if (cameraVideoRef.current) cameraVideoRef.current.srcObject = null;
  };

  const resetCropState = () => {
    setCropModalOpen(false);
    setPhotoSourceMenuUserId(null);
    setPendingPhotoUserId(null);
    setSelectedImageSrc(null);
    setCropScale(1);
    setCropX(0);
    setCropY(0);
    setSourceImageSize({ width: CROP_PREVIEW_SIZE, height: CROP_PREVIEW_SIZE });
  };

  const openCropModalForImage = (imageSrc: string, userId: string) => {
    const image = new window.Image();
    image.onload = () => {
      setPhotoSourceMenuUserId(null);
      setCameraModalOpen(false);
      setCameraError("");
      setPendingPhotoUserId(userId);
      setSelectedImageSrc(imageSrc);
      setSourceImageSize({
        width: image.naturalWidth || CROP_PREVIEW_SIZE,
        height: image.naturalHeight || CROP_PREVIEW_SIZE,
      });
      setCropScale(1);
      setCropX(0);
      setCropY(0);
      setCropModalOpen(true);
    };
    image.onerror = () => alert("Selected file is not a valid image.");
    image.src = imageSrc;
  };

  const handlePhotoSelection = async (
    event: ChangeEvent<HTMLInputElement>,
    userId: string,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== "string") {
          alert("Failed to read selected photo.");
          return;
        }
        openCropModalForImage(result, userId);
      };
      reader.onerror = () => alert("Failed to read selected photo.");
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error preparing student photo:", error);
      alert(
        "Failed to prepare photo. Please try again. Details: " +
          (error as Error).message,
      );
    } finally {
      event.target.value = "";
    }
  };

  const handleOpenCamera = async (userId: string) => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      alert("Camera is not supported in this browser.");
      return;
    }
    try {
      stopCameraStream();
      setPhotoSourceMenuUserId(null);
      setCameraError("");
      setPendingPhotoUserId(userId);
      setCameraModalOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      cameraStreamRef.current = stream;
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
        await cameraVideoRef.current.play();
      }
    } catch (error) {
      console.error("Error opening camera:", error);
      stopCameraStream();
      setCameraError(
        "Unable to access the laptop camera. Please allow browser camera permission and try again.",
      );
    }
  };

  const handleCaptureFromCamera = () => {
    if (!cameraVideoRef.current || !pendingPhotoUserId) return;
    const video = cameraVideoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || CROPPED_IMAGE_SIZE;
    canvas.height = video.videoHeight || CROPPED_IMAGE_SIZE;
    const context = canvas.getContext("2d");
    if (!context) {
      alert("Failed to capture photo from camera.");
      return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageSrc = canvas.toDataURL("image/jpeg", 0.92);
    stopCameraStream();
    openCropModalForImage(imageSrc, pendingPhotoUserId);
  };

  const handleCropAndUpload = async () => {
    if (!selectedImageSrc || !pendingPhotoUserId) return;
    try {
      setUploadingPhotoForUserId(pendingPhotoUserId);
      const image = new window.Image();
      image.onload = async () => {
        try {
          const baseScale = Math.max(
            CROP_PREVIEW_SIZE / sourceImageSize.width,
            CROP_PREVIEW_SIZE / sourceImageSize.height,
          );
          const finalScale = baseScale * cropScale;
          const drawWidth = sourceImageSize.width * finalScale;
          const drawHeight = sourceImageSize.height * finalScale;
          const drawX = cropX + (CROP_PREVIEW_SIZE - drawWidth) / 2;
          const drawY = cropY + (CROP_PREVIEW_SIZE - drawHeight) / 2;
          const canvas = document.createElement("canvas");
          canvas.width = CROPPED_IMAGE_SIZE;
          canvas.height = CROPPED_IMAGE_SIZE;
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Unable to initialize image cropper");
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, canvas.width, canvas.height);
          const exportScale = CROPPED_IMAGE_SIZE / CROP_PREVIEW_SIZE;
          context.drawImage(
            image,
            drawX * exportScale,
            drawY * exportScale,
            drawWidth * exportScale,
            drawHeight * exportScale,
          );
          const croppedBlob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
              (blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Failed to generate cropped photo"));
              },
              "image/jpeg",
              0.92,
            );
          });
          const formData = new FormData();
          formData.append("file", croppedBlob, "student-profile.jpg");
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          const data = await response.json();
          if (!response.ok || !data.imageUrl)
            throw new Error(data.error || "Failed to upload photo");
          setEditFormData((prev) => ({ ...prev, profileimage: data.imageUrl }));
          resetCropState();
        } catch (error) {
          console.error("Error cropping student photo:", error);
          alert(
            "Failed to crop and upload photo. Please try again. Details: " +
              (error as Error).message,
          );
        } finally {
          setUploadingPhotoForUserId(null);
        }
      };
      image.onerror = () => {
        setUploadingPhotoForUserId(null);
        alert("Failed to load image for cropping.");
      };
      image.src = selectedImageSrc;
    } catch (error) {
      console.error("Error uploading cropped student photo:", error);
      setUploadingPhotoForUserId(null);
      alert(
        "Failed to upload cropped photo. Please try again. Details: " +
          (error as Error).message,
      );
    }
  };

  const clampCropPosition = (
    nextX: number,
    nextY: number,
    scale = cropScale,
  ) => {
    const scaledWidth = sourceImageSize.width * baseScale * scale;
    const scaledHeight = sourceImageSize.height * baseScale * scale;
    const maxOffsetX = Math.max((scaledWidth - CROP_PREVIEW_SIZE) / 2, 0);
    const maxOffsetY = Math.max((scaledHeight - CROP_PREVIEW_SIZE) / 2, 0);
    return {
      x: Math.min(Math.max(nextX, -maxOffsetX), maxOffsetX),
      y: Math.min(Math.max(nextY, -maxOffsetY), maxOffsetY),
    };
  };

  const baseScale = Math.max(
    CROP_PREVIEW_SIZE / sourceImageSize.width,
    CROP_PREVIEW_SIZE / sourceImageSize.height,
  );
  const previewScale = baseScale * cropScale;
  const previewWidth = sourceImageSize.width * previewScale;
  const previewHeight = sourceImageSize.height * previewScale;
  const previewLeft = cropX + (CROP_PREVIEW_SIZE - previewWidth) / 2;
  const previewTop = cropY + (CROP_PREVIEW_SIZE - previewHeight) / 2;

  useEffect(() => {
    const clamped = clampCropPosition(cropX, cropY);
    if (clamped.x !== cropX) setCropX(clamped.x);
    if (clamped.y !== cropY) setCropY(clamped.y);
  }, [cropScale, selectedImageSrc, sourceImageSize, cropX, cropY]);

  useEffect(() => {
    if (!cameraModalOpen) stopCameraStream();
    return () => {
      stopCameraStream();
    };
  }, [cameraModalOpen]);

  const handleCropPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    cropDragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      initialCropX: cropX,
      initialCropY: cropY,
      dragging: true,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const handleCropPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!cropDragRef.current.dragging) return;
    const deltaX = event.clientX - cropDragRef.current.startX;
    const deltaY = event.clientY - cropDragRef.current.startY;
    const clamped = clampCropPosition(
      cropDragRef.current.initialCropX + deltaX,
      cropDragRef.current.initialCropY + deltaY,
    );
    setCropX(clamped.x);
    setCropY(clamped.y);
  };
  const handleCropPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    cropDragRef.current.dragging = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleOpenPhotoSourceMenu = (user: UserData) => {
    if (user.superAdmin && !isSuperAdmin) return;
    if (uploadingPhotoForUserId === user.id) return;
    setPhotoSourceMenuUserId(user.id);
  };

  const handleSort = (key: string) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "desc"
          ? "asc"
          : "desc",
    }));
  };

  if (authLoading || loading) return <AuthLoadingSpinner />;

  const statsData = [
    {
      label: "Total Users",
      value: users.length,
      icon: Users,
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-100",
    },
    {
      label: "Active",
      value: users.filter((u) => u.status === "active").length,
      icon: UserCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      label: "Inactive",
      value: users.filter((u) => u.status === "inactive").length,
      icon: EyeOff,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
    {
      label: "Admins",
      value: users.filter((u) => u.role === "admin").length,
      icon: Shield,
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-100",
    },
  ];

  const thClass =
    "px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none";

  return (
    <div className="min-h-screen bg-gray-50/80">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm rounded-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-700 to-red-500 flex items-center justify-center shadow-sm">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-900 leading-tight">
                Access Control
              </h1>
              <p className="text-xs text-gray-500 leading-tight">
                Manage roles & permissions
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchUsers}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
            <button
              onClick={() => router.push("/admin-dashboard")}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-700 to-red-600 rounded-lg hover:from-red-800 hover:to-red-700 transition-all shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map(({ label, value, icon: Icon, color, bg, border }) => (
            <div
              key={label}
              className={`bg-white rounded-xl border ${border} p-4 flex items-center gap-3 hover:shadow-md transition-shadow`}
            >
              <div
                className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}
              >
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-gray-900 leading-tight">
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Error */}
        {fetchError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
            {fetchError}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-400 bg-gray-50/50 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-400 bg-gray-50/50 outline-none transition-all text-gray-700"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="trainer">Trainer</option>
              <option value="student">Student</option>
            </select>
            <select
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-400 bg-gray-50/50 outline-none transition-all text-gray-700"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              {filteredUsers.length}{" "}
              <span className="text-gray-400 font-normal">
                user{filteredUsers.length !== 1 ? "s" : ""} found
              </span>
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className={thClass} onClick={() => handleSort("name")}>
                    <div className="flex items-center gap-1">
                      User{" "}
                      <SortIcon
                        active={sortConfig.key === "name"}
                        direction={sortConfig.direction}
                      />
                    </div>
                  </th>
                  <th className={thClass} onClick={() => handleSort("role")}>
                    <div className="flex items-center gap-1">
                      Role{" "}
                      <SortIcon
                        active={sortConfig.key === "role"}
                        direction={sortConfig.direction}
                      />
                    </div>
                  </th>
                  <th className={thClass} onClick={() => handleSort("status")}>
                    <div className="flex items-center gap-1">
                      Status{" "}
                      <SortIcon
                        active={sortConfig.key === "status"}
                        direction={sortConfig.direction}
                      />
                    </div>
                  </th>
                  <th
                    className={thClass}
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center gap-1">
                      Created{" "}
                      <SortIcon
                        active={sortConfig.key === "createdAt"}
                        direction={sortConfig.direction}
                      />
                    </div>
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
                          <Users className="w-6 h-6 text-gray-300" />
                        </div>
                        <p className="text-sm text-gray-500 font-medium">
                          No users found
                        </p>
                        <p className="text-xs text-gray-400">
                          Try adjusting your filters
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className={`hover:bg-gray-50/80 transition-colors group ${editingUserId === user.id ? "bg-blue-50/30" : ""}`}
                    >
                      {editingUserId === user.id ? (
                        <>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="relative flex-shrink-0 w-10 h-10 rounded-xl overflow-hidden ring-2 ring-white shadow-sm bg-gradient-to-br from-red-100 to-rose-200 flex items-center justify-center">
                                {editFormData.profileimage ||
                                user.profileimage ? (
                                  <Image
                                    src={
                                      editFormData.profileimage ||
                                      user.profileimage ||
                                      ""
                                    }
                                    alt={user.name}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        "/assets/logo1.png";
                                    }}
                                  />
                                ) : (
                                  <User className="w-4 h-4 text-red-700" />
                                )}
                                {user.role === "student" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleOpenPhotoSourceMenu(user)
                                    }
                                    disabled={
                                      uploadingPhotoForUserId === user.id ||
                                      (user.superAdmin && !isSuperAdmin)
                                    }
                                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-xl"
                                  >
                                    {uploadingPhotoForUserId === user.id ? (
                                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                                    ) : (
                                      <Camera className="w-4 h-4 text-white" />
                                    )}
                                  </button>
                                )}
                              </div>
                              <div className="min-w-0">
                                {user.superAdmin && !isSuperAdmin ? (
                                  <p className="text-xs text-amber-600 italic font-medium">
                                    Unchangeable
                                  </p>
                                ) : (
                                  <input
                                    type="text"
                                    value={editFormData.name || ""}
                                    placeholder="Enter name"
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        name: e.target.value,
                                      })
                                    }
                                    className="block w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-400 outline-none bg-white"
                                  />
                                )}
                                <p className="text-xs text-gray-400 mt-0.5 truncate">
                                  {user.email}
                                </p>
                                {user.role === "student" && (
                                  <>
                                    <input
                                      id={`student-photo-${user.id}`}
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      disabled={
                                        uploadingPhotoForUserId === user.id ||
                                        (user.superAdmin && !isSuperAdmin)
                                      }
                                      onChange={(e) =>
                                        void handlePhotoSelection(e, user.id)
                                      }
                                    />
                                    {editFormData.profileimage && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setEditFormData((prev) => ({
                                            ...prev,
                                            profileimage: "",
                                          }))
                                        }
                                        className="text-xs text-red-500 hover:text-red-700 mt-1"
                                      >
                                        Remove photo
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            {user.superAdmin && !isSuperAdmin ? (
                              <span className="text-xs text-amber-600 italic font-medium">
                                Super Admin (restricted)
                              </span>
                            ) : (
                              <select
                                value={editFormData.role || ""}
                                onChange={(e) =>
                                  handleRoleChange(e.target.value)
                                }
                                className="px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-400 outline-none bg-white"
                              >
                                <option value="admin">Admin</option>
                                <option value="trainer">Trainer</option>
                                <option value="student">Student</option>
                              </select>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            {user.superAdmin && !isSuperAdmin ? (
                              <span className="text-xs text-amber-600 italic font-medium">
                                Unchangeable
                              </span>
                            ) : (
                              <select
                                value={editFormData.status || ""}
                                onChange={(e) =>
                                  handleStatusChange(e.target.value)
                                }
                                className="px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-400 outline-none bg-white"
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="pending">Pending</option>
                              </select>
                            )}
                          </td>
                          <td className="px-5 py-3 text-sm text-gray-500">
                            {user.createdAt.toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={handleSaveChanges}
                                disabled={user.superAdmin && !isSuperAdmin}
                                className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                title="Save"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={user.profileimage}
                                name={user.name}
                              />
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {user.name}
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <RoleBadge
                              role={user.role}
                              superAdmin={user.superAdmin}
                            />
                          </td>
                          <td className="px-5 py-3.5">
                            <StatusBadge status={user.status} />
                          </td>
                          <td className="px-5 py-3.5 text-sm text-gray-500">
                            {user.createdAt.toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEditClick(user)}
                                disabled={user.superAdmin && !isSuperAdmin}
                                className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteUser(user.id, user.role)
                                }
                                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Crop Modal */}
      {cropModalOpen && selectedImageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Crop Photo
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Drag to position, scroll to zoom
                </p>
              </div>
              <button
                onClick={resetCropState}
                disabled={!!uploadingPhotoForUserId}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-5">
              <div className="flex justify-center">
                <div
                  className="relative overflow-hidden rounded-2xl bg-gray-900 shadow-inner cursor-move"
                  style={{
                    width: `${CROP_PREVIEW_SIZE}px`,
                    height: `${CROP_PREVIEW_SIZE}px`,
                  }}
                  onPointerDown={handleCropPointerDown}
                  onPointerMove={handleCropPointerMove}
                  onPointerUp={handleCropPointerUp}
                  onPointerCancel={handleCropPointerUp}
                  onPointerLeave={handleCropPointerUp}
                >
                  <img
                    src={selectedImageSrc}
                    alt="Crop preview"
                    className="absolute max-w-none select-none pointer-events-none"
                    draggable={false}
                    style={{
                      width: `${previewWidth}px`,
                      height: `${previewHeight}px`,
                      left: `${previewLeft}px`,
                      top: `${previewTop}px`,
                    }}
                  />
                  <div className="pointer-events-none absolute inset-0 border-2 border-white/60 shadow-[inset_0_0_0_9999px_rgba(0,0,0,0.2)] rounded-2xl" />
                </div>
              </div>
              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-gray-600">
                    Zoom
                  </label>
                  <span className="text-xs text-gray-400">
                    {Math.round(cropScale * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={cropScale}
                  onChange={(e) => setCropScale(Number(e.target.value))}
                  className="w-full accent-red-600"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={resetCropState}
                disabled={!!uploadingPhotoForUserId}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleCropAndUpload()}
                disabled={!!uploadingPhotoForUserId}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-700 to-red-600 rounded-lg hover:from-red-800 hover:to-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {uploadingPhotoForUserId ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                Crop & Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {cameraModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Camera
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Capture photo, then crop before upload
                </p>
              </div>
              <button
                onClick={() => {
                  setCameraModalOpen(false);
                  setPendingPhotoUserId(null);
                  setCameraError("");
                }}
                className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-5">
              <div className="rounded-xl overflow-hidden bg-black aspect-square">
                <video
                  ref={cameraVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
              {cameraError && (
                <p className="mt-3 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-100">
                  {cameraError}
                </p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => {
                  setCameraModalOpen(false);
                  setPendingPhotoUserId(null);
                  setCameraError("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCaptureFromCamera}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-700 to-red-600 rounded-lg hover:from-red-800 hover:to-red-700 transition-all shadow-sm"
              >
                <Camera className="w-4 h-4" />
                Capture
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Source Menu */}
      {photoSourceMenuUserId && !cropModalOpen && !cameraModalOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setPhotoSourceMenuUserId(null)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">
                Update Photo
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Choose source, then crop before upload
              </p>
            </div>
            <div className="px-5 py-4 space-y-2">
              <button
                type="button"
                onClick={() => void handleOpenCamera(photoSourceMenuUserId)}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <Camera className="w-4 h-4 text-red-600" />
                </div>
                Open Camera
              </button>
              <label
                htmlFor={`student-photo-${photoSourceMenuUserId}`}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                Choose from Gallery
              </label>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <button
                onClick={() => setPhotoSourceMenuUserId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessControlPage;
