"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

export default function CodefestPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("codefest_promo_seen");
    if (!seen) {
      setIsOpen(true);
      sessionStorage.setItem("codefest_promo_seen", "true");
    }
  }, []);

  const close = () => setIsOpen(false);
  const openRegistration = () => {
    close();
    window.dispatchEvent(new Event("open-codefest-registration"));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            {/* Card — portrait 9:16 */}
            <div className="relative w-[min(90vw,480px)] aspect-square overflow-hidden rounded-2xl shadow-2xl">
              {/* Close button */}
              <button
                onClick={close}
                className="absolute right-3 top-3 z-20 rounded-full bg-black/40 p-1.5 text-white hover:bg-black/60 transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>

              {/* Banner image */}
              <img
                src="/assets/codefest/codefest-banner.png"
                alt="Cyborg Codefest 2025"
                className="absolute inset-0 h-full w-full object-cover rounded-xl"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              {/* Register button */}
              <div className="bg-[#062341] px-4 py-3 flex justify-center">
                <button
                  type="button"
                  onClick={openRegistration}
                  className="w-full text-center bg-[#A81B1E] hover:bg-[#8f1618] text-white font-semibold text-sm py-2.5 rounded-lg transition-colors duration-200"
                >
                  Register Now
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
