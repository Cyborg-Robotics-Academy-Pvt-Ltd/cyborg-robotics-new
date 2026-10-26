"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Canvas, useThree } from "@react-three/fiber";
import {
  Center,
  ContactShadows,
  Environment,
  Float,
  Html,
  OrbitControls,
  useGLTF,
  useProgress,
} from "@react-three/drei";
import { Box3, Vector3 } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Box, RotateCcw, ZoomIn, Layers } from "lucide-react";

type Vec3 = [number, number, number];

const MODEL_URL = "/ftc-robot.glb";
const TARGET_SIZE = 2; // normalized longest side, keeps camera distance predictable

const INITIAL_CAMERA: Vec3 = [-0.17, -1.9, 1.08];
const INITIAL_TARGET: Vec3 = [0, 0, 0];

// Widened so the start view (polar ≈ 135°) isn't pinned to the orbit limit
const MIN_POLAR = Math.PI * 0.15;
const MAX_POLAR = Math.PI * 0.85;

// Set to false while re-tuning so the logged position is exactly where you released
const AUTO_ROTATE = true;

useGLTF.preload(MODEL_URL);

function RobotModel() {
  const { scene } = useGLTF(MODEL_URL);

  const { object, scale } = useMemo(() => {
    const clone = scene.clone(true);
    const size = new Box3().setFromObject(clone).getSize(new Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    return { object: clone, scale: TARGET_SIZE / maxDim };
  }, [scene]);

  return (
    <Float speed={1.8} rotationIntensity={0.12} floatIntensity={0.25}>
      <group scale={scale}>
        <Center>
          <primitive object={object} />
        </Center>
      </group>
    </Float>
  );
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#ffffff" }}>
        {progress.toFixed(0)}%
      </span>
    </Html>
  );
}

/** Dev-only: logs camera + target after every drag/zoom so you can copy them into the constants. */
function CameraLogger() {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;

  useEffect(() => {
    if (process.env.NODE_ENV !== "development" || !controls) return;
    const round = (v: number[]) => v.map((n) => +n.toFixed(2));
    const log = () =>
      console.log(
        `INITIAL_CAMERA: [${round(camera.position.toArray())}]\nINITIAL_TARGET: [${round(
          controls.target.toArray(),
        )}]`,
      );
    controls.addEventListener("end", log);
    return () => controls.removeEventListener("end", log);
  }, [camera, controls]);

  return null;
}

const tags = [
  { icon: RotateCcw, label: "Drag to rotate" },
  { icon: ZoomIn, label: "Click + scroll to zoom" },
  { icon: Layers, label: "Engineering finish" },
];

const squares = [
  { x: 920, y: 40, s: 10, r: 2, c: "#ff4d52", o: 0.25 },
  { x: 940, y: 58, s: 7, r: 1, c: "#3b8cf0", o: 0.22 },
  { x: 960, y: 36, s: 5, r: 1, c: "#ff4d52", o: 0.18 },
  { x: 910, y: 70, s: 6, r: 1, c: "#ffffff", o: 0.12 },
  { x: 60, y: 480, s: 10, r: 2, c: "#3b8cf0", o: 0.22 },
  { x: 80, y: 500, s: 7, r: 1, c: "#ff4d52", o: 0.2 },
  { x: 50, y: 505, s: 5, r: 1, c: "#3b8cf0", o: 0.15 },
  { x: 580, y: 20, s: 6, r: 1, c: "#ff4d52", o: 0.15 },
  { x: 1100, y: 300, s: 8, r: 2, c: "#3b8cf0", o: 0.16 },
  { x: 30, y: 200, s: 7, r: 1, c: "#ffffff", o: 0.1 },
];

export default function HeroCanvas() {
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { margin: "100px" });
  const reduceMotion = useReducedMotion();
  const [zoomActive, setZoomActive] = useState(false);

  return (
    <motion.section
      className="threed-viewer-root"
      aria-labelledby="robot-viewer-heading"
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
          background: #000000;
          color: #f5f5f5;
        }
        .threed-viewer-root::before {
          content: '';
          position: absolute;
          top: -80px; right: -80px;
          width: 420px; height: 420px;
          border-radius: 50%;
          background: transparent;
          box-shadow:
            0 0 0 1px rgba(255,77,82,0.22),
            0 0 0 40px rgba(255,77,82,0.05),
            0 0 0 80px rgba(255,77,82,0.03),
            0 0 0 130px rgba(255,255,255,0.02);
          pointer-events: none;
        }
        .threed-viewer-root::after {
          content: '';
          position: absolute;
          bottom: -100px; left: -100px;
          width: 360px; height: 360px;
          border-radius: 50%;
          background: transparent;
          box-shadow:
            0 0 0 1px rgba(59,140,240,0.22),
            0 0 0 40px rgba(59,140,240,0.05),
            0 0 0 80px rgba(59,140,240,0.025);
          pointer-events: none;
        }
        .viewer-hairline {
          position: absolute; inset: 0; pointer-events: none; overflow: hidden;
        }
        .viewer-hairline::before {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 200%; height: 200%;
          background:
            linear-gradient(135deg, transparent 49.8%, rgba(255,255,255,0.04) 50%, transparent 50.2%),
            linear-gradient(135deg, transparent 74.8%, rgba(255,255,255,0.02) 75%, transparent 75.2%);
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
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 100px; padding: 5px 14px;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #f5f5f5; backdrop-filter: blur(10px);
          margin-bottom: 22px;
        }
        .viewer-label-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #ff4d52;
          box-shadow: 0 0 0 3px rgba(255,77,82,0.28);
          animation: labelPulse 2s ease-in-out infinite;
        }
        @keyframes labelPulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(255,77,82,0.28); }
          50%       { box-shadow: 0 0 0 6px rgba(255,77,82,0.1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .viewer-label-dot, .viewer-strip-dot { animation: none; }
        }
        .viewer-heading {
          font-family: 'Syne', sans-serif;
          font-size: clamp(2rem, 4vw, 3.2rem);
          font-weight: 900; line-height: 1.05;
          letter-spacing: -0.03em; color: #ffffff;
          margin: 0 0 18px;
        }
        .viewer-heading-accent {
          display: block;
          background: linear-gradient(135deg, #ff4d52 20%, #ff8a4c 80%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .viewer-desc {
          font-size: 15px; color: #a1a1a1;
          line-height: 1.7; max-width: 400px;
          margin: 0 0 28px;
        }
        .viewer-tags { display: flex; flex-wrap: wrap; gap: 8px; }
        .viewer-tag {
          display: inline-flex; align-items: center; gap: 7px;
          background: #0d0d0d;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px; padding: 7px 14px;
          font-size: 12px; font-weight: 600; color: #f5f5f5;
          transition: all 0.22s ease; cursor: default;
        }
        .viewer-tag:hover {
          background: rgba(255,77,82,0.12);
          border-color: rgba(255,77,82,0.4);
          color: #ff7a7e; transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(255,77,82,0.15);
        }
        .viewer-tag svg { color: #ff4d52; }
        .viewer-card-wrap { position: relative; }
        .viewer-card-glow {
          position: absolute; inset: -2px; border-radius: 28px;
          background: linear-gradient(135deg,
            rgba(255,77,82,0.35),
            rgba(255,255,255,0.05) 40%,
            rgba(59,140,240,0.28)
          );
          filter: blur(6px); z-index: 0;
        }
        .viewer-canvas-card {
          position: relative; z-index: 1;
          height: 460px; border-radius: 26px; overflow: hidden;
          border: 1px solid rgba(255,255,255,0.12);
          background: #000000;
          cursor: grab;
          box-shadow:
            0 32px 80px rgba(0,0,0,0.8),
            0 8px 24px rgba(0,0,0,0.6),
            inset 0 1px 0 rgba(255,255,255,0.08);
        }
        .viewer-canvas-card:active { cursor: grabbing; }
        @media (max-width: 900px) {
          .viewer-canvas-card { height: 320px; }
        }
        .viewer-3d-badge {
          position: absolute; top: 14px; right: 14px; z-index: 20;
          display: flex; align-items: center; gap: 5px;
          background: linear-gradient(135deg, #d42a2e, #ff6a3d);
          border-radius: 10px; padding: 6px 12px;
          font-size: 11px; font-weight: 800;
          letter-spacing: 0.06em; color: #fff;
          box-shadow: 0 4px 16px rgba(255,77,82,0.4);
          border: 1px solid rgba(255,255,255,0.2);
        }
        .viewer-inner-ring {
          position: absolute; inset: 10px; border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.07);
          pointer-events: none; z-index: 5;
        }
        .viewer-corner { position: absolute; z-index: 10; pointer-events: none; }
        .viewer-corner-tl {
          top: 14px; left: 14px; width: 22px; height: 22px;
          border-top: 1.5px solid rgba(255,77,82,0.6);
          border-left: 1.5px solid rgba(255,77,82,0.6);
          border-radius: 4px 0 0 0;
        }
        .viewer-corner-br {
          bottom: 14px; right: 14px; width: 22px; height: 22px;
          border-bottom: 1.5px solid rgba(59,140,240,0.6);
          border-right: 1.5px solid rgba(59,140,240,0.6);
          border-radius: 0 0 4px 0;
        }
        .viewer-strip {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 10;
          padding: 14px 18px;
          background: linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%);
          display: flex; align-items: center; justify-content: space-between;
          pointer-events: none;
        }
        .viewer-strip-left { display: flex; align-items: center; gap: 8px; }
        .viewer-strip-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.3);
          animation: labelPulse 2s ease-in-out infinite;
        }
        .viewer-strip-text { font-size: 11px; font-weight: 600; color: #f5f5f5; letter-spacing: 0.04em; }
        .viewer-strip-hint { font-size: 10px; font-weight: 500; color: #8a8a8a; font-style: italic; }
      `}</style>

      <div className="viewer-hairline" aria-hidden="true" />

      <div className="viewer-accent-squares" aria-hidden="true">
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
          {squares.map((q, i) => (
            <rect
              key={i}
              x={q.x}
              y={q.y}
              width={q.s}
              height={q.s}
              rx={q.r}
              fill={q.c}
              opacity={q.o}
            />
          ))}
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

          <h3 id="robot-viewer-heading" className="viewer-heading">
            Rotate Our FTC
            <span className="viewer-heading-accent">Robot</span>
          </h3>

          <p className="viewer-desc">
            Drag to orbit, zoom in for details, and inspect the robot from every
            angle — just like a real design review.
          </p>

          <div className="viewer-tags">
            {tags.map(({ icon: Icon, label }) => (
              <span key={label} className="viewer-tag">
                <Icon size={13} strokeWidth={2} aria-hidden="true" />
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
          <div className="viewer-card-glow" aria-hidden="true" />
          <div
            ref={cardRef}
            className="viewer-canvas-card"
            role="img"
            aria-label="Interactive 3D model of the FTC robot. Drag to rotate; click then scroll to zoom."
            onPointerDown={() => setZoomActive(true)}
            onPointerLeave={() => setZoomActive(false)}
            onPointerCancel={() => setZoomActive(false)}
          >
            <div className="viewer-inner-ring" />
            <div className="viewer-corner viewer-corner-tl" />
            <div className="viewer-corner viewer-corner-br" />
            <div className="viewer-3d-badge">
              <Box size={13} strokeWidth={2.2} aria-hidden="true" />
              3D
            </div>

            <Canvas
              dpr={[1, 2]}
              camera={{ position: INITIAL_CAMERA, fov: 45 }}
              frameloop={inView ? "always" : "never"}
              gl={{ antialias: true, powerPreference: "high-performance" }}
            >
              <color attach="background" args={["#000000"]} />
              <ambientLight intensity={0.5} />
              <directionalLight position={[4, 6, 2]} intensity={1.2} />
              <directionalLight
                position={[-4, 2, -3]}
                intensity={0.45}
                color="#ffffff"
              />
              <Suspense fallback={<Loader />}>
                <Environment preset="studio" environmentIntensity={0.6} />
                <RobotModel />
                <ContactShadows
                  position={[0, -1, 0]}
                  opacity={0.7}
                  blur={2.4}
                  scale={6}
                  far={2}
                  color="#000000"
                />
              </Suspense>
              <OrbitControls
                makeDefault
                target={INITIAL_TARGET}
                enablePan={false}
                enableZoom={zoomActive}
                minDistance={1.5}
                maxDistance={12}
                minPolarAngle={MIN_POLAR}
                maxPolarAngle={MAX_POLAR}
                autoRotate={AUTO_ROTATE && !reduceMotion}
                autoRotateSpeed={0.8}
              />
              <CameraLogger />
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
