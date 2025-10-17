import React, { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// Template interface
interface Template {
  id: string;
  title: string;
  src: string;
  alt: string;
}

interface TemplateCarouselProps {
  showModal: boolean;
  closeModal: () => void;
}

const TemplateCarousel: React.FC<TemplateCarouselProps> = ({
  showModal,
  closeModal,
}) => {
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Template images array with id, title, and image
  const templateImages: Template[] = [
    {
      id: "template-1",
      title: "Summer Camp Workshop",
      src: "/assets/events/summer-camp.jpg",
      alt: "Cyborg Robotics Academy Template 1",
    },
    {
      id: "template-2",
      title: "Diwali Camp Workshop",
      src: "/assets/events/diwali-camp.jpg",
      alt: "Diwali Camp Template 1",
    },
  ];

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50; // Minimum swipe distance
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNextTemplate();
    } else if (isRightSwipe) {
      goToPreviousTemplate();
    }
  };

  // Mouse handlers for drag gestures
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setIsDragging(false);

    const distance = dragStart - e.clientX;
    const isLeftDrag = distance > 50; // Minimum drag distance
    const isRightDrag = distance < -50;

    if (isLeftDrag) {
      goToNextTemplate();
    } else if (isRightDrag) {
      goToPreviousTemplate();
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  // Prevent mouse wheel from interfering with background scrolling
  const handleWheel = (e: React.WheelEvent) => {
    // Prevent background scrolling when interacting with carousel
    e.stopPropagation();

    // Handle horizontal scrolling for carousel navigation
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      if (e.deltaX > 0) {
        goToNextTemplate();
      } else if (e.deltaX < 0) {
        goToPreviousTemplate();
      }
    }
    // For vertical scrolls, still prevent background scrolling but don't navigate
  };

  // Navigation functions for templates
  const goToPreviousTemplate = () => {
    setCurrentTemplateIndex((prevIndex) =>
      prevIndex === 0 ? templateImages.length - 1 : prevIndex - 1
    );
  };

  const goToNextTemplate = () => {
    setCurrentTemplateIndex((prevIndex) =>
      prevIndex === templateImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Navigate to specific template
  const goToTemplate = (index: number) => {
    setCurrentTemplateIndex(index);
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-md"
          onClick={closeModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 50, rotateX: -15 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 50, rotateX: 15 }}
            transition={{
              duration: 0.6,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: 0.1,
            }}
            className="relative max-w-6xl max-h-[90vh] mx-4 w-full"
            onClick={(e) => e.stopPropagation()}
            ref={modalContentRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onWheel={handleWheel}
          >
            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.4 }}
              whileTap={{ scale: 0.9 }}
              onClick={closeModal}
              className="absolute -top-4 -right-4 z-10 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100"
            >
              <motion.svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                transition={{ duration: 0.2 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </motion.svg>
            </motion.button>

            {/* Mobile Template Title - Visible on mobile only */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center z-10 md:hidden">
              <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
                <span className="text-sm font-semibold">
                  {templateImages[currentTemplateIndex].title}
                </span>
              </div>
            </div>
            {/* Carousel Container - Responsive for mobile/desktop */}
            <div className="relative overflow-hidden rounded-2xl">
              {/* Mobile view - 100% width per item */}
              <div
                className="flex transition-transform duration-500 ease-in-out md:hidden"
                style={{
                  transform: `translateX(-${currentTemplateIndex * 100}%)`,
                }}
              >
                {templateImages.map((template) => (
                  <div key={template.id} className="w-full flex-shrink-0 px-2">
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 60,
                        scale: 0.8,
                        filter: "blur(10px)",
                        rotateY: -20,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        filter: "blur(0px)",
                        rotateY: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: 60,
                        scale: 0.8,
                        filter: "blur(10px)",
                        rotateY: 20,
                      }}
                      transition={{
                        duration: 0.8,
                        ease: [0.34, 1.56, 0.64, 1],
                        delay: 0.2,
                      }}
                      className="relative"
                    >
                      <Image
                        src={template.src}
                        alt={template.alt}
                        width={500}
                        height={500}
                        className="w-full h-auto max-h-[70vh] object-contain rounded-xl shadow-2xl"
                        priority
                      />
                      {/* Title overlay for mobile */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-center rounded-b-xl">
                        <span className="text-sm font-semibold">
                          {template.title}
                        </span>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>

              {/* Desktop view - 33.333% width per item with increased gap */}
              <div
                className="hidden md:flex transition-transform duration-500 ease-in-out -mx-4"
                style={{
                  transform: `translateX(-${currentTemplateIndex * 33.333}%)`,
                }}
              >
                {templateImages.map((template) => (
                  <div key={template.id} className="w-1/3 flex-shrink-0 px-4">
                    <motion.div
                      initial={{
                        opacity: 0,
                        y: 60,
                        scale: 0.8,
                        filter: "blur(10px)",
                        rotateY: -20,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        filter: "blur(0px)",
                        rotateY: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: 60,
                        scale: 0.8,
                        filter: "blur(10px)",
                        rotateY: 20,
                      }}
                      transition={{
                        duration: 0.8,
                        ease: [0.34, 1.56, 0.64, 1],
                        delay: 0.2,
                      }}
                      className="relative"
                    >
                      <Image
                        src={template.src}
                        alt={template.alt}
                        width={800}
                        height={600}
                        className="w-full h-auto max-h-[70vh] object-contain rounded-xl shadow-2xl"
                        priority
                      />
                      {/* Title overlay for desktop */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-3 text-center rounded-b-xl">
                        <span className="font-semibold">{template.title}</span>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Navigation Dots */}
            <div className="absolute bottom-12 left-0 right-0 flex justify-center space-x-2 z-10 md:hidden">
              {templateImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToTemplate(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentTemplateIndex
                      ? "bg-white scale-125"
                      : "bg-white bg-opacity-50"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TemplateCarousel;
