"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function NewsletterSignup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative bg-white py-20 px-4 overflow-hidden">
      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="text-center mb-2"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-center font-bold text-2xl md:text-3xl    ">
            Stay <span className="gradient-text">Updated</span>
          </h1>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Illustration */}
          <motion.div
            className="flex justify-center lg:justify-start order-2 lg:order-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -50 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="relative w-full max-w-md">
              <motion.div
                className="relative z-10"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <Image
                  src="/assets/newsletter.png"
                  alt="Newsletter subscription illustration"
                  width={600}
                  height={500}
                  className="w-full h-auto"
                  priority
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Brevo Iframe Form */}
          <motion.div
            className="order-1 lg:order-2 flex justify-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 50 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <iframe
              width="540"
              height="405"
              src="https://f169c0e5.sibforms.com/serve/MUIFAB4pLckSEL0ZfHfatxBxFRGig5Zx-nmJ23NZeV-ao1Wc9U-2ReNINogkAIe8PuuDS8rxlsuthedA-2R9991-cBckG0vmBqSoqPq7jrbc1kI3y3mjUEhuvbGOiraFX-2Xe_upDrOth7Fu7tVGmOYA7mpjSl8fmtKvpHYKOdeB3pE4oNEhYhAvhjNS0gI_K1lPJ5tZf6863rK2"
              frameBorder="0"
              scrolling="no"
              allowFullScreen
              style={{
                display: "block",
                marginLeft: "auto",
                marginRight: "auto",
                width: "100%",
                maxWidth: "540px",
                height: "405px",
                border: "none",
                borderRadius: "1rem",
              }}
            ></iframe>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
