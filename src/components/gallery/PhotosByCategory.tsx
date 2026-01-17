"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";

interface PhotosByCategoryProps {
  category?: string; // Optional prop to filter by specific category
  limit?: number; // Optional prop to limit number of photos shown
  showFilters?: boolean; // Whether to show category filter buttons
}

const PhotosByCategory: React.FC<PhotosByCategoryProps> = ({
  category,
  limit,
  showFilters = true,
}) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [allPhotos, setAllPhotos] = useState<any[]>([]);

  // Fetch all photos and unique categories
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all photos or photos from specific category
      let photosQuery;
      if (category) {
        photosQuery = query(
          collection(db, "photo"),
          where("category", "==", category),
          orderBy("uploadedAt", "desc")
        );
      } else {
        photosQuery = query(
          collection(db, "photo"),
          orderBy("uploadedAt", "desc")
        );
      }

      const photosSnapshot = await getDocs(photosQuery);

      const photosData: any[] = [];
      const uniqueCategories = new Set<string>();

      photosSnapshot.forEach((doc) => {
        const data = doc.data();
        photosData.push({
          id: doc.id,
          ...data,
        });
        if (!category) {
          // Only collect categories if not filtering by a specific category
          uniqueCategories.add(data.category);
        }
      });

      // Apply limit if specified
      const limitedPhotos = limit ? photosData.slice(0, limit) : photosData;

      setAllPhotos(photosData);
      setPhotos(limitedPhotos);
      if (!category) {
        setCategories(Array.from(uniqueCategories));
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [category]); // Re-fetch when category changes

  const filterPhotosByCategory = (category: string) => {
    if (category === "all") {
      const limitedPhotos = limit ? allPhotos.slice(0, limit) : allPhotos;
      setPhotos(limitedPhotos);
      setSelectedCategory(null);
    } else {
      const filtered = allPhotos.filter((photo) => photo.category === category);
      const limitedPhotos = limit ? filtered.slice(0, limit) : filtered;
      setPhotos(limitedPhotos);
      setSelectedCategory(category);
    }
  };

  return (
    <div className="w-full">
      {/* Category Filter - only show if enabled and not filtering by specific category */}
      {showFilters && !category && (
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => filterPhotosByCategory("all")}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedCategory === null
                  ? "bg-red-800 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-red-100 border border-gray-200"
              }`}
            >
              All Photos
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => filterPhotosByCategory(cat)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-red-800 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-red-100 border border-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Category Label */}
      {selectedCategory && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-6"
        >
          <h2 className="text-2xl font-semibold text-gray-800">
            {selectedCategory}
          </h2>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {photos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                {category
                  ? `No photos found in the "${category}" category.`
                  : "No photos found."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {photos.map((photo, index) => (
                <motion.div
                  key={`${photo.id}-${index}`}
                  className="overflow-hidden rounded-2xl shadow-lg bg-white"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="relative h-60 overflow-hidden">
                    <Image
                      src={photo.imageUrl}
                      alt={photo.fileName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {photo.fileName}
                    </h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                        {photo.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {photo.uploadedAt?.toDate
                          ? new Date(
                              photo.uploadedAt.toDate()
                            ).toLocaleDateString()
                          : new Date(photo.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default PhotosByCategory;
