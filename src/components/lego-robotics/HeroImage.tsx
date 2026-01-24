"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";

// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-cards";

// import required modules
import { EffectCards, Autoplay } from "swiper/modules";

// Import Modal component
import Modal from "@/components/ui/Modal";

// Static image data structure
interface StaticImage {
  url: string;
  alt: string;
}

const HeroImage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Static Cloudinary image URLs - replace these with your actual URLs
  const staticImages: StaticImage[] = [
    {
      url: "https://res.cloudinary.com/dgbbkclfa/image/upload/v1766397913/iuq8qsrh6qjl8yyw1rim.jpg",
      alt: "LEGO Robotics Workshop 1",
    },
    {
      url: "https://res.cloudinary.com/dgbbkclfa/image/upload/v1768652660/cyguz9zagyyhkiwi2wmx.jpg",
      alt: "LEGO Robotics Workshop 2",
    },
    {
      url: "https://res.cloudinary.com/dgbbkclfa/image/upload/v1768652660/ovp3syigyxkvw0q4gxyt.jpg",
      alt: "LEGO Robotics Workshop 3",
    },
    {
      url: "https://res.cloudinary.com/dgbbkclfa/image/upload/v1768652659/vo7lj3pjmseccvf20sgx.jpg",
      alt: "LEGO Robotics Workshop 4",
    },
    {
      url: "https://res.cloudinary.com/dgbbkclfa/image/upload/v1768651632/fh1qaoyeqztmwytqrqr1.jpg",
      alt: "LEGO Robotics Workshop 5",
    },
  ];

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
        className="py-8 md:py-12 lg:py-16 mt-6 md:mt-1"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="max-w-[1200px] mx-auto px-4 ">
          <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-52 mt-4">
            <motion.div
              className="lg:w-1/2 text-center lg:text-left w-full"
              variants={itemVariants}
            >
              <motion.h1
                className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 md:mb-2 leading-tight font-sans"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Build. Think.{" "}
                <span className="gradient-text font-bold">Create.</span>
              </motion.h1>
              <motion.h2
                className="text-xl md:text-2xl font-semibold mb-2 md:mb-2 text-[#062341] font-sans"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Your Child’s First Step into Robotics Starts Here…
              </motion.h2>
              <motion.p
                className="text-base md:text-lg text-gray-700 mb-2 font-sans"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                A fun, hands-on LEGO® Robotics Workshop for young minds (Ages
                4–16)
              </motion.p>
              <motion.p
                className="text-base md:text-lg text-gray-700 mb-2 md:mb-2 font-sans"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Your child will build, explore and bring ideas to life—while
                learning the foundations of logic, creativity and STEM thinking.
              </motion.p>

              {/* Primary CTA button directly under subtitle */}
              <motion.div
                className="mb-2 md:mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <button
                  className="bg-gradient-to-r from-[#A81B1E] to-[#C73E1D] hover:from-[#C73E1D] hover:to-[#A81B1E] text-white font-bold py-2 px-8 md:py-2 md:px-8 rounded-xl transition-all duration-300 transform hover:scale-105  min-w-[220px] text-lg md:text-xl"
                  onClick={() => setIsModalOpen(true)}
                >
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
                    <span className="mr-2">⏰</span> 1-hours Structured Workshop
                    just @₹499
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">🏆</span> get STEM certified workshop
                    participation
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">🎁</span> Take-away Souvenir as
                    momento.
                  </li>
                </motion.ul>
              </motion.div>
            </motion.div>
            <motion.div
              className="md:w-[40%] w-full flex justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="w-full max-w-md">
                <Swiper
                  effect={"cards"}
                  grabCursor={true}
                  modules={[EffectCards, Autoplay]}
                  autoplay={{
                    delay: 3000, // Change slide every 3 seconds
                    disableOnInteraction: false, // Continue autoplay after user interactions
                  }}
                  loop={true}
                  className="w-2/3"
                >
                  {staticImages.map((image, index) => (
                    <SwiperSlide
                      key={`static-${index}`}
                      className="w-32 flex items-center justify-center "
                    >
                      <div className="w-auto h-full flex items-center justify-center">
                        <Image
                          src={image.url}
                          alt={image.alt}
                          width={300}
                          height={300}
                          className="rounded-xl object-cover "
                          unoptimized // Since we're using Cloudinary URLs
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
      {/* Booking Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register for LEGO Robotics Workshop"
      >
        <div className="p-4">
          {/* TODO: Replace YOUR_ACTUAL_FORM_ID with your Google Form ID */}
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSdQtiaYv9dtnaziDC_Izd2hwOVa1VsAR7-RzN6f6kYfWLb50w/viewform?usp=publish-editor"
              width="100%"
              height="600px"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
              title="Registration Form"
            >
              Loading Registration Form...
            </iframe>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HeroImage;
