"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Mail,
  MapPin,
  Phone,
  RotateCcw,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

interface GalleryImage {
  id: string;
  imageUrl?: string;
  src?: string;
  fileName?: string;
}

interface FooterProps {
  [key: string]: unknown;
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Footer: React.FC<FooterProps> = () => {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchFooterImages = useCallback(async () => {
    try {
      setLoadingImages(true);

      // Fetch latest 20 images, shuffle client-side
      const photosQuery = query(
        collection(db, "photo"),
        orderBy("uploadedAt", "desc"),
        limit(20),
      );

      const snapshot = await getDocs(photosQuery);
      const photosData: GalleryImage[] = [];

      snapshot.forEach((doc) => {
        photosData.push({
          id: doc.id,
          ...(doc.data() as Omit<GalleryImage, "id">),
        });
      });

      // Fisher-Yates shuffle for better randomization
      const shuffled = photosData.sort(() => Math.random() - 0.5).slice(0, 4);

      setGalleryImages(shuffled);
    } catch (error) {
      console.error("Error fetching footer images:", error);
    } finally {
      setLoadingImages(false);
      setIsInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    fetchFooterImages();
  }, [fetchFooterImages]);

  const quickLinks = [
    { href: "/", label: "Home" },
    { href: "/about-us", label: "About" },
    { href: "/gallery/photos", label: "Gallery" },
    { href: "/contact-us", label: "Contact" },
    { href: "/terms-conditions", label: "Terms" },
    { href: "/privacy-policy", label: "Privacy" },
  ];

  const socialLinks = [
    {
      href: "https://www.linkedin.com/company/cyborg-robotics-academy-pvt-ltd/",
      src: "/assets/social-icons/Linkedin.png",
      alt: "LinkedIn",
    },
    {
      href: "https://www.instagram.com/cyborgroboticsacademy",
      src: "/assets/social-icons/instagram.webp",
      alt: "Instagram",
    },
    {
      href: "https://www.facebook.com/cyborgrobotics/",
      src: "/assets/social-icons/Facebook.webp",
      alt: "Facebook",
    },
    {
      href: "https://www.youtube.com/@cyborgroboticsacademy",
      src: "/assets/social-icons/youtube.png",
      alt: "YouTube",
    },
  ];

  return (
    <footer className="relative mt-12 md:mt-20 bg-gradient-to-b from-white via-gray-50/50 to-white overflow-hidden">
      {/* Subtle animated background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-100/20 rounded-full blur-3xl opacity-40" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100/20 rounded-full blur-3xl opacity-40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 py-12 lg:py-16"
        >
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-blue-600 rounded-lg opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300" />
                <Image
                  src="/Cyborglogo.png"
                  width={56}
                  height={56}
                  alt="Cyborg Robotics Logo"
                  className="relative w-14 h-14 object-contain"
                  priority
                />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 leading-tight">
                  Cyborg Robotics
                </h2>
                <p className="text-xs font-semibold text-red-700 tracking-widest">
                  ACADEMY
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-gray-600">
              Leading robotics academy in Pune offering comprehensive technical
              courses and hands-on learning experiences.
            </p>

            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              {socialLinks.map((social) => (
                <motion.div
                  key={social.alt}
                  whileHover={{ scale: 1.15, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.alt}
                    className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 transition-all duration-300 hover:bg-gradient-to-br hover:from-red-600 hover:to-blue-600"
                  >
                    <Image
                      src={social.src}
                      width={20}
                      height={20}
                      alt={social.alt}
                      className="relative z-10 transition-all duration-300 group-hover:invert"
                    />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div variants={itemVariants} className="space-y-5">
            <h3 className="text-base font-bold text-gray-900 relative pb-2">
              Contact
              <span className="absolute bottom-0 left-0 h-1 w-6 bg-gradient-to-r from-red-600 to-red-400 rounded-full" />
            </h3>

            <div className="space-y-4">
              {[
                {
                  icon: Mail,
                  label: "Email",
                  value: "info@cyborgrobotics.in",
                  href: "mailto:info@cyborgrobotics.in",
                },
                {
                  icon: Phone,
                  label: "Phone",
                  value: "+91 91751 59292",
                  href: "tel:+919175159292",
                },
                {
                  icon: MapPin,
                  label: "Location",
                  value: "Kalyani Nagar, Pune",
                  href: "https://maps.app.goo.gl/uJUYgFrou6qQoS1MA",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      item.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                    className="flex gap-3 group cursor-pointer"
                  >
                    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors duration-200">
                      <Icon className="w-4 h-4 text-red-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {item.label}
                      </p>
                      <p className="text-sm text-gray-900 font-medium group-hover:text-red-600 transition-colors">
                        {item.value}
                      </p>
                    </div>
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants} className="space-y-5">
            <h3 className="text-base font-bold text-gray-900 relative pb-2">
              Explore
              <span className="absolute bottom-0 left-0 h-1 w-6 bg-gradient-to-r from-red-600 to-red-400 rounded-full" />
            </h3>

            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-red-600 transition-colors duration-200 group flex items-center gap-1"
                    >
                      {link.label}
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Gallery Section */}
          <motion.div variants={itemVariants} className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-bold text-gray-900 relative pb-2">
                Photos
                <span className="absolute bottom-0 left-0 h-1 w-6 bg-gradient-to-r from-red-600 to-red-400 rounded-full" />
              </h3>
              <motion.button
                type="button"
                onClick={fetchFooterImages}
                disabled={loadingImages}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-1.5 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Shuffle gallery"
              >
                {loadingImages ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="w-3.5 h-3.5" />
                )}
              </motion.button>
            </div>

            <div className="grid grid-cols-2 gap-3 w-52">
              <AnimatePresence mode="popLayout">
                {Array.from({ length: 4 }).map((_, index) => {
                  const image = galleryImages[index];
                  return (
                    <motion.div
                      key={image?.id || `placeholder-${index}`}
                      layoutId={image?.id || `placeholder-${index}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                      whileHover={image ? { scale: 1.05 } : {}}
                      className="relative h-28 rounded-xl overflow-hidden bg-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                    >
                      {image ? (
                        <>
                          <Image
                            src={image.imageUrl || image.src || ""}
                            alt={image.fileName || "Gallery"}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="80px"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                        </>
                      ) : (
                        <div className="w-full h-full animate-pulse bg-gray-300" />
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

        {/* Copyright & Legal */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Cyborg Robotics Academy. All rights
            reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="/terms-conditions"
              className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
            >
              Terms
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href="/privacy-policy"
              className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
            >
              Privacy
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
