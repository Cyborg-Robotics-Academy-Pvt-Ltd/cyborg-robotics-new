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

const HeroImage = () => {
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
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isInitiatingPayment) {
      return;
    }

    try {
      setIsInitiatingPayment(true);
      setFormError("");

      const response = await fetch("/api/payment/initiate-workshop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workshopKey: "lego-robotics-workshop",
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
      url: "https://res.cloudinary.com/dgbbkclfa/image/upload/v1766397913/iuq8qsrh6qjl8yyw1rim.jpg",
      alt: "LEGO Robotics Workshop 1",
    },
    {
      url: "https://res.cloudinary.com/dgbbkclfa/image/upload/v1768652660/cyguz9zagyyhkiwi2wmx.jpg",
      alt: "LEGO Robotics Workshop 2",
    },
    {
      url: "https://res.cloudinary.com/dgbbkclfa/image/upload/v1768652660/ovp3syigyxkvw0q4gxyt.jpg",
      alt: "LEGO Robotics Workshop 3",
    },
    {
      url: "https://res.cloudinary.com/dgbbkclfa/image/upload/v1768652659/vo7lj3pjmseccvf20sgx.jpg",
      alt: "LEGO Robotics Workshop 4",
    },
    {
      url: "https://res.cloudinary.com/dgbbkclfa/image/upload/v1768651632/fh1qaoyeqztmwytqrqr1.jpg",
      alt: "LEGO Robotics Workshop 5",
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

  return (
    <div
      style={{ fontFamily: "'DM Sans', sans-serif", overflow: "hidden" }}
      className="mt-6"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');

        .hero-bg {
          background: #ffffff;
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
        }
        .hero-bg::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 55% 50% at 5% 60%, rgba(168,27,30,0.07) 0%, transparent 65%),
            radial-gradient(ellipse 45% 55% at 95% 25%, rgba(168,27,30,0.06) 0%, transparent 65%);
          pointer-events: none;
        }

        .blob {
          position: absolute; border-radius: 50%;
          filter: blur(80px); opacity: 0.1;
          animation: blobFloat 9s ease-in-out infinite alternate;
          pointer-events: none;
        }
        @keyframes blobFloat {
          0% { transform: translateY(0px) scale(1); }
          100% { transform: translateY(-18px) scale(1.04); }
        }

        .dot-grid {
          position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(168,27,30,0.1) 1px, transparent 1px);
          background-size: 28px 28px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
          opacity: 0.3; pointer-events: none;
        }

        .card-3d-wrapper { perspective: 900px; }
        .card-3d-inner { transform-style: preserve-3d; will-change: transform; position: relative; }

        .glare {
          position: absolute; inset: 0; border-radius: 20px;
          pointer-events: none; z-index: 10;
          mix-blend-mode: overlay; opacity: 0.4;
        }

        .float-badge { animation: badgeFloat 3s ease-in-out infinite alternate; }
        .float-badge-2 { animation: badgeFloat 3.5s ease-in-out infinite alternate-reverse; }
        @keyframes badgeFloat {
          0% { transform: translateY(0px) rotate(-1.5deg); }
          100% { transform: translateY(-6px) rotate(1.5deg); }
        }

        .hero-swiper { width: 100% !important; height: 100% !important; }
        .hero-swiper .swiper-slide { border-radius: 16px; overflow: hidden; }
        .hero-swiper .swiper-slide img { width: 100%; height: 100%; object-fit: cover; }

        .cta-btn {
          background: linear-gradient(135deg, #A81B1E 0%, #C73E1D 100%);
          color: white; border: none; border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px; font-weight: 700;
          padding: 12px 28px; cursor: pointer;
          position: relative; overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 6px 22px rgba(168,27,30,0.35);
          white-space: nowrap;
        }
        .cta-btn::before {
          content: ''; position: absolute; top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          transition: left 0.5s ease;
        }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(168,27,30,0.42); }
        .cta-btn:hover::before { left: 150%; }

        .inclusion-card {
          background: linear-gradient(135deg, #fff 0%, #fff8f8 100%);
          border: 1px solid rgba(168,27,30,0.13);
          border-radius: 14px;
          box-shadow: 0 3px 16px rgba(168,27,30,0.06);
        }

        .card-shadow {
          position: absolute; bottom: -16px; left: 50%;
          transform: translateX(-50%);
          width: 70%; height: 24px;
          background: radial-gradient(ellipse, rgba(168,27,30,0.18) 0%, transparent 70%);
          filter: blur(8px); pointer-events: none;
        }

        .tag-chip {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(168,27,30,0.07);
          border: 1px solid rgba(168,27,30,0.16);
          border-radius: 100px; padding: 4px 12px;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase; color: #A81B1E;
        }

        .divider-line {
          width: 40px; height: 3px;
          background: linear-gradient(90deg, #A81B1E, #C73E1D);
          border-radius: 2px; margin: 8px 0 12px;
        }

        .trust-pill {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(168,27,30,0.04);
          border: 1px solid rgba(168,27,30,0.1);
          border-radius: 100px; padding: 3px 10px;
          font-size: 11px; color: #666; font-weight: 500;
        }

        .inclusion-icon {
          width: 26px; height: 26px; border-radius: 7px;
          background: rgba(168,27,30,0.08);
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; flex-shrink: 0;
        }

        .registration-shell {
          background: linear-gradient(180deg, #fff 0%, #fff7f7 100%);
        }
        .registration-card {
          border: 1px solid rgba(168,27,30,0.12);
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 12px 40px rgba(168,27,30,0.08);
        }
        .registration-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }
        .registration-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .registration-field.full-width {
          grid-column: 1 / -1;
        }
        .registration-label {
          font-size: 13px;
          font-weight: 700;
          color: #2a2a2a;
        }
        .registration-input {
          width: 100%;
          border: 1px solid rgba(168,27,30,0.18);
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 14px;
          color: #222;
          background: #fff;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .registration-input:focus {
          border-color: #A81B1E;
          box-shadow: 0 0 0 4px rgba(168,27,30,0.08);
        }
        .registration-note {
          font-size: 12px;
          line-height: 1.6;
          color: #666;
        }
        .registration-submit {
          width: 100%;
          background: linear-gradient(135deg, #A81B1E 0%, #C73E1D 100%);
          color: #fff;
          border: none;
          border-radius: 14px;
          padding: 14px 18px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 10px 26px rgba(168,27,30,0.26);
        }
        .payment-card {
          border-radius: 16px;
          border: 1px solid rgba(168,27,30,0.12);
          background: linear-gradient(135deg, rgba(168,27,30,0.05), rgba(199,62,29,0.08));
          padding: 16px;
        }
        .qr-placeholder {
          min-height: 180px;
          border-radius: 16px;
          border: 1px dashed rgba(168,27,30,0.24);
          background:
            linear-gradient(45deg, rgba(168,27,30,0.03) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(168,27,30,0.03) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(168,27,30,0.03) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(168,27,30,0.03) 75%);
          background-size: 24px 24px;
          background-position: 0 0, 0 12px, 12px -12px, -12px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 20px;
          color: #7a4d4e;
          font-size: 13px;
          font-weight: 600;
        }
        .error-banner {
          border-radius: 14px;
          border: 1px solid rgba(239, 68, 68, 0.18);
          background: rgba(239, 68, 68, 0.08);
          padding: 12px 14px;
          color: #b91c1c;
          font-size: 13px;
          font-weight: 600;
        }

        @media (max-width: 640px) {
          .registration-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <motion.section
        className="hero-bg"
        style={{ padding: "0 24px" }}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="dot-grid" />
        <div
          className="blob"
          style={{
            width: 400,
            height: 400,
            background: "#A81B1E",
            top: "-100px",
            left: "-120px",
          }}
        />
        <div
          className="blob"
          style={{
            width: 300,
            height: 300,
            background: "#C73E1D",
            bottom: "-80px",
            right: "-60px",
            animationDelay: "1.5s",
          }}
        />

        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            width: "100%",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 40,
              flexWrap: "wrap",
            }}
          >
            {/* LEFT */}
            <motion.div
              variants={itemVariants}
              style={{ flex: "1 1 340px", minWidth: 260 }}
            >
              <motion.div variants={itemVariants} style={{ marginBottom: 12 }}>
                <span className="tag-chip">🤖 Ages 4–16 · STEM Workshop</span>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: "clamp(1.9rem, 4vw, 3.2rem)",
                  fontWeight: 900,
                  lineHeight: 1.06,
                  letterSpacing: "-0.03em",
                  color: "#1a1a1a",
                  margin: 0,
                }}
              >
                Build. Think.{" "}
                <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                  Create.
                </span>
              </motion.h1>

              <div className="divider-line" />

              <motion.h2
                variants={itemVariants}
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: "clamp(0.9rem, 1.6vw, 1.1rem)",
                  fontWeight: 700,
                  color: "#A81B1E",
                  margin: "0 0 8px",
                  lineHeight: 1.4,
                }}
              >
                Your Child's First Step into Robotics Starts Here…
              </motion.h2>

              <motion.p
                variants={itemVariants}
                style={{
                  fontSize: 14,
                  color: "#555",
                  lineHeight: 1.6,
                  margin: "0 0 4px",
                }}
              >
                A fun, hands-on{" "}
                <strong style={{ color: "#1a1a1a" }}>
                  LEGO® Robotics Workshop
                </strong>{" "}
                for young minds (Ages 4–16).
              </motion.p>
              <motion.p
                variants={itemVariants}
                style={{
                  fontSize: 14,
                  color: "#555",
                  lineHeight: 1.6,
                  margin: "0 0 14px",
                }}
              >
                Your child will build, explore and bring ideas to life —
                learning logic, creativity and STEM thinking.
              </motion.p>

              {/* Trust pills */}
              <motion.div
                variants={itemVariants}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginBottom: 16,
                }}
              >
                {[
                  "👨‍🏫 Expert Mentors",
                  "🧠 STEM Learning",
                  "🧩 Project Based",
                ].map((t) => (
                  <span key={t} className="trust-pill">
                    {t}
                  </span>
                ))}
              </motion.div>

              {/* CTA */}
              <motion.div variants={itemVariants} style={{ marginBottom: 4 }}>
                <button
                  className="cta-btn"
                  onClick={() => setIsModalOpen(true)}
                >
                  🎟 Book LEGO Experience – ₹499
                </button>
                <p
                  style={{
                    fontSize: 11,
                    color: "#bbb",
                    marginTop: 6,
                    marginBottom: 0,
                  }}
                >
                  Limited seats · Instant confirmation
                </p>
              </motion.div>

              {/* Inclusions */}
              <motion.div
                variants={itemVariants}
                className="inclusion-card"
                style={{ padding: "13px 16px", marginTop: 14 }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    marginBottom: 11,
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: "rgba(168,27,30,0.09)",
                      border: "1px solid rgba(168,27,30,0.16)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 15,
                    }}
                  >
                    🎁
                  </div>
                  <span
                    style={{ fontWeight: 700, fontSize: 13, color: "#1a1a1a" }}
                  >
                    Special Inclusions
                  </span>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 7 }}
                >
                  {[
                    {
                      icon: "⏰",
                      text: "1-hour Structured Workshop just @₹499",
                    },
                    {
                      icon: "🏆",
                      text: "STEM Certified workshop participation",
                    },
                    { icon: "🎁", text: "Take-away Souvenir as memento" },
                  ].map((item) => (
                    <div
                      key={item.text}
                      style={{ display: "flex", alignItems: "center", gap: 9 }}
                    >
                      <div className="inclusion-icon">{item.icon}</div>
                      <span
                        style={{ fontSize: 12, color: "#444", fontWeight: 500 }}
                      >
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* RIGHT: 3D card */}
            <motion.div
              variants={itemVariants}
              style={{
                flex: "0 0 auto",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
              }}
            >
              <div
                className="float-badge"
                style={{
                  position: "absolute",
                  top: -14,
                  left: -18,
                  zIndex: 20,
                  background: "linear-gradient(135deg, #8a1518, #A81B1E)",
                  borderRadius: 11,
                  padding: "7px 12px",
                  boxShadow: "0 6px 20px rgba(168,27,30,0.38)",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <span style={{ fontSize: 14 }}>🤖</span>
                <div>
                  <div
                    style={{
                      fontSize: 9,
                      color: "rgba(255,255,255,0.6)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Workshop
                  </div>
                  <div style={{ fontSize: 12, color: "#fff", fontWeight: 700 }}>
                    LEGO Robotics
                  </div>
                </div>
              </div>

              <div
                className="float-badge-2"
                style={{
                  position: "absolute",
                  bottom: -10,
                  right: -14,
                  zIndex: 20,
                  background: "linear-gradient(135deg, #A81B1E, #C73E1D)",
                  borderRadius: 11,
                  padding: "7px 12px",
                  boxShadow: "0 6px 20px rgba(168,27,30,0.35)",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <span style={{ fontSize: 14 }}>⭐</span>
                <div>
                  <div
                    style={{
                      fontSize: 9,
                      color: "rgba(255,255,255,0.6)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    Rated
                  </div>
                  <div style={{ fontSize: 12, color: "#fff", fontWeight: 700 }}>
                    5.0 · 200+ Kids
                  </div>
                </div>
              </div>

              <div
                ref={cardRef}
                className="card-3d-wrapper"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{ position: "relative" }}
              >
                <motion.div
                  className="card-3d-inner"
                  style={{ rotateX, rotateY }}
                >
                  <div
                    style={{
                      width: 260,
                      height: 360,

                      overflow: "hidden",

                      position: "relative",
                    }}
                  >
                    <motion.div
                      className="glare"
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
                      loop
                      className="hero-swiper"
                    >
                      {staticImages.map((image, index) => (
                        <SwiperSlide key={index}>
                          <Image
                            src={image.url}
                            alt={image.alt}
                            width={260}
                            height={360}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            unoptimized
                          />
                        </SwiperSlide>
                      ))}
                    </Swiper>

                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 70,
                        background:
                          "linear-gradient(to top, rgba(168,27,30,0.82), transparent)",
                        zIndex: 5,
                        display: "flex",
                        alignItems: "flex-end",
                        padding: "0 14px 12px",
                        gap: 4,
                      }}
                    >
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            height: 2.5,
                            borderRadius: 2,
                            background:
                              i === 0 ? "#fff" : "rgba(255,255,255,0.3)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="card-shadow" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register for LEGO Robotics Workshop"
      >
        <div className="registration-shell p-4 sm:p-5">
          <div className="registration-card p-4 sm:p-6">
            <div className="mb-5">
              <h3
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "#1a1a1a",
                  margin: 0,
                }}
              >
                LEGO Robotics Workshop Registration
              </h3>
              <p
                style={{
                  fontSize: 14,
                  color: "#5b5b5b",
                  lineHeight: 1.6,
                  margin: "10px 0 0",
                }}
              >
                Register your child for the LEGO Robotics Experience Workshop.
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 12,
                }}
              >
                <span className="trust-pill">Age Group: 4-16 Years</span>
                <span className="trust-pill">Workshop Fee: Rs. 499</span>
              </div>
            </div>

            {formError && <div className="error-banner mb-5">{formError}</div>}

            <form onSubmit={handleFormSubmit}>
              <div className="registration-grid">
                <div className="registration-field full-width">
                  <label className="registration-label" htmlFor="email">
                    Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="registration-input"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="registration-field full-width">
                  <label className="registration-label" htmlFor="contactNumber">
                    Contact Number (WhatsApp Preferred) *
                  </label>
                  <input
                    id="contactNumber"
                    name="contactNumber"
                    type="tel"
                    required
                    className="registration-input"
                    placeholder="Enter contact number"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="registration-field full-width">
                  <label className="registration-label" htmlFor="childName">
                    Name of the Child *
                  </label>
                  <input
                    id="childName"
                    name="childName"
                    type="text"
                    required
                    className="registration-input"
                    placeholder="Enter child's full name"
                    value={formData.childName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="registration-field">
                  <label className="registration-label" htmlFor="age">
                    Age *
                  </label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    min="4"
                    max="16"
                    required
                    className="registration-input"
                    placeholder="4-16"
                    value={formData.age}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="registration-field">
                  <label className="registration-label" htmlFor="city">
                    City *
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    className="registration-input"
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="registration-field full-width">
                  <label className="registration-label" htmlFor="area">
                    Area / Location *
                  </label>
                  <input
                    id="area"
                    name="area"
                    type="text"
                    required
                    className="registration-input"
                    placeholder="Enter area or location"
                    value={formData.area}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <p className="registration-note mt-4 mb-4">
                Please fill in the details below and continue to the integrated
                payment checkout. Contact form owner:{" "}
                <strong>gshrikant199980@gmail.com</strong>
              </p>

              <button type="submit" className="registration-submit">
                {isInitiatingPayment
                  ? "Connecting to Payment..."
                  : "Register & Pay Rs. 499"}
              </button>
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HeroImage;
