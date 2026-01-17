"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";

const PhotosByCategoryPage = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [allPhotos, setAllPhotos] = useState<any[]>([]);

  // Fetch all photos and unique categories
  const fetchData = async () => {
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

      setAllPhotos(photosData);
      setPhotos(photosData);
      setCategories(Array.from(uniqueCategories));
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filterPhotosByCategory = (category: string) => {
    if (category === "all") {
      setPhotos(allPhotos);
      setSelectedCategory(null);
    } else {
      const filtered = allPhotos.filter((photo) => photo.category === category);
      setPhotos(filtered);
      setSelectedCategory(category);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Photo Gallery
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Browse our collection of photos organized by categories
          </p>
        </motion.div>

        {/* Category Filter */}
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
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => filterPhotosByCategory(category)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-red-800 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-red-100 border border-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

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
                  No photos found in this category.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {photos.map((photo, index) => (
                  <motion.div
                    key={photo.id}
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
                          {new Date(
                            photo.uploadedAt?.toDate()
                          ).toLocaleDateString()}
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
    </div>
  );
};

export default PhotosByCategoryPage;
