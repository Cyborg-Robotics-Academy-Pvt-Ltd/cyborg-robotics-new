"use client";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { saveOrderId } from "@/lib/order-id-storage";
import {
  normalizeWorkshopRegistrationForm,
  validateWorkshopRegistrationForm,
  type WorkshopRegistrationFormData,
  type WorkshopRegistrationFormErrors,
} from "@/lib/workshop-form-validation";

interface StaticImage {
  url: string;
  alt: string;
}

const GoogleSitesHero = () => {
  const isWorkshopClosed = true;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInitiatingPayment, setIsInitiatingPayment] = useState(false);
  const [formError, setFormError] = useState("");
  const [formErrors, setFormErrors] = useState<WorkshopRegistrationFormErrors>(
    {},
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [formData, setFormData] = useState<WorkshopRegistrationFormData>({
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
    setFormErrors((current) => ({ ...current, [name]: "" }));
    setFormData((current) => {
      const nextValue =
        name === "contactNumber"
          ? value.replace(/\D/g, "").slice(0, 10)
          : name === "age"
            ? value.replace(/[^\d]/g, "").slice(0, 2)
            : value;

      return { ...current, [name]: nextValue };
    });
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isWorkshopClosed || isInitiatingPayment) return;

    try {
      const normalizedFormData = normalizeWorkshopRegistrationForm(formData);
      const validationErrors =
        validateWorkshopRegistrationForm(normalizedFormData);

      setFormData(normalizedFormData);
      setFormErrors(validationErrors);

      if (Object.keys(validationErrors).length > 0) {
        setFormError("Please fix the highlighted fields and try again.");
        return;
      }

      setIsInitiatingPayment(true);
      setFormError("");
      setFormErrors({});

      const response = await fetch("/api/payment/initiate-workshop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workshopKey: "google-site-workshop",
          email: normalizedFormData.email,
          contactNumber: normalizedFormData.contactNumber,
          childName: normalizedFormData.childName,
          age: normalizedFormData.age,
          city: normalizedFormData.city,
          area: normalizedFormData.area,
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

  // TODO: Replace with actual Google Sites workshop images from Cloudinary
  const staticImages: StaticImage[] = [
    {
      url: "https://res.cloudinary.com/dgbbkclfa/image/upload/v1766397913/iuq8qsrh6qjl8yyw1rim.jpg",
      alt: "Google Sites Workshop 1",
    },
    {
      url: "https://res.cloudinary.com/dgbbkclfa/image/upload/v1768652660/cyguz9zagyyhkiwi2wmx.jpg",
      alt: "Google Sites Workshop 2",
    },
    {
      url: "https://res.cloudinary.com/dgbbkclfa/image/upload/v1768652660/ovp3syigyxkvw0q4gxyt.jpg",
      alt: "Google Sites Workshop 3",
    },
    {
      url: "https://res.cloudinary.com/dgbbkclfa/image/upload/v1768652659/vo7lj3pjmseccvf20sgx.jpg",
      alt: "Google Sites Workshop 4",
    },
    {
      url: "https://res.cloudinary.com/dgbbkclfa/image/upload/v1768651632/fh1qaoyeqztmwytqrqr1.jpg",
      alt: "Google Sites Workshop 5",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
  };

  const eventMeta = [
    { icon: "📅", label: "16 May 2026" },
    { icon: "🕙", label: "11:00 AM – 1:00 PM" },
    { icon: "💻", label: "Live on Zoom" },
  ];

  const inclusions = [
    { icon: "🌐", text: "2-hour live workshop @ just ₹99" },
    { icon: "🔗", text: "Live portfolio website link to keep & share" },
    { icon: "📜", text: "Certificate of participation" },
  ];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveImageIndex((currentIndex) =>
        currentIndex === staticImages.length - 1 ? 0 : currentIndex + 1,
      );
    }, 2800);

    return () => window.clearInterval(interval);
  }, [staticImages.length]);

  return (
    <div className="font-['DM_Sans',sans-serif] overflow-hidden mt-6">
      {/* Google Fonts — kept as minimal style tag; Tailwind cannot load external fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');`}</style>

      {/* ── HERO SECTION ───────────────────────────────────────── */}
      <motion.section
        className="
          relative min-h-screen flex items-center bg-white px-6 md:mt-5
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

        {/* ── INNER WRAPPER ── */}
        <div className="max-w-[1200px] mx-auto w-full relative z-10">
          <div className="flex flex-row items-center gap-10 flex-wrap">
            {/* ── LEFT COLUMN ── */}
            <motion.div
              variants={itemVariants}
              className="flex-[1_1_340px] min-w-[260px]"
            >
              {/* Tag chip */}
              <motion.div variants={itemVariants} className="mb-3">
                <span className="inline-flex items-center gap-[6px] bg-[rgba(168,27,30,0.07)] border border-[rgba(168,27,30,0.16)] rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.08em] uppercase text-[#A81B1E]">
                  🌐 Ages 10–16 · Live Online Workshop
                </span>
              </motion.div>

              {/* H1 */}
              <motion.h1
                variants={itemVariants}
                className="font-['Syne',sans-serif] text-[clamp(1.9rem,4vw,3.2rem)] font-black leading-[1.06] tracking-[-0.03em] text-[#1a1a1a] m-0"
              >
                Design. Publish.{" "}
                <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                  Own It.
                </span>
              </motion.h1>

              {/* Divider */}
              <div className="w-10 h-[3px] bg-gradient-to-r from-[#A81B1E] to-[#C73E1D] rounded-sm my-2 mb-3" />

              {/* H2 */}
              <motion.h2
                variants={itemVariants}
                className="font-['Syne',sans-serif] text-[clamp(0.9rem,1.6vw,1.1rem)] font-bold text-[#A81B1E] m-0 mb-2 leading-[1.4]"
              >
                Build Your Own Portfolio Website with Google Sites — Live!
              </motion.h2>

              {/* Description */}
              <motion.p
                variants={itemVariants}
                className="text-[14px] text-[#555] leading-[1.6] m-0 mb-1"
              >
                A hands-on{" "}
                <strong className="text-[#1a1a1a]">
                  Portfolio Website Workshop
                </strong>{" "}
                for young minds (Ages 10–16).
              </motion.p>
              <motion.p
                variants={itemVariants}
                className="text-[14px] text-[#555] leading-[1.6] m-0 mb-3"
              >
                Students build a real, live website to showcase their projects,
                certificates, and achievements — no coding knowledge required.
              </motion.p>

              {/* Event meta row */}
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap gap-2 mb-4"
              >
                {eventMeta.map((m) => (
                  <div
                    key={m.label}
                    className="inline-flex items-center gap-[5px] bg-[rgba(168,27,30,0.04)] border border-[rgba(168,27,30,0.1)] rounded-full px-[10px] py-[3px] text-[11px] text-[#666] font-medium"
                  >
                    <span>{m.icon}</span> {m.label}
                  </div>
                ))}
              </motion.div>

              {/* Trust pills */}
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap gap-[6px] mb-4"
              >
                {[
                  "🚫 No Coding Needed",
                  "🌐 Live Website Link",
                  "🧑‍🏫 Mentor Guided",
                ].map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-[5px] bg-[rgba(168,27,30,0.04)] border border-[rgba(168,27,30,0.1)] rounded-full px-[10px] py-[3px] text-[11px] text-[#666] font-medium"
                  >
                    {t}
                  </span>
                ))}
              </motion.div>

              {/* CTA */}
              <motion.div variants={itemVariants} className="mb-1">
                <button
                  type="button"
                  disabled={isWorkshopClosed}
                  onClick={() => {
                    if (!isWorkshopClosed) {
                      setIsModalOpen(true);
                    }
                  }}
                  className="
                    relative overflow-hidden whitespace-nowrap
                    bg-gradient-to-br from-[#A81B1E] to-[#C73E1D] text-white border-0
                    rounded-xl text-[15px] font-bold px-7 py-3 cursor-pointer
                    shadow-[0_6px_22px_rgba(168,27,30,0.35)]
                    transition-[transform,box-shadow] duration-200 ease-out
                    hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(168,27,30,0.42)]
                    before:content-[''] before:absolute before:top-0 before:-left-full before:w-[60%] before:h-full
                    before:bg-gradient-to-r before:from-transparent before:via-white/25 before:to-transparent
                    before:transition-[left] before:duration-500 hover:before:left-[150%]
                    disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_6px_22px_rgba(168,27,30,0.35)]
                  "
                >
                  {isWorkshopClosed
                    ? "Workshop Closed"
                    : isInitiatingPayment
                      ? "Connecting to Payment..."
                      : "Register Now"}
                </button>
              </motion.div>

              {/* What's Included card */}
              <motion.div
                variants={itemVariants}
                className="mt-[14px] p-[13px_16px] bg-gradient-to-br from-white to-[#fff8f8] border border-[rgba(168,27,30,0.13)] rounded-[14px] shadow-[0_3px_16px_rgba(168,27,30,0.06)]"
              >
                {/* Card header */}
                <div className="flex items-center gap-[9px] mb-[11px]">
                  <div className="w-[30px] h-[30px] rounded-full bg-[rgba(168,27,30,0.09)] border border-[rgba(168,27,30,0.16)] flex items-center justify-center text-[15px] shrink-0">
                    🎁
                  </div>
                  <span className="font-bold text-[13px] text-[#1a1a1a]">
                    What's Included
                  </span>
                </div>

                {/* Items */}
                <div className="flex flex-col gap-[7px]">
                  {inclusions.map((item) => (
                    <div
                      key={item.text}
                      className="flex items-center gap-[9px]"
                    >
                      <div className="w-[26px] h-[26px] rounded-[7px] bg-[rgba(168,27,30,0.08)] flex items-center justify-center text-[13px] shrink-0">
                        {item.icon}
                      </div>
                      <span className="text-[12px] text-[#444] font-medium">
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* ── RIGHT COLUMN: 3D tilt card ── */}
            <motion.div
              variants={itemVariants}
              className="flex-none flex justify-center items-center relative"
            >
              {/* Top-left floating badge */}
              <div
                className="
                  absolute -top-[14px] -left-[18px] z-20
                  bg-gradient-to-br from-[#8a1518] to-[#A81B1E] rounded-xl px-3 py-[7px]
                  shadow-[0_6px_20px_rgba(168,27,30,0.38)]
                  flex items-center gap-[7px]
                  animate-[badgeFloat_3s_ease-in-out_infinite_alternate]
                "
              >
                <span className="text-sm">🌐</span>
                <div>
                  <div className="text-[9px] text-white/60 font-semibold uppercase tracking-[0.06em]">
                    Workshop
                  </div>
                  <div className="text-[12px] text-white font-bold">
                    Google Sites
                  </div>
                </div>
              </div>

              {/* Bottom-right floating badge */}
              <div
                className="
                  absolute -bottom-[10px] -right-[14px] z-20
                  bg-gradient-to-br from-[#A81B1E] to-[#C73E1D] rounded-xl px-3 py-[7px]
                  shadow-[0_6px_20px_rgba(168,27,30,0.35)]
                  flex items-center gap-[7px]
                  animate-[badgeFloat_3.5s_ease-in-out_infinite_alternate-reverse]
                "
              >
                <span className="text-sm">⚡</span>
                <div>
                  <div className="text-[9px] text-white/60 font-semibold uppercase tracking-[0.06em]">
                    Only
                  </div>
                  <div className="text-[12px] text-white font-bold">
                    ₹99 · 16 May 2026
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
                  <div className="w-[260px] h-[360px] rounded-[20px] overflow-hidden relative">
                    {/* Glare overlay */}
                    <motion.div
                      className="absolute inset-0 rounded-[20px] pointer-events-none z-10 mix-blend-overlay opacity-40"
                      style={{
                        background: useTransform(
                          [glareX, glareY],
                          ([x, y]) =>
                            `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.7) 0%, transparent 60%)`,
                        ),
                      }}
                    />

                    {staticImages.map((image, index) => {
                      const isActive = index === activeImageIndex;

                      return (
                        <motion.img
                          key={image.url}
                          src={image.url}
                          alt={image.alt}
                          className="absolute inset-0 h-full w-full rounded-[20px] object-cover"
                          initial={false}
                          animate={{
                            opacity: isActive ? 1 : 0,
                            scale: isActive ? 1 : 0.96,
                            rotate: isActive
                              ? 0
                              : index < activeImageIndex
                                ? -2
                                : 2,
                          }}
                          transition={{ duration: 0.45, ease: "easeOut" }}
                          style={{
                            zIndex: isActive ? 2 : 1,
                            pointerEvents: isActive ? "auto" : "none",
                          }}
                        />
                      );
                    })}

                    {/* Bottom gradient overlay with progress bars */}
                    <div
                      className="
                        absolute bottom-0 left-0 right-0 h-[70px] z-[5]
                        bg-gradient-to-t from-[rgba(168,27,30,0.82)] to-transparent
                        flex items-end pb-3 px-[14px] gap-1
                      "
                    >
                      {staticImages.map((image, i) => (
                        <div
                          key={image.url}
                          className={`h-[2.5px] flex-1 rounded-sm ${
                            i === activeImageIndex ? "bg-white" : "bg-white/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Card shadow */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[70%] h-6 [background:radial-gradient(ellipse,rgba(168,27,30,0.18)_0%,transparent_70%)] blur-[8px] pointer-events-none" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ── MODAL ───────────────────────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register for Portfolio Website Workshop"
      >
        <div className="bg-gradient-to-b from-white to-[#fff7f7] p-4 sm:p-5">
          <div className="border border-[rgba(168,27,30,0.12)] rounded-[18px] bg-white shadow-[0_12px_40px_rgba(168,27,30,0.08)] p-4 sm:p-6">
            {/* Modal header */}
            <div className="mb-5">
              <h3 className="font-['Syne',sans-serif] text-2xl font-extrabold text-[#1a1a1a] m-0">
                Portfolio Website Workshop Registration
              </h3>
              <p className="text-[14px] text-[#5b5b5b] leading-[1.6] mt-[10px] mb-0">
                Register your child for the Google Sites portfolio workshop.
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
                {/* Email – full width */}
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
                    aria-invalid={Boolean(formErrors.email)}
                    className="w-full border border-[rgba(168,27,30,0.18)] rounded-xl px-[14px] py-3 text-[14px] text-[#222] bg-white outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#A81B1E] focus:shadow-[0_0_0_4px_rgba(168,27,30,0.08)]"
                  />
                  {formErrors.email && (
                    <p className="text-xs text-red-600">{formErrors.email}</p>
                  )}
                </div>

                {/* Contact – full width */}
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
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Enter contact number"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    aria-invalid={Boolean(formErrors.contactNumber)}
                    className="w-full border border-[rgba(168,27,30,0.18)] rounded-xl px-[14px] py-3 text-[14px] text-[#222] bg-white outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#A81B1E] focus:shadow-[0_0_0_4px_rgba(168,27,30,0.08)]"
                  />
                  {formErrors.contactNumber && (
                    <p className="text-xs text-red-600">
                      {formErrors.contactNumber}
                    </p>
                  )}
                </div>

                {/* Child name – full width */}
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
                    aria-invalid={Boolean(formErrors.childName)}
                    className="w-full border border-[rgba(168,27,30,0.18)] rounded-xl px-[14px] py-3 text-[14px] text-[#222] bg-white outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#A81B1E] focus:shadow-[0_0_0_4px_rgba(168,27,30,0.08)]"
                  />
                  {formErrors.childName && (
                    <p className="text-xs text-red-600">
                      {formErrors.childName}
                    </p>
                  )}
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
                    inputMode="numeric"
                    placeholder="4-16"
                    value={formData.age}
                    onChange={handleInputChange}
                    aria-invalid={Boolean(formErrors.age)}
                    className="w-full border border-[rgba(168,27,30,0.18)] rounded-xl px-[14px] py-3 text-[14px] text-[#222] bg-white outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#A81B1E] focus:shadow-[0_0_0_4px_rgba(168,27,30,0.08)]"
                  />
                  {formErrors.age && (
                    <p className="text-xs text-red-600">{formErrors.age}</p>
                  )}
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
                    aria-invalid={Boolean(formErrors.city)}
                    className="w-full border border-[rgba(168,27,30,0.18)] rounded-xl px-[14px] py-3 text-[14px] text-[#222] bg-white outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#A81B1E] focus:shadow-[0_0_0_4px_rgba(168,27,30,0.08)]"
                  />
                  {formErrors.city && (
                    <p className="text-xs text-red-600">{formErrors.city}</p>
                  )}
                </div>

                {/* Area – full width */}
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
                    aria-invalid={Boolean(formErrors.area)}
                    className="w-full border border-[rgba(168,27,30,0.18)] rounded-xl px-[14px] py-3 text-[14px] text-[#222] bg-white outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#A81B1E] focus:shadow-[0_0_0_4px_rgba(168,27,30,0.08)]"
                  />
                  {formErrors.area && (
                    <p className="text-xs text-red-600">{formErrors.area}</p>
                  )}
                </div>
              </div>
              <div className="mb-4"></div>
              <button
                type="submit"
                disabled={isWorkshopClosed || isInitiatingPayment}
                className="
                  w-full bg-gradient-to-br from-[#A81B1E] to-[#C73E1D] text-white border-0
                  rounded-2xl py-[14px] px-[18px] text-[15px] font-bold cursor-pointer
                  shadow-[0_10px_26px_rgba(168,27,30,0.26)]
                  transition-[transform,box-shadow] duration-200
                  hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(168,27,30,0.35)]
                  disabled:opacity-70 disabled:cursor-not-allowed
                "
              >
                {isWorkshopClosed
                  ? "Workshop Closed"
                  : isInitiatingPayment
                    ? "Connecting to Payment..."
                    : "Secure Your Seat & Pay Rs. 99"}
              </button>
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GoogleSitesHero;
