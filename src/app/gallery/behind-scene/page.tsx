"use client";

import React, {
  useState,
  useEffect,
  Suspense,
  useMemo,
  useCallback,
} from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
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
      <motion.div
        className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="relative w-full max-w-5xl max-h-[90vh] flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Close Button */}
          <motion.button
            className="absolute top-4 right-4 text-white bg-red-800/80 hover:bg-red-800 rounded-full w-12 h-12 flex items-center justify-center z-10 transition-colors shadow-lg"
            onClick={onClose}
            aria-label="Close lightbox"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <X className="w-6 h-6" />
          </motion.button>

          {/* Previous Button */}
          <motion.button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-red-800/80 hover:bg-red-800 rounded-full w-12 h-12 flex items-center justify-center z-10 transition-colors shadow-lg hidden sm:flex"
            onClick={onPrev}
            aria-label="Previous image"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>

          {/* Image Container */}
          <motion.div
            className="w-full max-h-[80vh] flex items-center justify-center rounded-xl overflow-hidden"
            key={image.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Image
              src={image.imageUrl || image.src}
              alt={image.fileName || image.alt || "Gallery image"}
              width={1200}
              height={900}
              className="max-h-[80vh] max-w-full object-contain"
              priority
              unoptimized
            />
          </motion.div>

          {/* Next Button */}
          <motion.button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-red-800/80 hover:bg-red-800 rounded-full w-12 h-12 flex items-center justify-center z-10 transition-colors shadow-lg hidden sm:flex"
            onClick={onNext}
            aria-label="Next image"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>

          {/* Mobile Navigation Hints */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 sm:hidden text-white/70 text-xs">
            <button
              onClick={onPrev}
              className="bg-red-800/80 px-3 py-2 rounded-full hover:bg-red-800"
            >
              ← Prev
            </button>
            <button
              onClick={onNext}
              className="bg-red-800/80 px-3 py-2 rounded-full hover:bg-red-800"
            >
              Next →
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  },
);

const BehindSceneContent = () => {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<string>(
    tabFromUrl &&
      ["certificates", "actions", "competitions", "workshops"].includes(
        tabFromUrl,
      )
      ? tabFromUrl
      : "certificates",
  );

  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(
    new Set(),
  );
  const itemsPerPage = 12;

  // Fetch photos once
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const photosQuery = query(
          collection(db, "photo"),
          orderBy("uploadedAt", "desc"),
        );
        const photosSnapshot = await getDocs(photosQuery);
        const photosData = photosSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
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

  const categoryMap = useMemo(
    () => ({
      certificates: "Student Certificate",
      actions: "Student Action",
      competitions: "Competition Glory",
      workshops: "Workshops",
    }),
    [],
  );

  const filteredPhotos = useMemo(() => {
    const categoryName = categoryMap[activeTab as keyof typeof categoryMap];
    return photos.filter((photo) => photo.category === categoryName);
  }, [photos, activeTab, categoryMap]);

  const { currentItems, totalPages } = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPhotos.slice(
      indexOfFirstItem,
      indexOfLastItem,
    );
    const totalPages = Math.ceil(filteredPhotos.length / itemsPerPage);
    return { currentItems, totalPages };
  }, [filteredPhotos, currentPage]);

  // Preload images on tab switch
  useEffect(() => {
    if (currentItems.length === 0) return;

    currentItems.slice(0, 6).forEach((img) => {
      if (!preloadedImages.has(img.id)) {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = img.imageUrl || img.src;
        document.head.appendChild(link);

        setPreloadedImages((prev) => new Set([...prev, img.id]));
      }
    });
  }, [currentItems, preloadedImages]);

  // Preload next page images
  useEffect(() => {
    const nextPageStart = currentPage * itemsPerPage;
    const nextPageEnd = nextPageStart + itemsPerPage;
    const nextPageImages = filteredPhotos.slice(nextPageStart, nextPageEnd);

    setTimeout(() => {
      nextPageImages.forEach((img) => {
        if (!preloadedImages.has(img.id)) {
          const link = document.createElement("link");
          link.rel = "prefetch";
          link.as = "image";
          link.href = img.imageUrl || img.src;
          document.head.appendChild(link);

          setPreloadedImages((prev) => new Set([...prev, img.id]));
        }
      });
    }, 500);
  }, [currentPage, filteredPhotos, preloadedImages]);

  const goToNextImage = useCallback(() => {
    setSelectedImage((prev: any) => {
      if (!prev) return null;
      const currentIndex = filteredPhotos.findIndex(
        (img) => img.id === prev.id,
      );
      if (currentIndex === -1) return prev;
      const nextIndex = (currentIndex + 1) % filteredPhotos.length;
      return filteredPhotos[nextIndex];
    });
  }, [filteredPhotos]);

  const goToPreviousImage = useCallback(() => {
    setSelectedImage((prev: any) => {
      if (!prev) return null;
      const currentIndex = filteredPhotos.findIndex(
        (img) => img.id === prev.id,
      );
      if (currentIndex === -1) return prev;
      const prevIndex =
        (currentIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
      return filteredPhotos[prevIndex];
    });
  }, [filteredPhotos]);

  const closeLightbox = useCallback(() => {
    setSelectedImage(null);
  }, []);

  useEffect(() => {
    if (!selectedImage) return;

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
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, closeLightbox, goToNextImage, goToPreviousImage]);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", activeTab);
    window.history.replaceState({}, "", url.toString());
    setCurrentPage(1);
  }, [activeTab]);

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
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const tabs = [
    { id: "certificates", label: "Student Certificate", icon: "🎖️" },
    { id: "actions", label: "Student Action", icon: "⚡" },
    { id: "competitions", label: "Student in Glory", icon: "🏆" },
    { id: "workshops", label: "Workshops", icon: "🛠️" },
  ];

  if (loading) {
    return (
      <>
        <Header />
        <GallerySkeleton />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Header />
      <div className="max-w-7xl mx-auto mt-10">
        {/* Hero Section with Enhanced Design */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-4"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-red-100 text-red-800 text-sm font-semibold mb-4">
              Gallery
            </span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-black mb-6 text-gray-900 leading-tight">
            Student{" "}
            <span className="bg-gradient-to-r from-red-800 via-red-700 to-red-600 bg-clip-text text-transparent">
              Achievements
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
            Explore our students' certificates, accomplishments, and moments of
            glory in competitions and workshops
          </p>
        </motion.div>

        {/* Enhanced Tab Navigation */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-16"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className="inline-flex gap-2 p-1 bg-gray-100 rounded-2xl">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 text-sm md:text-base ${
                  activeTab === tab.id
                    ? "bg-red-800 text-white shadow-lg shadow-red-800/30"
                    : "text-gray-700 hover:text-red-800 hover:bg-white"
                }`}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Gallery Container with Enhanced Styling */}
        <motion.div
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-gray-200/50 p-8 md:p-10"
          key={activeTab}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {error ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-5xl mb-4">⚠️</div>
              <p className="text-red-600 text-lg font-medium">{error}</p>
            </motion.div>
          ) : filteredPhotos.length === 0 ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-6xl mb-4">📷</div>
              <p className="text-gray-500 text-lg font-medium">
                No photos available in this category.
              </p>
            </motion.div>
          ) : (
            <>
              {/* Image Grid - Enhanced with 4 column layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <AnimatePresence mode="wait">
                  {currentItems.map((img, index) => (
                    <motion.div
                      key={img.id}
                      className="group relative overflow-hidden rounded-2xl cursor-pointer aspect-square shadow-md hover:shadow-2xl transition-all duration-300"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      whileHover={{ y: -6 }}
                      onClick={() => setSelectedImage(img)}
                    >
                      {/* Image */}
                      <Image
                        src={img.imageUrl || img.src}
                        alt={img.fileName || img.alt}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700"
                        priority={index < 4}
                        loading={index < 8 ? "eager" : "lazy"}
                        quality={75}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3C/svg%3E"
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Badge */}
                      <motion.div
                        className="absolute top-4 right-4 bg-red-800/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        whileHover={{ scale: 1.1 }}
                      >
                        View
                      </motion.div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <motion.div
                  className="flex justify-center items-center gap-4 pt-8 border-t border-gray-200"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`p-3 rounded-full transition-all ${
                      currentPage === 1
                        ? "text-gray-300 cursor-not-allowed bg-gray-100"
                        : "text-red-800 hover:bg-red-100 shadow-md hover:shadow-lg"
                    }`}
                    whileHover={currentPage !== 1 ? { scale: 1.1 } : {}}
                    whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
                  >
                    <ChevronLeft size={20} />
                  </motion.button>

                  <div className="flex gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }).map(
                      (_, i) => {
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
                          <motion.button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-10 h-10 rounded-full font-semibold transition-all text-sm ${
                              currentPage === pageNum
                                ? "bg-red-800 text-white shadow-lg shadow-red-800/30"
                                : "text-gray-700 hover:bg-red-100 bg-gray-100"
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {pageNum}
                          </motion.button>
                        );
                      },
                    )}
                  </div>

                  <motion.button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`p-3 rounded-full transition-all ${
                      currentPage === totalPages
                        ? "text-gray-300 cursor-not-allowed bg-red-100"
                        : "text-red-800 hover:bg-red-800 hover:text-red-800 shadow-md hover:shadow-lg"
                    }`}
                    whileHover={
                      currentPage !== totalPages ? { scale: 1.1 } : {}
                    }
                    whileTap={currentPage !== totalPages ? { scale: 0.95 } : {}}
                  >
                    <ChevronRight size={20} />
                  </motion.button>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <Lightbox
            image={selectedImage}
            onClose={closeLightbox}
            onNext={goToNextImage}
            onPrev={goToPreviousImage}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const BehindScenePage = () => {
  return (
    <Suspense fallback={<GallerySkeleton />}>
      <BehindSceneContent />
    </Suspense>
  );
};

export default BehindScenePage;
