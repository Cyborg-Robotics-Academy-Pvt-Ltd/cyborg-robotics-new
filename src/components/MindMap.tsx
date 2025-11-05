"use client";
import React, { useCallback, useState, memo, useEffect } from "react";
import Link from "next/link";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// Viewport Control Component
// Updated to include expand all functionality
const ViewportControls = ({
  onFitView,
  onCropNodes,
  onExpandAll,
}: {
  onFitView: () => void;
  onCropNodes: () => void;
  onExpandAll: () => void;
}) => {
  return (
    <div className="absolute top-20 right-4 z-10 flex gap-2 flex-col">
      <div className="flex gap-2">
        <button
          onClick={onFitView}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded shadow"
        >
          Fit View
        </button>
        <button
          onClick={onCropNodes}
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded shadow"
        >
          Crop Nodes
        </button>
        <button
          onClick={onExpandAll}
          className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded shadow"
        >
          Expand All
        </button>
      </div>
    </div>
  );
};
ViewportControls.displayName = "ViewportControls";

// 🧩 Custom Node Component with Link and Collapse/Expand functionality
const HorizontalNode = memo(
  ({
    data,
    isCollapsed,
    onToggle,
  }: {
    data: {
      label: string;
      color?: string;
      link?: string;
      collapsible?: boolean;
    };
    isCollapsed?: boolean;
    onToggle?: () => void;
  }) => {
    const nodeContent = (
      <div
        style={{
          padding: "14px 24px",
          borderRadius: 12,
          background: `linear-gradient(135deg, ${data.color || "#3b82f6"} 0%, ${data.color || "#3b82f6"}dd 100%)`,
          color: "#fff",
          fontWeight: 500,
          fontSize: "14px",
          textAlign: "center",
          minWidth: 160,
          border: "2px solid rgba(255,255,255,0.2)",
          margin: 0,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)",
          transition: "all 0.3s ease",
          cursor: "pointer",
          position: "relative",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.25)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
        }}
      >
        {/* Collapse/Expand dot indicator */}
        {data.collapsible && (
          <div
            style={{
              position: "absolute",
              top: 16,
              right: -8,
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: isCollapsed ? "#22c55e" : "#ef4444",
              border: "2px solid white",
              cursor: "pointer",
              zIndex: 10,
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (onToggle) {
                onToggle();
              }
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 8,
                height: 2,
                background: "white",
              }}
            />
            {isCollapsed && (
              <div
                style={{
                  position: "absolute",
                  top: "60%",
                  left: "50%",
                  transform: "translate(-50%, -50%) rotate(90deg)",
                  width: 8,
                  height: 2,
                  background: "white",
                }}
              />
            )}
          </div>
        )}

        <Handle
          type="target"
          position={Position.Left}
          style={{
            background: "#fff",
            width: 14,
            height: 14,
            borderRadius: 7,
            border: "3px solid " + (data.color || "#3b82f6"),
          }}
        />
        {data.label}
        <Handle
          type="source"
          position={Position.Right}
          style={{
            background: "#fff",
            width: 14,
            height: 14,
            borderRadius: 7,
            border: "3px solid " + (data.color || "#3b82f6"),
          }}
        />
      </div>
    );

    // If link exists, wrap the node in a Link component
    if (data.link) {
      return (
        <Link href={data.link} passHref>
          {nodeContent}
        </Link>
      );
    }

    return nodeContent;
  }
);
HorizontalNode.displayName = "HorizontalNode";

//
// 🧭 ALL NODES - Enhanced positioning and spacing with links
//
const initialNodes: Node[] = [
  // ROOT
  {
    id: "ROOT",
    type: "horizontal",
    position: { x: 50, y: 700 },
    data: { label: "CYBORG COURSES", color: "#1e3a8a", collapsible: true },
  },

  // MAIN CATEGORIES
  {
    id: "ROBOTICS",
    type: "horizontal",
    position: { x: 350, y: 600 },
    data: { label: "ROBOTICS", color: "#AB2623", collapsible: true },
  },
  {
    id: "SKILL",
    type: "horizontal",
    position: { x: 350, y: 700 },
    data: { label: "SKILL BASED", color: "#0ea018", collapsible: true },
  },
  {
    id: "WORKSHOPS",
    type: "horizontal",
    position: { x: 320, y: 800 },
    data: { label: "WORKSHOPS & CAMPS", color: "#0000FF", collapsible: true },
  },

  //
  // ROBOTICS AGE GROUPS
  //
  {
    id: "AGE46",
    type: "horizontal",
    position: { x: 650, y: 500 },
    data: { label: "AGE 4-6", color: "#4ade80", collapsible: true },
  },
  {
    id: "AGE69",
    type: "horizontal",
    position: { x: 650, y: 600 },
    data: { label: "AGE 6-9", color: "#8b5cf6", collapsible: true },
  },
  {
    id: "AGE911",
    type: "horizontal",
    position: { x: 650, y: 700 },
    data: { label: "AGE 9-11", color: "#8b5cf6", collapsible: true },
  },
  {
    id: "AGE1116",
    type: "horizontal",
    position: { x: 650, y: 800 },
    data: { label: "AGE 11-16", color: "#ed6565", collapsible: true },
  },

  //
  // AGE 4–6 COURSES
  //
  {
    id: "KUBO1",
    type: "horizontal",
    position: { x: 950, y: 450 },
    data: {
      label: "KUBO - 2 Levels",
      color: "#4ade80",
      link: "/courses/bambino-coding",
    },
  },
  {
    id: "ESM",
    type: "horizontal",
    position: { x: 970, y: 510 },
    data: {
      label: "Early Simple Machine",
      color: "#4ade80",
      link: "/courses/early-simple-machines",
    },
  },
  {
    id: "BAMBINO",
    type: "horizontal",
    position: { x: 950, y: 570 },
    data: {
      label: "Bambino Coding - 2 Levels",
      color: "#4ade80",
      link: "/courses/bambino-coding",
    },
  },

  //
  // AGE 6–9 COURSES
  //
  {
    id: "KUBO2",
    type: "horizontal",
    position: { x: 950, y: 450 },
    data: {
      label: "KUBO - 1 Level",
      color: "#22d3ee",
      link: "/courses/bambino-coding",
    },
  },
  {
    id: "SPM",
    type: "horizontal",
    position: { x: 950, y: 510 },
    data: {
      label: "Simple & Powered Machines",
      color: "#22d3ee",
      link: "/courses/simple-powered-machines",
    },
  },
  {
    id: "CODE1",
    type: "horizontal",
    position: { x: 950, y: 570 },
    data: { label: "Code.org - 2 Levels", color: "#22d3ee" },
  },
  {
    id: "QUARKY1",
    type: "horizontal",
    position: { x: 950, y: 630 },
    data: { label: "Quarky Robotics & AI - 2 Levels", color: "#22d3ee" },
  },

  // AGE 6–9 ADDITIONAL COURSES (Second column)
  {
    id: "PEECEE",
    type: "horizontal",
    position: { x: 950, y: 690 },
    data: {
      label: "PEECEE - 2 Levels",
      color: "#22d3ee",
      link: "/courses/arduino",
    },
  },
  {
    id: "SPIKE1",
    type: "horizontal",
    position: { x: 950, y: 750 },
    data: {
      label: "SPIKE Essential - 2 Levels",
      color: "#22d3ee",
      link: "/courses/spike-pneumatics",
    },
  },

  //
  // AGE 9–11 COURSES
  //
  {
    id: "EARLY",
    type: "horizontal",
    position: { x: 950, y: 650 },
    data: {
      label: "Early Electronics - 2 Levels",
      color: "#fb923c",
      link: "/courses/electronics",
    },
  },
  {
    id: "MINI",
    type: "horizontal",
    position: { x: 950, y: 730 },
    data: {
      label: "Mini Electronics - 2 Levels",
      color: "#fb923c",
      link: "/courses/electronics",
    },
  },

  //
  // AGE 11–16 ROBOTICS COURSES
  //
  {
    id: "MECH",
    type: "horizontal",
    position: { x: 930, y: 730 },
    data: { label: "MECHANICAL + CODING", color: "#c084fc", collapsible: true },
  },
  {
    id: "SPRIME",
    type: "horizontal",
    position: { x: 1300, y: 630 },
    data: {
      label: "SPIKE Prime - 4 Levels",
      color: "#c084fc",
      link: "/courses/spike-prime",
    },
  },
  {
    id: "EV3",
    type: "horizontal",
    position: { x: 1300, y: 690 },
    data: {
      label: "EV3 - 4 Levels",
      color: "#c084fc",
      link: "/courses/robotics-ev3",
    },
  },
  {
    id: "SPYTHON",
    type: "horizontal",
    position: { x: 1300, y: 750 },
    data: {
      label: "SPIKE + Python - Levels",
      color: "#c084fc",
      link: "/courses/spike-prime",
    },
  },

  //
  // CORE CODING
  //
  {
    id: "CODING",
    type: "horizontal",
    position: { x: 950, y: 790 },
    data: { label: "CORE CODING", color: "#0891b2", collapsible: true },
  },
  {
    id: "APP",
    type: "horizontal",
    position: { x: 1300, y: 690 },
    data: {
      label: "Application Designing - 4 Levels",
      color: "#06b6d4",
      link: "/courses/app-designing",
    },
  },
  {
    id: "WEB",
    type: "horizontal",
    position: { x: 1300, y: 750 },
    data: {
      label: "Web Designing - 4 Levels",
      color: "#06b6d4",
      link: "/courses/web-designing",
    },
  },
  {
    id: "PYTHON",
    type: "horizontal",
    position: { x: 1300, y: 810 },
    data: {
      label: "Python",
      color: "#06b6d4",
      link: "/courses/python-language",
    },
  },

  {
    id: "JAVA",
    type: "horizontal",
    position: { x: 1300, y: 870 },
    data: {
      label: "Java - 3 Levels",
      color: "#06b6d4",
      link: "/courses/java",
    },
  },
  {
    id: "DSA",
    type: "horizontal",
    position: { x: 1300, y: 930 },
    data: {
      label: "DSA - 2 Levels",
      color: "#06b6d4",
      link: "/courses/java",
    },
  },

  //
  // EMBEDDED SYSTEMS
  //
  {
    id: "EMBEDDED",
    type: "horizontal",
    position: { x: 950, y: 850 },
    data: { label: "EMBEDDED", color: "#0891b2", collapsible: true },
  },
  {
    id: "ARDUINO",
    type: "horizontal",
    position: { x: 1300, y: 810 },
    data: {
      label: "Basic Electronics + Arduino - 3 Levels",
      color: "#14b8a6",
      link: "/courses/arduino",
    },
  },
  {
    id: "IOT",
    type: "horizontal",
    position: { x: 1300, y: 870 },
    data: { label: "IoT", color: "#14b8a6", link: "/courses/iot" },
  },
  {
    id: "RASP",
    type: "horizontal",
    position: { x: 1300, y: 930 },
    data: { label: "Raspberry", color: "#14b8a6" },
  },
  // SKILL BASED SUB-BRANCHES (ARTIFICIAL INTELLIGENCE, PBL, EMERGING TECH)
  {
    id: "AI_ROOT",
    type: "horizontal",
    position: { x: 650, y: 660 },
    data: {
      label: "ARTIFICIAL INTELLIGENCE",
      color: "#f97316",
      collapsible: true,
    },
  },
  {
    id: "QUARKY_AI",
    type: "horizontal",
    position: { x: 1000, y: 500 },
    data: { label: "QUARKY", color: "#fb7185" },
  },
  {
    id: "DEEP_LEARNING",
    type: "horizontal",
    position: { x: 1000, y: 560 },
    data: { label: "DEEP LEARNING", color: "#fb7185" },
  },
  {
    id: "MACHINE_LEARNING",
    type: "horizontal",
    position: { x: 1000, y: 620 },
    data: { label: "MACHINE LEARNING", color: "#fb7185" },
  },
  {
    id: "AI_GENERAL",
    type: "horizontal",
    position: { x: 1000, y: 680 },
    data: { label: "AI", color: "#fb7185" },
  },
  {
    id: "AI_INFUSED_ROBOTICS",
    type: "horizontal",
    position: { x: 1000, y: 740 },
    data: { label: "AI INFUSED ROBOTICS", color: "#fb7185" },
  },
  {
    id: "PBL",
    type: "horizontal",
    position: { x: 650, y: 800 },
    data: {
      label: "PROJECT BASED LEARNING (PBL)",
      color: "#f59e0b",
      collapsible: true,
    },
  },
  {
    id: "PBL_SOFTWARE",
    type: "horizontal",
    position: { x: 1000, y: 730 },
    data: { label: "SOFTWARE", color: "#fbbf24", collapsible: true },
  },

  {
    id: "PBL_HARDWARE",
    type: "horizontal",
    position: { x: 1000, y: 790 },
    data: { label: "HARDWARE", color: "#fbbf24", collapsible: true },
  },

  {
    id: "EMERGING",
    type: "horizontal",
    position: { x: 660, y: 730 },
    data: { label: "EMERGING TECH", color: "#10b981", collapsible: true },
  },
  {
    id: "DRONES",
    type: "horizontal",
    position: { x: 950, y: 660 },
    data: { label: "DRONES - 4 LEVELS", color: "#34d399", collapsible: true },
  },

  {
    id: "3DPRINT",
    type: "horizontal",
    position: { x: 950, y: 730 },
    data: {
      label: "3D PRINTING - 3 LEVELS",
      color: "#60a5fa",
      collapsible: true,
    },
  },

  // WORKSHOPS & CAMPS children
  {
    id: "WORK_TECH",
    type: "horizontal",
    position: { x: 650, y: 740 },
    data: { label: "TECHNICAL", color: "#06b6d4", collapsible: true },
  },
  {
    id: "W_ROBOTICS_AI",
    type: "horizontal",
    position: { x: 950, y: 660 },
    data: { label: "ROBOTICS & AI", color: "#06b6d4" },
  },
  {
    id: "W_3DPRINT",
    type: "horizontal",
    position: { x: 950, y: 730 },
    data: { label: "3D PRINTING", color: "#06b6d4" },
  },
  {
    id: "W_DRONES",
    type: "horizontal",
    position: { x: 950, y: 790 },
    data: { label: "DRONES", color: "#06b6d4" },
  },
  {
    id: "W_POWERBI",
    type: "horizontal",
    position: { x: 950, y: 850 },
    data: { label: "POWER BI & EXCEL", color: "#06b6d4" },
  },
  {
    id: "WORK_NONTECH",
    type: "horizontal",
    position: { x: 650, y: 800 },
    data: { label: "NON-TECHNICAL", color: "#a78bfa", collapsible: true },
  },
  {
    id: "W_SOFTSKILLS",
    type: "horizontal",
    position: { x: 950, y: 740 },
    data: { label: "SOFT SKILLS", color: "#c4b5fd" },
  },
  {
    id: "W_DESIGN_THINKING",
    type: "horizontal",
    position: { x: 950, y: 800 },
    data: { label: "DESIGN THINKING", color: "#c4b5fd" },
  },
  {
    id: "W_PUBLIC_SPEAK",
    type: "horizontal",
    position: { x: 950, y: 860 },
    data: { label: "PUBLIC SPEAKING", color: "#c4b5fd" },
  },
  {
    id: "W_SCIENCE",
    type: "horizontal",
    position: { x: 950, y: 920 },
    data: { label: "SCIENCE", color: "#c4b5fd" },
  },
];

//
// 🕸️ EDGES - Enhanced styling
//
const initialEdges: Edge[] = [
  // ROOT CONNECTIONS
  {
    id: "e1",
    source: "ROOT",
    target: "ROBOTICS",
    type: "default",
    animated: true,
    style: { stroke: "#7e22ce", strokeWidth: 3 },
  },
  {
    id: "e4",
    source: "ROOT",
    target: "SKILL",
    type: "default",
    animated: true,
    style: { stroke: "#7e22ce", strokeWidth: 3 },
  },
  {
    id: "e5",
    source: "ROOT",
    target: "WORKSHOPS",
    type: "default",
    animated: true,
    style: { stroke: "#7e22ce", strokeWidth: 3 },
  },

  // ROBOTICS CONNECTIONS
  {
    id: "e6",
    source: "ROBOTICS",
    target: "AGE46",
    type: "default",
    style: { stroke: "#8b5cf6", strokeWidth: 2.5 },
  },
  {
    id: "e7",
    source: "ROBOTICS",
    target: "AGE69",
    type: "default",
    style: { stroke: "#8b5cf6", strokeWidth: 2.5 },
  },
  {
    id: "e8",
    source: "ROBOTICS",
    target: "AGE911",
    type: "default",
    style: { stroke: "#8b5cf6", strokeWidth: 2.5 },
  },
  {
    id: "e9",
    source: "ROBOTICS",
    target: "AGE1116",
    type: "default",
    style: { stroke: "#8b5cf6", strokeWidth: 2.5 },
  },

  // AGE 4–6
  {
    id: "e10",
    source: "AGE46",
    target: "KUBO1",
    type: "default",
    style: { stroke: "#4ade80", strokeWidth: 2 },
  },
  {
    id: "e11",
    source: "AGE46",
    target: "ESM",
    type: "default",
    style: { stroke: "#4ade80", strokeWidth: 2 },
  },
  {
    id: "e12",
    source: "AGE46",
    target: "BAMBINO",
    type: "default",
    style: { stroke: "#4ade80", strokeWidth: 2 },
  },

  // AGE 6–9
  {
    id: "e13",
    source: "AGE69",
    target: "KUBO2",
    type: "default",
    style: { stroke: "#22d3ee", strokeWidth: 2 },
  },
  {
    id: "e14",
    source: "AGE69",
    target: "SPM",
    type: "default",
    style: { stroke: "#22d3ee", strokeWidth: 2 },
  },
  {
    id: "e15",
    source: "AGE69",
    target: "CODE1",
    type: "default",
    style: { stroke: "#22d3ee", strokeWidth: 2 },
  },
  {
    id: "e16",
    source: "AGE69",
    target: "QUARKY1",
    type: "default",
    style: { stroke: "#22d3ee", strokeWidth: 2 },
  },
  {
    id: "e17",
    source: "AGE69",
    target: "PEECEE",
    type: "default",
    style: { stroke: "#22d3ee", strokeWidth: 2 },
  },
  {
    id: "e18",
    source: "AGE69",
    target: "SPIKE1",
    type: "default",
    style: { stroke: "#22d3ee", strokeWidth: 2 },
  },

  // AGE 9–11
  {
    id: "e19",
    source: "AGE911",
    target: "EARLY",
    type: "default",
    style: { stroke: "#fb923c", strokeWidth: 2 },
  },
  {
    id: "e20",
    source: "AGE911",
    target: "MINI",
    type: "default",
    style: { stroke: "#fb923c", strokeWidth: 2 },
  },

  // AGE 11–16
  {
    id: "e21",
    source: "AGE1116",
    target: "MECH",
    type: "default",
    style: { stroke: "#c084fc", strokeWidth: 2 },
  },
  {
    id: "e22",
    source: "MECH",
    target: "SPRIME",
    type: "default",
    style: { stroke: "#c084fc", strokeWidth: 2 },
  },
  {
    id: "e23",
    source: "MECH",
    target: "EV3",
    type: "default",
    style: { stroke: "#c084fc", strokeWidth: 2 },
  },
  {
    id: "e24",
    source: "MECH",
    target: "SPYTHON",
    type: "default",
    style: { stroke: "#c084fc", strokeWidth: 2 },
  },

  // NEW CONNECTIONS FROM AGE 11–16
  {
    id: "e62",
    source: "AGE1116",
    target: "CODING",
    type: "default",
    animated: true,
    style: { stroke: "#0891b2", strokeWidth: 2.5 },
  },
  {
    id: "e63",
    source: "AGE1116",
    target: "EMBEDDED",
    type: "default",
    animated: true,
    style: { stroke: "#0891b2", strokeWidth: 2.5 },
  },

  // CORE CODING PATHS
  {
    id: "e64",
    source: "CODING",
    target: "APP",
    type: "default",
    style: { stroke: "#06b6d4", strokeWidth: 2 },
  },
  {
    id: "e65",
    source: "CODING",
    target: "WEB",
    type: "default",
    style: { stroke: "#06b6d4", strokeWidth: 2 },
  },
  {
    id: "e66",
    source: "CODING",
    target: "PYTHON",
    type: "default",
    style: { stroke: "#06b6d4", strokeWidth: 2 },
  },
  {
    id: "e67",
    source: "CODING",
    target: "JAVA",
    type: "default",
    style: { stroke: "#06b6d4", strokeWidth: 2 },
  },
  {
    id: "e68",
    source: "CODING",
    target: "DSA",
    type: "default",
    style: { stroke: "#06b6d4", strokeWidth: 2 },
  },
  {
    id: "e69",
    source: "PYTHON",
    target: "PYBASIC",
    type: "default",
    style: { stroke: "#06b6d4", strokeWidth: 2 },
  },
  {
    id: "e70",
    source: "PYTHON",
    target: "PYADVANCE",
    type: "default",
    style: { stroke: "#06b6d4", strokeWidth: 2 },
  },

  // EMBEDDED PATHS
  {
    id: "e71",
    source: "EMBEDDED",
    target: "ARDUINO",
    type: "default",
    style: { stroke: "#14b8a6", strokeWidth: 2 },
  },
  {
    id: "e72",
    source: "EMBEDDED",
    target: "IOT",
    type: "default",
    style: { stroke: "#14b8a6", strokeWidth: 2 },
  },
  {
    id: "e73",
    source: "EMBEDDED",
    target: "RASP",
    type: "default",
    style: { stroke: "#14b8a6", strokeWidth: 2 },
  },
  // SKILL subtree edges
  {
    id: "e74",
    source: "SKILL",
    target: "AI_ROOT",
    type: "default",
    animated: true,
    style: { stroke: "#7e22ce", strokeWidth: 2.5 },
  },
  {
    id: "e75",
    source: "SKILL",
    target: "PBL",
    type: "default",
    animated: true,
    style: { stroke: "#7e22ce", strokeWidth: 2.5 },
  },
  {
    id: "e76",
    source: "SKILL",
    target: "EMERGING",
    type: "default",
    animated: true,
    style: { stroke: "#7e22ce", strokeWidth: 2.5 },
  },
  {
    id: "e77",
    source: "AI_ROOT",
    target: "QUARKY_AI",
    type: "default",
    style: { stroke: "#fb7185", strokeWidth: 2 },
  },
  {
    id: "e78",
    source: "AI_ROOT",
    target: "DEEP_LEARNING",
    type: "default",
    style: { stroke: "#fb7185", strokeWidth: 2 },
  },
  {
    id: "e79",
    source: "AI_ROOT",
    target: "MACHINE_LEARNING",
    type: "default",
    style: { stroke: "#fb7185", strokeWidth: 2 },
  },
  {
    id: "e80",
    source: "AI_ROOT",
    target: "AI_GENERAL",
    type: "default",
    style: { stroke: "#fb7185", strokeWidth: 2 },
  },
  {
    id: "e81",
    source: "AI_ROOT",
    target: "AI_INFUSED_ROBOTICS",
    type: "default",
    style: { stroke: "#fb7185", strokeWidth: 2 },
  },
  {
    id: "e82",
    source: "PBL",
    target: "PBL_SOFTWARE",
    type: "default",
    style: { stroke: "#fbbf24", strokeWidth: 2 },
  },
  {
    id: "e83",
    source: "PBL",
    target: "PBL_HARDWARE",
    type: "default",
    style: { stroke: "#fbbf24", strokeWidth: 2 },
  },
  {
    id: "e84",
    source: "PBL_SOFTWARE",
    target: "PBL_SW_BASIC",
    type: "default",
    style: { stroke: "#fde68a", strokeWidth: 2 },
  },
  {
    id: "e85",
    source: "PBL_SOFTWARE",
    target: "PBL_SW_INTERMEDIATE",
    type: "default",
    style: { stroke: "#fde68a", strokeWidth: 2 },
  },
  {
    id: "e86",
    source: "PBL_SOFTWARE",
    target: "PBL_SW_ADVANCE",
    type: "default",
    style: { stroke: "#fde68a", strokeWidth: 2 },
  },
  {
    id: "e87",
    source: "PBL_HARDWARE",
    target: "PBL_HW_BASIC",
    type: "default",
    style: { stroke: "#fde68a", strokeWidth: 2 },
  },
  {
    id: "e88",
    source: "PBL_HARDWARE",
    target: "PBL_HW_INTERMEDIATE",
    type: "default",
    style: { stroke: "#fde68a", strokeWidth: 2 },
  },
  {
    id: "e89",
    source: "PBL_HARDWARE",
    target: "PBL_HW_ADVANCE",
    type: "default",
    style: { stroke: "#fde68a", strokeWidth: 2 },
  },
  {
    id: "e90",
    source: "EMERGING",
    target: "DRONES",
    type: "default",
    style: { stroke: "#34d399", strokeWidth: 2 },
  },
  {
    id: "e91",
    source: "EMERGING",
    target: "3DPRINT",
    type: "default",
    style: { stroke: "#60a5fa", strokeWidth: 2 },
  },
  {
    id: "e92",
    source: "DRONES",
    target: "DRONE_L1",
    type: "default",
    style: { stroke: "#bbf7d0", strokeWidth: 2 },
  },
  {
    id: "e93",
    source: "DRONES",
    target: "DRONE_L2",
    type: "default",
    style: { stroke: "#bbf7d0", strokeWidth: 2 },
  },
  {
    id: "e94",
    source: "DRONES",
    target: "DRONE_L3",
    type: "default",
    style: { stroke: "#bbf7d0", strokeWidth: 2 },
  },
  {
    id: "e95",
    source: "DRONES",
    target: "DRONE_L4",
    type: "default",
    style: { stroke: "#bbf7d0", strokeWidth: 2 },
  },
  {
    id: "e96",
    source: "3DPRINT",
    target: "3DPRINT_L1",
    type: "default",
    style: { stroke: "#bfdbfe", strokeWidth: 2 },
  },
  {
    id: "e97",
    source: "3DPRINT",
    target: "3DPRINT_L2",
    type: "default",
    style: { stroke: "#bfdbfe", strokeWidth: 2 },
  },
  {
    id: "e98",
    source: "3DPRINT",
    target: "3DPRINT_L3",
    type: "default",
    style: { stroke: "#bfdbfe", strokeWidth: 2 },
  },
  // WORKSHOPS connections
  {
    id: "e99",
    source: "WORKSHOPS",
    target: "WORK_TECH",
    type: "default",
    animated: true,
    style: { stroke: "#7e22ce", strokeWidth: 2.5 },
  },
  {
    id: "e100",
    source: "WORKSHOPS",
    target: "WORK_NONTECH",
    type: "default",
    animated: true,
    style: { stroke: "#7e22ce", strokeWidth: 2.5 },
  },
  {
    id: "e101",
    source: "WORK_TECH",
    target: "W_ROBOTICS_AI",
    type: "default",
    style: { stroke: "#06b6d4", strokeWidth: 2 },
  },
  {
    id: "e102",
    source: "WORK_TECH",
    target: "W_3DPRINT",
    type: "default",
    style: { stroke: "#06b6d4", strokeWidth: 2 },
  },
  {
    id: "e103",
    source: "WORK_TECH",
    target: "W_DRONES",
    type: "default",
    style: { stroke: "#06b6d4", strokeWidth: 2 },
  },
  {
    id: "e104",
    source: "WORK_TECH",
    target: "W_POWERBI",
    type: "default",
    style: { stroke: "#06b6d4", strokeWidth: 2 },
  },
  {
    id: "e105",
    source: "WORK_NONTECH",
    target: "W_SOFTSKILLS",
    type: "default",
    style: { stroke: "#a78bfa", strokeWidth: 2 },
  },
  {
    id: "e106",
    source: "WORK_NONTECH",
    target: "W_DESIGN_THINKING",
    type: "default",
    style: { stroke: "#a78bfa", strokeWidth: 2 },
  },
  {
    id: "e107",
    source: "WORK_NONTECH",
    target: "W_PUBLIC_SPEAK",
    type: "default",
    style: { stroke: "#a78bfa", strokeWidth: 2 },
  },
  {
    id: "e108",
    source: "WORK_NONTECH",
    target: "W_SCIENCE",
    type: "default",
    style: { stroke: "#a78bfa", strokeWidth: 2 },
  },
];

// Inner component to use React Flow hooks
const FlowWithProvider = () => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>(
    {
      // Setting initial collapsed nodes
      ROOT: true,
      ROBOTICS: true,
      SKILL: true,
      WORKSHOPS: true,
      AGE46: true,
      AGE69: true,
      AGE911: true,
      AGE1116: true,
      MECH: true,
      CODING: true,
      EMBEDDED: true,
      // New SKILL and WORKSHOPS subtrees
      AI_ROOT: true,
      PBL: true,
      PBL_SOFTWARE: true,
      PBL_HARDWARE: true,
      EMERGING: true,
      DRONES: true,
      "3DPRINT": true,
      WORK_TECH: true,
      WORK_NONTECH: true,
    }
  );
  const [isMobile, setIsMobile] = useState(false);
  const { fitView, getNodes, setViewport } = useReactFlow();

  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  // Function to get node color for MiniMap
  const getNodeColor = useCallback((node: Node): string => {
    return (node.data.color as string) || "#3b82f6";
  }, []);

  // Align nodes in a line and adjust viewport
  const alignAndFitNodes = useCallback(
    (targetNodes: Node[]) => {
      if (targetNodes.length === 0) return;

      // Calculate bounding box with accurate node dimensions
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      targetNodes.forEach((node) => {
        // More accurate node dimensions based on actual styling
        const nodeWidth = 160; // minWidth from node styling
        const nodeHeight = 60; // Approximate height based on padding (14px top/bottom) + content

        minX = Math.min(minX, node.position.x);
        minY = Math.min(minY, node.position.y);
        maxX = Math.max(maxX, node.position.x + nodeWidth);
        maxY = Math.max(maxY, node.position.y + nodeHeight);
      });

      // Add padding (15% of the bounding box size)
      const width = maxX - minX;
      const height = maxY - minY;
      const paddingX = width * 0.15;
      const paddingY = height * 0.15;

      minX -= paddingX;
      minY -= paddingY;
      maxX += paddingX;
      maxY += paddingY;

      // Calculate the zoom level to fit all nodes in the viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const scaleX = viewportWidth / (maxX - minX);
      const scaleY = viewportHeight / (maxY - minY);

      // Use the smaller scale to ensure all nodes fit, but don't zoom in too much
      const zoom = Math.min(scaleX, scaleY, 1.2);

      // Calculate the position to center the nodes
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;

      // Corrected viewport positioning for React Flow
      const x = -centerX * zoom + viewportWidth / 2;
      const y = -centerY * zoom + viewportHeight / 2;

      // Set viewport to fit all nodes
      setViewport(
        {
          x,
          y,
          zoom,
        },
        { duration: 500 }
      );
    },
    [setViewport]
  );

  // Crop nodes to viewport with line alignment
  const handleCropNodes = useCallback(() => {
    // Get bounds of all nodes
    const allNodes = getNodes();
    if (allNodes.length === 0) return;

    // Align and fit all nodes
    alignAndFitNodes(allNodes);
  }, [getNodes, alignAndFitNodes]);

  // Fit view to show all nodes with line alignment
  const handleFitView = useCallback(() => {
    // Get bounds of all nodes
    const allNodes = getNodes();
    if (allNodes.length === 0) return;

    // Align and fit all nodes
    alignAndFitNodes(allNodes);
  }, [getNodes, alignAndFitNodes]);

  // Toggle node collapse/expand and auto-adjust viewport with line alignment
  const toggleNode = useCallback(
    (nodeId: string) => {
      setCollapsedNodes((prev) => {
        const isCurrentlyCollapsed = prev[nodeId];
        const newCollapsedState = {
          ...prev,
          [nodeId]: !isCurrentlyCollapsed,
        };

        // If we're expanding a node, auto-adjust viewport after state update
        if (isCurrentlyCollapsed) {
          // Node was collapsed, now expanding
          setTimeout(() => {
            // Get the expanded node and its children
            const nodeChildren: Record<string, string[]> = {
              ROOT: ["ROBOTICS", "SKILL", "WORKSHOPS"],
              ROBOTICS: ["AGE46", "AGE69", "AGE911", "AGE1116"],
              AGE46: ["KUBO1", "ESM", "BAMBINO"],
              AGE69: ["KUBO2", "SPM", "CODE1", "QUARKY1", "PEECEE", "SPIKE1"],
              AGE911: ["EARLY", "MINI"],
              AGE1116: ["MECH", "CODING", "EMBEDDED"],
              MECH: ["SPRIME", "EV3", "SPYTHON"],
              CODING: ["APP", "WEB", "PYTHON", "JAVA"],
              PYTHON: ["PYBASIC", "PYADVANCE"],
              JAVA: ["DSA"],
              EMBEDDED: ["ARDUINO", "IOT", "RASP"],
              // SKILL subtree
              SKILL: ["AI_ROOT", "PBL", "EMERGING"],
              AI_ROOT: [
                "QUARKY_AI",
                "DEEP_LEARNING",
                "MACHINE_LEARNING",
                "AI_GENERAL",
                "AI_INFUSED_ROBOTICS",
              ],
              PBL: ["PBL_SOFTWARE", "PBL_HARDWARE"],
              PBL_SOFTWARE: [
                "PBL_SW_BASIC",
                "PBL_SW_INTERMEDIATE",
                "PBL_SW_ADVANCE",
              ],
              PBL_HARDWARE: [
                "PBL_HW_BASIC",
                "PBL_HW_INTERMEDIATE",
                "PBL_HW_ADVANCE",
              ],
              EMERGING: ["DRONES", "3DPRINT"],
              DRONES: ["DRONE_L1", "DRONE_L2", "DRONE_L3", "DRONE_L4"],
              "3DPRINT": ["3DPRINT_L1", "3DPRINT_L2", "3DPRINT_L3"],
              // WORKSHOPS subtree
              WORKSHOPS: ["WORK_TECH", "WORK_NONTECH"],
              WORK_TECH: [
                "W_ROBOTICS_AI",
                "W_3DPRINT",
                "W_DRONES",
                "W_POWERBI",
              ],
              WORK_NONTECH: [
                "W_SOFTSKILLS",
                "W_DESIGN_THINKING",
                "W_PUBLIC_SPEAK",
                "W_SCIENCE",
              ],
            };

            // Get all nodes that should be visible after expansion
            const visibleNodeIds = new Set<string>();
            visibleNodeIds.add(nodeId);

            // Add children recursively
            const addChildren = (id: string) => {
              const children = nodeChildren[id] || [];
              children.forEach((childId) => {
                // Only add if child is not collapsed
                if (!newCollapsedState[childId]) {
                  visibleNodeIds.add(childId);
                  addChildren(childId);
                }
              });
            };

            addChildren(nodeId);

            // Get positions of visible nodes
            const visibleNodes = getNodes().filter((node) =>
              visibleNodeIds.has(node.id)
            );

            if (visibleNodes.length > 0) {
              // Align and fit visible nodes
              alignAndFitNodes(visibleNodes);
            }
          }, 100);
        }

        return newCollapsedState;
      });
    },
    [getNodes, setViewport, alignAndFitNodes]
  );

  // Expand all nodes with line alignment
  const handleExpandAll = useCallback(() => {
    setCollapsedNodes({});
    // Auto-adjust viewport after expanding all nodes
    setTimeout(() => {
      // Get bounds of all nodes
      const allNodes = getNodes();
      if (allNodes.length === 0) return;

      // Align and fit all nodes
      alignAndFitNodes(allNodes);
    }, 100);
  }, [getNodes, alignAndFitNodes]);

  // Get nodes that should be hidden based on collapsed nodes
  const getHiddenNodes = useCallback(() => {
    const hiddenNodes = new Set<string>();

    // Define node hierarchy relationships
    const nodeChildren: Record<string, string[]> = {
      ROOT: ["ROBOTICS", "SKILL", "WORKSHOPS"],
      ROBOTICS: ["AGE46", "AGE69", "AGE911", "AGE1116"],
      AGE46: ["KUBO1", "ESM", "BAMBINO"],
      AGE69: ["KUBO2", "SPM", "CODE1", "QUARKY1", "PEECEE", "SPIKE1"],
      AGE911: ["EARLY", "MINI"],
      AGE1116: ["MECH", "CODING", "EMBEDDED"],
      MECH: ["SPRIME", "EV3", "SPYTHON"],
      CODING: ["APP", "WEB", "PYTHON", "JAVA"],
      PYTHON: ["PYBASIC", "PYADVANCE"],
      JAVA: ["DSA"],
      EMBEDDED: ["ARDUINO", "IOT", "RASP"],
      // SKILL subtree
      SKILL: ["AI_ROOT", "PBL", "EMERGING"],
      AI_ROOT: [
        "QUARKY_AI",
        "DEEP_LEARNING",
        "MACHINE_LEARNING",
        "AI_GENERAL",
        "AI_INFUSED_ROBOTICS",
      ],
      PBL: ["PBL_SOFTWARE", "PBL_HARDWARE"],
      PBL_SOFTWARE: ["PBL_SW_BASIC", "PBL_SW_INTERMEDIATE", "PBL_SW_ADVANCE"],
      PBL_HARDWARE: ["PBL_HW_BASIC", "PBL_HW_INTERMEDIATE", "PBL_HW_ADVANCE"],
      EMERGING: ["DRONES", "3DPRINT"],
      DRONES: ["DRONE_L1", "DRONE_L2", "DRONE_L3", "DRONE_L4"],
      "3DPRINT": ["3DPRINT_L1", "3DPRINT_L2", "3DPRINT_L3"],
      // WORKSHOPS subtree
      WORKSHOPS: ["WORK_TECH", "WORK_NONTECH"],
      WORK_TECH: ["W_ROBOTICS_AI", "W_3DPRINT", "W_DRONES", "W_POWERBI"],
      WORK_NONTECH: [
        "W_SOFTSKILLS",
        "W_DESIGN_THINKING",
        "W_PUBLIC_SPEAK",
        "W_SCIENCE",
      ],
    };

    // Check each collapsed node and hide its children
    Object.entries(collapsedNodes).forEach(([nodeId, isCollapsed]) => {
      if (isCollapsed && nodeChildren[nodeId]) {
        const hideChildren = (children: string[]) => {
          children.forEach((childId) => {
            hiddenNodes.add(childId);
            if (nodeChildren[childId]) {
              hideChildren(nodeChildren[childId]);
            }
          });
        };
        hideChildren(nodeChildren[nodeId]);
      }
    });

    return hiddenNodes;
  }, [collapsedNodes]);

  // Get edges that should be hidden based on collapsed nodes
  const getHiddenEdges = useCallback(() => {
    const hiddenEdges = new Set<string>();

    // Get hidden nodes to determine which edges to hide
    const hiddenNodes = getHiddenNodes();

    // Hide edges connected to hidden nodes
    edges.forEach((edge) => {
      if (hiddenNodes.has(edge.source) || hiddenNodes.has(edge.target)) {
        hiddenEdges.add(edge.id);
      }
    });

    return hiddenEdges;
  }, [edges, getHiddenNodes]);

  // Get visible nodes
  const visibleNodes = useCallback(() => {
    const hiddenNodes = getHiddenNodes();
    return nodes.filter((node) => !hiddenNodes.has(node.id));
  }, [nodes, getHiddenNodes]);

  // Get visible edges
  const visibleEdges = useCallback(() => {
    const hiddenEdges = getHiddenEdges();
    return edges.filter((edge) => !hiddenEdges.has(edge.id));
  }, [edges, getHiddenEdges]);

  // Custom node renderer with collapse/expand functionality
  const HorizontalNodeWithCollapse = memo(
    ({
      data,
      id,
    }: {
      data: {
        label: string;
        color?: string;
        link?: string;
        collapsible?: boolean;
      };
      id: string;
    }) => (
      <HorizontalNode
        data={data}
        isCollapsed={collapsedNodes[id] || false}
        onToggle={() => toggleNode(id)}
      />
    )
  );
  HorizontalNodeWithCollapse.displayName = "HorizontalNodeWithCollapse";

  const nodeTypesWithCollapse = {
    horizontal: HorizontalNodeWithCollapse,
  };

  return (
    <>
      <ViewportControls
        onFitView={handleFitView}
        onCropNodes={handleCropNodes}
        onExpandAll={handleExpandAll}
      />
      <ReactFlow
        nodes={visibleNodes()}
        edges={visibleEdges()}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypesWithCollapse}
        fitView
        defaultEdgeOptions={{
          type: "default",
          animated: false,
        }}
        // Mobile-specific settings
        zoomOnScroll={isMobile ? false : true}
        panOnScroll={isMobile ? true : false}
        panOnDrag={isMobile ? true : true}
        zoomOnPinch={isMobile ? true : true}
        panOnScrollSpeed={isMobile ? 2 : 1}
      >
        <MiniMap
          nodeColor={getNodeColor}
          maskColor="rgba(0, 0, 0, 0.6)"
          style={{ background: "rgba(255, 255, 255, 0.9)", borderRadius: 8 }}
        />
        <Controls
          style={{ background: "rgba(255, 255, 255, 0.9)", borderRadius: 8 }}
        />
        <Background
          gap={20}
          size={1.5}
          color="rgba(255, 255, 255, 0.3)"
          style={{ background: "transparent" }}
        />
      </ReactFlow>

      {/* Mobile instructions */}
      {isMobile && (
        <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm bg-black/30 p-2 rounded-lg mx-4">
          Swipe to pan, pinch to zoom
        </div>
      )}
    </>
  );
};

//
// ⚙️ MAIN COMPONENT
//
const MindMap = () => {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "white",
      }}
    >
      <ReactFlowProvider>
        <FlowWithProvider />
      </ReactFlowProvider>
    </div>
  );
};

export default MindMap;
