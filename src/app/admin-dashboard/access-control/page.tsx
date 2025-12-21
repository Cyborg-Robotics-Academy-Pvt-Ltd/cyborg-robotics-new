"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { getAdminUserData } from "@/lib/admin-utils";
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
}

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

  // Fetch all users from different collections
  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Get users from all collections
      const collections = ["students", "trainers", "admins"];
      let allUsers: UserData[] = [];

      for (const collectionName of collections) {
        const querySnapshot = await getDocs(collection(db, collectionName));
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          allUsers.push({
            id: doc.id,
            name: data.name || data.fullName || data.username || "",
            email: data.email || "",
            role: collectionName.slice(0, -1), // Remove 's' from end
            status: data.status || "active",
            createdAt: data.createdAt?.toDate() || new Date(),
          });
        });
      }

      setUsers(allUsers);
      setFilteredUsers(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search term and filters
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

    setFilteredUsers(result);
  }, [searchTerm, roleFilter, statusFilter, users]);

  // Handle edit button click
  const handleEditClick = (user: UserData) => {
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

    try {
      // If role has changed, we need to move the user document between collections
      const originalUser = users.find((user) => user.id === editingUserId);
      if (!originalUser) return;

      if (editFormData.role && originalUser.role !== editFormData.role) {
        // Role has changed - move document between collections
        const originalCollectionName = `${originalUser.role}s`;
        const newCollectionName = `${editFormData.role || originalUser.role}s`;

        // Get the original document data
        const originalDocRef = doc(db, originalCollectionName, editingUserId);
        const originalDocSnapshot = await getDoc(originalDocRef);

        if (originalDocSnapshot.exists()) {
          const originalData = originalDocSnapshot.data();

          // Create new document in the new collection
          const newDocRef = doc(db, newCollectionName, editingUserId);
          await setDoc(newDocRef, {
            ...originalData,
            ...editFormData,
            role: editFormData.role || originalUser.role,
            updatedAt: new Date(),
          });

          // Delete the original document
          await deleteDoc(originalDocRef);
        }
      } else {
        // Role hasn't changed - just update the document
        const collectionName = `${editFormData.role || originalUser.role}s`;
        const userDocRef = doc(db, collectionName, editingUserId);

        await updateDoc(userDocRef, {
          name: editFormData.name,
          email: editFormData.email,
          status: editFormData.status,
          updatedAt: new Date(),
        });
      }

      // Removed email notification when status changes to active

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === editingUserId
            ? ({ ...user, ...editFormData } as UserData)
            : user
        )
      );

      setEditingUserId(null);
      setEditFormData({});
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Error updating user. Please try again.");
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

  if (authLoading || loading) {
    return <AuthLoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="text-red-800" />
                Access Control Management
              </h1>
              <p className="mt-2 text-gray-600">
                Manage user roles, permissions and access levels
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchUsers}
                className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors flex items-center gap-2"
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
                className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors flex items-center gap-2"
              >
                <UserCog className="w-4 h-4" />
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Users
              </label>
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Role
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
            <div className="rounded-full bg-red-100 p-3 mr-4">
              <Users className="text-red-800 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <UserCheck className="text-green-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.status === "active").length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
            <div className="rounded-full bg-yellow-100 p-3 mr-4">
              <EyeOff className="text-yellow-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Inactive</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.status === "inactive").length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 flex items-center">
            <div className="rounded-full bg-purple-100 p-3 mr-4">
              <Shield className="text-purple-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Admins</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.role === "admin").length}
              </p>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    User
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Created
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      {editingUserId === user.id ? (
                        // Edit row
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-red-800" />
                              </div>
                              <div className="ml-4">
                                <input
                                  type="text"
                                  className="block w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-800 focus:border-red-800 sm:text-sm"
                                  value={editFormData.name || ""}
                                  placeholder="Enter name"
                                  onChange={(e) =>
                                    setEditFormData({
                                      ...editFormData,
                                      name: e.target.value,
                                    })
                                  }
                                />
                                <div className="text-sm text-gray-500 mt-1">
                                  <input
                                    type="email"
                                    className="block w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-800 focus:border-red-800 sm:text-sm"
                                    value={editFormData.email || ""}
                                    placeholder="Enter email"
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        email: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-800 focus:border-red-800 sm:text-sm"
                              value={editFormData.role || ""}
                              onChange={(e) => handleRoleChange(e.target.value)}
                            >
                              <option value="admin">Admin</option>
                              <option value="trainer">Trainer</option>
                              <option value="student">Student</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <select
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-800 focus:border-red-800 sm:text-sm"
                              value={editFormData.status || ""}
                              onChange={(e) =>
                                handleStatusChange(e.target.value)
                              }
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                              <option value="pending">Pending</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.createdAt.toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={handleSaveChanges}
                                className="text-green-600 hover:text-green-900 p-1"
                                title="Save"
                              >
                                <Save className="w-5 h-5" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="text-gray-600 hover:text-gray-900 p-1"
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
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-red-800" />
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
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.role === "admin"
                                  ? "bg-purple-100 text-purple-800"
                                  : user.role === "trainer"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {user.role.charAt(0).toUpperCase() +
                                user.role.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : user.status === "inactive"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {user.status.charAt(0).toUpperCase() +
                                user.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.createdAt.toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleEditClick(user)}
                                className="text-blue-600 hover:text-blue-900 p-1"
                                title="Edit"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteUser(user.id, user.role)
                                }
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Delete"
                              >
                                <Trash2 className="w-5 h-5" />
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
    </div>
  );
};

export default AccessControlPage;
