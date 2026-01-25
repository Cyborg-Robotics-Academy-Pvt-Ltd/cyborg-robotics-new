"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { motion } from "framer-motion";
import { Trash2, Upload, Eye, Loader2, Edit3, Save, X } from "lucide-react";
import Image from "next/image";
import Head from "next/head";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";
import AuthLoadingSpinner from "@/components/AuthLoadingSpinner";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Skeleton } from "@/components/ui/skeleton";

export function ImageContentCardSkeleton() {
  return (
    <div className="rounded-xl  bg-card p-3 space-y-3">
      {/* Image */}
      <Skeleton className="h-48 w-full rounded-lg" />

      {/* Title */}
      <Skeleton className="h-4 w-3/4" />

      {/* Description / subtitle */}
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />

      {/* Footer (optional) */}
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  );
}

export default function GalleryDataPage() {
  const { userRole, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "galleryImage" | "homeGalleryImage"
  >("galleryImage");
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [homeGalleryImages, setHomeGalleryImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFileName, setEditFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch images from Firebase
  useEffect(() => {
    // Only fetch if user is authenticated and is admin
    if (authLoading || userRole !== "admin") return;

    const fetchImages = async () => {
      try {
        // Fetch gallery images
        const galleryQuery = query(
          collection(db, "galleryImage"),
          orderBy("uploadedAt", "desc")
        );
        const gallerySnapshot = await getDocs(galleryQuery);
        const galleryImagesData: any[] = [];
        gallerySnapshot.forEach((doc) => {
          galleryImagesData.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        setGalleryImages(galleryImagesData);

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
      } catch (error) {
        console.error("Error fetching images:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [authLoading, userRole]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      // Upload each file
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        // Use different API endpoints based on active tab
        const endpoint =
          activeTab === "galleryImage"
            ? "/api/gallery-upload"
            : "/api/home-gallery-upload";

        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });

        return await response.json();
      });

      const results = await Promise.all(uploadPromises);

      // Check if all uploads were successful
      const successfulUploads = results.filter((result) => result.imageUrl);
      const failedUploads = results.filter((result) => !result.imageUrl);

      if (successfulUploads.length > 0) {
        // Refresh the gallery to show the new images
        const collectionName =
          activeTab === "galleryImage" ? "galleryImage" : "homeGalleryImage";
        const q = query(
          collection(db, collectionName),
          orderBy("uploadedAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const images: any[] = [];
        querySnapshot.forEach((doc) => {
          images.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        // Update the appropriate state
        if (activeTab === "galleryImage") {
          setGalleryImages(images);
        } else {
          setHomeGalleryImages(images);
        }

        if (failedUploads.length > 0) {
          toast.warn(
            `Uploaded ${successfulUploads.length} images successfully. ${failedUploads.length} uploads failed.`
          );
        } else {
          toast.success(
            `Uploaded ${successfulUploads.length} images successfully!`
          );
        }
      } else {
        toast.error(
          "All uploads failed: " + results.map((r) => r.error).join(", ")
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed: " + error);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteImage = async (imageId: string, fileId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) {
      return;
    }

    setDeletingId(imageId);
    try {
      // Use different API endpoints based on active tab
      const endpoint =
        activeTab === "galleryImage"
          ? `/api/delete-gallery-image?imageId=${imageId}`
          : `/api/delete-home-gallery-image?imageId=${imageId}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete image");
      }

      // Update local state
      if (activeTab === "galleryImage") {
        setGalleryImages((prevImages) =>
          prevImages.filter((img) => img.id !== imageId)
        );
      } else {
        setHomeGalleryImages((prevImages) =>
          prevImages.filter((img) => img.id !== imageId)
        );
      }

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
      // Call the API to update the file name
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

      // Update local state
      if (activeTab === "galleryImage") {
        setGalleryImages((prevImages) =>
          prevImages.map((img) =>
            img.id === imageId ? { ...img, fileName: editFileName } : img
          )
        );
      } else {
        setHomeGalleryImages((prevImages) =>
          prevImages.map((img) =>
            img.id === imageId ? { ...img, fileName: editFileName } : img
          )
        );
      }

      // Exit editing mode
      setEditingId(null);
      setEditFileName("");

      toast.success("File name updated successfully!");
    } catch (error) {
      console.error("Error updating file name:", error);
      toast.error("Failed to update file name: " + error);
    }
  };

  // Check if user is authorized
  if (authLoading) {
    return <AuthLoadingSpinner />;
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
              Gallery Data Management
            </h1>
            <p className="text-gray-600">
              Upload, view, and manage gallery images
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`py-2 px-4 font-medium text-sm rounded-t-lg ${
                activeTab === "galleryImage"
                  ? "text-red-800 border-b-2 border-red-800 bg-red-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("galleryImage")}
            >
              Gallery Images
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
                  Upload New{" "}
                  {activeTab === "galleryImage" ? "Gallery" : "Home Gallery"}{" "}
                  Images
                </h2>
                <p className="text-gray-600">
                  Add new images to the{" "}
                  {activeTab === "galleryImage" ? "gallery" : "home gallery"}
                </p>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                multiple
                className="hidden"
              />

              <button
                onClick={handleUploadClick}
                disabled={isUploading}
                className="px-4 py-3 bg-red-800 text-white rounded-3xl hover:bg-red-900 transition-colors flex items-center disabled:opacity-50"
              >
                {isUploading ? (
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
              {activeTab === "galleryImage"
                ? "Gallery Images"
                : "Home Gallery Images"}
            </h2>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <ImageContentCardSkeleton key={index} />
                ))}
              </div>
            ) : activeTab === "galleryImage" ? (
              galleryImages.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <Eye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No gallery images found
                  </h3>
                  <p className="text-gray-500">
                    Upload some images to get started
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {galleryImages.map((image) => (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden group"
                    >
                      <div className="relative pb-[75%]">
                        <Image
                          src={image.imageUrl}
                          alt={image.fileName || "Gallery image"}
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
                                handleDeleteImage(image.id, image.fileId)
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
              )
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
                              handleDeleteImage(image.id, image.fileId)
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
        </div>
        <ToastContainer position="top-right" autoClose={5000} />
      </div>
    </>
  );
}
