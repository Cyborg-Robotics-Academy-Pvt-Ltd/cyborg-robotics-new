"use client";

import { useRef, Suspense, useMemo, lazy } from "react";
import { motion, useInView } from "framer-motion";
import { MapPin, Users, Award } from "lucide-react";
import RoboticsCard from "@/components/ui/robotics-card";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

// Lazy load the WorldMap component
const WorldMap = lazy(() =>
  import("@/components/ui/world-map").then((module) => ({
    default: module.WorldMap,
  }))
);

export default function GlobalReachSection() {
  const globalRef = useRef(null);
  const globalInView = useInView(globalRef, { once: true, margin: "-50px" });

  const worldMapData = useMemo(
    () => [
      {
        start: { lat: 18.5204, lng: 73.8567 }, // Pune, India
        end: { lat: 37.7749, lng: -122.4194 }, // San Francisco, USA
      },
      {
        start: { lat: 18.5204, lng: 73.8567 }, // Pune, India
        end: { lat: 51.5074, lng: -0.1278 }, // London, UK
      },
      {
        start: { lat: 18.5204, lng: 73.8567 }, // Pune, India
        end: { lat: 35.6762, lng: 139.6503 }, // Tokyo, Japan
      },
    ],
    []
  );

  return (
    <motion.section
      ref={globalRef}
      initial={{ opacity: 0, y: 50 }}
      animate={globalInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="max-w-6xl mx-auto mb-20"
    >
      <motion.h2
        className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={globalInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        Our Global Reach
      </motion.h2>

      <motion.p
        className="text-center text-gray-600 mb-8 max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={globalInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        From Pune to the world - our students and collaborations span across
        continents, building a global community of innovators and learners.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={globalInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 1, duration: 0.8 }}
        className="bg-white   "
      >
        <Suspense
          fallback={
            <LoadingSkeleton height="h-64" message="Loading World Map..." />
          }
        >
          <WorldMap dots={worldMapData} lineColor="#dc2626" />
        </Suspense>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <RoboticsCard className="text-center" variant="elevated">
            <MapPin className="w-8 h-8 text-red-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-800 mb-2">Headquarters</h3>
            <p className="text-gray-600 text-sm">Pune, India</p>
          </RoboticsCard>

          <RoboticsCard className="text-center" variant="elevated">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-800 mb-2">Global Partners</h3>
            <p className="text-gray-600 text-sm">
              Meta, Educational Institutes
            </p>
          </RoboticsCard>

          <RoboticsCard className="text-center" variant="elevated">
            <Award className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-800 mb-2">
              International Recognition
            </h3>
            <p className="text-gray-600 text-sm">WRO, IRO Participation</p>
          </RoboticsCard>
        </div>
      </motion.div>
    </motion.section>
  );
}
