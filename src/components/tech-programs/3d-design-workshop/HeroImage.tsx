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

interface StaticImage {
  url: string;
  alt: string;
  title: string;
}

const ThreeDDesignHero = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    { label: "Age Group", value: "9–15 Years", icon: "🎯" },
    { label: "Mode", value: "Live Online", icon: "💻" },
  ];

  const highlights = [
    { icon: <Award size={11} />, text: "Certificate" },
    { icon: <Sparkles size={11} />, text: "3D Modeling" },
    { icon: <Box size={11} />, text: "Real Project" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", overflow: "hidden" }}>
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

        .cta-primary {
          background: linear-gradient(135deg, #A81B1E 0%, #C73E1D 100%);
          color: white; border: none; border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 700;
          padding: 11px 24px; cursor: pointer;
          position: relative; overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 6px 22px rgba(168,27,30,0.35);
          display: inline-flex; align-items: center; gap: 7px;
          white-space: nowrap;
        }
        .cta-primary::before {
          content: ''; position: absolute; top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          transition: left 0.5s ease;
        }
        .cta-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 36px rgba(168,27,30,0.42); }
        .cta-primary:hover::before { left: 150%; }

        .cta-secondary {
          background: rgba(168,27,30,0.05);
          color: #A81B1E; border: 1px solid rgba(168,27,30,0.2);
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 600;
          padding: 11px 22px; cursor: pointer;
          display: inline-flex; align-items: center; gap: 6px;
          transition: all 0.2s ease; white-space: nowrap;
        }
        .cta-secondary:hover {
          background: rgba(168,27,30,0.09);
          border-color: rgba(168,27,30,0.35);
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
          border-radius: 2px; margin: 8px 0 10px;
        }

        .trust-pill {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(168,27,30,0.04);
          border: 1px solid rgba(168,27,30,0.1);
          border-radius: 100px; padding: 3px 10px;
          font-size: 11px; color: #666; font-weight: 500;
        }

        .highlight-pill {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(168,27,30,0.06);
          border: 1px solid rgba(168,27,30,0.14);
          border-radius: 8px; padding: 5px 10px;
          font-size: 11px; font-weight: 600; color: #A81B1E;
          transition: all 0.2s ease;
        }
        .highlight-pill:hover { background: rgba(168,27,30,0.1); transform: translateY(-1px); }

        .stat-card {
          background: rgba(255,255,255,0.9);
          border: 1px solid rgba(168,27,30,0.1);
          border-radius: 12px; padding: 10px 12px;
          box-shadow: 0 2px 10px rgba(168,27,30,0.05);
          transition: all 0.2s ease;
        }
        .stat-card:hover {
          box-shadow: 0 4px 16px rgba(168,27,30,0.1);
          transform: translateY(-1px);
        }

        .pulse-dot {
          position: relative;
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #A81B1E;
          flex-shrink: 0;
        }
        .pulse-dot::after {
          content: '';
          position: absolute; inset: -3px;
          border-radius: 50%;
          background: #A81B1E;
          animation: pulseRing 2s ease-out infinite;
          opacity: 0.5;
        }
        @keyframes pulseRing {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(2); opacity: 0; }
        }

        .card-shadow {
          position: absolute; bottom: -16px; left: 50%;
          transform: translateX(-50%);
          width: 70%; height: 24px;
          background: radial-gradient(ellipse, rgba(168,27,30,0.18) 0%, transparent 70%);
          filter: blur(8px); pointer-events: none;
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
              {/* Badge */}
              <motion.div variants={itemVariants} style={{ marginBottom: 12 }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "rgba(168,27,30,0.07)",
                    border: "1px solid rgba(168,27,30,0.16)",
                    borderRadius: 100,
                    padding: "4px 14px",
                  }}
                >
                  <div className="pulse-dot" />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#A81B1E",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    Cyborg Weekend Tech Series
                  </span>
                </div>
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
                Design. Build.{" "}
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, #A81B1E 20%, #C73E1D 80%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
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
                Create Your First{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #A81B1E, #C73E1D)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  3D Design Project
                </span>
              </motion.h2>

              <motion.p
                variants={itemVariants}
                style={{
                  fontSize: 13,
                  color: "#555",
                  lineHeight: 1.6,
                  margin: "0 0 12px",
                  maxWidth: 420,
                }}
              >
                Kids learn 3D modeling and digital design through a hands-on
                live workshop — guided step by step in a 2-hour session.
              </motion.p>

              {/* Trust pills */}
              <motion.div
                variants={itemVariants}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginBottom: 14,
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

              {/* CTAs */}
              <motion.div
                variants={itemVariants}
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  marginBottom: 14,
                }}
              >
                <button
                  className="cta-primary"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Sparkles size={13} />
                  Register for ₹99
                  <ArrowRight size={13} />
                </button>
                <button className="cta-secondary">
                  <Users size={13} />
                  View Gallery
                </button>
              </motion.div>

              {/* Highlight pills */}
              <motion.div
                variants={itemVariants}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginBottom: 14,
                }}
              >
                {highlights.map(({ icon, text }) => (
                  <div key={text} className="highlight-pill">
                    {icon}
                    {text}
                  </div>
                ))}
              </motion.div>

              {/* Stat cards */}
              <motion.div
                variants={itemVariants}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 8,
                }}
              >
                {stats.map(({ label, value, icon }) => (
                  <div key={label} className="stat-card">
                    <p
                      style={{
                        fontSize: 10,
                        color: "#999",
                        margin: "0 0 2px",
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <span>{icon}</span>
                      {label}
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#A81B1E",
                        margin: 0,
                      }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
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
              {/* Badge bottom-right */}
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
                    Workshop Fee
                  </div>
                  <div style={{ fontSize: 12, color: "#fff", fontWeight: 700 }}>
                    ₹99 · 3 May 2026
                  </div>
                </div>
              </div>

              {/* 3D tilt card */}
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
                      borderRadius: 20,
                      overflow: "hidden",
                      boxShadow:
                        "0 24px 64px rgba(168,27,30,0.16), 0 6px 20px rgba(168,27,30,0.09), inset 0 1px 0 rgba(255,255,255,0.7)",
                      border: "1px solid rgba(168,27,30,0.1)",
                      background: "#fff",
                      position: "relative",
                    }}
                  >
                    {/* Glare */}
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
                          <div
                            style={{
                              position: "relative",
                              width: "100%",
                              height: "100%",
                            }}
                          >
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
                            <span
                              style={{
                                position: "absolute",
                                top: 10,
                                right: 10,
                                background:
                                  "linear-gradient(135deg, #8a1518, #C73E1D)",
                                borderRadius: 100,
                                padding: "3px 10px",
                                fontSize: 10,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                color: "#fff",
                                boxShadow: "0 2px 8px rgba(168,27,30,0.4)",
                                border: "1px solid rgba(255,255,255,0.25)",
                              }}
                            >
                              {image.title}
                            </span>
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>

                    {/* Bottom overlay */}
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
        title="Register for 3D Designing Workshop"
      >
        <div className="p-4">
          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLSfJfYegfWy-YCE75jDcy3b37Q23a3ppS8uOZXf4YsBNPFItKQ/viewform"
            width="100%"
            height="600px"
            frameBorder="0"
            title="Registration Form"
          >
            Loading Registration Form...
          </iframe>
        </div>
      </Modal>
    </div>
  );
};

export default ThreeDDesignHero;
