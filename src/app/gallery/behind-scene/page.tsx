"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import Header from "@/components/layout/header";
import GallerySkeleton from "@/components/gallery/GallerySkeleton";

// Lightbox Component
const Lightbox = React.memo(
  ({
    image,
    onClose,
    onNext,
    onPrev,
  }: {
    image: any;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
  }) => {
    if (!image) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-6xl max-h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center z-10 hover:bg-opacity-75 transition-all"
            onClick={onClose}
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6 bg-red-800 rounded-full p-1" />
          </button>

          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center z-10 hover:bg-opacity-75 transition-all"
            onClick={onPrev}
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6 bg-red-800 rounded-full p-1" />
          </button>

          <div className="max-h-[90vh] max-w-[90vw] flex items-center justify-center p-8 rounded-2xl">
            <Image
              src={image.imageUrl || image.src}
              alt={image.fileName || image.alt || "Gallery image"}
              width={800}
              height={600}
              className="max-h-[80vh] max-w-[80vw] object-contain"
              priority={false}
              unoptimized // Allow browser to handle optimization
            />
          </div>

          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center z-10 hover:bg-opacity-75 transition-all"
            onClick={onNext}
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6 bg-red-800 rounded-full p-1" />
          </button>
        </div>
      </div>
    );
  },
);

const BehindSceneContent = () => {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");

  // Set initial active tab based on URL parameter or default to 'certificates'
  const [activeTab, setActiveTab] = useState(
    tabFromUrl &&
      [
        "certificates",
        "actions",
        "competitions",
        "workshops",
        "achievements",
      ].includes(tabFromUrl)
      ? tabFromUrl
      : "certificates",
  );

  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const itemsPerPage = 9; // Show 9 images per page (3x3 grid)

  // Fetch all photos from Firebase
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);

        const photosQuery = query(
          collection(db, "photo"),
          orderBy("uploadedAt", "desc"),
        );
        const photosSnapshot = await getDocs(photosQuery);

        const photosData: any[] = [];

        photosSnapshot.forEach((doc) => {
          const data = doc.data();
          photosData.push({
            id: doc.id,
            ...data,
          });
        });

        setPhotos(photosData);
      } catch (err) {
        console.error("Error fetching photos:", err);
        setError("Failed to load photos");
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  // Update URL when tab changes
  useEffect(() => {
    // Update the URL without causing a full page reload
    const url = new URL(window.location.href);
    url.searchParams.set("tab", activeTab);
    window.history.replaceState({}, "", url.toString());
  }, [activeTab]);

  // Show category loading when switching tabs
  useEffect(() => {
    if (!loading) {
      // Only show category loading after initial load
      setCategoryLoading(true);
      const timer = setTimeout(() => {
        setCategoryLoading(false);
      }, 300); // Brief loading indication
      return () => clearTimeout(timer);
    }
  }, [activeTab, loading]);

  // Handle keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowRight") {
        goToNextImage();
      } else if (e.key === "ArrowLeft") {
        goToPreviousImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxOpen, selectedImage, activeTab]);

  // Listen for URL changes (e.g., browser back/forward buttons)

  const tabs = [
    { id: "certificates", label: "Student Certificate" },
    { id: "actions", label: "Student Action" },
    { id: "competitions", label: "Student in (Competition) Glory" },

    { id: "workshops", label: "Workshops" },
  ];

  // Helper function to get all images in the current category (for navigation in lightbox)
  const getAllImagesInCategory = (category: string) => {
    return photos.filter((photo) => {
      if (
        (category === "certificates" &&
          photo.category === "Student Certificate") ||
        (category === "actions" && photo.category === "Student Action") ||
        (category === "competitions" &&
          photo.category === "Competition Glory") ||
        (category === "activities" && photo.category === "Class Activities") ||
        (category === "events" && photo.category === "Events") ||
        (category === "workshops" && photo.category === "Workshops")
      ) {
        return true;
      }
      return false;
    });
  };

  // Function to close the lightbox
  const closeLightbox = () => {
    setLightboxOpen(false);
    setSelectedImage(null);
  };

  // Function to navigate to the next image in the lightbox
  const goToNextImage = () => {
    if (!selectedImage) return;

    const currentCategoryImages = getAllImagesInCategory(activeTab);
    const currentIndex = currentCategoryImages.findIndex(
      (img) => img.id === selectedImage.id,
    );

    if (currentIndex !== -1) {
      const nextIndex = (currentIndex + 1) % currentCategoryImages.length;
      setSelectedImage(currentCategoryImages[nextIndex]);
    }
  };

  // Function to navigate to the previous image in the lightbox
  const goToPreviousImage = () => {
    if (!selectedImage) return;

    const currentCategoryImages = getAllImagesInCategory(activeTab);
    const currentIndex = currentCategoryImages.findIndex(
      (img) => img.id === selectedImage.id,
    );

    if (currentIndex !== -1) {
      const prevIndex =
        (currentIndex - 1 + currentCategoryImages.length) %
        currentCategoryImages.length;
      setSelectedImage(currentCategoryImages[prevIndex]);
    }
  };

  // Handle keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowRight") {
        goToNextImage();
      } else if (e.key === "ArrowLeft") {
        goToPreviousImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxOpen, closeLightbox, goToNextImage, goToPreviousImage]);

  // Listen for URL changes (e.g., browser back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const url = new URL(window.location.href);
      const tabParam = url.searchParams.get("tab");
      if (
        tabParam &&
        ["certificates", "actions", "competitions", "workshops"].includes(
          tabParam,
        )
      ) {
        setActiveTab(tabParam);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Filter photos by category
  const getPhotosByCategory = (category: string) => {
    return getAllImagesInCategory(category);
  };

  // Pagination logic moved to component level
  const getCurrentItems = (images: any[]) => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = images.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(images.length / itemsPerPage);
    return { currentItems, totalPages };
  };

  const renderImages = (images: any[]) => {
    const { currentItems, totalPages } = getCurrentItems(images);

    // Show skeleton loaders when switching categories
    if (categoryLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {Array.from({ length: itemsPerPage }).map((_, index) => (
            <motion.div
              key={index}
              className="overflow-hidden rounded-2xl shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="aspect-square overflow-hidden">
                <div className="w-full h-full bg-gray-200 animate-pulse rounded-none" />
              </div>
            </motion.div>
          ))}
        </div>
      );
    }

    if (images.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No photos available in this category.
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {currentItems.map((img, index) => (
            <motion.div
              key={img.id || img.fileName}
              className="overflow-hidden rounded-2xl shadow-lg  transform transition-transform duration-300 hover:-translate-y-1 cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                setSelectedImage(img);
                setLightboxOpen(true);
              }}
            >
              <div className="aspect-square overflow-hidden">
                <Image
                  src={img.imageUrl || img.src}
                  alt={img.fileName || img.alt}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover transition-transform duration-300 cursor-pointer"
                  priority={index < 2}
                  loading={index < 6 ? "eager" : "lazy"}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded-full ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-red-800 hover:bg-red-100"
              }`}
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-full ${
                      currentPage === pageNum
                        ? "bg-red-800 text-white"
                        : "text-gray-700 hover:bg-red-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`p-2 rounded-full ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-red-800 hover:bg-red-100"
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </>
    );
  };

  if (loading) {
    return (
      <>
        <Header />
        <GallerySkeleton />
      </>
    );
  }

  return (
    <div className="min-h-screen  py-8 px-4 sm:px-6 lg:px-8">
      <Header />
      <div className="max-w-7xl mx-auto mt-10">
        <motion.div
          className="text-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl gradient-text md:text-4xl font-bold  mb-3 md:mb-4">
            Student Achievements
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            Explore our students' certificates, accomplishments, and moments of
            glory in competitions
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (activeTab !== tab.id) {
                  setCategoryLoading(true); // Show loading immediately
                  setActiveTab(tab.id);
                  setCurrentPage(1); // Reset to first page when changing tabs
                  // Update URL with the new tab
                  const url = new URL(window.location.href);
                  url.searchParams.set("tab", tab.id);
                  window.history.replaceState({}, "", url.toString());
                }
              }}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-red-800 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-red-100 border border-gray-200 hover:text-red-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl  p-4 md:p-6"
        >
          {error ? (
            <div className="text-center py-12">
              <p className="text-red-600 text-lg">{error}</p>
            </div>
          ) : (
            <>
              {activeTab === "certificates" &&
                renderImages(getPhotosByCategory("certificates"))}
              {activeTab === "actions" &&
                renderImages(getPhotosByCategory("actions"))}
              {activeTab === "competitions" &&
                renderImages(getPhotosByCategory("competitions"))}

              {activeTab === "workshops" &&
                renderImages(getPhotosByCategory("workshops"))}
            </>
          )}
        </motion.div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && selectedImage && (
        <Lightbox
          image={selectedImage}
          onClose={closeLightbox}
          onNext={goToNextImage}
          onPrev={goToPreviousImage}
        />
      )}
    </div>
  );
};

const BehindScenePage = () => {
  return (
    <Suspense
      fallback={
        <GallerySkeleton showHeader={false} showTabs={false} itemsPerPage={6} />
      }
    >
      <BehindSceneContent />
    </Suspense>
  );
};

export default BehindScenePage;
