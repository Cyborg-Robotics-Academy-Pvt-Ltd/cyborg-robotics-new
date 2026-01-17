"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import Header from "@/components/layout/header";

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
      : "certificates"
  );

  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all photos from Firebase
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);

        const photosQuery = query(
          collection(db, "photo"),
          orderBy("uploadedAt", "desc")
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

  // Listen for URL changes (e.g., browser back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      const url = new URL(window.location.href);
      const tabParam = url.searchParams.get("tab");
      if (
        tabParam &&
        [
          "certificates",
          "actions",
          "competitions",
          "workshops",
          "achievements",
        ].includes(tabParam)
      ) {
        setActiveTab(tabParam);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const tabs = [
    { id: "certificates", label: "Student Certificate" },
    { id: "actions", label: "Student Action" },
    { id: "competitions", label: "Student in (Competition) Glory" },

    { id: "workshops", label: "Workshops" },
    { id: "achievements", label: "Achievements" },
  ];

  // Filter photos by category
  const getPhotosByCategory = (category: string) => {
    return photos.filter((photo) => {
      // Match the category with the tab labels
      if (
        (category === "certificates" &&
          photo.category === "Student Certificate") ||
        (category === "actions" && photo.category === "Student Action") ||
        (category === "competitions" &&
          photo.category === "Competition Glory") ||
        (category === "activities" && photo.category === "Class Activities") ||
        (category === "events" && photo.category === "Events") ||
        (category === "workshops" && photo.category === "Workshops") ||
        (category === "achievements" && photo.category === "Achievements") ||
        (category === "others" && photo.category === "Others")
      ) {
        return true;
      }
      return false;
    });
  };

  const renderImages = (images: any[]) => {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((img, index) => (
            <motion.div
              key={img.id || img.fileName}
              className="overflow-hidden rounded-2xl shadow-lg  transform transition-transform duration-300 hover:-translate-y-1 "
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="aspect-square overflow-hidden">
                <Image
                  src={img.imageUrl || img.src}
                  alt={img.fileName || img.alt}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover transition-transform duration-300 "
                  priority={index < 2}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </>
    );
  };

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
                setActiveTab(tab.id);
                // Update URL with the new tab
                const url = new URL(window.location.href);
                url.searchParams.set("tab", tab.id);
                window.history.replaceState({}, "", url.toString());
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
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
            </div>
          ) : error ? (
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
              {activeTab === "achievements" &&
                renderImages(getPhotosByCategory("achievements"))}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const BehindScenePage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto mt-10">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
            </div>
          </div>
        </div>
      }
    >
      <BehindSceneContent />
    </Suspense>
  );
};

export default BehindScenePage;
