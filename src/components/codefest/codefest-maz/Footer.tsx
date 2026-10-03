"use client";

import Image from "next/image";
import {
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Youtube,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { MotionConfig } from "framer-motion";

const quickLinks = [
  { label: "Home", href: "#top" },
  { label: "About", href: "#about" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Rules", href: "/terms-conditions" },
  { label: "FAQ", href: "#faq" },
];

const importantLinks = [
  { label: "Terms & Conditions", href: "/terms-conditions" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Code of Conduct", href: "/terms-conditions" },
];

const socialLinks = [
  {
    icon: Instagram,
    label: "Instagram",
    href: "https://www.instagram.com/cyborgroboticsacademy",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/cyborg-robotics-academy-pvt-ltd/",
  },
  {
    icon: Youtube,
    label: "YouTube",
    href: "https://www.youtube.com/@cyborgroboticsacademy",
  },
];

const contactItems = [
  {
    icon: Mail,
    label: "info@cyborgrobotics.in",
    href: "mailto:info@cyborgrobotics.in",
  },
  {
    icon: Phone,
    label: "+91  91751 59292",
    href: "tel:+919175159292",
  },
  {
    icon: MapPin,
    label: "India",
    href: null,
  },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 text-[10px] font-black uppercase tracking-[0.14em] text-[#c0392b]">
      {children}
    </h3>
  );
}

export default function Footer() {
  return (
    <footer
      id="contact"
      className="scroll-mt-24 border-t border-gray-200 bg-white"
    >
      <div className="mx-auto max-w-7xl px-6 py-10">
        <Card className="border-gray-200/80 bg-white shadow-sm">
          <CardContent className="grid grid-cols-1 gap-10 p-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <Image
                  src="/cyborglogo.png"
                  alt="Maze Challenge logo"
                  width={42}
                  height={42}
                  className="h-[42px] w-[42px] rounded-full object-cover"
                />
                <div>
                  <p className="mb-[3px] text-[15px] font-black leading-none text-[#082c78]">
                    MAZE
                  </p>
                  <p className="text-[10px] font-black leading-none tracking-[0.18em] text-[#c0392b]">
                    CHALLENGE
                  </p>
                </div>
              </div>

              <p className="mb-5 text-xs leading-6 text-gray-500">
                A maze-solving challenge for
                <br />
                the brightest minds.
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
                  <div key={item.href} className="relative">
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
                  </div>
                ))}
              </div>
            </div>

            <div>
              <SectionHeading>Quick Links</SectionHeading>
              <ul className="space-y-2">
                {quickLinks.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-xs text-gray-500 transition-colors duration-150 hover:text-[#082c78]"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <SectionHeading>Important</SectionHeading>
              <ul className="space-y-2">
                {importantLinks.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-xs text-gray-500 transition-colors duration-150 hover:text-[#082c78]"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <SectionHeading>Contact Us</SectionHeading>
              <ul className="space-y-3">
                {contactItems.map(({ icon: Icon, label, href }) => {
                  const inner = (
                    <>
                      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded border border-gray-200 transition-colors duration-200 group-hover:border-[#082c78] group-hover:text-[#082c78]">
                        <Icon size={12} />
                      </span>
                      <span className="text-xs">{label}</span>
                    </>
                  );

                  return (
                    <li key={label}>
                      {href ? (
                        <a
                          href={href}
                          className="group flex items-center gap-3 text-gray-500 transition-colors duration-150 hover:text-[#082c78]"
                        >
                          {inner}
                        </a>
                      ) : (
                        <span className="group flex items-center gap-3 text-gray-500">
                          {inner}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Copyright & Legal */}
      <div className="py-8  flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-gray-600 mx-auto">
          © {new Date().getFullYear()} CODE FEST 1.0 • THE LONGEST DAY
          CHALLENGE
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
      </div>
    </footer>
  );
}
