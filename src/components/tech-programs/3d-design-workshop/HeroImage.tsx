"use client";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  cubicBezier,
  type Variants,
} from "framer-motion";
import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-cards";
import { EffectCards, Autoplay } from "swiper/modules";
import Modal from "@/components/ui/Modal";
import { ArrowRight, Sparkles, Users, Award, Box } from "lucide-react";
import { saveOrderId } from "@/lib/order-id-storage";

interface StaticImage {
  url: string;
  alt: string;
  title: string;
}

interface RegistrationFormData {
  email: string;
  contactNumber: string;
  childName: string;
  age: string;
  city: string;
  area: string;
}

const ThreeDDesignHero = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInitiatingPayment, setIsInitiatingPayment] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState<RegistrationFormData>({
    email: "",
    contactNumber: "",
    childName: "",
    age: "",
    city: "",
    area: "",
  });
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setFormError("");
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isInitiatingPayment) return;

    try {
      setIsInitiatingPayment(true);
      setFormError("");

      const response = await fetch("/api/payment/initiate-workshop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshopKey: "3d-design-workshop",
          email: formData.email,
          contactNumber: formData.contactNumber,
          childName: formData.childName,
          age: formData.age,
          city: formData.city,
          area: formData.area,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success && data.paymentUrl) {
        if (data.orderId) {
          saveOrderId(data.orderId);
        }
        window.location.href = data.paymentUrl;
        return;
      }

      setFormError(
        data.message || "Unable to start payment. Please try again.",
      );
    } catch (error) {
      console.error("Workshop payment initiation failed:", error);
      setFormError("Unable to start payment. Please try again.");
    } finally {
      setIsInitiatingPayment(false);
    }
  };

  const staticImages: StaticImage[] = [
    {
      url: "/assets/workshops/3d-printing/IMG_0327.jpeg",
      alt: "3D design workshop session 1",
      title: "Doraemon",
    },
    {
      url: "/assets/workshops/3d-printing/IMG_0332.jpeg",
      alt: "3D design workshop session 2",
      title: "Gojo (Anime)",
    },
    {
      url: "/assets/workshops/3d-printing/IMG_0333.jpeg",
      alt: "3D design workshop session 3",
      title: "Solo-Leveling",
    },
    {
      url: "/assets/workshops/3d-printing/IMG_0328.jpeg",
      alt: "3D design workshop session 4",
      title: "Bholenath",
    },
    {
      url: "/assets/workshops/3d-printing/IMG_0335.jpeg",
      alt: "3D design workshop session 5",
      title: "Iron-Man",
    },
  ];
  const shouldLoopSlides = staticImages.length > 3;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: cubicBezier(0.22, 1, 0.36, 1),
      },
    },
  };

  const stats = [
    { label: "Duration", value: "2 Hours", icon: "⏱" },
    { label: "Age Group", value: "9-15 Years", icon: "🎯" },
    { label: "Mode", value: "Live Online", icon: "💻" },
  ];

  const highlights = [
    { icon: <Award size={11} />, text: "Certificate" },
    { icon: <Sparkles size={11} />, text: "3D Modeling" },
    { icon: <Box size={11} />, text: "Real Project" },
  ];

  return (
    <div className="font-['DM_Sans',sans-serif] overflow-hidden">
      {/* Google Fonts import kept as a minimal style tag since Tailwind cannot load external fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');`}</style>

      {/* HERO SECTION */}
      <motion.section
        className="
          relative min-h-screen flex items-center bg-white px-6
          before:content-[''] before:absolute before:inset-0 before:pointer-events-none
          before:[background:radial-gradient(ellipse_55%_50%_at_5%_60%,rgba(168,27,30,0.07)_0%,transparent_65%),radial-gradient(ellipse_45%_55%_at_95%_25%,rgba(168,27,30,0.06)_0%,transparent_65%)]
        "
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Dot grid */}
        <div
          className="
            absolute inset-0 pointer-events-none opacity-30
            [background-image:radial-gradient(circle,rgba(168,27,30,0.1)_1px,transparent_1px)]
            [background-size:28px_28px]
            [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_30%,transparent_100%)]
          "
        />

        {/* Blobs */}
        <div
          className="
            absolute w-[400px] h-[400px] rounded-full pointer-events-none opacity-10
            bg-[#A81B1E] blur-[80px] -top-[100px] -left-[120px]
            animate-[blobFloat_9s_ease-in-out_infinite_alternate]
          "
        />
        <div
          className="
            absolute w-[300px] h-[300px] rounded-full pointer-events-none opacity-10
            bg-[#C73E1D] blur-[80px] -bottom-[80px] -right-[60px]
            animate-[blobFloat_9s_ease-in-out_infinite_alternate]
            [animation-delay:1.5s]
          "
        />

        {/* INNER WRAPPER */}
        <div className="max-w-[1200px] mx-auto w-full relative z-10">
          <div className="flex flex-row items-center gap-10 flex-wrap">
            {/* LEFT COLUMN */}
            <motion.div
              variants={itemVariants}
              className="flex-[1_1_340px] min-w-[260px]"
            >
              {/* Live badge */}
              <motion.div variants={itemVariants} className="mb-3">
                <div className="inline-flex items-center gap-2 bg-[rgba(168,27,30,0.07)] border border-[rgba(168,27,30,0.16)] rounded-full px-[14px] py-1">
                  {/* Pulse dot */}
                  <span className="relative w-2 h-2 rounded-full bg-[#A81B1E] shrink-0 after:content-[''] after:absolute after:-inset-[3px] after:rounded-full after:bg-[#A81B1E] after:opacity-50 after:animate-ping" />
                  <span className="text-[11px] font-bold text-[#A81B1E] tracking-[0.06em] uppercase">
                    Cyborg Weekend Tech Series
                  </span>
                </div>
              </motion.div>

              {/* H1 */}
              <motion.h1
                variants={itemVariants}
                className="font-['Syne',sans-serif] text-[clamp(1.9rem,4vw,3.2rem)] font-black leading-[1.06] tracking-[-0.03em] text-[#1a1a1a] m-0"
              >
                Design. Build.{" "}
                <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                  Create.
                </span>
              </motion.h1>

              {/* Divider */}
              <div className="w-10 h-[3px] bg-gradient-to-r from-[#A81B1E] to-[#C73E1D] rounded-sm my-2" />

              {/* H2 */}
              <motion.h2
                variants={itemVariants}
                className="font-['Syne',sans-serif] text-[clamp(0.9rem,1.6vw,1.1rem)] font-bold text-[#A81B1E] m-0 mb-2 leading-[1.4]"
              >
                Create Your First{" "}
                <span className="bg-gradient-to-br from-[#A81B1E] to-[#C73E1D] bg-clip-text text-transparent">
                  3D Design Project
                </span>
              </motion.h2>

              {/* Description */}
              <motion.p
                variants={itemVariants}
                className="text-[13px] text-[#555] leading-[1.6] m-0 mb-3 max-w-[420px]"
              >
                Kids learn 3D modeling and digital design through a hands-on
                live workshop — guided step by step in a 2-hour session.
              </motion.p>

              {/* Trust pills */}
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap gap-[6px] mb-[14px]"
              >
                {[
                  "👨‍🏫 Expert Mentors",
                  "🧠 STEM Learning",
                  "🧩 Project Based",
                ].map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-[5px] bg-[rgba(168,27,30,0.04)] border border-[rgba(168,27,30,0.1)] rounded-full px-[10px] py-[3px] text-[11px] text-[#666] font-medium"
                  >
                    {t}
                  </span>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div
                variants={itemVariants}
                className="flex gap-[10px] flex-wrap mb-[14px]"
              >
                {/* Primary CTA */}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="
                    relative overflow-hidden inline-flex items-center gap-[7px] whitespace-nowrap
                    bg-gradient-to-br from-[#A81B1E] to-[#C73E1D] text-white border-0
                    rounded-xl text-[14px] font-bold px-6 py-[11px] cursor-pointer
                    shadow-[0_6px_22px_rgba(168,27,30,0.35)]
                    transition-[transform,box-shadow] duration-200 ease-out
                    hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(168,27,30,0.42)]
                    before:content-[''] before:absolute before:top-0 before:-left-full before:w-[60%] before:h-full
                    before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent
                    before:transition-[left] before:duration-500 hover:before:left-[150%]
                  "
                >
                  <Sparkles size={13} />
                  Register for ₹99
                  <ArrowRight size={13} />
                </button>
              </motion.div>

              {/* Highlight pills */}
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap gap-[6px] mb-[14px]"
              >
                {highlights.map(({ icon, text }) => (
                  <div
                    key={text}
                    className="
                      inline-flex items-center gap-[6px]
                      bg-[rgba(168,27,30,0.06)] border border-[rgba(168,27,30,0.14)]
                      rounded-lg px-[10px] py-[5px] text-[11px] font-semibold text-[#A81B1E]
                      transition-all duration-200 ease-out
                      hover:bg-[rgba(168,27,30,0.1)] hover:-translate-y-px
                    "
                  >
                    {icon}
                    {text}
                  </div>
                ))}
              </motion.div>

              {/* Stat cards */}
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-3 gap-2"
              >
                {stats.map(({ label, value, icon }) => (
                  <div
                    key={label}
                    className="
                      bg-white/90 border border-[rgba(168,27,30,0.1)] rounded-xl px-3 py-[10px]
                      shadow-[0_2px_10px_rgba(168,27,30,0.05)]
                      transition-all duration-200 ease-out
                      hover:shadow-[0_4px_16px_rgba(168,27,30,0.1)] hover:-translate-y-px
                    "
                  >
                    <p className="text-[10px] text-[#999] m-0 mb-[2px] flex items-center gap-[3px]">
                      <span>{icon}</span>
                      {label}
                    </p>
                    <p className="text-[13px] font-bold text-[#A81B1E] m-0">
                      {value}
                    </p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* RIGHT COLUMN: 3D tilt card */}
            <motion.div
              variants={itemVariants}
              className="flex-none flex justify-center items-center relative"
            >
              {/* Floating badge */}
              <div
                className="
                  absolute -bottom-[10px] -right-[14px] z-20
                  bg-gradient-to-br from-[#A81B1E] to-[#C73E1D] rounded-xl px-3 py-[7px]
                  shadow-[0_6px_20px_rgba(168,27,30,0.35)]
                  flex items-center gap-[7px]
                  animate-[badgeFloat_3.5s_ease-in-out_infinite_alternate-reverse]
                "
              >
                <span className="text-sm">⭐</span>
                <div>
                  <div className="text-[9px] text-white/60 font-semibold uppercase tracking-[0.06em]">
                    Workshop Fee
                  </div>
                  <div className="text-[12px] text-white font-bold">
                    ₹99 · 3 May 2026
                  </div>
                </div>
              </div>

              {/* 3D tilt wrapper */}
              <div
                ref={cardRef}
                className="[perspective:900px] relative"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <motion.div
                  className="[transform-style:preserve-3d] [will-change:transform]"
                  style={{ rotateX, rotateY }}
                >
                  <div className="w-[260px] h-[360px] overflow-hidden relative">
                    {/* Glare overlay */}
                    <motion.div
                      className="absolute inset-0 rounded-xl pointer-events-none z-10 mix-blend-overlay opacity-40"
                      style={{
                        background: useTransform(
                          [glareX, glareY],
                          ([x, y]) =>
                            `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.7) 0%, transparent 60%)`,
                        ),
                      }}
                    />

                    <Swiper
                      effect="cards"
                      grabCursor
                      modules={[EffectCards, Autoplay]}
                      autoplay={{ delay: 2800, disableOnInteraction: false }}
                      loop={shouldLoopSlides}
                      className="!w-full !h-full [&_.swiper-slide]:rounded-2xl [&_.swiper-slide]:overflow-hidden [&_.swiper-slide_img]:w-full [&_.swiper-slide_img]:h-full [&_.swiper-slide_img]:object-cover"
                    >
                      {staticImages.map((image, index) => (
                        <SwiperSlide key={index}>
                          <div className="relative w-full h-full">
                            <Image
                              src={image.url}
                              alt={image.alt}
                              width={260}
                              height={360}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                            <span
                              className="
                                absolute top-[10px] right-[10px]
                                bg-gradient-to-br from-[#8a1518] to-[#C73E1D]
                                rounded-full px-[10px] py-[3px]
                                text-[10px] font-bold uppercase tracking-[0.05em] text-white
                                shadow-[0_2px_8px_rgba(168,27,30,0.4)]
                                border border-white/25
                              "
                            >
                              {image.title}
                            </span>
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>

                    {/* Bottom gradient overlay with progress bars */}
                    <div
                      className="
                        absolute bottom-0 left-0 right-0 h-[70px] z-[5]
                        bg-gradient-to-t from-[rgba(168,27,30,0.82)] to-transparent
                        flex items-end pb-3 px-[14px] gap-1
                      "
                    >
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`flex-1 h-[2.5px] rounded-sm ${i === 0 ? "bg-white" : "bg-white/30"}`}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register for 3D Designing Workshop"
      >
        <div className="bg-gradient-to-b from-white to-[#fff7f7] p-4 sm:p-5">
          <div className="border border-[rgba(168,27,30,0.12)] rounded-[18px] bg-white shadow-[0_12px_40px_rgba(168,27,30,0.08)] p-4 sm:p-6">
            {/* Modal header */}
            <div className="mb-5">
              <h3 className="font-['Syne',sans-serif] text-2xl font-extrabold text-[#1a1a1a] m-0">
                3D Designing Workshop Registration
              </h3>
              <p className="text-[14px] text-[#5b5b5b] leading-[1.6] mt-[10px] mb-0">
                Register your child for the 3D Designing Workshop.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {["Age Group: 4-16 Years", "Workshop Fee: Rs. 99"].map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-[5px] bg-[rgba(168,27,30,0.04)] border border-[rgba(168,27,30,0.1)] rounded-full px-[10px] py-[3px] text-[11px] text-[#666] font-medium"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Error banner */}
            {formError && (
              <div className="mb-5 rounded-xl border border-red-200/40 bg-red-50/60 px-[14px] py-3 text-[13px] font-semibold text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              {/* Grid */}
              <div className="grid grid-cols-2 gap-[14px] max-sm:grid-cols-1">
                {/* Email - full width */}
                <div className="flex flex-col gap-[6px] col-span-2 max-sm:col-span-1">
                  <label
                    className="text-[13px] font-bold text-[#2a2a2a]"
                    htmlFor="email"
                  >
                    Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="
                      w-full border border-[rgba(168,27,30,0.18)] rounded-xl px-[14px] py-3
                      text-[14px] text-[#222] bg-white outline-none
                      transition-[border-color,box-shadow] duration-200
                      focus:border-[#A81B1E] focus:shadow-[0_0_0_4px_rgba(168,27,30,0.08)]
                    "
                  />
                </div>

                {/* Contact - full width */}
                <div className="flex flex-col gap-[6px] col-span-2 max-sm:col-span-1">
                  <label
                    className="text-[13px] font-bold text-[#2a2a2a]"
                    htmlFor="contactNumber"
                  >
                    Contact Number (WhatsApp Preferred) *
                  </label>
                  <input
                    id="contactNumber"
                    name="contactNumber"
                    type="tel"
                    required
                    placeholder="Enter contact number"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    className="
                      w-full border border-[rgba(168,27,30,0.18)] rounded-xl px-[14px] py-3
                      text-[14px] text-[#222] bg-white outline-none
                      transition-[border-color,box-shadow] duration-200
                      focus:border-[#A81B1E] focus:shadow-[0_0_0_4px_rgba(168,27,30,0.08)]
                    "
                  />
                </div>

                {/* Child name - full width */}
                <div className="flex flex-col gap-[6px] col-span-2 max-sm:col-span-1">
                  <label
                    className="text-[13px] font-bold text-[#2a2a2a]"
                    htmlFor="childName"
                  >
                    Name of the Child *
                  </label>
                  <input
                    id="childName"
                    name="childName"
                    type="text"
                    required
                    placeholder="Enter child's full name"
                    value={formData.childName}
                    onChange={handleInputChange}
                    className="
                      w-full border border-[rgba(168,27,30,0.18)] rounded-xl px-[14px] py-3
                      text-[14px] text-[#222] bg-white outline-none
                      transition-[border-color,box-shadow] duration-200
                      focus:border-[#A81B1E] focus:shadow-[0_0_0_4px_rgba(168,27,30,0.08)]
                    "
                  />
                </div>

                {/* Age */}
                <div className="flex flex-col gap-[6px]">
                  <label
                    className="text-[13px] font-bold text-[#2a2a2a]"
                    htmlFor="age"
                  >
                    Age *
                  </label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    min="4"
                    max="16"
                    required
                    placeholder="4-16"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="
                      w-full border border-[rgba(168,27,30,0.18)] rounded-xl px-[14px] py-3
                      text-[14px] text-[#222] bg-white outline-none
                      transition-[border-color,box-shadow] duration-200
                      focus:border-[#A81B1E] focus:shadow-[0_0_0_4px_rgba(168,27,30,0.08)]
                    "
                  />
                </div>

                {/* City */}
                <div className="flex flex-col gap-[6px]">
                  <label
                    className="text-[13px] font-bold text-[#2a2a2a]"
                    htmlFor="city"
                  >
                    City *
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="
                      w-full border border-[rgba(168,27,30,0.18)] rounded-xl px-[14px] py-3
                      text-[14px] text-[#222] bg-white outline-none
                      transition-[border-color,box-shadow] duration-200
                      focus:border-[#A81B1E] focus:shadow-[0_0_0_4px_rgba(168,27,30,0.08)]
                    "
                  />
                </div>

                {/* Area - full width */}
                <div className="flex flex-col gap-[6px] col-span-2 max-sm:col-span-1">
                  <label
                    className="text-[13px] font-bold text-[#2a2a2a]"
                    htmlFor="area"
                  >
                    Area / Location *
                  </label>
                  <input
                    id="area"
                    name="area"
                    type="text"
                    required
                    placeholder="Enter area or location"
                    value={formData.area}
                    onChange={handleInputChange}
                    className="
                      w-full border border-[rgba(168,27,30,0.18)] rounded-xl px-[14px] py-3
                      text-[14px] text-[#222] bg-white outline-none
                      transition-[border-color,box-shadow] duration-200 mb-4
                      focus:border-[#A81B1E] focus:shadow-[0_0_0_4px_rgba(168,27,30,0.08)]
                    "
                  />
                </div>
              </div>

              <button
                type="submit"
                className="
                  w-full bg-gradient-to-br from-[#A81B1E] to-[#C73E1D] text-white border-0
                  rounded-2xl py-[14px] px-[18px] text-[15px] font-bold cursor-pointer
                  shadow-[0_10px_26px_rgba(168,27,30,0.26)]
                  transition-[transform,box-shadow] duration-200
                  hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(168,27,30,0.35)]
                  disabled:opacity-70 disabled:cursor-not-allowed
                "
                disabled={isInitiatingPayment}
              >
                {isInitiatingPayment
                  ? "Connecting to Payment..."
                  : "Register & Pay Rs. 99"}
              </button>
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ThreeDDesignHero;
