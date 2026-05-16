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

const quickLinks = [
  { label: "Home", href: "#top" },
  { label: "About", href: "#about" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Rules", href: "/terms-conditions" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

const importantLinks = [
  { label: "Terms & Conditions", href: "/terms-conditions" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Code of Conduct", href: "/terms-conditions" },
];

const socialLinks = [
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Youtube, label: "YouTube", href: "#" },
];

const contactItems = [
  {
    icon: Mail,
    label: "hello@mazechallenge.in",
    href: "mailto:hello@mazechallenge.in",
  },
  {
    icon: Phone,
    label: "+91 12345 67890",
    href: "tel:+911234567890",
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
    <footer id="contact" className="scroll-mt-24 border-t border-gray-200 bg-white">
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

              <div className="flex items-center gap-2">
                {socialLinks.map(({ icon: Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-gray-300 text-gray-500 transition-colors duration-200 hover:border-[#082c78] hover:text-[#082c78]"
                  >
                    <Icon size={13} />
                  </a>
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

      <div className="border-t-2 border-[#c0392b] py-4 text-center text-[11px] text-gray-400">
        (c) 2024 Maze Challenge. All Rights Reserved.
      </div>
    </footer>
  );
}
