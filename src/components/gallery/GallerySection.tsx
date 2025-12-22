"use client";
import React, { useState, useEffect, useRef } from "react";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

// Import required modules
import { EffectCoverflow, Pagination } from "swiper/modules";

// Import Firebase
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

// Import auth context
import { useAuth } from "@/lib/auth-context";

// Import custom styles
import "./swiper.css";

const GallerySection = () => {
  const { userRole } = useAuth();
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch images from Firebase
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const q = query(
          collection(db, "homeGalleryImage"),
          orderBy("uploadedAt", "desc")
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
        setGalleryImages([
          {
            id: "1",
            src: "/assets/moments/IMG_2472.PNG",
          },
          {
            id: "2",
            src: "/assets/moments/wsro_national.png",
          },
          {
            id: "3",
            src: "/assets/moments/IMG_2470.PNG",
          },
          {
            id: "4",
            src: "/assets/moments/IMG_2467.PNG",
          },
          {
            id: "5",
            src: "/assets/moments/IMG_2468.PNG",
          },
          {
            id: "6",
            src: "/assets/moments/IMG_2471.PNG",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

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

        const response = await fetch("/api/home-gallery-upload", {
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
          collection(db, "homeGalleryImage"),
          orderBy("uploadedAt", "desc")
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
            `Uploaded ${successfulUploads.length} images successfully. ${failedUploads.length} uploads failed.`
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full mt-4 md:mt-12">
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
        <div className="flex justify-center mb-4">
          <button
            onClick={handleUploadClick}
            disabled={isUploading}
            className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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

      <h1 className="text-center font-bold text-2xl md:text-3xl">
        Celebrating <span className="gradient-text">Learning</span>
      </h1>
      <div className="flex items-center justify-center gap-1 my-3">
        <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-[#8D0F11]/60 rounded-full"></div>
        <div className="w-16 h-0.5 bg-gradient-to-r from-[#8D0F11]/60 to-[#8D0F11] rounded-full"></div>
        <div className="w-8 h-0.5 bg-gradient-to-r from-[#8D0F11] to-transparent rounded-full"></div>
      </div>
      <p className="text-center text-sm md:text-base text-gray-600 mt-1">
        Explore moments from our programs and events
      </p>

      <div className="mx-6 md:mx-0">
        <style jsx global>{`
          .mySwiper .swiper-pagination-bullet {
            background: #cbd5e1;
            opacity: 1;
            width: 8px;
            height: 8px;
            transition: all 0.3s ease;
          }
          .mySwiper .swiper-pagination-bullet-active {
            background: #8d0f11;
            width: 20px;
            border-radius: 4px;
          }
        `}</style>
        <Swiper
          effect={"coverflow"}
          grabCursor={true}
          spaceBetween={20}
          centeredSlides={true}
          slidesPerView={"auto"}
          coverflowEffect={{
            rotate: 30,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          pagination={true}
          modules={[EffectCoverflow, Pagination]}
          className="mySwiper"
          initialSlide={0}
        >
          {galleryImages.map((item: any) => (
            <SwiperSlide key={item.id}>
              <img
                src={item.imageUrl || item.src}
                alt={`Gallery item ${item.id}`}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default GallerySection;
