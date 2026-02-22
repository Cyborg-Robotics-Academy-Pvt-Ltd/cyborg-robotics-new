"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Mail, MapPinHouse, PhoneCall, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import styles from "./Footer.module.css";

import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

interface FooterProps {
  [key: string]: unknown;
}

const Footer: React.FC<FooterProps> = () => {
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const contactRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];
  const sectionRefs = useRef([
    React.createRef<HTMLDivElement>(),
    React.createRef<HTMLDivElement>(),
    React.createRef<HTMLDivElement>(),
    React.createRef<HTMLDivElement>(),
  ]);

  const fetchFooterImages = useCallback(async () => {
    try {
      setLoadingImages(true);

      const photosQuery = query(
        collection(db, "photo"),
        orderBy("uploadedAt", "desc"),
      );

      const snapshot = await getDocs(photosQuery);

      const photosData: any[] = [];

      snapshot.forEach((doc) => {
        photosData.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      const shuffled = photosData.sort(() => 0.5 - Math.random());
      const randomFour = shuffled.slice(0, 4);

      setGalleryImages(randomFour);
    } catch (error) {
      console.error("Error fetching footer images:", error);
    } finally {
      setLoadingImages(false);
    }
  }, []);

  // Fetch 4 random images from "photo" collection
  useEffect(() => {
    fetchFooterImages();
  }, [fetchFooterImages]);

  return (
    <footer className="bg-white mt-7 md:my-10 rounded-t-3xl overflow-hidden relative">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div
          className={`absolute top-10 left-10 w-64 h-64 bg-red-800 rounded-full mix-blend-multiply filter blur-3xl opacity-30 ${styles.animateBlob}`}
        />
        <div
          className={`absolute top-10 right-10 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 ${styles.animateBlob} ${styles.animationDelay2000}`}
        />
        <div
          className={`absolute bottom-10 left-1/2 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 ${styles.animateBlob} ${styles.animationDelay4000}`}
        />
      </div>

      <div className="max-w-[1366px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-2xl shadow-xl shadow-gray-300/20 p-6 md:p-8 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {/* Section 1 */}
            <div className="space-y-4 bg-white rounded-xl p-5">
              <Image
                src="/assets/Cyborg-logo.png"
                width={150}
                height={150}
                alt="Cyborg Robotics Logo"
                className="w-40 h-auto"
              />
              <p className="text-sm text-gray-700 leading-relaxed">
                <span className="font-bold text-gray-900">
                  Cyborg Robotics Academy Private Limited
                </span>{" "}
                is one of the leading Robotics Academy in Pune offering various
                technical courses all under one roof.
              </p>
              <div className="flex gap-3 items-center">
                {[
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
                ].map((item) => (
                  <motion.div
                    key={item.href}
                    whileHover={{ scale: 1 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="relative"
                  >
                    <Link href={item.href}>
                      <Image
                        src={item.src}
                        width={35 + (item.alt === "YouTube" ? 10 : 0)}
                        height={35 + (item.alt === "YouTube" ? 5 : 0)}
                        alt={item.alt}
                        className="rounded-xl transition-all cursor-pointer"
                      />
                      <div className="absolute inset-0 rounded-xl"></div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Section 2: Contact Information */}
            <div
              className="space-y-4 bg-white rounded-xl p-5 "
              ref={sectionRefs.current[1]}
            >
              <h3 className="text-lg font-bold text-gray-900">Contact Us</h3>
              <motion.div
                className="flex gap-3 items-center"
                ref={contactRefs[0]}
                whileHover={{ x: 8 }}
                transition={{ duration: 0.2 }}
              >
                <Mail className="mt-1 flex-shrink-0 text-red-800" size={22} />
                <Link
                  href="mailto:info@cyborgrobotics.in"
                  className="text-base font-medium text-gray-800 hover:text-[#a63534] hover:font-semibold transition-colors"
                >
                  info@cyborgrobotics.in
                </Link>
              </motion.div>
              <motion.div
                className="flex items-start gap-3"
                ref={contactRefs[1]}
                whileHover={{ x: 8 }}
                transition={{ duration: 0.2 }}
              >
                <MapPinHouse
                  className="mt-1 flex-shrink-0 text-red-800"
                  size={22}
                />
                <Link
                  href="https://www.google.com/maps/place/North+Court,+Rd+Number+12,+Jogger's+Park,+Nilanjali+Society,+Kalyani+Nagar,+Pune,+Maharashtra+411006/@18.5492198,73.8982955,786m/data=!3m2!1e3!4b1!4m10!1m2!2m1!1sNorth+court,office+No:2A,+1st+floor,opposite+joggers+park,above+punjab+national+bank,kalyani+nagar,Pune+411+006!3m6!1s0x3bc2c110e47e39a3:0x1790569bae5ab0f4!8m2!3d18.5492148!4d73.9031664!15sCm9Ob3J0aCBjb3VydCxvZmZpY2UgTm86MkEsIDFzdCBmbG9vcixvcHBvc2l0ZSBqb2dnZXJzIHBhcmssYWJvdmUgcHVuamFiIG5hdGlvbmFsIGJhbmlla2FseWFuaSBuYWdhcixQdW5lIDQxMSAwMDYiA4gBAZIBEWNvbXBvdW5kX2J1aWxkaW5n4AEA!16s%2Fg%2F1hjggd2b0?authuser=0&entry=ttu&g_ep=EgoyMDI1MDMxNy4wIKXMDSoASAFQAw%3D%3D"
                  className="text-base hover:font-semibold  font-medium text-gray-800 hover:text-[#a63534] transition-colors"
                >
                  North Court, Office No: 2A, 1st Floor, Opposite Joggers Park,
                  Above Punjab National Bank, Kalyani Nagar, Pune 411 006
                </Link>
              </motion.div>
              <motion.div
                className="flex items-center gap-3"
                ref={contactRefs[2]}
                whileHover={{ x: 8 }}
                transition={{ duration: 0.2 }}
              >
                <PhoneCall
                  className="mt-1 flex-shrink-0 text-red-800"
                  size={22}
                />
                <Link
                  href="tel:+919175159292"
                  className="text-base hover:font-semibold  font-medium text-gray-800 hover:text-[#a63534] transition-colors"
                >
                  Phone: +91 91751 59292
                </Link>
              </motion.div>
            </div>

            {/* Section 3 */}
            <div className="space-y-4 bg-white rounded-xl p-5">
              <h3 className="text-lg font-bold text-gray-900">Quick Links</h3>
              <ul className="space-y-3">
                {[
                  { href: "/", label: "Home" },
                  { href: "/about-us", label: "About" },
                  { href: "/gallery/photos", label: "Gallery" },
                  { href: "/contact-us", label: "Contact" },
                  { href: "/terms-conditions", label: "Terms & Conditions" },
                  { href: "/privacy-policy", label: "Privacy Policy" },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-gray-800 hover:text-red-800 transition-all block"
                    >
                      <motion.span
                        whileHover={{ x: 8 }}
                        transition={{ duration: 0.2 }}
                        style={{ display: "inline-block" }}
                        className="hover:font-semibold"
                      >
                        {item.label}
                      </motion.span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 4 - Gallery Highlights 2x2 */}
            <div className="space-y-4 bg-white rounded-xl p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-gray-900">Photo Hub</h3>
                <button
                  type="button"
                  onClick={fetchFooterImages}
                  disabled={loadingImages}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-red-200 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Shuffle gallery images"
                >
                  {loadingImages ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <RotateCcw size={14} />
                  )}
                  Shuffle
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, index) => {
                  const image = galleryImages[index];

                  return (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 shadow-sm hover:shadow-lg"
                    >
                      {image ? (
                        <Image
                          src={image.imageUrl || image.src}
                          alt={image.fileName || "Gallery Image"}
                          fill
                          className="object-cover transition-transform duration-300"
                          sizes="120px"
                        />
                      ) : (
                        <div className="w-full h-full animate-pulse bg-gray-200" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="py-6 text-center border-t border-gray-200">
          <p className="text-sm text-gray-700">
            © {new Date().getFullYear()} Cyborg Robotics Academy Private
            Limited. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
