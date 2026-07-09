"use client";

import Image from "next/image";
import { BadgeCheck, ShieldCheck, UsersRound } from "lucide-react";
import { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type HighlightItem = {
  title: string;
  subtitle: string;
  icon: LucideIcon | null;
  imageSrc?: string;
  color: string;
  href: string | null;
};

const items: HighlightItem[] = [
  {
    title: "OPEN TO STUDENTS",
    subtitle: "All Schools & Boards",
    icon: UsersRound,
    color: "#173B7A",
    href: null,
  },
  {
    title: "SAFE & SECURE",
    subtitle: "Monitored Environment",
    icon: ShieldCheck,
    color: "#173B7A",
    href: null,
  },
  {
    title: "E-CERTIFICATES",
    subtitle: "For All Participants",
    icon: BadgeCheck,
    color: "#173B7A",
    href: null,
  },
  {
    title: "JOIN COMMUNITY",
    subtitle: "WhatsApp Group →",
    icon: null,
    imageSrc: "/assets/social-icons/whatsapp.png",
    color: "#25D366",
    href: "https://chat.whatsapp.com/CaNL7KBldoWFQzS3kR6orX",
  },
];

export default function Highlights() {
  return (
    <section className="w-full px-4 py-4">
      <Card className="mx-auto max-w-[1320px] overflow-hidden rounded-3xl border border-[#e7e7e7] bg-white shadow-sm sm:rounded-[28px]">
        <CardContent className="grid grid-cols-1 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => {
            const Icon = item.icon;
            const Wrapper = item.href ? "a" : "div";

            return (
              <Wrapper
                key={item.title}
                {...(item.href
                  ? {
                      href: item.href,
                      target: "_blank",
                      rel: "noopener noreferrer",
                    }
                  : {})}
                className={`
                  flex min-h-[100px] items-center gap-4
                  px-5 py-5
                  transition-all

                  sm:min-h-[110px] sm:px-6
                  lg:h-[118px] lg:px-8

                  ${item.href ? "cursor-pointer hover:bg-[#f6fef8]" : ""}

                  border-b border-[#ececec]
                  sm:border-b

                  lg:border-b-0
                  ${
                    index !== items.length - 1
                      ? "lg:border-r lg:border-[#ececec]"
                      : ""
                  }

                  ${index >= items.length - 1 ? "border-b-0" : ""}

                  ${index >= 2 ? "sm:border-b-0" : ""}
                `}
              >
                {/* Icon */}
                <div className="shrink-0">
                  {item.imageSrc ? (
                    <Image
                      src={item.imageSrc}
                      alt={item.title}
                      width={40}
                      height={40}
                      className="
                        h-9 w-9 object-contain
                        sm:h-10 sm:w-10
                      "
                    />
                  ) : Icon ? (
                    <Icon
                      strokeWidth={1.9}
                      className="
                        h-[34px] w-[34px]
                        sm:h-[40px] sm:w-[40px]
                      "
                      style={{ color: item.color }}
                    />
                  ) : null}
                </div>

                {/* Content */}
                <div className="min-w-0">
                  <h3
                    className="
                      text-[13px] font-extrabold uppercase
                      leading-[1.3] tracking-[-0.3px]
                      text-[#0B347A]

                      sm:text-[14px]
                      lg:text-[15px]
                    "
                  >
                    {item.title}
                  </h3>

                  <p
                    className="
                      mt-1 text-[12px] font-medium leading-[1.45]
                      sm:text-[13px]
                    "
                    style={{
                      color: item.href ? "#25D366" : "#2c2c2c",
                    }}
                  >
                    {item.subtitle}
                  </p>
                </div>
              </Wrapper>
            );
          })}
        </CardContent>
      </Card>
    </section>
  );
}
