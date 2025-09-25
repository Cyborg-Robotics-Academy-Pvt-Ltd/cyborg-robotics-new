"use client";

import React, { useState } from "react";
import MouseFollower, {
  MouseFollowerSmooth,
  MouseFollowerPulse,
} from "@/components/ui/mouse-follower";
import { motion } from "framer-motion";

export default function MouseFollowerDemo() {
  const [activeVariant, setActiveVariant] = useState<
    "default" | "smooth" | "pulse"
  >("default");

  const variants = [
    {
      key: "default",
      name: "Spring Animation",
      description: "Responsive spring-based movement with scale animation",
    },
    {
      key: "smooth",
      name: "Smooth Follow",
      description: "Smooth tween animation with back-out easing",
    },
    {
      key: "pulse",
      name: "Pulsing Circle",
      description: "Continuous pulsing animation with spring movement",
    },
  ];

  const renderActiveFollower = () => {
    switch (activeVariant) {
      case "smooth":
        return <MouseFollowerSmooth />;
      case "pulse":
        return <MouseFollowerPulse />;
      default:
        return <MouseFollower />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Hide the default mouse follower from layout */}
      <style jsx global>{`
        .mouse-follower-hidden {
          display: none !important;
        }
      `}</style>

      {/* Render the active variant */}
      {renderActiveFollower()}

      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
            Mouse Follower Demo
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Experience different mouse follower animations. Move your mouse
            around to see the interactive circles follow your cursor.
          </p>
        </motion.div>

        {/* Variant Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Choose a Variant
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {variants.map((variant) => (
              <motion.button
                key={variant.key}
                onClick={() =>
                  setActiveVariant(
                    variant.key as "default" | "smooth" | "pulse"
                  )
                }
                className={`px-6 py-3 rounded-lg border-2 transition-all duration-300 ${
                  activeVariant === variant.key
                    ? "border-blue-500 bg-blue-500/20 text-blue-300"
                    : "border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="text-sm font-medium">{variant.name}</div>
                <div className="text-xs opacity-70 mt-1">
                  {variant.description}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Interactive Areas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          <motion.div
            className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 p-8 rounded-xl border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300"
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <h3 className="text-xl font-semibold mb-4 text-blue-300">
              Hover Area 1
            </h3>
            <p className="text-gray-300">
              Move your mouse over this card to see the follower in action.
            </p>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 p-8 rounded-xl border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300"
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <h3 className="text-xl font-semibold mb-4 text-purple-300">
              Hover Area 2
            </h3>
            <p className="text-gray-300">
              The mouse follower adapts to your movement speed and direction.
            </p>
          </motion.div>

          <motion.div
            className="bg-gradient-to-br from-pink-500/20 to-red-600/20 p-8 rounded-xl border border-pink-500/30 hover:border-pink-400/50 transition-all duration-300 md:col-span-2 lg:col-span-1"
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <h3 className="text-xl font-semibold mb-4 text-pink-300">
              Hover Area 3
            </h3>
            <p className="text-gray-300">
              Try quick movements and slow movements to see different behaviors.
            </p>
          </motion.div>
        </motion.div>

        {/* Feature List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700"
        >
          <h2 className="text-2xl font-semibold mb-6 text-center">Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3 text-blue-300">
                Customizable Properties
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Adjustable size and colors</li>
                <li>• Opacity and blur effects</li>
                <li>• Border customization</li>
                <li>• Animation delay control</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3 text-purple-300">
                Animation Types
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Spring-based physics</li>
                <li>• Smooth tween animations</li>
                <li>• Pulsing effects</li>
                <li>• Scale transformations</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Usage Example */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 bg-gray-900/50 p-6 rounded-xl border border-gray-600"
        >
          <h3 className="text-lg font-semibold mb-4">Usage Example</h3>
          <pre className="text-sm text-gray-300 overflow-x-auto">
            <code>{`import MouseFollowerCircleDot from '@/components/ui/mouse-follower-circle-dot';

// Basic usage
<MouseFollowerCircleDot />

// Custom configuration
<MouseFollowerCircleDot 
  size={50}
  dotSize={8}
  borderColor="rgba(59, 130, 246, 0.8)"
  dotColor="rgba(59, 130, 246, 1)"
  dotDelay={0.2}
/>`}</code>
          </pre>
        </motion.div>
      </div>
    </div>
  );
}
