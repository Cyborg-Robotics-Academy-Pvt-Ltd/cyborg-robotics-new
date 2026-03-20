import React from "react";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import { Box, RotateCcw, ZoomIn, Layers } from "lucide-react";

function PrintedObject() {
  const { scene } = useGLTF("/model.glb");
  return (
    <Float speed={1.8} rotationIntensity={0.2} floatIntensity={0.35}>
      <primitive
        object={scene}
        scale={0.7}
        position={[0, -0.5, 0]}
        rotation={[0, Math.PI / 4, 0]}
      />
    </Float>
  );
}

const tags = [
  { icon: RotateCcw, label: "Drag to rotate" },
  { icon: ZoomIn, label: "Scroll to zoom" },
  { icon: Layers, label: "Engineering finish" },
];

export default function PrintedObjectViewer() {
  return (
    <motion.section
      className="threed-viewer-root"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');

        .threed-viewer-root {
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
          padding: 72px 24px;
          /* ── Option C: soft pastel gradient ── */
          background: linear-gradient(135deg, #eef1f8 0%, #f5f0fa 50%, #eaf3f8 100%);
        }

        /* ── Concentric rings top-right ── */
        .threed-viewer-root::before {
          content: '';
          position: absolute;
          top: -80px; right: -80px;
          width: 420px; height: 420px;
          border-radius: 50%;
          background: transparent;
          box-shadow:
            0 0 0 1px rgba(168,27,30,0.10),
            0 0 0 40px rgba(168,27,30,0.045),
            0 0 0 80px rgba(168,27,30,0.025),
            0 0 0 130px rgba(8,85,171,0.03);
          pointer-events: none;
        }

        /* ── Concentric rings bottom-left ── */
        .threed-viewer-root::after {
          content: '';
          position: absolute;
          bottom: -100px; left: -100px;
          width: 360px; height: 360px;
          border-radius: 50%;
          background: transparent;
          box-shadow:
            0 0 0 1px rgba(8,85,171,0.10),
            0 0 0 40px rgba(8,85,171,0.04),
            0 0 0 80px rgba(8,85,171,0.02);
          pointer-events: none;
        }

        /* ── Diagonal hairline ── */
        .viewer-hairline {
          position: absolute; inset: 0; pointer-events: none; overflow: hidden;
        }
        .viewer-hairline::before {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 200%; height: 200%;
          background:
            linear-gradient(135deg, transparent 49.8%, rgba(6,35,65,0.03) 50%, transparent 50.2%),
            linear-gradient(135deg, transparent 74.8%, rgba(6,35,65,0.015) 75%, transparent 75.2%);
        }

        .viewer-accent-squares {
          position: absolute; inset: 0; pointer-events: none; overflow: hidden;
        }

        .viewer-inner {
          position: relative; z-index: 1;
          max-width: 1200px; margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 56px;
        }
        @media (max-width: 900px) {
          .viewer-inner { grid-template-columns: 1fr; gap: 36px; }
        }

        .viewer-label {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.75);
          border: 1px solid rgba(6,35,65,0.10);
          border-radius: 100px; padding: 5px 14px;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #062341; backdrop-filter: blur(10px);
          margin-bottom: 22px;
          box-shadow: 0 2px 10px rgba(6,35,65,0.06);
        }

        .viewer-label-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #A81B1E;
          box-shadow: 0 0 0 3px rgba(168,27,30,0.18);
          animation: labelPulse 2s ease-in-out infinite;
        }
        @keyframes labelPulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(168,27,30,0.18); }
          50%       { box-shadow: 0 0 0 6px rgba(168,27,30,0.07); }
        }

        .viewer-heading {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2rem, 4vw, 3.2rem);
          font-weight: 900; line-height: 1.05;
          letter-spacing: -0.03em; color: #062341;
          margin: 0 0 18px;
        }
        .viewer-heading-accent {
          display: block;
          background: linear-gradient(135deg, #A81B1E 20%, #c73e1d 80%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .viewer-desc {
          font-size: 15px; color: #5a6a82;
          line-height: 1.7; max-width: 400px;
          margin: 0 0 28px;
        }

        .viewer-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .viewer-tag {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,0.85);
          border: 1px solid rgba(6,35,65,0.09);
          border-radius: 10px; padding: 7px 14px;
          font-size: 12px; font-weight: 600; color: #062341;
          backdrop-filter: blur(8px);
          box-shadow: 0 2px 8px rgba(6,35,65,0.05);
          transition: all 0.22s ease; cursor: default;
        }
        .viewer-tag:hover {
          background: rgba(168,27,30,0.06);
          border-color: rgba(168,27,30,0.18);
          color: #A81B1E; transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(168,27,30,0.09);
        }
        .viewer-tag svg { color: #A81B1E; }

        .viewer-card-wrap { position: relative; }

        .viewer-card-glow {
          position: absolute; inset: -2px; border-radius: 28px;
          background: linear-gradient(135deg,
            rgba(168,27,30,0.18),
            rgba(168,27,30,0.05) 40%,
            rgba(8,85,171,0.14)
          );
          filter: blur(1px); z-index: 0;
        }

        .viewer-canvas-card {
          position: relative; z-index: 1;
          height: 460px; border-radius: 26px; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.9);
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(20px);
          box-shadow:
            0 32px 80px rgba(6,35,65,0.10),
            0 8px 24px rgba(6,35,65,0.06),
            inset 0 1px 0 rgba(255,255,255,0.95);
        }
        @media (max-width: 900px) {
          .viewer-canvas-card { height: 320px; }
        }

        .viewer-3d-badge {
          position: absolute; top: 14px; right: 14px; z-index: 20;
          display: flex; align-items: center; gap: 5px;
          background: linear-gradient(135deg, #A81B1E, #c73e1d);
          border-radius: 10px; padding: 6px 12px;
          font-size: 11px; font-weight: 800;
          letter-spacing: 0.06em; color: #fff;
          box-shadow: 0 4px 16px rgba(168,27,30,0.35);
          border: 1px solid rgba(255,255,255,0.2);
        }

        /* Frosted inner ring */
        .viewer-inner-ring {
          position: absolute; inset: 10px; border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.55);
          pointer-events: none; z-index: 5;
        }

        .viewer-corner { position: absolute; z-index: 10; pointer-events: none; }
        .viewer-corner-tl {
          top: 14px; left: 14px; width: 22px; height: 22px;
          border-top: 1.5px solid rgba(168,27,30,0.35);
          border-left: 1.5px solid rgba(168,27,30,0.35);
          border-radius: 4px 0 0 0;
        }
        .viewer-corner-br {
          bottom: 14px; right: 14px; width: 22px; height: 22px;
          border-bottom: 1.5px solid rgba(8,85,171,0.3);
          border-right: 1.5px solid rgba(8,85,171,0.3);
          border-radius: 0 0 4px 0;
        }

        .viewer-strip {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 10;
          padding: 14px 18px;
          background: linear-gradient(to top, rgba(238,241,248,0.88) 0%, transparent 100%);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: space-between;
        }
        .viewer-strip-left { display: flex; align-items: center; gap: 8px; }
        .viewer-strip-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.25);
          animation: labelPulse 2s ease-in-out infinite;
        }
        .viewer-strip-text { font-size: 11px; font-weight: 600; color: #062341; letter-spacing: 0.04em; }
        .viewer-strip-hint { font-size: 10px; font-weight: 500; color: #7a8aaa; font-style: italic; }
      `}</style>

      {/* Diagonal hairline */}
      <div className="viewer-hairline" />

      {/* Accent squares */}
      <div className="viewer-accent-squares">
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMid slice"
        >
          <rect
            x="920"
            y="40"
            width="10"
            height="10"
            rx="2"
            fill="#A81B1E"
            opacity="0.13"
          />
          <rect
            x="940"
            y="58"
            width="7"
            height="7"
            rx="1"
            fill="#0855AB"
            opacity="0.12"
          />
          <rect
            x="960"
            y="36"
            width="5"
            height="5"
            rx="1"
            fill="#A81B1E"
            opacity="0.09"
          />
          <rect
            x="910"
            y="70"
            width="6"
            height="6"
            rx="1"
            fill="#062341"
            opacity="0.07"
          />
          <rect
            x="60"
            y="480"
            width="10"
            height="10"
            rx="2"
            fill="#0855AB"
            opacity="0.12"
          />
          <rect
            x="80"
            y="500"
            width="7"
            height="7"
            rx="1"
            fill="#A81B1E"
            opacity="0.10"
          />
          <rect
            x="50"
            y="505"
            width="5"
            height="5"
            rx="1"
            fill="#0855AB"
            opacity="0.08"
          />
          <rect
            x="580"
            y="20"
            width="6"
            height="6"
            rx="1"
            fill="#A81B1E"
            opacity="0.08"
          />
          <rect
            x="1100"
            y="300"
            width="8"
            height="8"
            rx="2"
            fill="#0855AB"
            opacity="0.09"
          />
          <rect
            x="30"
            y="200"
            width="7"
            height="7"
            rx="1"
            fill="#062341"
            opacity="0.06"
          />
        </svg>
      </div>

      <div className="viewer-inner">
        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className="viewer-label">
            <span className="viewer-label-dot" />
            Interactive Model View
          </div>

          <h3 className="viewer-heading">
            Rotate a 3D Printed
            <span className="viewer-heading-accent">Prototype</span>
          </h3>

          <p className="viewer-desc">
            Drag to orbit, zoom in for details, and inspect the model from every
            angle — just like a real design review.
          </p>

          <div className="viewer-tags">
            {tags.map(({ icon: Icon, label }) => (
              <span key={label} className="viewer-tag">
                <Icon size={13} strokeWidth={2} />
                {label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* RIGHT */}
        <motion.div
          className="viewer-card-wrap"
          initial={{ opacity: 0, x: 30, scale: 0.97 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className="viewer-card-glow" />
          <div className="viewer-canvas-card">
            <div className="viewer-inner-ring" />
            <div className="viewer-corner viewer-corner-tl" />
            <div className="viewer-corner viewer-corner-br" />
            <div className="viewer-3d-badge">
              <Box size={13} strokeWidth={2.2} />
              3D
            </div>

            <Canvas camera={{ position: [2.6, 1.9, 2.8], fov: 45 }} shadows>
              <color attach="background" args={["#f2f4fb"]} />
              <ambientLight intensity={0.9} />
              <directionalLight
                position={[4, 6, 2]}
                intensity={1.2}
                castShadow
              />
              <PrintedObject />
              <ContactShadows
                position={[0, -1, 0]}
                opacity={0.28}
                blur={2.4}
                scale={5}
                far={2}
              />
              <Environment preset="city" />
              <OrbitControls
                enablePan={false}
                minDistance={2.2}
                maxDistance={5}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={(Math.PI * 3) / 4}
                autoRotate
                autoRotateSpeed={0.8}
              />
            </Canvas>

            <div className="viewer-strip">
              <div className="viewer-strip-left">
                <div className="viewer-strip-dot" />
                <span className="viewer-strip-text">Live 3D Model</span>
              </div>
              <span className="viewer-strip-hint">drag · zoom · inspect</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
