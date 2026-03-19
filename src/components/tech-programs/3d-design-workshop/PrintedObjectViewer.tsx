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
import { Box } from "lucide-react";

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

export default function PrintedObjectViewer() {
  return (
    <motion.section
      className="relative overflow-hidden py-16 md:py-24"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(168,27,30,0.08),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(8,85,171,0.1),transparent_44%)]" />

      <div className="relative z-10 mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12">
        {/* LEFT CONTENT (UNCHANGED) */}
        <div>
          <div className="mb-4 inline-flex items-center rounded-full border border-[#0855AB]/20 bg-white/80 px-4 py-2 text-xs font-semibold tracking-wide text-[#062341]">
            INTERACTIVE MODEL VIEW
          </div>

          <h3 className="mb-4 text-3xl font-bold leading-tight text-[#062341] md:text-4xl lg:text-5xl">
            Rotate a 3D Printed
            <span className="gradient-text"> Prototype</span>
          </h3>

          <p className="max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
            Drag to orbit, zoom in for details, and inspect the model from every
            angle just like a real design review.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {["Drag to rotate", "Scroll to zoom", "Engineering finish"].map(
              (tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#062341]/15 bg-white/75 px-3 py-1 text-xs font-semibold text-[#062341]"
                >
                  {tag}
                </span>
              ),
            )}
          </div>
        </div>

        {/* RIGHT SIDE 3D VIEWER */}
        <div className="h-[160px] overflow-hidden rounded-4xl border border-[#062341]/12 bg-white shadow-[0_20px_60px_rgba(6,35,65,0.15)] md:h-[460px]">
          <div className="absolute right-10 top-4 z-10 flex items-center gap-1 rounded-full bg-red-800 text-white px-3 py-1 text-xs font-semibold  shadow">
            <Box size={20} />
            3D
          </div>
          <Canvas camera={{ position: [2.6, 1.9, 2.8], fov: 45 }} shadows>
            <color attach="background" args={["#f8fafc"]} />

            <ambientLight intensity={0.8} />

            <directionalLight position={[4, 6, 2]} intensity={1.2} castShadow />

            <PrintedObject />

            <ContactShadows
              position={[0, -1, 0]}
              opacity={0.34}
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
        </div>
      </div>
    </motion.section>
  );
}
