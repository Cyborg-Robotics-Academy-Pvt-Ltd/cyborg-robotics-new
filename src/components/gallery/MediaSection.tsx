"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";

import { X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { Tooltip } from "react-tooltip";
import { FileUpload } from "@/components/gallery/file-upload";

interface FileData {
  name: string;
  type: string;
  size: number;
  preview: string | null;
  file: File;
  status: "uploading" | "complete" | "error" | "compressing";
  secure_url?: string;
  originalFile?: File;
  compressedSize?: number;
}

interface StudentData {
  PrnNumber?: string;
  username?: string;
  uid?: string;
}

// Interface for PRN suggestions
interface PrnSuggestion {
  prn: string;
  username: string;
}

// Compression utility function
const compressImage = (file: File, maxSizeKB: number = 100): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new window.Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      const maxDimension = 1200; // Maximum dimension to prevent too large images

      if (width > height && width > maxDimension) {
        height = (height * maxDimension) / width;
        width = maxDimension;
      } else if (height > maxDimension) {
        width = (width * maxDimension) / height;
        height = maxDimension;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw image on canvas
      ctx?.drawImage(img, 0, 0, width, height);

      // Start with high quality and reduce until file size is acceptable
      let quality = 0.9;

      const compressWithQuality = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"));
              return;
            }

            const sizeKB = blob.size / 1024;

            if (sizeKB <= maxSizeKB || quality <= 0.1) {
              // Create new file with compressed data
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              // Reduce quality and try again
              quality -= 0.1;
              compressWithQuality();
            }
          },
          file.type,
          quality
        );
      };

      compressWithQuality();
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};

const MediaSection = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedImages, setUploadedImages] = useState<FileData[]>([]);
  const [prnNumber, setPrnNumber] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // New states for PRN auto-search functionality
  const [prnSuggestions, setPrnSuggestions] = useState<PrnSuggestion[]>([]);
  const [allPrns, setAllPrns] = useState<PrnSuggestion[]>([]);

  const handleUpload = async (file: File): Promise<FileData | null> => {
    setLoading(true);
    setError("");

    try {
      // Compress the file first
      const compressedFile = await compressImage(file, 100);

      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("upload_preset", "shrikant");

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dz8enfjtx/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Upload failed");
      }

      return {
        ...data,
        originalFile: file,
        name: file.name,
        type: file.type,
        size: file.size,
        compressedSize: compressedFile.size,
        secure_url: data.secure_url,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : null,
        status: "complete",
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      console.error("Upload error:", err);
      return null;
    }
  };

  // Refactor handleFileChange to accept File[] directly
  const handleFileChange = async (
    selectedFiles: File[] | React.ChangeEvent<HTMLInputElement>
  ) => {
    let filesArray: File[] = [];
    if (Array.isArray(selectedFiles)) {
      filesArray = selectedFiles;
    } else if (selectedFiles.target.files) {
      filesArray = Array.from(selectedFiles.target.files);
    }
    if (!filesArray.length) return;

    setLoading(true);
    const uploadPromises: Promise<FileData | null>[] = [];
    const newFiles: FileData[] = [];

    // Process files and create preview
    for (let i = 0; i < filesArray.length; i++) {
      const file = filesArray[i];
      newFiles.push({
        name: file.name,
        type: file.type,
        size: file.size,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : null,
        file: file,
        status: "compressing",
      });
    }

    // Update UI with files that are being processed
    setFiles([...files, ...newFiles]);

    // Compress and upload each file
    for (let i = 0; i < filesArray.length; i++) {
      uploadPromises.push(handleUpload(filesArray[i]));
    }

    try {
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(
        (f): f is FileData => f !== null
      );
      setUploadedImages((prev) => [...prev, ...successfulUploads]);
      setMessage(
        successfulUploads.length > 0
          ? `Uploaded ${successfulUploads.length} file(s) successfully!`
          : "No files uploaded."
      );
      // Update file status for completed uploads (fix for stuck 'compressing')
      const updatedFiles = [...files, ...newFiles].map((file) => {
        const uploadResult = successfulUploads.find(
          (result) => result.name === file.name && result.size === file.size
        );
        if (uploadResult) {
          return {
            ...file,
            status: "complete",
            secure_url: uploadResult.secure_url,
            compressedSize: uploadResult.compressedSize,
          };
        }
        return file;
      });
      setFiles(updatedFiles as FileData[]);
    } catch (err) {
      console.error("Upload error:", err);
      setError("An error occurred during upload.");
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles || droppedFiles.length === 0) return;
    const filesArray = Array.from(droppedFiles);
    await handleFileChange(filesArray);
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    if (newFiles[index].preview) {
      URL.revokeObjectURL(newFiles[index].preview);
    }

    // If this file was successfully uploaded, also remove from uploadedImages
    if (newFiles[index].secure_url) {
      setUploadedImages(
        uploadedImages.filter(
          (img) => img.secure_url !== newFiles[index].secure_url
        )
      );
    }

    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  // Function to fetch all PRNs
  const fetchPrns = useCallback(async () => {
    try {
      const db = getFirestore();
      const studentsCollection = collection(db, "students");
      const querySnapshot = await getDocs(studentsCollection);
      const prnList: PrnSuggestion[] = [];

      querySnapshot.forEach((doc) => {
        const studentData = doc.data() as StudentData;
        prnList.push({
          prn: studentData.PrnNumber || "",
          username: studentData.username || "",
        });
      });

      setAllPrns(prnList);
    } catch (error) {
      console.error("Error fetching PRN numbers: ", error);
      setError("Failed to fetch PRN numbers. Please try again.");
    }
  }, []);

  // Function to handle PRN input change
  const handlePrnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrnNumber(value);

    if (value.trim()) {
      const filteredSuggestions = allPrns.filter(
        (suggestion) =>
          suggestion.prn.toLowerCase().includes(value.toLowerCase()) ||
          suggestion.username.toLowerCase().includes(value.toLowerCase())
      );
      setPrnSuggestions(filteredSuggestions);
    } else {
      setPrnSuggestions([]);
    }
  };

  // Function to handle PRN selection from suggestions
  const handlePrnSelect = (selectedPrn: string) => {
    setPrnNumber(selectedPrn);
    setPrnSuggestions([]);
  };
  const findStudentByPRN = async (
    prnNumber: string
  ): Promise<StudentData | null> => {
    try {
      // Initialize Firestore
      const firestore = getFirestore();

      // Create a query against the students collection
      const studentsRef = collection(firestore, "students");
      const q = query(studentsRef, where("PrnNumber", "==", prnNumber));

      // Execute query
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      // Get the first document that matches
      const studentDoc = querySnapshot.docs[0];
      const studentData = studentDoc.data() as StudentData;

      return {
        PrnNumber: studentData.PrnNumber || prnNumber,
        username: studentData.username,
        uid: studentDoc.id, // Always use the Firestore document ID
      };
    } catch (error) {
      console.error("Error finding student:", error);
      return null;
    }
  };

  // Modified function to store URL in Firebase
  const verifyAndStoreImage = async (url: string) => {
    if (!prnNumber) {
      setError("Please enter a PRN number");
      return;
    }

    if (!url) {
      setError("No image URL available");
      return;
    }

    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      // Find student by PRN
      const student = await findStudentByPRN(prnNumber);

      if (!student) {
        setError(`No student found with PRN: ${prnNumber}`);
        setIsSaving(false);
        return;
      }

      // Get Firestore reference
      const firestore = getFirestore();

      if (!student.uid) {
        throw new Error("Student UID is undefined");
      }

      // Reference to the student document
      const studentDocRef = doc(firestore, "students", student.uid);

      // Update the student document with the image URL
      await updateDoc(studentDocRef, {
        imageUrls: arrayUnion(url), // Add URL to an array field called imageUrls
      });

      // Successfully verified student and stored URL
      setMessage(
        `Image successfully stored for student with PRN: ${prnNumber}`
      );
      setPrnNumber(""); // Clear the PRN input after successful verification

      // Clear the file input (optional)
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      // Keep uploaded images and selection so user can assign again without re-uploading
    } catch (error) {
      console.error("Error storing image URL:", error);
      setError(
        "Failed to store image URL: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Load PRNs on component mount
  useEffect(() => {
    fetchPrns();
  }, [fetchPrns]);

  return (
    <div className="w-full max-w-6xl mx-auto p-8 bg-white  rounded-xl shadow-lg mt-16 transition-transform transform ">
      <h2 className="text-4xl font-bold mb-6 text-gray-800 flex items-center">
        <span className="bg-red-100 p-2 rounded-lg mr-3">
          {/* Removed Image icon */}
        </span>
        Media Library
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {message && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p>{message}</p>
        </div>
      )}

      {/* Upload section with drag-and-drop */}
      <div
        className={`w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg mb-8 ${
          isDragging ? "border-[#991b1b] bg-red-50" : ""
        }`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <FileUpload
          onChange={(newFiles: File[]) => handleFileChange(newFiles)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Files preview section */}
        {files.length > 0 && (
          <div className="lg:col-span-2">
            <div className="bg-gray-50 rounded-xl p-6 h-full shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
                <span className="bg-red-100 p-1.5 rounded-md mr-2">
                  {/* Removed Image icon */}
                </span>
                Uploaded Files ({files.length})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="border rounded-xl p-3 bg-white shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className="relative pb-[70%] mb-3 bg-gray-100 rounded-lg overflow-hidden">
                      {file.preview ? (
                        <Image
                          src={file.preview}
                          alt={file.name}
                          layout="fill"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          {/* Removed Image icon */}
                        </div>
                      )}
                      <Tooltip content="Remove file">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full shadow-sm transition-all"
                          disabled={loading}
                        >
                          <X className="w-4 h-4 text-gray-700" />
                        </button>
                      </Tooltip>
                    </div>
                    <div className="px-1">
                      <p
                        className="font-medium text-gray-800 truncate text-sm"
                        title={file.name}
                      >
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {file.compressedSize ? (
                          <span>
                            <span className="line-through text-gray-400">
                              {formatFileSize(file.size)}
                            </span>
                            <span className="ml-1 text-green-600 font-medium">
                              {formatFileSize(file.compressedSize)}
                            </span>
                          </span>
                        ) : (
                          formatFileSize(file.size)
                        )}
                      </p>
                      <div className="mt-2">
                        {file.status === "compressing" ? (
                          <span className="inline-flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Compressing...
                          </span>
                        ) : file.status === "uploading" ? (
                          <span className="inline-flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Uploading...
                          </span>
                        ) : file.status === "complete" ? (
                          <span className="inline-flex items-center text-xs text-[#991b1b] bg-red-50 px-2 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </span>
                        ) : file.status === "error" ? (
                          <span className="inline-flex items-center text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Failed
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Compression Statistics */}
              {uploadedImages.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-md font-medium mb-3 text-gray-700 flex items-center">
                    <span className="bg-green-100 p-1 rounded-md mr-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </span>
                    Compression Statistics
                  </h4>
                  <div className="bg-white border rounded-lg p-4 shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {uploadedImages.length}
                        </div>
                        <div className="text-sm text-gray-600">
                          Files Processed
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {uploadedImages.reduce(
                            (total, img) => total + (img.size || 0),
                            0
                          ) /
                            1024 /
                            1024 >
                          1
                            ? `${(uploadedImages.reduce((total, img) => total + (img.size || 0), 0) / 1024 / 1024).toFixed(1)} MB`
                            : `${(uploadedImages.reduce((total, img) => total + (img.size || 0), 0) / 1024).toFixed(1)} KB`}
                        </div>
                        <div className="text-sm text-gray-600">
                          Original Size
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#991b1b]">
                          {uploadedImages.reduce(
                            (total, img) => total + (img.compressedSize || 0),
                            0
                          ) /
                            1024 /
                            1024 >
                          1
                            ? `${(uploadedImages.reduce((total, img) => total + (img.compressedSize || 0), 0) / 1024 / 1024).toFixed(1)} MB`
                            : `${(uploadedImages.reduce((total, img) => total + (img.compressedSize || 0), 0) / 1024).toFixed(1)} KB`}
                        </div>
                        <div className="text-sm text-gray-600">
                          Compressed Size
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <div className="text-lg font-semibold text-gray-800">
                        {Math.round(
                          (1 -
                            uploadedImages.reduce(
                              (total, img) => total + (img.compressedSize || 0),
                              0
                            ) /
                              uploadedImages.reduce(
                                (total, img) => total + (img.size || 0),
                                0
                              )) *
                            100
                        )}
                        % Size Reduction
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Display Cloudinary URLs */}
              {uploadedImages.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-md font-medium mb-3 text-gray-700 flex items-center">
                    <span className="bg-red-100 p-1 rounded-md mr-2">
                      <CheckCircle className="w-4 h-4 text-[#991b1b]" />
                    </span>
                    Cloudinary URLs
                  </h4>
                  <div className="bg-white border rounded-lg p-4 max-h-48 overflow-y-auto shadow-md">
                    <ul className="divide-y">
                      {uploadedImages.map((img, index) => (
                        <li key={index} className="py-2">
                          <div className="flex items-center">
                            <Image
                              src={img.secure_url || "/placeholder.png"}
                              alt={img.name || "Uploaded image"}
                              width={40}
                              height={40}
                              className="w-10 h-10 mr-3 rounded object-cover"
                            />
                            <div className="flex-1">
                              <a
                                href={img.secure_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#991b1b] hover:underline text-sm break-all"
                              >
                                {img.secure_url}
                              </a>
                              <div className="text-xs text-gray-500 mt-1">
                                {img.compressedSize && (
                                  <span>
                                    Compressed:{" "}
                                    {formatFileSize(img.compressedSize)}
                                    (from {formatFileSize(img.size)})
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PRN input and assign section */}
        {uploadedImages.length > 0 && (
          <div className={files.length > 0 ? "lg:col-span-1" : "lg:col-span-3"}>
            <div className="bg-gray-50 rounded-xl p-6 h-full shadow-lg">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">
                Assign to Student
              </h3>
              <div className="flex flex-col space-y-5">
                <div>
                  <label
                    htmlFor="prnNumber"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Student PRN Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="prnNumber"
                      value={prnNumber}
                      onChange={handlePrnChange}
                      placeholder="Enter PRN number (e.g. 7020354108)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#991b1b] focus:border-transparent"
                    />

                    {/* PRN Suggestions Dropdown */}
                    {prnSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {prnSuggestions.map((suggestion) => (
                          <div
                            key={suggestion.prn}
                            onClick={() => handlePrnSelect(suggestion.prn)}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-[#991b1b] cursor-pointer transition-colors duration-200"
                          >
                            <span className="font-medium">
                              {suggestion.prn}
                            </span>{" "}
                            - {suggestion.username}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Image
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                    {uploadedImages.map((img, index) => (
                      <div
                        key={index}
                        className={`border-2 rounded-lg p-2 cursor-pointer transition-all ${
                          selectedImageIndex === index
                            ? "border-[#991b1b] bg-red-50 transform scale-105"
                            : "border-gray-200 hover:border-[#991b1b] hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <div className="relative pb-[70%] mb-1">
                          <Image
                            src={img.secure_url || "/placeholder.png"}
                            alt={img.name || `Image ${index}`}
                            layout="fill"
                            className="absolute inset-0 w-full h-full object-cover rounded"
                          />
                          {selectedImageIndex === index && (
                            <div className="absolute top-1 right-1 bg-[#991b1b] rounded-full p-1">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="text-xs truncate text-gray-600 text-center">
                          {img.name || `Image ${index + 1}`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    const imgToAssign =
                      selectedImageIndex !== null
                        ? uploadedImages[selectedImageIndex]
                        : uploadedImages[0];
                    verifyAndStoreImage(imgToAssign?.secure_url || "");
                  }}
                  disabled={
                    isSaving || !prnNumber || uploadedImages.length === 0
                  }
                  className={`mt-4 py-3 rounded-lg font-medium transition-all transform ${
                    isSaving || !prnNumber || uploadedImages.length === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-[#991b1b] text-white hover:bg-[#7d1616] hover:shadow-lg active:scale-98"
                  }`}
                >
                  {isSaving ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submiting......
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Submit
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaSection;
