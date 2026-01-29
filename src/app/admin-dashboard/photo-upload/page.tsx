"use client";

import React, { useState, useRef, useEffect } from "react";
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
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { Trash2, Upload, Eye, Loader2, Edit3, Save, X } from "lucide-react";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Skeleton } from "@/components/ui/skeleton";

const PhotoUploadPage = () => {
  const { userRole, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"photo" | "homeGalleryImage">(
    "photo"
  );

  // Photo upload states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [category, setCategory] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [photos, setPhotos] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const photosPerPage = 8;

  // Gallery states
  const [homeGalleryImages, setHomeGalleryImages] = useState<any[]>([]);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFileName, setEditFileName] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);

  const predefinedCategories = [
    "Student Certificate",
    "Student Action",
    "Competition Glory",
    "Workshops",
  ];

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch photos
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

      // Fetch home gallery images
      const homeGalleryQuery = query(
        collection(db, "homeGalleryImage"),
        orderBy("uploadedAt", "desc")
      );
      const homeGallerySnapshot = await getDocs(homeGalleryQuery);
      const homeGalleryImagesData: any[] = [];
      homeGallerySnapshot.forEach((doc) => {
        homeGalleryImagesData.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setHomeGalleryImages(homeGalleryImagesData);

      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && userRole === "admin") {
      fetchData();
    }
  }, [authLoading, userRole]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files) as File[];
      setSelectedFiles(filesArray);
    }
  };

  const handleGalleryFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingGallery(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const endpoint = "/api/home-gallery-upload";

        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });

        return await response.json();
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter((result) => result.imageUrl);
      const failedUploads = results.filter((result) => !result.imageUrl);

      if (successfulUploads.length > 0) {
        if (failedUploads.length > 0) {
          toast.warn(
            `Uploaded ${successfulUploads.length} images successfully. ${failedUploads.length} uploads failed.`
          );
        } else {
          toast.success(
            `Uploaded ${successfulUploads.length} images successfully!`
          );
        }
        fetchData();
      } else {
        toast.error(
          "All uploads failed: " + results.map((r) => r.error).join(", ")
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed: " + error);
    } finally {
      setIsUploadingGallery(false);
      if (galleryFileInputRef.current) {
        galleryFileInputRef.current.value = "";
      }
    }
  };

  const handleGalleryUploadClick = () => {
    galleryFileInputRef.current?.click();
  };

  const handleDeleteGalleryImage = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) {
      return;
    }

    setDeletingId(imageId);
    try {
      const endpoint = `/api/delete-home-gallery-image?imageId=${imageId}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete image");
      }

      fetchData();
      toast.success("Image deleted successfully!");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image: " + error);
    } finally {
      setDeletingId(null);
    }
  };

  const startEditing = (imageId: string, currentFileName: string) => {
    setEditingId(imageId);
    setEditFileName(currentFileName || "");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditFileName("");
  };

  const saveFileName = async (imageId: string) => {
    if (!editFileName.trim()) {
      toast.warn("File name cannot be empty");
      return;
    }

    try {
      const response = await fetch("/api/update-gallery-filename", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageId,
          newFileName: editFileName,
          collectionName: activeTab,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update file name");
      }

      fetchData();
      setEditingId(null);
      setEditFileName("");
      toast.success("File name updated successfully!");
    } catch (error) {
      console.error("Error updating file name:", error);
      toast.error("Failed to update file name: " + error);
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
      const uploadPromises = selectedFiles.map(async (file: File) => {
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
      fetchData();
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
      fetchData(); // Refresh the list
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
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Photo & Gallery Management
            </h1>
            <p className="text-gray-600">
              Upload and manage photos, gallery images, and home gallery images
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`py-2 px-4 font-medium text-sm rounded-t-lg ${
                activeTab === "photo"
                  ? "text-red-800 border-b-2 border-red-800 bg-red-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("photo")}
            >
              Photo Management
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm rounded-t-lg ${
                activeTab === "homeGalleryImage"
                  ? "text-red-800 border-b-2 border-red-800 bg-red-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("homeGalleryImage")}
            >
              Home Gallery Images
            </button>
          </div>

          {activeTab === "photo" ? (
            <>
              {/* Upload Section - Full Width */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6 mb-8"
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
                    disabled={
                      uploading || selectedFiles.length === 0 || !category
                    }
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <div
                        key={index}
                        className="rounded-xl bg-white p-3 space-y-3 shadow-lg"
                      >
                        <div className="h-48 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                        <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-5/6 bg-gray-200 rounded animate-pulse"></div>
                        <div className="flex justify-between items-center pt-2">
                          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-8 w-8 bg-gray-200 rounded-md animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {memoizedCurrentPhotos.length > 0 ? (
                        memoizedCurrentPhotos.map((photo) => (
                          <motion.div
                            key={photo.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-2xl shadow-lg overflow-hidden group"
                          >
                            <div className="relative pb-[100%]">
                              <Image
                                src={photo.imageUrl}
                                alt={photo.fileName || "Photo"}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                              />
                            </div>

                            <div className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <div className="min-w-0 flex-1">
                                  <h3 className="text-sm font-medium text-gray-900 truncate">
                                    {photo.fileName || "Unnamed photo"}
                                  </h3>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {photo.category}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {photo.uploadedAt
                                      ?.toDate?.()
                                      .toLocaleDateString() ||
                                      new Date(
                                        photo.uploadedAt
                                      ).toLocaleDateString()}
                                  </p>
                                </div>

                                <button
                                  onClick={() => handleDelete(photo.id)}
                                  disabled={deletingId === photo.id}
                                  className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors flex-shrink-0"
                                >
                                  {deletingId === photo.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="col-span-full bg-white rounded-2xl shadow-lg p-12 text-center">
                          <Eye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            No photos found
                          </h3>
                          <p className="text-gray-500">
                            {selectedCategoryFilter !== "all"
                              ? `No photos in "${selectedCategoryFilter}" category`
                              : "Upload some photos to get started"}
                          </p>
                        </div>
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
                          className={`px-3 py-1 rounded-md ${currentPage === 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-red-700 text-white hover:bg-red-800"}`}
                        >
                          Previous
                        </button>

                        <span className="text-gray-700">
                          Page {currentPage} of {totalPages}
                        </span>

                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
                          className={`px-3 py-1 rounded-md ${currentPage === totalPages ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-red-700 text-white hover:bg-red-800"}`}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </>
          ) : (
            /* Gallery Sections */
            <>
              {/* Upload Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6 mb-8"
              >
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Upload New Home Gallery Images
                    </h2>
                    <p className="text-gray-600">
                      Add new images to the home gallery
                    </p>
                  </div>

                  <input
                    type="file"
                    ref={galleryFileInputRef}
                    onChange={handleGalleryFileChange}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />

                  <button
                    onClick={handleGalleryUploadClick}
                    disabled={isUploadingGallery}
                    className="px-4 py-3 bg-red-800 text-white rounded-3xl hover:bg-red-900 transition-colors flex items-center disabled:opacity-50"
                  >
                    {isUploadingGallery ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Images
                      </>
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Gallery Images Grid */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Home Gallery Images
                </h2>

                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <div
                        key={index}
                        className="rounded-xl bg-white p-3 space-y-3"
                      >
                        <div className="h-48 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                        <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-5/6 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : homeGalleryImages.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                    <Eye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">
                      No home gallery images found
                    </h3>
                    <p className="text-gray-500">
                      Upload some images to get started
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {homeGalleryImages.map((image) => (
                      <motion.div
                        key={image.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-2xl shadow-lg overflow-hidden group"
                      >
                        <div className="relative pb-[177.77%]">
                          <Image
                            src={image.imageUrl}
                            alt={image.fileName || "Home Gallery image"}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="min-w-0 flex-1">
                              {editingId === image.id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={editFileName}
                                    onChange={(e) =>
                                      setEditFileName(e.target.value)
                                    }
                                    className="text-sm font-medium text-gray-900 border rounded px-2 py-1 w-full"
                                    placeholder="Enter file name"
                                  />
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => saveFileName(image.id)}
                                      className="p-1 text-green-600 hover:bg-green-100 rounded-full"
                                    >
                                      <Save className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={cancelEditing}
                                      className="p-1 text-gray-500 hover:bg-gray-100 rounded-full"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <h3 className="text-sm font-medium text-gray-900 truncate">
                                    {image.fileName || "Unnamed image"}
                                  </h3>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {image.uploadedAt
                                      ?.toDate?.()
                                      .toLocaleDateString() ||
                                      new Date(
                                        image.uploadedAt
                                      ).toLocaleDateString()}
                                  </p>
                                </>
                              )}
                            </div>

                            <div className="flex gap-1">
                              {editingId !== image.id && (
                                <button
                                  onClick={() =>
                                    startEditing(image.id, image.fileName)
                                  }
                                  className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors ml-2 flex-shrink-0"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() =>
                                  handleDeleteGalleryImage(image.id)
                                }
                                disabled={deletingId === image.id}
                                className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors ml-2 flex-shrink-0"
                              >
                                {deletingId === image.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </div>
        <ToastContainer position="top-right" autoClose={5000} />
      </div>
    </>
  );
};

export default PhotoUploadPage;
