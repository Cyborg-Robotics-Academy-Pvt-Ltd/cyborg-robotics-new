"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";

const PhotoUploadPage = () => {
  const { userRole, loading: authLoading } = useAuth();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [category, setCategory] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const photosPerPage = 6; // Reduced to 6 photos per page for better performance
  const fileInputRef = useRef<HTMLInputElement>(null);

  const predefinedCategories = [
    "Student Certificate",
    "Student Action",
    "Competition Glory",
    "Workshops",
  ];

  // Fetch all photos and unique categories
  const fetchPhotos = async () => {
    try {
      setLoading(true);

      // Fetch all photos
      const photosQuery = query(
        collection(db, "photo"),
        orderBy("uploadedAt", "desc")
      );
      const photosSnapshot = await getDocs(photosQuery);

      const photosData: any[] = [];
      const uniqueCategories = new Set<string>();

      photosSnapshot.forEach((doc) => {
        const data = doc.data();
        photosData.push({
          id: doc.id,
          ...data,
        });
        uniqueCategories.add(data.category);
      });

      setPhotos(photosData);
      setCategories(Array.from(uniqueCategories));
      setCurrentPage(1); // Reset to first page when photos are fetched
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!authLoading && userRole === "admin") {
      fetchPhotos();
    }
  }, [authLoading, userRole]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !category) {
      setMessage("Please select at least one file and category.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      // Upload all files concurrently
      const uploadPromises = selectedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", category);

        const response = await fetch("/api/photos", {
          method: "POST",
          body: formData,
        });

        return {
          fileName: file.name,
          success: response.ok,
          result: await response.json(),
        };
      });

      const results = await Promise.all(uploadPromises);

      // Process results
      const successfulUploads = results.filter((r) => r.success).length;
      const failedUploads = results.length - successfulUploads;

      if (successfulUploads > 0) {
        setMessage(
          `Successfully uploaded ${successfulUploads} photo${
            successfulUploads > 1 ? "s" : ""
          }${failedUploads > 0 ? `, ${failedUploads} failed` : ""}!`
        );
      } else {
        setMessage(
          `Failed to upload ${failedUploads} photo${failedUploads > 1 ? "s" : ""}.`
        );
      }

      // Reset form
      setSelectedFiles([]);
      setCategory("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Refresh the photo list
      fetchPhotos();
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("An error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteDoc(doc(db, "photo", id));
      setMessage("Photo deleted successfully!");
      fetchPhotos(); // Refresh the list
    } catch (error) {
      console.error("Error deleting photo:", error);
      setMessage("Error deleting photo.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPhotos = React.useMemo(() => {
    return selectedCategoryFilter === "all"
      ? photos
      : photos.filter((photo) => photo.category === selectedCategoryFilter);
  }, [photos, selectedCategoryFilter]);

  // Calculate pagination
  const indexOfLastPhoto = currentPage * photosPerPage;
  const indexOfFirstPhoto = indexOfLastPhoto - photosPerPage;
  const currentPhotos = filteredPhotos.slice(
    indexOfFirstPhoto,
    indexOfLastPhoto
  );
  const totalPages = Math.ceil(filteredPhotos.length / photosPerPage);

  // Memoize the current photos to prevent unnecessary re-renders
  const memoizedCurrentPhotos = React.useMemo(() => {
    return currentPhotos;
  }, [currentPhotos, currentPage, selectedCategoryFilter]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
      </div>
    );
  }

  if (userRole !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Photo Management
          </h1>
          <p className="text-gray-600">
            Upload and manage photos with categories
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Upload New Photo
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  multiple
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-red-50 file:text-red-700
                    hover:file:bg-red-100"
                />
                {selectedFiles.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">
                      Selected {selectedFiles.length} file
                      {selectedFiles.length > 1 ? "s" : ""}:
                    </p>
                    <ul className="text-xs text-gray-500 max-h-24 overflow-y-auto">
                      {selectedFiles.map((file, index) => (
                        <li key={index} className="truncate">
                          {file.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border-gray-300 border p-2 focus:border-red-500 focus:ring-red-500"
                >
                  <option value="">Select a category</option>
                  {predefinedCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {category === "custom" && (
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Enter custom category"
                    className="w-full mt-2 rounded-lg border-gray-300 border p-2 focus:border-red-500 focus:ring-red-500"
                  />
                )}
              </div>

              <button
                onClick={handleUpload}
                disabled={uploading || selectedFiles.length === 0 || !category}
                className={`w-full py-3 px-4 rounded-xl font-medium text-white ${
                  uploading || selectedFiles.length === 0 || !category
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-800 hover:bg-red-900"
                } transition-colors`}
              >
                {uploading ? (
                  <span className="flex items-center justify-center">
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
                    Uploading...
                  </span>
                ) : (
                  "Upload Photo"
                )}
              </button>

              {message && (
                <div
                  className={`p-3 rounded-lg ${
                    message.includes("successfully")
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {message}
                </div>
              )}
            </div>
          </motion.div>

          {/* Photos Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Uploaded Photos
            </h2>

            {/* Category Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Category
              </label>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => {
                  setSelectedCategoryFilter(e.target.value);
                  setCurrentPage(1); // Reset to first page when category changes
                }}
                className="w-full rounded-lg border-gray-300 border p-2 focus:border-red-500 focus:ring-red-500"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto p-2">
                  {memoizedCurrentPhotos.length > 0 ? (
                    memoizedCurrentPhotos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photo.imageUrl}
                          alt={photo.fileName}
                          className="w-full h-32 object-cover rounded-xl"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/20  opacity-10 group-hover:opacity-80 transition-opacity rounded-lg flex flex-col items-center justify-center p-2">
                          <p className="text-white text-xs text-center break-words mb-1">
                            {photo.category}
                          </p>
                          <button
                            onClick={() => handleDelete(photo.id)}
                            disabled={deletingId === photo.id}
                            className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                          >
                            {deletingId === photo.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="col-span-full text-center py-8 text-gray-500">
                      No photos found
                      {selectedCategoryFilter !== "all"
                        ? ` in "${selectedCategoryFilter}" category`
                        : ""}
                    </p>
                  )}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-4 space-x-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md ${currentPage === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-red-600 text-white hover:bg-red-700"}`}
                    >
                      Previous
                    </button>

                    <span className="text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md ${currentPage === totalPages ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-red-600 text-white hover:bg-red-700"}`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PhotoUploadPage;
