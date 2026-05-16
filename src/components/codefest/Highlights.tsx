"use client";

import Image from "next/image";
import { BadgeCheck, ShieldCheck, UsersRound } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type HighlightItem = {
  title: string;
  subtitle: string;
  icon: React.ElementType | null;
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
    href: "https://chat.whatsapp.com/your-invite-link",
  },
];

export default function Highlights() {
  return (
    <section className="w-full px-4 py-4">
      <Card className="mx-auto max-w-[1320px] overflow-hidden rounded-[28px] border border-[#e7e7e7] bg-white shadow-sm">
        <CardContent className="flex p-0">
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
                className={`flex h-[118px] flex-1 items-center gap-5 px-8 ${
                  index !== items.length - 1 ? "border-r border-[#ececec]" : ""
                } ${item.href ? "cursor-pointer transition-colors hover:bg-[#f6fef8]" : ""}`}
              >
                <div className="shrink-0">
                  {item.imageSrc ? (
                    <Image
                      src={item.imageSrc}
                      alt={item.title}
                      width={40}
                      height={40}
                      className="h-10 w-10 object-contain"
                    />
                  ) : Icon ? (
                    <Icon
                      strokeWidth={1.9}
                      className="h-[40px] w-[40px]"
                      style={{ color: item.color }}
                    />
                  ) : null}
                </div>

                <div>
                  <h3 className="text-[15px] font-extrabold uppercase leading-[1.25] tracking-[-0.4px] text-[#0B347A]">
                    {item.title}
                  </h3>
                  <p
                    className="mt-1 text-[13px] font-medium leading-[1.4]"
                    style={{ color: item.href ? "#25D366" : "#2c2c2c" }}
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
