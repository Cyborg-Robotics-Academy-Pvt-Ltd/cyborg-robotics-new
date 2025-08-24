"use client";

import { useState, useEffect, useRef } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { motion, AnimatePresence } from "framer-motion";

const ITEMS_PER_PAGE = 6;
const MAX_VISIBLE_PAGES = 5; // Limit visible pagination numbers

export default function VideoGallery() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isClient, setIsClient] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const videoRefs = useRef({});

  // Video data
  const slideData = [
    {
      id: "1",
      videoUrl:
        "https://res.cloudinary.com/dz8enfjtx/video/upload/v1742552839/jvqogzudnrpzjf5626ac.mp4",
      title: "Video 1",
    },
    {
      id: "2",
      videoUrl:
        "https://res.cloudinary.com/dz8enfjtx/video/upload/v1742552847/petloc1v3auqj7ggiqvv.mp4",
      title: "Video 2",
    },
    {
      id: "3",
      videoUrl:
        "https://res.cloudinary.com/dz8enfjtx/video/upload/v1742553723/ujdcm22x3go3klpvzycw.mp4",
      title: "Video 3",
    },
    {
      id: "4",
      videoUrl:
        "https://res.cloudinary.com/dz8enfjtx/video/upload/v1746082108/upvvefm3ajfhenonvabk.mp4",
      title: "Video 4",
    },
    {
      id: "5",
      videoUrl:
        "https://res.cloudinary.com/dz8enfjtx/video/upload/v1746082318/db0en0g499gaubzxxpsz.mp4",
      title: "Video 5",
    },
  ];

  // Hydration fix - ensure component renders the same on server and client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auto-pause other videos when one starts playing
  useEffect(() => {
    // Store a reference to the current videoRefs value
    const currentVideoRefs = videoRefs.current;
    const handlePlay = (videoId: string) => {
      setPlayingVideo(videoId);

      // Pause all other videos
      Object.entries(currentVideoRefs).forEach(([id, videoElement]) => {
        if (id !== videoId && videoElement instanceof HTMLVideoElement) {
          videoElement.pause();
        }
      });
    };

    // Add play event listeners to all video elements
    Object.entries(currentVideoRefs).forEach(([id, videoElement]) => {
      if (videoElement instanceof HTMLVideoElement) {
        videoElement.addEventListener("play", () => handlePlay(id));
      }
    });

    // Cleanup listeners - using the captured reference
    return () => {
      Object.entries(currentVideoRefs).forEach(([id, videoElement]) => {
        if (videoElement instanceof HTMLVideoElement) {
          videoElement.removeEventListener("play", () => handlePlay(id));
        }
      });
    };
  }, []); // No dependencies since we're capturing the current value

  // Handle page navigation
  const totalPages = Math.min(
    100,
    Math.ceil(slideData.length / ITEMS_PER_PAGE)
  );

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const selectedVideos = slideData.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const navigatePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      // Pause all videos when changing pages
      Object.values(videoRefs.current).forEach((videoElement) => {
        if (videoElement instanceof HTMLVideoElement) {
          videoElement.pause();
        }
      });

      setPlayingVideo(null);
      setCurrentPage(newPage);
      // Scroll to top of gallery on page change
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Generate pagination items with limited range and ellipsis
  const getPaginationItems = () => {
    const items = [];

    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink
          href="#"
          isActive={currentPage === 1}
          onClick={(e) => {
            e.preventDefault();
            navigatePage(1);
          }}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Calculate range to display
    let startPage = Math.max(
      2,
      currentPage - Math.floor(MAX_VISIBLE_PAGES / 2)
    );
    const endPage = Math.min(totalPages - 1, startPage + MAX_VISIBLE_PAGES - 2);

    // Adjust start if we're near the end
    if (endPage - startPage < MAX_VISIBLE_PAGES - 2) {
      startPage = Math.max(2, endPage - (MAX_VISIBLE_PAGES - 2));
    }

    // Add ellipsis if needed before start
    if (startPage > 2) {
      items.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            isActive={currentPage === i}
            onClick={(e) => {
              e.preventDefault();
              navigatePage(i);
            }}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Add ellipsis if needed before end
    if (endPage < totalPages - 1) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink
            href="#"
            isActive={currentPage === totalPages}
            onClick={(e) => {
              e.preventDefault();
              navigatePage(totalPages);
            }}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  // Don't render until after hydration to prevent mismatch
  if (!isClient) {
    // Loader removed
    return null;
  }

  return (
    <motion.div
      className="max-w-7xl mx-auto p-4"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="wait">
          {selectedVideos.map((video, index) => (
            <motion.div
              key={`${video.id}-page-${currentPage}`}
              className="w-full aspect-video overflow-hidden rounded-xl shadow-md bg-black"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut",
              }}
              whileHover={{
                scale: 1.03,
                transition: { duration: 0.2 },
              }}
            >
              <div className="relative w-full h-full">
                ``{" "}
                <video
                  ref={(el: HTMLVideoElement | null) => {
                    if (el)
                      (videoRefs.current as Record<string, HTMLVideoElement>)[
                        video.id
                      ] = el;
                  }}
                  src={video.videoUrl}
                  preload="metadata"
                  controls
                  playsInline
                  className={`w-full h-full object-contain ${
                    playingVideo === video.id ? "z-10" : "z-0"
                  }`}
                  poster="" // Add a poster image URL if available
                  title={video.title || `Video ${video.id}`}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {totalPages > 1 && (
        <div className="my-8 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigatePage(currentPage - 1);
                  }}
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {getPaginationItems()}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigatePage(currentPage + 1);
                  }}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </motion.div>
  );
}
