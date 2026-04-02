"use client";

import { useState, useEffect } from "react";
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
  Plus,
  Save,
  X,
  Eye,
  EyeOff,
  Users,
  UserCog,
  UserCheck,
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

const getSafeCreatedAt = (value: unknown): Date => {
  if (!value) return new Date();

  if (value instanceof Date) {
    return value;
  }

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
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({ key: "createdAt", direction: "desc" });

  // Check if user is admin
  useEffect(() => {
    if (authLoading) return;

    if (!user || userRole !== "admin") {
      router.push("/login");
      return;
    }

    // Check if admin document exists
    const checkAdminDocument = async () => {
      try {
        const adminData = await getAdminUserData(user.uid);
        if (!adminData) {
          // Redirect to user creation page if admin document doesn't exist
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

  // Check if current user is a super admin
  useEffect(() => {
    if (user && users.length > 0) {
      const currentUser = users.find((u) => u.email === user.email);
      if (currentUser && currentUser.superAdmin) {
        setIsSuperAdmin(true);
      }
    }
  }, [user, users]);

  // Fetch all users from different collections
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setFetchError("");

      // Get users from all collections
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
              role: collectionName.slice(0, -1), // Remove 's' from end
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

      // Filter out the specific email to hide from display
      const filteredUsersList = allUsers.filter(
        (user) => user.email !== "shrikantg199@gmail.com"
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

  // Filter and sort users
  useEffect(() => {
    let result = [...users];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (user) =>
          (user.name && user.name.toLowerCase().includes(term)) ||
          (user.email && user.email.toLowerCase().includes(term))
      );
    }

    // Apply role filter
    if (roleFilter !== "all") {
      result = result.filter((user) => user.role === roleFilter);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((user) => user.status === statusFilter);
    }

    // Apply sorting
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

  // Handle edit button click
  const handleEditClick = (user: UserData) => {
    // Prevent editing super admin users if current user is not super admin
    if (user.superAdmin && !isSuperAdmin) {
      alert("You cannot edit super admin users.");
      return;
    }
    setEditingUserId(user.id);
    setEditFormData({ ...user });
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditFormData({});
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    if (!editingUserId) return;

    // Check if we're trying to edit a super admin user
    const userBeingEdited = users.find((user) => user.id === editingUserId);
    if (userBeingEdited?.superAdmin && !isSuperAdmin) {
      alert("You cannot edit super admin users.");
      return;
    }

    try {
      // If role has changed, we need to move the user document between collections
      const originalUser = users.find((user) => user.id === editingUserId);
      if (!originalUser) {
        alert(
          "Original user not found. Please refresh the page and try again."
        );
        return;
      }

      if (editFormData.role && originalUser.role !== editFormData.role) {
        // Role has changed - move document between collections
        const originalCollectionName = `${originalUser.role}s`;
        const newCollectionName = `${editFormData.role}s`; // Use editFormData.role directly since we already checked it exists

        // Get the original document data
        const originalDocRef = doc(db, originalCollectionName, editingUserId);
        const originalDocSnapshot = await getDoc(originalDocRef);

        if (originalDocSnapshot.exists()) {
          const originalData = originalDocSnapshot.data() as DocumentData;

          // Create new document in the new collection
          const newDocRef = doc(db, newCollectionName, editingUserId);

          // Prepare data for the new document, avoiding undefined values
          const newDocData: any = {
            ...originalData,
            name: editFormData.name || originalData.name,
            status: editFormData.status || originalData.status,
            role: editFormData.role, // Use the new role
            updatedAt: new Date(),
          };

          // Only add profileimage if it exists to avoid Firestore errors
          const profileImageValue =
            editFormData.profileimage || originalData.profileimage;
          if (profileImageValue !== undefined) {
            newDocData.profileimage = profileImageValue;
          }

          await setDoc(newDocRef, newDocData);

          // Delete the original document
          await deleteDoc(originalDocRef);
        }
      } else {
        // Role hasn't changed - just update the document
        const collectionName = `${originalUser.role}s`; // Use originalUser.role to ensure we update the correct collection
        const userDocRef = doc(db, collectionName, editingUserId);

        // Prepare update data, only update fields that are defined
        const updateData: any = {
          updatedAt: new Date(),
        };

        if (editFormData.name !== undefined)
          updateData.name = editFormData.name;
        if (editFormData.status !== undefined) {
          updateData.status = editFormData.status;

          // Check if status is changing from pending to active for students
          if (
            editFormData.status === "active" &&
            originalUser.status === "pending" &&
            originalUser.role === "student"
          ) {
            // Add flag to indicate PRN should be generated
            updateData.needsPrnGeneration = true;
          }
        }
        if (editFormData.profileimage !== undefined)
          updateData.profileimage = editFormData.profileimage;
        else if (
          editFormData.profileimage === undefined &&
          originalUser.profileimage !== undefined
        )
          // If profileimage is undefined in editFormData but existed in original data, remove it
          updateData.profileimage = originalUser.profileimage;
        if (editFormData.role !== undefined)
          updateData.role = editFormData.role; // Update role even if it didn't change collections

        await updateDoc(userDocRef, updateData);

        // Generate PRN if needed
        if (updateData.needsPrnGeneration) {
          try {
            // Get the student document to find center information
            const studentDoc = await getDoc(userDocRef);
            if (studentDoc.exists()) {
              const studentData = studentDoc.data();
              const location = studentData.center || "KALYANI NAGAR"; // Default to Kalyani Nagar

              // Generate and assign PRN
              await autoGenerateAndAssignPrn(editingUserId, location);

              // Remove the flag from the document
              await updateDoc(userDocRef, {
                needsPrnGeneration: deleteField(),
              });
            }
          } catch (prnError) {
            console.error("Error generating PRN:", prnError);
            // Don't fail the whole operation if PRN generation fails
          }
        }
      }

      // Removed email notification when status changes to active

      // Update local state
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
            : user
        )
      );

      setEditingUserId(null);
      setEditFormData({});
    } catch (error) {
      console.error("Error updating user:", error);
      alert(
        "Error updating user. Please try again. Details: " +
          (error as Error).message
      );
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId: string, role: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const collectionName = `${role}s`;
      const userDocRef = doc(db, collectionName, userId);

      await deleteDoc(userDocRef);

      // Update local state
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Handle role change
  const handleRoleChange = (role: string) => {
    setEditFormData({ ...editFormData, role });
  };

  // Handle status change
  const handleStatusChange = (status: string) => {
    setEditFormData({ ...editFormData, status });
  };

  // Handle sorting
  const handleSort = (key: string) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "desc"
          ? "asc"
          : "desc",
    }));
  };

  if (authLoading || loading) {
    return <AuthLoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-red-800 to-red-600 text-white">
                  <Shield className="w-6 h-6" />
                </div>
                Access Control Management
              </h1>
              <p className="mt-2 text-gray-600">
                Manage user roles, permissions and access levels
              </p>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              <button
                onClick={fetchUsers}
                className="px-4 py-2 bg-gradient-to-r from-red-800 to-red-600 text-white rounded-lg hover:from-red-900 hover:to-red-700 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
                Refresh
              </button>
              <button
                onClick={() => router.push("/admin-dashboard")}
                className="px-4 py-2 bg-gradient-to-r from-blue-800 to-blue-600 text-white rounded-lg hover:from-blue-900 hover:to-blue-700 transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <UserCog className="w-4 h-4" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {fetchError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {fetchError}
          </div>
        )}

        <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 ">
                Search Users
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-all duration-300 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 ">
                Filter by Role
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-all duration-300 shadow-sm"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="trainer">Trainer</option>
                <option value="student">Student</option>
              </select>
            </div>

            <div>
              <label className="block text-sm  text-gray-700 mb-2 font-semibold">
                Filter by Status
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-all duration-300 shadow-sm"
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
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-lg p-6 flex items-center border border-gray-200 transition-transform duration-300 hover:scale-[1.02]">
            <div className="p-3 rounded-xl bg-gradient-to-r from-red-100 to-red-200 mr-4">
              <Users className="text-red-800 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-lg p-6 flex items-center border border-gray-200 transition-transform duration-300 hover:scale-[1.02]">
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-100 to-green-200 mr-4">
              <UserCheck className="text-green-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.status === "active").length}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-lg p-6 flex items-center border border-gray-200 transition-transform duration-300 hover:scale-[1.02]">
            <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-100 to-yellow-200 mr-4">
              <EyeOff className="text-yellow-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Inactive</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.status === "inactive").length}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-lg p-6 flex items-center border border-gray-200 transition-transform duration-300 hover:scale-[1.02]">
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-100 to-purple-200 mr-4">
              <Shield className="text-purple-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Admins</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.role === "admin").length}
              </p>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-1">
                      User
                      {sortConfig.key === "name" && (
                        <span>
                          {sortConfig.direction === "desc" ? "↓" : "↑"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => handleSort("role")}
                  >
                    <div className="flex items-center gap-1">
                      Role
                      {sortConfig.key === "role" && (
                        <span>
                          {sortConfig.direction === "desc" ? "↓" : "↑"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => handleSort("status")}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      {sortConfig.key === "status" && (
                        <span>
                          {sortConfig.direction === "desc" ? "↓" : "↑"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center gap-1">
                      Created
                      {sortConfig.key === "createdAt" && (
                        <span>
                          {sortConfig.direction === "desc" ? "↓" : "↑"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-gray-500 text-lg"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <svg
                          className="w-16 h-16 text-gray-300 mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        No users found
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      {editingUserId === user.id ? (
                        // Edit row
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-r from-red-100 to-red-200 flex items-center justify-center overflow-hidden border-2 border-white shadow">
                                {user.profileimage ? (
                                  <Image
                                    src={user.profileimage}
                                    alt={user.name}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.onerror = null;
                                      target.src = "/assets/logo1.png"; // fallback image
                                    }}
                                  />
                                ) : (
                                  <User className="h-6 w-6 text-red-800" />
                                )}
                              </div>
                              <div className="ml-4">
                                {user.superAdmin && !isSuperAdmin ? (
                                  <div className="text-sm text-yellow-700 italic font-medium">
                                    Unchangeable
                                  </div>
                                ) : (
                                  <input
                                    type="text"
                                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-all duration-300 shadow-sm"
                                    value={editFormData.name || ""}
                                    placeholder="Enter name"
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        name: e.target.value,
                                      })
                                    }
                                  />
                                )}
                                <div className="text-sm text-gray-500 mt-1">
                                  <div className="text-sm text-gray-900 font-medium">
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.superAdmin && !isSuperAdmin ? (
                              <div className="text-sm text-yellow-700 italic font-medium">
                                Super Admin (restricted)
                              </div>
                            ) : (
                              <select
                                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-all duration-300 shadow-sm"
                                value={editFormData.role || ""}
                                onChange={(e) =>
                                  handleRoleChange(e.target.value)
                                }
                              >
                                <option value="admin">Admin</option>
                                <option value="trainer">Trainer</option>
                                <option value="student">Student</option>
                              </select>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.superAdmin && !isSuperAdmin ? (
                              <div className="text-sm text-yellow-700 italic font-medium">
                                Unchangeable
                              </div>
                            ) : (
                              <select
                                className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-800 focus:border-red-800 transition-all duration-300 shadow-sm"
                                value={editFormData.status || ""}
                                onChange={(e) =>
                                  handleStatusChange(e.target.value)
                                }
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="pending">Pending</option>
                              </select>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                            {user.createdAt.toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={handleSaveChanges}
                                className={`${user.superAdmin && !isSuperAdmin ? "text-gray-400 cursor-not-allowed" : "text-green-600 hover:text-green-800"} p-2 rounded-lg hover:bg-green-100 transition-colors duration-200`}
                                title="Save"
                                disabled={user.superAdmin && !isSuperAdmin}
                              >
                                <Save className="w-5 h-5" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                                title="Cancel"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        // View row
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-r from-red-100 to-red-200 flex items-center justify-center overflow-hidden border-2 border-white shadow">
                                {user.profileimage ? (
                                  <Image
                                    src={user.profileimage}
                                    alt={user.name}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.onerror = null;
                                      target.src = "/assets/logo1.png"; // fallback image
                                    }}
                                  />
                                ) : (
                                  <User className="h-6 w-6 text-red-800" />
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.superAdmin
                                  ? "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800"
                                  : user.role === "admin"
                                    ? "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800"
                                    : user.role === "trainer"
                                      ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800"
                                      : "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800"
                              }`}
                              title={
                                user.superAdmin
                                  ? "Super Admin cannot be modified by regular admins"
                                  : ""
                              }
                            >
                              {user.superAdmin
                                ? "Super Admin"
                                : user.role.charAt(0).toUpperCase() +
                                  user.role.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.status === "active"
                                  ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800"
                                  : user.status === "inactive"
                                    ? "bg-gradient-to-r from-red-100 to-red-200 text-red-800"
                                    : "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800"
                              }`}
                            >
                              {user.status.charAt(0).toUpperCase() +
                                user.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                            {user.createdAt.toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleEditClick(user)}
                                className={`text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-100 transition-colors duration-200 ${user.superAdmin && !isSuperAdmin ? "opacity-50 cursor-not-allowed" : ""}`}
                                title="Edit"
                                disabled={user.superAdmin && !isSuperAdmin}
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              {/* {isSuperAdmin && !user.superAdmin && ( */}
                              <button
                                onClick={() =>
                                  handleDeleteUser(user.id, user.role)
                                }
                                className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-100 transition-colors duration-200"
                                title="Delete"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                              {/* )} */}
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
    </div>
  );
};

export default AccessControlPage;
