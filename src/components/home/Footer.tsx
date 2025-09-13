"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, MapPinHouse, PhoneCall, RefreshCw } from "lucide-react";
import { motion, useInView } from "framer-motion";
import VisitorCounter from "../VisitorCounter";

interface FooterProps {
  [key: string]: unknown;
}

const Footer: React.FC<FooterProps> = () => {
  // Refs for the four main sections
  const sectionRefs = useRef([
    React.createRef<HTMLDivElement>(),
    React.createRef<HTMLDivElement>(),
    React.createRef<HTMLDivElement>(),
    React.createRef<HTMLDivElement>(),
  ]);
  // Refs for animated elements
  const logoRef = useRef<HTMLImageElement>(null);

  const contactRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  // Refs for quick links
  const quickLinkRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Check if sections are in view
  const isInView = useInView(sectionRefs.current[0], {
    once: true,
    margin: "-100px",
  });

  const [dailyQuote, setDailyQuote] = useState<string>("");
  const [isLoadingQuote, setIsLoadingQuote] = useState<boolean>(false);

  useEffect(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const cacheKey = `dailyQuote-${y}-${m}-${d}`;

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setDailyQuote(cached);
        return;
      }
    } catch {
      // ignore storage errors
    }

    const controller = new AbortController();
    const fetchQuote = async () => {
      try {
        const prompt = `Give a short, motivational one-line quote for students learning robotics and coding. Max 8 words, no quotes, no emojis.`;
        const res = await fetch("/api/generate-blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
          signal: controller.signal,
        });
        if (!res.ok) return;
        const data = await res.json();
        let text: string = (data?.generated || "").trim();
        if (!text) return;
        // sanitize to one line and keep it short
        text = text.replace(/\s+/g, " ").replace(/["'`]/g, "").slice(0, 80);
        setDailyQuote(text);
        try {
          localStorage.setItem(cacheKey, text);
        } catch {
          // ignore storage errors
        }
      } catch {
        // network/API failure -> keep as empty or cached
      }
    };

    fetchQuote();
    return () => controller.abort();
  }, []);

  const fetchNewQuote = async () => {
    if (isLoadingQuote) return;

    setIsLoadingQuote(true);
    try {
      const prompt = `Give a short, motivational one-line quote for students learning robotics and coding. Max 8 words, no quotes, no emojis.`;
      const res = await fetch("/api/generate-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) return;
      const data = await res.json();
      let text: string = (data?.generated || "").trim();
      if (!text) return;
      // sanitize to one line and keep it short
      text = text.replace(/\s+/g, " ").replace(/["'`]/g, "").slice(0, 80);
      setDailyQuote(text);
    } catch {
      // network/API failure -> keep current quote
    } finally {
      setIsLoadingQuote(false);
    }
  };

  return (
    <footer className="bg-white mt-9 md:my-20">
      <hr className="border-t border-gray-300 my-4 w-[90%] mx-auto" />
      <div className="max-w-[1366px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid layout with responsive columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 py-8">
          {/* Section 1: Company Info & Social */}
          <motion.div
            className="space-y-4"
            ref={sectionRefs.current[0]}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <motion.div>
              <Image
                src="/assets/logo.png"
                width={150}
                height={150}
                alt="logo"
                loading="lazy"
                className="w-40 h-auto cursor-pointer"
                ref={logoRef}
              />
            </motion.div>
            <p className="text-sm text-black/80 leading-relaxed">
              <span className="text-bold">
                Cyborg Robotics Academy Private Limited
              </span>{" "}
              is one of the leading Robotics Academy in Pune offering various
              technical courses all under one roof.
            </p>
            <div className="flex gap-3 items-center">
              {[
                {
                  href: "https://www.instagram.com/cyborgroboticsacademy?igsh=dmppcHR2NWh1MDJ5",
                  src: "/assets/social-icons/instagram.webp",
                  alt: "Instagram",
                },
                {
                  href: "https://www.facebook.com/cyborgrobotics/",
                  src: "/assets/social-icons/Facebook.webp",
                  alt: "Facebook",
                },
                {
                  href: "https://youtube.com/@cyborgroboticsacademy2270?si=aQjTThVhESGN_bQ9",
                  src: "/assets/social-icons/youtube.png",
                  alt: "YouTube",
                },
              ].map((item, idx) => (
                <motion.div
                  key={item.href}
                  whileHover={{ scale: 1.2, rotate: -10 + idx * 10 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <Link href={item.href}>
                    <Image
                      src={item.src}
                      width={35 + (item.alt === "YouTube" ? 10 : 0)}
                      height={35 + (item.alt === "YouTube" ? 5 : 0)}
                      alt={item.alt}
                      className="rounded-xl transition-opacity cursor-pointer"
                    />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Section 2: Contact Information */}
          <motion.div
            className="space-y-4"
            ref={sectionRefs.current[1]}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          >
            <h3 className="text-lg font-medium text-black">Contact Us</h3>
            <motion.div
              className="flex  gap-3 items-center "
              ref={contactRefs[0]}
              whileHover={{ x: 8 }}
              transition={{ duration: 0.2 }}
            >
              <Mail className=" mt-1 flex-shrink-0 " size={22} />
              <Link
                href="mailto:info@cyborgrobotics.in"
                className="text-base font-medium text-black hover:text-red-800 text-center"
              >
                info@cyborgrobotics.in
              </Link>
            </motion.div>
            <motion.div
              className="flex items-start  gap-3"
              ref={contactRefs[1]}
              whileHover={{ x: 8 }}
              transition={{ duration: 0.2 }}
            >
              <MapPinHouse className=" mt-1 flex-shrink-0 " size={22} />
              <Link
                href="https://www.google.com/maps/place/North+Court,+Rd+Number+12,+Jogger's+Park,+Nilanjali+Society,+Kalyani+Nagar,+Pune,+Maharashtra+411006/@18.5492198,73.8982955,786m/data=!3m2!1e3!4b1!4m10!1m2!2m1!1sNorth+court,office+No:2A,+1st+floor,opposite+joggers+park,above+punjab+national+bank,kalyani+nagar,Pune+411+006!3m6!1s0x3bc2c110e47e39a3:0x1790569bae5ab0f4!8m2!3d18.5492148!4d73.9031664!15sCm9Ob3J0aCBjb3VydCxvZmZpY2UgTm86MkEsIDFzdCBmbG9vcixvcHBvc2l0ZSBqb2dnZXJzIHBhcmssYWJvdmUgcHVuamFiIG5hdGlvbmFsIGJhbmssa2FseWFuaSBuYWdhcixQdW5lIDQxMSAwMDYiA4gBAZIBEWNvbXBvdW5kX2J1aWxkaW5n4AEA!16s%2Fg%2F1hjggd2b0?authuser=0&entry=ttu&g_ep=EgoyMDI1MDMxNy4wIKXMDSoASAFQAw%3D%3D"
                className="text-base font-medium text-black hover:text-red-800 "
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
              <PhoneCall className=" mt-1 flex-shrink-0" size={22} />
              <Link
                href="tel:+919175159292"
                className="text-base font-medium hover:text-red-800 text-black "
              >
                Phone: +91 91751 59292
              </Link>
            </motion.div>
          </motion.div>
          {/* Section 3: Quick Links */}
          <motion.div
            className="space-y-4"
            ref={sectionRefs.current[2]}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
          >
            <h3 className="text-lg font-medium text-black">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { href: "/", label: "Home" },
                { href: "/about", label: "About" },
                { href: "/gallery/photo", label: "Gallery" },
                { href: "/contact-us", label: "Contact" },
                {
                  href: "/terms-conditions",
                  label: "Terms and Conditions",
                },
                {
                  href: "/privacy-policy",
                  label: "Privacy Policy",
                },
              ].map((item, idx) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-base font-medium text-black hover:text-red-800 transition-all "
                  >
                    <motion.span
                      ref={(el) => {
                        quickLinkRefs.current[idx] = el;
                      }}
                      whileHover={{ x: 8, color: "#991b1b" }}
                      transition={{ duration: 0.2 }}
                      style={{ display: "inline-block" }}
                      className=""
                    >
                      {item.label}
                    </motion.span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Section 4: Download App Links */}
          <motion.div
            className="space-y-4"
            ref={sectionRefs.current[3]}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
          >
            <h3 className="text-lg font-medium text-black text-shadow-md">
              Daily Inspiration
            </h3>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-red-500 gradient-text flex-1">
                {dailyQuote || "Loading...."}
              </h2>
              <motion.button
                onClick={fetchNewQuote}
                disabled={isLoadingQuote}
                className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <RefreshCw
                  size={16}
                  className={`transition-transform duration-300 ${isLoadingQuote ? "animate-spin" : ""}`}
                />
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Copyright Section */}
        <hr className="border-t border-gray-300" />
        <div className="py-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <p className="text-xs md:text-sm text-black">
              © Copyright All Rights Reserved by Cyborg Robotics Academy
              Private Limited
            </p>
            <VisitorCounter />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
