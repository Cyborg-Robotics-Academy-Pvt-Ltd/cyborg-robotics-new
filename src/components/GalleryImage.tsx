"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { GalleryImageData } from "../../utils/Images";
import { motion, AnimatePresence } from "framer-motion";

const ITEMS_PER_PAGE = 6;
const MAX_VISIBLE_PAGES = 5; // Limit visible pagination numbers

export default function Gallery() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isClient, setIsClient] = useState(false);

  // Hydration fix - ensure component renders the same on server and client
  useEffect(() => {
    setIsClient(true);
  }, []);

  const totalPages = Math.min(
    100,
    Math.ceil(GalleryImageData.length / ITEMS_PER_PAGE)
  );

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const selectedImages = GalleryImageData.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const navigatePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
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
      className="max-w-4xl mx-auto p-4 "
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 md:gap-4 gap-2">
        <AnimatePresence mode="wait">
          {selectedImages.map((image, index) => (
            <motion.div
              key={`${image.id}-page-${currentPage}`}
              className="w-full md:h-80 h-64 overflow-hidden rounded-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut",
              }}
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.2 },
              }}
            >
              <Image
                src={image.imageUrl}
                width={850}
                height={700}
                alt={`Gallery image of ${`item ${image.id}`}`}
                className="w-full object-cover h-full"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 400px"
                // Priority load first two images for better LCP
                priority={index < 2 && currentPage === 1}
                loading={index < 2 && currentPage === 1 ? "eager" : "lazy"}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="my-6 flex justify-center">
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
    </motion.div>
  );
}
