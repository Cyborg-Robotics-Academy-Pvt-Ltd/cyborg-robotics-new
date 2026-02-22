"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";

const ITEMS_PER_PAGE = 6;
const MAX_VISIBLE_PAGES = 5; // Limit visible pagination numbers

export default function Gallery() {
  const { userRole } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [isClient, setIsClient] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hydration fix - ensure component renders the same on server and client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch images from Firebase
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const q = query(
          collection(db, "galleryImage"),
          orderBy("uploadedAt", "desc"),
        );
        const querySnapshot = await getDocs(q);
        const images: any[] = [];
        let index = 1;
        querySnapshot.forEach((doc) => {
          const { fileId, ...rest } = doc.data();
          images.push({
            id: String(index++),
            ...rest,
          });
        });
        setGalleryImages(images);
      } catch (error) {
        console.error("Error fetching images:", error);
        // Fallback to static data if Firebase fetch fails
      } finally {
        setLoading(false);
      }
    };

    if (isClient) {
      fetchImages();
    }
  }, [isClient]);

  const totalPages = Math.min(
    100,
    Math.ceil(galleryImages.length / ITEMS_PER_PAGE),
  );

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const selectedImages = galleryImages.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const navigatePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Scroll to top of gallery on page change
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

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

        const response = await fetch("/api/gallery-upload", {
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
        console.log("Successfully uploaded images:", successfulUploads);
        // Refresh the gallery to show the new images
        const q = query(
          collection(db, "galleryImage"),
          orderBy("uploadedAt", "desc"),
        );
        const querySnapshot = await getDocs(q);
        const images: any[] = [];
        let index = 1;
        querySnapshot.forEach((doc) => {
          const { fileId, ...rest } = doc.data();
          images.push({
            id: String(index++),
            ...rest,
          });
        });
        setGalleryImages(images);

        if (failedUploads.length > 0) {
          alert(
            `Uploaded ${successfulUploads.length} images successfully. ${failedUploads.length} uploads failed.`,
          );
        } else {
          alert(`Uploaded ${successfulUploads.length} images successfully!`);
        }
      } else {
        console.error("All uploads failed:", results);
        alert("All uploads failed: " + results.map((r) => r.error).join(", "));
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed: " + error);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Generate pagination items with limited range and ellipsis
  const getPaginationItems = () => {
    const items = [];

    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink
          href="#"
          isActive={currentPage === 1}
          onClick={(e) => {
            e.preventDefault();
            navigatePage(1);
          }}
        >
          1
        </PaginationLink>
      </PaginationItem>,
    );

    // Calculate range to display
    let startPage = Math.max(
      2,
      currentPage - Math.floor(MAX_VISIBLE_PAGES / 2),
    );
    const endPage = Math.min(totalPages - 1, startPage + MAX_VISIBLE_PAGES - 2);

    // Adjust start if we're near the end
    if (endPage - startPage < MAX_VISIBLE_PAGES - 2) {
      startPage = Math.max(2, endPage - (MAX_VISIBLE_PAGES - 2));
    }

    // Add ellipsis if needed before start
    if (startPage > 2) {
      items.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            isActive={currentPage === i}
            onClick={(e) => {
              e.preventDefault();
              navigatePage(i);
            }}
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    // Add ellipsis if needed before end
    if (endPage < totalPages - 1) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>,
      );
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink
            href="#"
            isActive={currentPage === totalPages}
            onClick={(e) => {
              e.preventDefault();
              navigatePage(totalPages);
            }}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    return items;
  };

  // Don't render until after hydration to prevent mismatch
  if (!isClient || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto p-4 "
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Upload button - only show for admin users */}
      {userRole === "admin" && (
        <div className="mb-6 flex justify-center">
          <button
            onClick={handleUploadClick}
            disabled={isUploading}
            className="px-6 py-3 bg-red-800 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
          >
            {isUploading ? (
              <>
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
              </>
            ) : (
              "Upload Image"
            )}
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:gap-4 gap-2">
        <AnimatePresence mode="wait">
          {selectedImages.map((image, index) => (
            <motion.div
              key={`${image.id}-page-${currentPage}`}
              className="w-full md:h-80 h-64 overflow-hidden rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut",
              }}
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.2 },
              }}
            >
              <Image
                src={image.imageUrl}
                width={850}
                height={700}
                alt={`Gallery image of ${`item ${image.id}`}`}
                className="w-full object-cover h-full"
                sizes="(max-width: 740px) 50vw, (max-width: 1024px) 33vw, 400px"
                // Priority load first two images for better LCP
                priority={index < 2 && currentPage === 1}
                loading={index < 2 && currentPage === 1 ? "eager" : "lazy"}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="my-6 flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigatePage(currentPage - 1);
                }}
                className={
                  currentPage === 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {getPaginationItems()}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigatePage(currentPage + 1);
                }}
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </motion.div>
  );
}
