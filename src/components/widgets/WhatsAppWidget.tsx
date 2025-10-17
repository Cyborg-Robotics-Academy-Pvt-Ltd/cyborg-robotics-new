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
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(0.9);
            opacity: 0.7;
          }
          70% {
            transform: scale(1.2);
            opacity: 0.2;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
        .animate-pulse {
          animation: pulse 2s infinite;
        }
      `}</style>
      {/* Chat Card */}
      <AnimatePresence>
        {canShowCard && isOpen && (
          <div className="relative mb-3">
            {/* Close button positioned completely outside the card container */}
            <motion.button
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsOpen(false)}
              className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/30 backdrop-blur-lg border border-white/50 text-gray-800 shadow-lg hover:bg-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-300"
              aria-label="Close chat widget"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.button>

            <motion.div
              key="chat-card"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-72 h-52 flex flex-col overflow-hidden rounded-2xl  bg-white/80 backdrop-blur-lg shadow-xl shadow-green-500/10"
              role="dialog"
              aria-label="WhatsApp chat widget"
            >
              {/* Header */}
              <div className="flex items-center justify-between bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 text-white rounded-t-2xl">
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
                    <p className="truncate text-sm font-bold tracking-wide">
                      {businessName}
                    </p>
                    <p className="text-[10px] leading-none text-white/90 font-medium tracking-wider mt-0.5">
                      ONLINE
                    </p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-4 py-3 flex-1 overflow-auto">
                <div className="mb-3 inline-block max-w-[85%] rounded-2xl rounded-bl-none bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-2 text-sm text-gray-800 shadow-sm relative">
                  <div className="absolute bottom-0 left-4 translate-y-full border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent border-t-gray-100"></div>
                  {welcomeMessage}
                </div>

                <a
                  href={chatHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    "flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:from-green-600 hover:to-emerald-700 hover:shadow-lg hover:shadow-green-500/30 " +
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
          </div>
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
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg transition-all duration-300 hover:from-green-600 hover:to-emerald-700 hover:shadow-xl hover:shadow-green-500/40 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Pulsing animation circle */}
        <span className="absolute -inset-2 rounded-full bg-green-400 opacity-70 animate-pulse"></span>
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
