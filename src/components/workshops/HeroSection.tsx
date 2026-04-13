"use client";

import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useRef, type MouseEvent } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-cards";
import { Autoplay, EffectCards } from "swiper/modules";
import { WORKSHOP_HERO_IMAGES } from "./constants";
import { heroContainerVariants, heroItemVariants } from "./motion";
import type { CampLocation } from "./types";

interface Props {
  activeLocation: CampLocation;
  onRegister: () => void;
}

const HeroSection = ({ activeLocation, onRegister }: Props) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-150, 150], [12, -12]), {
    stiffness: 200,
    damping: 25,
  });
  const rotateY = useSpring(useTransform(mouseX, [-150, 150], [-12, 12]), {
    stiffness: 200,
    damping: 25,
  });
  const glareX = useTransform(mouseX, [-150, 150], [0, 100]);
  const glareY = useTransform(mouseY, [-150, 150], [0, 100]);
  const glareBackground = useTransform([glareX, glareY], ([x, y]) => {
    return `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.7) 0%, transparent 60%)`;
  });

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    mouseX.set(event.clientX - rect.left - rect.width / 2);
    mouseY.set(event.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section className="relative flex min-h-[auto] items-center overflow-hidden bg-white px-4 pb-8 pt-2 sm:px-6 sm:pb-16 sm:pt-16 lg:-mt-2 lg:min-h-[90vh] lg:py-0 before:pointer-events-none before:absolute before:inset-0 before:content-[''] before:[background:radial-gradient(ellipse_55%_50%_at_5%_60%,rgba(141,15,17,0.07)_0%,transparent_65%),radial-gradient(ellipse_45%_55%_at_95%_25%,rgba(141,15,17,0.06)_0%,transparent_65%)]">
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle,rgba(141,15,17,0.1)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_30%,transparent_100%)]" />
      <div className="pointer-events-none absolute -left-[90px] -top-[40px] h-[220px] w-[220px] animate-[blobFloat_9s_ease-in-out_infinite_alternate] rounded-full bg-[#8D0F11] opacity-10 blur-[70px] sm:-left-[120px] sm:-top-[100px] sm:h-[400px] sm:w-[400px] sm:blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-[40px] -right-[40px] h-[200px] w-[200px] animate-[blobFloat_9s_ease-in-out_infinite_alternate] rounded-full bg-[#B92423] opacity-10 blur-[70px] [animation-delay:1.5s] sm:-bottom-[80px] sm:-right-[60px] sm:h-[300px] sm:w-[300px] sm:blur-[80px]" />

      <div className="relative z-10 mx-auto w-full max-w-[1200px]">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={heroContainerVariants}
          className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10"
        >
          <div className="max-w-[720px]">
            <motion.div variants={heroItemVariants} className="mb-3">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(141,15,17,0.16)] bg-[rgba(141,15,17,0.07)] px-3 py-1 sm:gap-2 sm:px-[14px]">
                <span className="relative h-2 w-2 shrink-0 rounded-full bg-[#8D0F11] after:absolute after:-inset-[3px] after:animate-ping after:rounded-full after:bg-[#8D0F11] after:opacity-50 after:content-['']" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-[#8D0F11] sm:text-[11px]">
                  Cyborg Robotics Academy - Summer 2026
                </span>
              </div>
            </motion.div>

            <motion.h1
              variants={heroItemVariants}
              className="m-0 text-[clamp(2rem,4vw,3.2rem)] font-bold leading-[1.06] tracking-[-0.03em] text-[#1a1a1a]"
            >
              Build. Fly.{" "}
              <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                Innovate.
              </span>
            </motion.h1>

            <motion.div
              variants={heroItemVariants}
              className="my-2 h-[3px] w-10 rounded-sm bg-gradient-to-r from-[#8D0F11] to-[#B92423]"
            />

            <motion.h2
              variants={heroItemVariants}
              className="m-0 mb-2 text-[clamp(0.9rem,1.6vw,1.1rem)] font-semibold leading-[1.4] text-[#8D0F11]"
            >
              Robotics Summer Camp 2026 -{" "}
              <span className="bg-gradient-to-br from-[#8D0F11] to-[#B92423] bg-clip-text text-transparent">
                Kharadi - Kalyani Nagar - Magarpatta
              </span>
            </motion.h2>

            <motion.p
              variants={heroItemVariants}
              className="m-0 mb-5 text-[13px] font-normal leading-[1.65] text-[#666] sm:max-w-[560px]"
            >
              Kids build mechanical robots, assemble and fly drones, and pitch
              startup ideas through hands-on STEM learning. Choose your
              preferred center from Kharadi, Kalyani Nagar, or Magarpatta.
            </motion.p>

            <motion.div
              variants={heroItemVariants}
              className="mb-5 flex flex-wrap items-center gap-3"
            >
              <button
                type="button"
                onClick={onRegister}
                className="group relative inline-flex min-w-[200px] items-center justify-between gap-3 overflow-hidden rounded-2xl border border-[rgba(141,15,17,0.14)] bg-gradient-to-br from-[#8D0F11] via-[#A51518] to-[#C42924] px-4 py-3 text-left text-white shadow-[0_14px_36px_rgba(141,15,17,0.28)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(141,15,17,0.36)] active:translate-y-0"
              >
                <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.18)_22%,transparent_44%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="relative flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                    <Sparkles size={16} />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-[14px] font-semibold leading-none">
                      Book Now
                    </span>
                    <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.12em] text-white/72">
                      Reserve your seat
                    </span>
                  </span>
                </span>
                <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/18 bg-white/12 transition-transform duration-300 group-hover:translate-x-1">
                  <ArrowRight size={16} />
                </span>
              </button>
              <span className="text-[11px] font-medium text-[#8D0F11]/75">
                Limited seats available
              </span>
            </motion.div>

            <motion.div
              variants={heroItemVariants}
              className="mb-[14px] flex flex-wrap gap-[6px]"
            >
              {["Expert Mentors", "STEM Learning", "Project Based"].map(
                (item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-[5px] rounded-full border border-[rgba(141,15,17,0.1)] bg-[rgba(141,15,17,0.04)] px-[10px] py-[3px] text-[11px] font-normal text-[#777]"
                  >
                    {item}
                  </span>
                ),
              )}
            </motion.div>

            <motion.div
              variants={heroItemVariants}
              className="mb-[14px] flex flex-wrap gap-[6px]"
            >
              {[
                "Certificate",
                "Drone Included",
                "Hands-on STEM",
                "Entrepreneurship",
              ].map((text) => (
                <div
                  key={text}
                  className="inline-flex items-center gap-[6px] rounded-lg border border-[rgba(141,15,17,0.14)] bg-[rgba(141,15,17,0.06)] px-[10px] py-[5px] text-[11px] font-medium text-[#8D0F11] transition-all duration-200 hover:-translate-y-px hover:bg-[rgba(141,15,17,0.1)]"
                >
                  {text}
                </div>
              ))}
            </motion.div>

            <motion.div
              variants={heroItemVariants}
              className="grid grid-cols-1 gap-2 sm:grid-cols-3"
            >
              {[
                {
                  label: "Duration",
                  value: activeLocation.totalHours,
                  icon: <Clock size={10} />,
                },
                {
                  label: "Schedule",
                  value: activeLocation.days,
                  icon: <CalendarDays size={10} />,
                },
                {
                  label: "Locations",
                  value: "Kharadi - Kalyani Nagar - Magarpatta",
                  icon: <MapPin size={10} />,
                },
              ].map(({ label, value, icon }) => (
                <div
                  key={label}
                  className="rounded-xl border border-[rgba(141,15,17,0.1)] px-3 py-[10px] shadow-[0_2px_10px_rgba(141,15,17,0.05)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_4px_16px_rgba(141,15,17,0.1)]"
                >
                  <p className="m-0 mb-[2px] flex items-center gap-[3px] text-[10px] font-normal text-[#aaa]">
                    {icon} {label}
                  </p>
                  <p className="m-0 truncate text-[12px] font-semibold text-[#8D0F11]">
                    {value}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            variants={heroItemVariants}
            className="relative mx-auto flex w-full max-w-[320px] justify-center lg:mx-0 lg:mr-10 lg:w-auto lg:flex-none"
          >
            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative [perspective:900px]"
            >
              <motion.div
                style={{ rotateX, rotateY }}
                className="relative [transform-style:preserve-3d] will-change-transform"
              >
                <div className="relative h-[360px] w-[260px] overflow-hidden rounded-[22px] border border-[rgba(141,15,17,0.12)] shadow-[0_18px_50px_rgba(141,15,17,0.16)]">
                  <motion.div
                    className="pointer-events-none absolute inset-0 z-10 rounded-[22px] mix-blend-overlay opacity-40"
                    style={{ background: glareBackground }}
                  />

                  <Swiper
                    effect="cards"
                    grabCursor
                    loop
                    autoplay={{ delay: 2800, disableOnInteraction: false }}
                    modules={[EffectCards, Autoplay]}
                    className="h-full w-full [&_.swiper-slide]:overflow-hidden [&_.swiper-slide]:rounded-[22px]"
                  >
                    {WORKSHOP_HERO_IMAGES.map((image) => (
                      <SwiperSlide key={image.src}>
                        <div className="relative h-full w-full">
                          <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            sizes="260px"
                            className="object-cover"
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] bg-gradient-to-t from-[rgba(141,15,17,0.78)] via-[rgba(141,15,17,0.26)] to-transparent px-4 pb-4 pt-12">
                    <div className="inline-flex rounded-full border border-white/70  px-3 py-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-sm">
                      <p className="m-0 text-[12px] font-medium uppercase tracking-[0.1em] text-[#555]">
                        Robotics Summer Camp
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pointer-events-none absolute -bottom-4 left-1/2 h-6 w-[72%] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(141,15,17,0.18)_0%,transparent_70%)] blur-[8px]" />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
