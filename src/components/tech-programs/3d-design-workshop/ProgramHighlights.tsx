import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Box,
  Users,
  Rocket,
  Sparkles,
  Zap,
  Globe,
} from "lucide-react";

const ThreeDDesignProgramHighlights = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
  };

  const courseHighlights = [
    "Build your first 3D design project",
    "Live online workshop via Zoom",
    "Hands-on 3D modeling practice",
    "Limited seats for personal guidance",
    "Take home your completed 3D design",
    "Certificate of completion",
  ];

  const interests = [
    "Design and technology",
    "3D modeling and digital creation",
    "Robotics and engineering",
    "Product design concepts",
  ];

  const futureSkills = [
    "3D modeling basics",
    "Design thinking",
    "Digital creativity",
    "Shapes and spatial understanding",
    "Technology confidence",
  ];

  const cards = [
    {
      id: "highlights",
      icon: Box,
      label: "01",
      title: "Core Highlights",
      accent: "#10b981",
      accentBg: "rgba(16,185,129,0.08)",
      gradient: "linear-gradient(135deg, #062341 0%, #0a3d6b 100%)",
      items: courseHighlights,
      extra: null,
    },
    {
      id: "join",
      icon: Users,
      label: "02",
      title: "Who Can Join",
      accent: "#0855AB",
      accentBg: "rgba(8,85,171,0.08)",
      gradient: "linear-gradient(135deg, #0855AB 0%, #1a6fd4 100%)",
      items: interests,
      extra: {
        badge: "Age: 9–15 yrs",
        note: "No prior design experience required.",
      },
    },
    {
      id: "skills",
      icon: Rocket,
      label: "03",
      title: "Future Skills",
      accent: "#e63b3e",
      accentBg: "rgba(168,27,30,0.08)",
      gradient: "linear-gradient(135deg, #A81B1E 0%, #d4393c 100%)",
      items: futureSkills,
      extra: null,
    },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        .highlight-card {
          transition: transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease;
          cursor: default;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .highlight-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.13);
        }
        .card-shine {
          position: absolute;
          top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
          transition: left 0.6s ease;
          pointer-events: none;
          z-index: 1;
        }
        .highlight-card:hover .card-shine { left: 150%; }
        .check-item { transition: transform 0.2s ease; }
        .check-item:hover { transform: translateX(3px); }
        .section-bg {
          background: linear-gradient(160deg, #f8faff 0%, #eef3fb 40%, #f8faff 100%);
          position: relative;
        }
        .section-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 20% 50%, rgba(8,85,171,0.04) 0%, transparent 60%),
            radial-gradient(circle at 80% 20%, rgba(168,27,30,0.03) 0%, transparent 50%);
          pointer-events: none;
        }
        .label-pill {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
      `}</style>

      <motion.section
        className="section-bg"
        style={{ padding: "20px 24px" }}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          style={{ textAlign: "center", marginBottom: 16 }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(8,85,171,0.08)",
              borderRadius: 100,
              padding: "4px 12px",
              marginBottom: 8,
            }}
          >
            <Sparkles size={11} color="#0855AB" />
            <span className="label-pill" style={{ color: "#0855AB" }}>
              What You'll Get
            </span>
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "#062341",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Workshop{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #0855AB, #A81B1E)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Highlights
            </span>
          </h2>
        </motion.div>

        {/* Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 300px))",
            gap: 16,
            justifyContent: "center",
          }}
        >
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                variants={fadeInUp}
                className="highlight-card"
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  border: "1px solid rgba(0,0,0,0.07)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                }}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="card-shine" />

                {/* Card Header */}
                <div
                  style={{
                    background: card.gradient,
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      right: -14,
                      top: -14,
                      width: 70,
                      height: 70,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.07)",
                    }}
                  />
                  <div>
                    <div
                      style={{
                        background: "rgba(255,255,255,0.18)",
                        borderRadius: 10,
                        padding: "7px 8px",
                        display: "inline-flex",
                        marginBottom: 8,
                      }}
                    >
                      <Icon size={16} color="#fff" />
                    </div>
                    <h3
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 17,
                        fontWeight: 700,
                        color: "#fff",
                        margin: 0,
                        lineHeight: 1.2,
                      }}
                    >
                      {card.title}
                    </h3>
                  </div>
                  <span
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 30,
                      fontWeight: 800,
                      color: "rgba(255,255,255,0.15)",
                      lineHeight: 1,
                      userSelect: "none",
                    }}
                  >
                    {card.label}
                  </span>
                </div>

                {/* Card Body */}
                <div
                  style={{
                    padding: "14px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  {card.extra?.badge && (
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        background: card.accentBg,
                        borderRadius: 100,
                        padding: "3px 10px",
                        alignSelf: "flex-start",
                      }}
                    >
                      <Zap size={10} color={card.accent} />
                      <span
                        className="label-pill"
                        style={{ color: card.accent }}
                      >
                        {card.extra.badge}
                      </span>
                    </div>
                  )}

                  {card.id === "join" && (
                    <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>
                      Suitable for students interested in:
                    </p>
                  )}

                  <ul
                    style={{
                      listStyle: "none",
                      margin: 0,
                      padding: 0,
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    {card.items.map((item) => (
                      <li
                        key={item}
                        className="check-item"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "6px 8px",
                          borderRadius: 8,
                          background:
                            hoveredCard === card.id
                              ? card.accentBg
                              : "transparent",
                          transition: "background 0.3s ease",
                        }}
                      >
                        <div
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            background: card.accentBg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <CheckCircle2 size={11} color={card.accent} />
                        </div>
                        <span
                          style={{
                            color: "#374151",
                            fontSize: 13,
                            lineHeight: 1.4,
                          }}
                        >
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {card.extra?.note && (
                    <div
                      style={{
                        paddingTop: 8,
                        marginTop: 4,
                        borderTop: "1px dashed rgba(8,85,171,0.2)",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Globe size={11} color={card.accent} />
                      <span
                        style={{
                          color: "#062341",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {card.extra.note}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom pill */}
        <motion.div
          variants={fadeInUp}
          style={{ textAlign: "center", marginTop: 16 }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#fff",
              borderRadius: 100,
              padding: "7px 18px",
              boxShadow: "0 4px 14px rgba(0,0,0,0.07)",
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#10b981",
              }}
            />
            <span style={{ color: "#374151", fontSize: 12, fontWeight: 500 }}>
              Limited seats — ₹99 per session
            </span>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#A81B1E",
              }}
            />
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default ThreeDDesignProgramHighlights;
