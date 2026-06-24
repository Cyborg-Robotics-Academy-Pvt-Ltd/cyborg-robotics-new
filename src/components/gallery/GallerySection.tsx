"use client";

import React, {
  useState,
  useEffect,
  Suspense,
  useCallback,
  useMemo,
} from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  Trophy,
  Images,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import GallerySkeleton from "@/components/gallery/GallerySkeleton";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Photo {
  id: string;
  imageUrl?: string;
  src?: string;
  fileName?: string;
  alt?: string;
  category?: string;
  uploadedAt?: any;
  width?: number;
  height?: number;
}

// ─── Image Dimension Cache ────────────────────────────────────────────────────
const imageDimensionCache = new Map<
  string,
  { width: number; height: number }
>();

const getImageDimensions = (
  src: string,
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    // Check cache first
    if (imageDimensionCache.has(src)) {
      resolve(imageDimensionCache.get(src)!);
      return;
    }

    const img = new window.Image();
    img.onload = () => {
      const dimensions = { width: img.width, height: img.height };
      imageDimensionCache.set(src, dimensions);
      resolve(dimensions);
    };
    img.onerror = () => {
      // Fallback to 4/3 if load fails
      resolve({ width: 4, height: 3 });
    };
    img.src = src;
  });
};

// ─── Lightbox ─────────────────────────────────────────────────────────────────
const Lightbox = React.memo(
  ({
    image,
    index,
    total,
    onClose,
    onNext,
    onPrev,
    direction,
  }: {
    image: Photo;
    index: number;
    total: number;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
    direction: number;
  }) => {
    if (!image) return null;

    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/95 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Close */}
        <motion.button
          className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-red-800 text-white flex items-center justify-center transition-colors duration-200 border border-white/20"
          onClick={onClose}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Close lightbox"
        >
          <X className="w-5 h-5" />
        </motion.button>

        {/* Counter */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 bg-white/10 border border-white/20 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full">
          {index + 1} / {total}
        </div>

        {/* Prev */}
        <motion.button
          className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-red-800 text-white flex items-center justify-center transition-colors duration-200 border border-white/20 shadow-xl"
          onClick={onPrev}
          whileHover={{ scale: 1.1, x: -2 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6" />
        </motion.button>

        {/* Image */}
        <div className="relative z-10 w-full max-w-5xl px-16 sm:px-24 max-h-[85vh] flex flex-col items-center gap-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={image.id}
              className="relative w-full max-h-[75vh] flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl"
              initial={{ opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -60 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <Image
                src={image.imageUrl || image.src || ""}
                alt={image.fileName || image.alt || "Gallery image"}
                width={image.width || 1200}
                height={image.height || 900}
                className="max-h-[75vh] max-w-full object-contain"
                priority
              />
            </motion.div>
          </AnimatePresence>

          {/* Caption */}
          {image.fileName && (
            <motion.p
              className="text-white/50 text-xs text-center truncate max-w-md"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              {image.fileName}
            </motion.p>
          )}
        </div>

        {/* Next */}
        <motion.button
          className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-red-800 text-white flex items-center justify-center transition-colors duration-200 border border-white/20 shadow-xl"
          onClick={onNext}
          whileHover={{ scale: 1.1, x: 2 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6" />
        </motion.button>
      </motion.div>
    );
  },
);
Lightbox.displayName = "Lightbox";

// ─── Photo Card ───────────────────────────────────────────────────────────────
const PhotoCard = React.memo(
  ({
    photo,
    index,
    onClick,
    aspectRatio,
  }: {
    photo: Photo;
    index: number;
    onClick: () => void;
    aspectRatio: string;
  }) => (
    <motion.div
      className="group relative overflow-hidden rounded-2xl cursor-pointer bg-gray-100 w-full"
      style={{ aspectRatio }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: (index % 8) * 0.05, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
    >
      <Image
        src={photo.imageUrl || photo.src || ""}
        alt={photo.fileName || photo.alt || "Gallery image"}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-110"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        loading={index < 8 ? "eager" : "lazy"}
        quality={75}
        placeholder="blur"
        blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3C/svg%3E"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Zoom Icon */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={false}
      >
        <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-lg">
          <ZoomIn className="w-5 h-5 text-white" />
        </div>
      </motion.div>
    </motion.div>
  ),
);
PhotoCard.displayName = "PhotoCard";

// ─── Main Content ─────────────────────────────────────────────────────────────
const BehindSceneContent = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState(1);
  const [aspectRatios, setAspectRatios] = useState<Record<string, string>>({});

  // Fetch photos from Firestore
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const photosQuery = query(
          collection(db, "photo"),
          orderBy("uploadedAt", "desc"),
        );
        const snap = await getDocs(photosQuery);
        const data = snap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }) as Photo)
          .filter((p) => p.category === "Competition Glory");

        setPhotos(data);

        // Preload image dimensions
        const ratios: Record<string, string> = {};
        for (const photo of data) {
          const src = photo.imageUrl || photo.src || "";
          if (!src) continue;

          try {
            const dims =
              photo.width && photo.height
                ? { width: photo.width, height: photo.height }
                : await getImageDimensions(src);
            ratios[photo.id] = `${dims.width}/${dims.height}`;
          } catch {
            // Fallback to 4/3 on error
            ratios[photo.id] = "4/3";
          }
        }
        setAspectRatios(ratios);
      } catch (err) {
        console.error("Error fetching photos:", err);
        setError("Failed to load photos. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  const openLightbox = useCallback(
    (index: number) => setSelectedIndex(index),
    [],
  );

  const closeLightbox = useCallback(() => setSelectedIndex(null), []);

  const goToNext = useCallback(() => {
    setDirection(1);
    setSelectedIndex((prev) =>
      prev === null ? null : (prev + 1) % photos.length,
    );
  }, [photos.length]);

  const goToPrev = useCallback(() => {
    setDirection(-1);
    setSelectedIndex((prev) =>
      prev === null ? null : (prev - 1 + photos.length) % photos.length,
    );
  }, [photos.length]);

  // Keyboard navigation
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      else if (e.key === "ArrowRight") goToNext();
      else if (e.key === "ArrowLeft") goToPrev();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedIndex, closeLightbox, goToNext, goToPrev]);

  if (loading) {
    return (
      <>
        <GallerySkeleton />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Ambient orbs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute -top-20 right-0 w-72 h-72 bg-blue-100 rounded-full blur-3xl opacity-40 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <Trophy className="w-4 h-4" />
              Competition Glory
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight leading-[1.05] mb-5">
              Student{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-red-700 to-red-500 bg-clip-text text-transparent">
                  Wins
                </span>
                <motion.span
                  className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-red-700 to-red-400 rounded-full"
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
                />
              </span>
            </h1>

            <p className="text-lg text-gray-500 max-w-2xl font-light leading-relaxed mb-4">
              Awards, podium moments, and competition highlights — every photo
              is a story of skill built at Cyborg Robotics.
            </p>

            {photos.length > 0 && (
              <motion.div
                className="flex items-center gap-2 text-sm text-gray-400 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Images className="w-4 h-4" />
                {photos.length} photos
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* ── Gallery Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {error ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-2xl">
              ⚠️
            </div>
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-gray-500 underline hover:text-gray-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-3xl">
              📷
            </div>
            <p className="text-gray-500 font-medium">
              No photos yet in this category.
            </p>
            <p className="text-gray-400 text-sm">
              Check back after the next competition!
            </p>
          </div>
        ) : (
          <motion.div
            className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {photos.map((photo, index) => (
              <div key={photo.id} className="break-inside-avoid">
                <PhotoCard
                  photo={photo}
                  index={index}
                  onClick={() => openLightbox(index)}
                  aspectRatio={aspectRatios[photo.id] || "4/3"}
                />
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {selectedIndex !== null && photos[selectedIndex] && (
          <Lightbox
            image={photos[selectedIndex]}
            index={selectedIndex}
            total={photos.length}
            direction={direction}
            onClose={closeLightbox}
            onNext={goToNext}
            onPrev={goToPrev}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const BehindScenePage = () => (
  <Suspense fallback={<GallerySkeleton />}>
    <BehindSceneContent />
  </Suspense>
);

export default BehindScenePage;
