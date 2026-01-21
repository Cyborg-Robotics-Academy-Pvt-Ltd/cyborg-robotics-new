import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-cards";

// import required modules
import { EffectCards } from "swiper/modules";

// Firebase imports
import { db } from "@/lib/firebase";
import { collection, getDocs, query } from "firebase/firestore";

interface GalleryImage {
  id: string;
  imageUrl?: string;
  url?: string;
  altText?: string;
  [key: string]: any; // Allow additional properties
}

const HeroImage = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch images from galleryImage collection
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const q = query(collection(db, "galleryImage"));
        const querySnapshot = await getDocs(q);

        const imageList: GalleryImage[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          imageList.push({
            id: doc.id,
            ...data,
          });
        });

        // Shuffle the images and take only 9 for the slider
        const shuffled = [...imageList].sort(() => 0.5 - Math.random());
        const selectedImages = shuffled.slice(0, 9);

        setImages(selectedImages);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching images:", error);
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Animation variants

  // Swiper styles
  const swiperStyle = `
    .mySwiper {
      width: 100%;
      height: 380px;
      margin: 0 auto;
      max-width: 300px;
    }
    
    @media (min-width: 768px) {
      .mySwiper {
        height: 420px;
        max-width: 340px;
      }
    }
    
    @media (min-width: 1024px) {
      .mySwiper {
        height: 480px;
        max-width: 380px;
      }
    }
    
    .swiper-slide {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 18px;
     
    }
    
  `;
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };
  return (
    <div>
      <style>{swiperStyle}</style>{" "}
      {/* Hero Section with improved CTA placement */}
      <motion.section
        className="py-8 md:py-12 lg:py-16"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 mt-4">
            <motion.div
              className="lg:w-1/2 text-center lg:text-left w-full"
              variants={itemVariants}
            >
              <motion.h1
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 leading-tight font-sans"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Build. Think.{" "}
                <span className="gradient-text font-bold">Create.</span>
              </motion.h1>
              <motion.h2
                className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-[#062341] font-sans"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Your Child's First Step into Robotics Starts hear with Us!
              </motion.h2>

              {/* Primary CTA button directly under subtitle */}
              <motion.div
                className="mb-4 md:mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <button className="bg-gradient-to-r from-[#A81B1E] to-[#C73E1D] hover:from-[#C73E1D] hover:to-[#A81B1E] text-white font-bold py-4 px-8 md:py-5 md:px-10 rounded-xl transition-all duration-300 transform hover:scale-105  min-w-[220px] text-lg md:text-xl">
                  Book LEGO Experience – ₹499
                </button>
              </motion.div>

              <motion.div
                className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-800 p-4 md:p-6 rounded-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 text-xl">🎁</span>
                  </div>
                  <h3 className="font-bold text-lg">Special Inclusions</h3>
                </div>
                <motion.ul
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  <li className="flex items-center">
                    <span className="mr-2">⏰</span> 1.5-hours Structured
                    Workshop just @₹499
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">🏆</span> get STEM certified workshop
                    participation
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">🎁</span> Take-away Souvenir
                  </li>
                </motion.ul>
              </motion.div>
            </motion.div>
            <motion.div
              className="lg:w-1/2 w-full flex justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="w-full max-w-md">
                <Swiper
                  effect={"cards"}
                  grabCursor={true}
                  modules={[EffectCards]}
                  className="w-2/3"
                >
                  {loading
                    ? // Show loading placeholder while fetching images
                      Array.from({ length: 9 }).map((_, index) => (
                        <SwiperSlide key={`placeholder-${index}`}>
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-full h-full" />
                          </div>
                        </SwiperSlide>
                      ))
                    : images.map((image, index) => (
                        <SwiperSlide
                          key={image.id || index}
                          className=" w-32 flex items-center justify-center "
                        >
                          <div className="w-auto h-full flex items-center justify-center ">
                            <Image
                              src={
                                image.imageUrl ||
                                image.url ||
                                "/placeholder.jpg"
                              }
                              alt={
                                image.altText || `Gallery Image ${index + 1}`
                              }
                              width={300}
                              height={300}
                              className="rounded-xl object-cover !m-0 !p-0"
                              unoptimized // Since we're using dynamic images from Firebase
                            />
                          </div>
                        </SwiperSlide>
                      ))}
                </Swiper>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default HeroImage;
