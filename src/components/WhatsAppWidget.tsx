"use client";

import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type WhatsAppWidgetProps = {
  phoneNumber?: string;
  businessName?: string;
  welcomeMessage?: string;
  showAfterScroll?: number; // pixels after which card can show
  autoOpenAfter?: number; // ms after which card auto-opens
};

export default function WhatsAppWidget({
  phoneNumber,
  businessName = "Cyborg Robotics Academy",
  welcomeMessage = "Hello Cyborg, I am looking for some help! (Enquiry)",
  showAfterScroll = 200,
  autoOpenAfter = 8000, // 8 seconds
}: WhatsAppWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [canShowCard, setCanShowCard] = useState(false);
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  // Enable card on scroll
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > showAfterScroll) {
        setCanShowCard(true);
      } else {
        setCanShowCard(false);
        setIsOpen(false);
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfterScroll]);

  // Auto open after time
  useEffect(() => {
    if (!autoOpenAfter) return;
    const timer = setTimeout(() => {
      if (!hasAutoOpened) {
        setCanShowCard(true);
        setIsOpen(true);
        setHasAutoOpened(true);
      }
    }, autoOpenAfter);
    return () => clearTimeout(timer);
  }, [autoOpenAfter, hasAutoOpened]);

  const resolvedPhone = useMemo(() => {
    const fromEnv = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").trim();
    return (phoneNumber || fromEnv).replace(/[^\d]/g, "");
  }, [phoneNumber]);

  const chatHref = useMemo(() => {
    if (!resolvedPhone) return "#";
    const encoded = encodeURIComponent(welcomeMessage);
    return `https://wa.me/${resolvedPhone}?text=${encoded}`;
  }, [resolvedPhone, welcomeMessage]);

  return (
    <div className="fixed bottom-4 right-8 md:right-32 z-50 flex flex-col items-end">
      {/* Chat Card */}
      <AnimatePresence>
        {canShowCard && isOpen && (
          <motion.div
            key="chat-card"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="mb-3 w-72 h-52 flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
            role="dialog"
            aria-label="WhatsApp chat widget"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-green-500 px-4 py-3 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                  <Image
                    src="/assets/logo1.png"
                    alt="WhatsApp"
                    width={60}
                    height={60}
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {businessName}
                  </p>
                  <p className="text-[11px] leading-none text-white/80">
                    online
                  </p>
                </div>
              </div>
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="ml-2 text-white hover:text-gray-200 focus:outline-none"
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="px-4 py-3 flex-1 overflow-auto">
              <div className="mb-3 inline-block max-w-[85%] rounded-2xl rounded-bl-none bg-gray-100 px-3 py-2 text-sm text-gray-800">
                {welcomeMessage}
              </div>

              <a
                href={chatHref}
                target="_blank"
                rel="noopener noreferrer"
                className={
                  "flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-600 " +
                  (!resolvedPhone ? "cursor-not-allowed opacity-60" : "")
                }
                aria-disabled={!resolvedPhone}
              >
                Start chat
              </a>
              {!resolvedPhone && (
                <p className="mt-2 text-[11px] text-red-500">
                  WhatsApp number is not configured.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button (always visible, clickable anytime) */}
      <motion.button
        type="button"
        aria-label="Open WhatsApp chat"
        onClick={() => {
          if (!canShowCard) setCanShowCard(true);
          setIsOpen((v) => !v);
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
      >
        <Image
          src="/assets/social-icons/whatsapp.png"
          alt="WhatsApp"
          width={28}
          height={28}
        />
      </motion.button>
    </div>
  );
}
