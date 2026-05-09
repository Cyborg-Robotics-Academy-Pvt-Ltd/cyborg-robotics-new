"use client";

import Image from "next/image";
import { useMemo } from "react";
import { motion } from "framer-motion";

type WhatsAppWidgetProps = {
  phoneNumber?: string;
  welcomeMessage?: string;
};

export default function WhatsAppWidget({
  phoneNumber,
  welcomeMessage = "Hello Cyborg, I am looking for some help! (Enquiry)",
}: WhatsAppWidgetProps) {
  const resolvedPhone = useMemo(() => {
    const fromEnv = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").trim();
    return (phoneNumber || fromEnv).replace(/[^\d]/g, "");
  }, [phoneNumber]);

  const chatHref = useMemo(() => {
    if (!resolvedPhone) return "#";
    const encoded = encodeURIComponent(welcomeMessage);
    return `https://wa.me/${resolvedPhone}?text=${encoded}`;
  }, [resolvedPhone, welcomeMessage]);

  const socialLinks = [
    {
      href: "https://www.instagram.com/cyborgroboticsacademy",
      label: "Instagram",
      icon: (
        <Image
          src="/assets/social-icons/instagram.webp"
          alt="Instagram"
          width={24}
          height={24}
          className="h-8 w-8 rounded-full object-contain"
        />
      ),
    },
    {
      href: "https://www.facebook.com/cyborgrobotics/",
      label: "Facebook",
      icon: (
        <Image
          src="/assets/social-icons/Facebook.webp"
          alt="Facebook"
          width={24}
          height={24}
          className="h-8 w-8 rounded-full object-contain"
        />
      ),
    },
    {
      href: "https://www.youtube.com/@cyborgroboticsacademy",
      label: "YouTube",
      icon: (
        <Image
          src="/assets/social-icons/youtube.png"
          alt="YouTube"
          width={24}
          height={24}
          className="h-8 w-8 object-contain"
        />
      ),
    },
    {
      href: chatHref,
      label: "WhatsApp",
      icon: (
        <Image
          src="/assets/social-icons/whatsapp.png"
          alt="WhatsApp"
          width={24}
          height={24}
          className="h-10 w-10 object-contain"
        />
      ),
    },
  ];

  return (
    <div className="fixed md:bottom-6 bottom-20 right-4 md:right-4 z-50 flex flex-col items-end">
      <div className="flex flex-col items-end gap-2">
        {socialLinks.map((link, index) => (
          <motion.a
            key={link.label}
            href={link.href}
            aria-label={link.label}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 * (index + 1), duration: 0.25 }}
            whileHover={{ scale: 1.08, x: -2 }}
            whileTap={{ scale: 0.96 }}
            className={`flex h-12 w-12 items-center justify-center rounded-full  text-[#b92423]  transition-all duration-300  ${
              link.label === "WhatsApp" && !resolvedPhone
                ? "cursor-not-allowed opacity-60"
                : ""
            }`}
            aria-disabled={link.label === "WhatsApp" && !resolvedPhone}
          >
            {link.icon}
          </motion.a>
        ))}
      </div>
    </div>
  );
}
