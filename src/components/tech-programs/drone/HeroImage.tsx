"use client";
import Image from "next/image";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-cards";
import { EffectCards, Autoplay } from "swiper/modules";
import Modal from "@/components/ui/Modal";
import { saveOrderId } from "@/lib/order-id-storage";

interface StaticImage {
  url: string;
  alt: string;
}

interface RegistrationFormData {
  email: string;
  contactNumber: string;
  childName: string;
  age: string;
  city: string;
  area: string;
}

const DroneHero = () => {
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
          workshopKey: "drone-workshop",
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

  // TODO: Replace with actual drone workshop images from Cloudinary
  const staticImages: StaticImage[] = [
    { url: "/assets/workshops/drone/Drone_1.jpeg", alt: "Drone Workshop 1" },
    { url: "/assets/workshops/drone/Drone_2.jpeg", alt: "Drone Workshop 2" },
    { url: "/assets/workshops/drone/Drone_3.jpeg", alt: "Drone Workshop 3" },
  ];
  const shouldLoopSlides = staticImages.length > 3;

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

  const courseHighlights = [
    { icon: "🔧", text: "Hands-on drone assembly & components" },
    { icon: "✈️", text: "Real drone flying practice sessions" },
    { icon: "🏆", text: "Certificate of completion" },
  ];

  return (
    <div className="font-['DM_Sans',sans-serif] overflow-hidden mt-10">
      {/* Google Fonts — kept as minimal style tag; Tailwind cannot load external fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');`}</style>

      {/* ── HERO SECTION ───────────────────────────────────────── */}
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
                  🚁 Ages 4–16 · Drone Course
                </span>
              </motion.div>

              {/* H1 */}
              <motion.h1
                variants={itemVariants}
                className="font-['Syne',sans-serif] text-[clamp(1.9rem,4vw,3.2rem)] font-black leading-[1.06] tracking-[-0.03em] text-[#1a1a1a] m-0"
              >
                Build. Fly.{" "}
                <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                  Soar.
                </span>
              </motion.h1>

              {/* Divider */}
              <div className="w-10 h-[3px] bg-gradient-to-r from-[#A81B1E] to-[#C73E1D] rounded-sm my-2 mb-3" />

              {/* H2 */}
              <motion.h2
                variants={itemVariants}
                className="font-['Syne',sans-serif] text-[clamp(0.9rem,1.6vw,1.1rem)] font-bold text-[#A81B1E] m-0 mb-2 leading-[1.4]"
              >
                Your Child's First Step into Drone Technology Starts Here…
              </motion.h2>

              {/* Description */}
              <motion.p
                variants={itemVariants}
                className="text-[14px] text-[#555] leading-[1.6] m-0 mb-1"
              >
                A hands-on{" "}
                <strong className="text-[#1a1a1a]">
                  Drone Building &amp; Flying Course
                </strong>{" "}
                for young minds (Ages 10–16).
              </motion.p>
              <motion.p
                variants={itemVariants}
                className="text-[14px] text-[#555] leading-[1.6] m-0 mb-[14px]"
              >
                Students learn how drones work, how to build them, and how to
                fly them safely — exploring aerial robotics, aerodynamics, and
                future tech careers.
              </motion.p>

              {/* Trust pills */}
              <motion.div
                variants={itemVariants}
                className="flex flex-wrap gap-[6px] mb-4"
              >
                {[
                  "👨‍🏫 Mentor Guided",
                  "🧠 STEM Learning",
                  "✈️ Real Drone Flying",
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
                  onClick={() => setIsModalOpen(true)}
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
                  "
                >
                  🚁 Enroll in Drone Course
                </button>
                <p className="text-[11px] text-[#bbb] mt-[6px] mb-0">
                  Small batch · Offline at Cyborg Robotics Lab
                </p>
              </motion.div>

              {/* Course Highlights card */}
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
                    Course Highlights
                  </span>
                </div>

                {/* Items */}
                <div className="flex flex-col gap-[7px]">
                  {courseHighlights.map((item) => (
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
                    Ages
                  </div>
                  <div className="text-[12px] text-white font-bold">
                    10–16 · No Prior Exp
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
                          <Image
                            src={image.url}
                            alt={image.alt}
                            width={260}
                            height={360}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
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
        title="Enroll in Drone Building & Flying Course"
      >
        <div className="bg-gradient-to-b from-white to-[#fff7f7] p-4 sm:p-5">
          <div className="border border-[rgba(168,27,30,0.12)] rounded-[18px] bg-white shadow-[0_12px_40px_rgba(168,27,30,0.08)] p-4 sm:p-6">
            {/* Modal header */}
            <div className="mb-5">
              <h3 className="font-['Syne',sans-serif] text-2xl font-extrabold text-[#1a1a1a] m-0">
                Drone Building &amp; Flying Course Registration
              </h3>
              <p className="text-[14px] text-[#5b5b5b] leading-[1.6] mt-[10px] mb-0">
                Register your child for the Drone Building &amp; Flying Course.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {["Age Group: 4-16 Years", "Workshop Fee: Rs. 499"].map((t) => (
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
                    className="w-full border border-[rgba(168,27,30,0.18)] rounded-xl px-[14px] py-3 text-[14px] text-[#222] bg-white outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#A81B1E] focus:shadow-[0_0_0_4px_rgba(168,27,30,0.08)]"
                  />
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
                    placeholder="Enter contact number"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    className="w-full border border-[rgba(168,27,30,0.18)] rounded-xl px-[14px] py-3 text-[14px] text-[#222] bg-white outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#A81B1E] focus:shadow-[0_0_0_4px_rgba(168,27,30,0.08)]"
                  />
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
                    className="w-full border border-[rgba(168,27,30,0.18)] rounded-xl px-[14px] py-3 text-[14px] text-[#222] bg-white outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#A81B1E] focus:shadow-[0_0_0_4px_rgba(168,27,30,0.08)]"
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
                    className="w-full border border-[rgba(168,27,30,0.18)] rounded-xl px-[14px] py-3 text-[14px] text-[#222] bg-white outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#A81B1E] focus:shadow-[0_0_0_4px_rgba(168,27,30,0.08)]"
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
                    className="w-full border border-[rgba(168,27,30,0.18)] rounded-xl px-[14px] py-3 text-[14px] text-[#222] bg-white outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#A81B1E] focus:shadow-[0_0_0_4px_rgba(168,27,30,0.08)]"
                  />
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
                    className="w-full border border-[rgba(168,27,30,0.18)] rounded-xl px-[14px] py-3 text-[14px] text-[#222] bg-white outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#A81B1E] focus:shadow-[0_0_0_4px_rgba(168,27,30,0.08)]"
                  />
                </div>
              </div>

              <p className="text-[12px] leading-[1.6] text-[#666] mt-4 mb-4">
                Please fill in the details below and continue to the integrated
                payment checkout. Contact form owner:{" "}
                <strong>gshrikant199980@gmail.com</strong>
              </p>

              <button
                type="submit"
                disabled={isInitiatingPayment}
                className="
                  w-full bg-gradient-to-br from-[#A81B1E] to-[#C73E1D] text-white border-0
                  rounded-2xl py-[14px] px-[18px] text-[15px] font-bold cursor-pointer
                  shadow-[0_10px_26px_rgba(168,27,30,0.26)]
                  transition-[transform,box-shadow] duration-200
                  hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(168,27,30,0.35)]
                  disabled:opacity-70 disabled:cursor-not-allowed
                "
              >
                {isInitiatingPayment
                  ? "Connecting to Payment..."
                  : "Enroll & Pay Rs. 499"}
              </button>
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DroneHero;
