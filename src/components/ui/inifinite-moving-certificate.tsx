"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";

const ImageItem = ({
  item,
}: {
  item: { image?: string; video?: string; name?: string };
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <li
      className="w-[300px] max-w-full relative flex-shrink-0 transition-transform duration-300 hover:scale-105 mx-5 bg-white"
      key={item.image || item.video}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {item.video ? (
        <video
          ref={videoRef}
          src={item.video}
          controls
          className="object-cover rounded-2xl"
          width={300}
          height={225}
        />
      ) : (
        <Image
          src={item.image!}
          alt="Gallery image"
          width={300}
          height={225}
          className="object-cover rounded-2xl"
          loading="lazy"
        />
      )}
      <p className="text-center text-sm mt-2">
        {item.image ? item.name : "Video"}
      </p>
    </li>
  );
};

export const InfiniteCertificateImages = ({
  items,
  direction = "left",
  speed = "slow",
  pauseOnHover = true,
  className,
}: {
  items: {
    image?: string;
    video?: string;
    name?: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);

  const [start, setStart] = useState(false);

  const addAnimation = useCallback(() => {
    const getDirection = () => {
      if (containerRef.current) {
        if (direction === "left") {
          containerRef.current.style.setProperty(
            "--animation-direction",
            "forwards"
          );
        } else {
          containerRef.current.style.setProperty(
            "--animation-direction",
            "reverse"
          );
        }
      }
    };

    const getSpeed = () => {
      if (containerRef.current) {
        if (speed === "fast") {
          containerRef.current.style.setProperty("--animation-duration", "20s");
        } else if (speed === "normal") {
          containerRef.current.style.setProperty("--animation-duration", "40s");
        } else {
          containerRef.current.style.setProperty("--animation-duration", "80s");
        }
      }
    };

    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  }, [direction, speed]);

  useEffect(() => {
    addAnimation();
  }, [addAnimation]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative z-20 w-full py-5 overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_5%,white_95%,transparent)] bg-white",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex min-w-full shrink-0 py-2 w-max flex-nowrap ",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {items.map((item) => (
          <ImageItem key={item.image || item.video} item={item} />
        ))}
      </ul>
    </div>
  );
};
