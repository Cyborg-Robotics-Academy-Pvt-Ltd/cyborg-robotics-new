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
          fontWeight: 700,
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
              background: isCollapsed ? "#ef4444" : "#22c55e",
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
            {!isCollapsed && (
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
    position: { x: 350, y: 400 },
    data: { label: "ROBOTICS", color: "#7e22ce", collapsible: true },
  },
  {
    id: "SKILL",
    type: "horizontal",
    position: { x: 350, y: 900 },
    data: { label: "SKILL BASED", color: "#7e22ce", collapsible: true },
  },
  {
    id: "WORKSHOPS",
    type: "horizontal",
    position: { x: 350, y: 1200 },
    data: { label: "WORKSHOPS & CAMPS", color: "#7e22ce", collapsible: true },
  },

  //
  // ROBOTICS AGE GROUPS
  //
  {
    id: "AGE46",
    type: "horizontal",
    position: { x: 650, y: 100 },
    data: { label: "AGE 4-6", color: "#4ade80", collapsible: true },
  },
  {
    id: "AGE69",
    type: "horizontal",
    position: { x: 650, y: 350 },
    data: { label: "AGE 6-9", color: "#8b5cf6", collapsible: true },
  },
  {
    id: "AGE911",
    type: "horizontal",
    position: { x: 650, y: 600 },
    data: { label: "AGE 9-11", color: "#8b5cf6", collapsible: true },
  },
  {
    id: "AGE1116",
    type: "horizontal",
    position: { x: 650, y: 850 },
    data: { label: "AGE 11-16", color: "#ed6565", collapsible: true },
  },

  //
  // AGE 4–6 COURSES
  //
  {
    id: "KUBO1",
    type: "horizontal",
    position: { x: 950, y: 50 },
    data: {
      label: "KUBO - 2 Levels",
      color: "#4ade80",
      link: "/classroom-courses/bambino-coding",
    },
  },
  {
    id: "ESM",
    type: "horizontal",
    position: { x: 970, y: 130 },
    data: {
      label: "Early Simple Machine",
      color: "#4ade80",
      link: "/classroom-courses/early-simple-machines",
    },
  },
  {
    id: "BAMBINO",
    type: "horizontal",
    position: { x: 950, y: 200 },
    data: {
      label: "Bambino Coding - 2 Levels",
      color: "#4ade80",
      link: "/online-courses/bambino-coding",
    },
  },

  //
  // AGE 6–9 COURSES
  //
  {
    id: "KUBO2",
    type: "horizontal",
    position: { x: 950, y: 380 },
    data: {
      label: "KUBO - 1 Level",
      color: "#22d3ee",
      link: "/classroom-courses/bambino-coding",
    },
  },
  {
    id: "SPM",
    type: "horizontal",
    position: { x: 950, y: 440 },
    data: {
      label: "Simple & Powered Machines",
      color: "#22d3ee",
      link: "/classroom-courses/simple-powered-machines",
    },
  },
  {
    id: "CODE1",
    type: "horizontal",
    position: { x: 950, y: 500 },
    data: { label: "Code.org - 2 Levels", color: "#22d3ee" },
  },
  {
    id: "QUARKY1",
    type: "horizontal",
    position: { x: 950, y: 560 },
    data: { label: "Quarky Robotics & AI - 2 Levels", color: "#22d3ee" },
  },

  //
  // AGE 6–9 ADDITIONAL COURSES (Second column)
  //
  {
    id: "PEECEE",
    type: "horizontal",
    position: { x: 950, y: 320 },
    data: {
      label: "PEECEE - 2 Levels",
      color: "#22d3ee",
      link: "/classroom-courses/arduino",
    },
  },
  {
    id: "SPIKE1",
    type: "horizontal",
    position: { x: 950, y: 265 },
    data: {
      label: "SPIKE Essential - 2 Levels",
      color: "#22d3ee",
      link: "/classroom-courses/spike-pneumatics",
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
      link: "/classroom-courses/electronics",
    },
  },
  {
    id: "MINI",
    type: "horizontal",
    position: { x: 950, y: 730 },
    data: {
      label: "Mini Electronics - 2 Levels",
      color: "#fb923c",
      link: "/classroom-courses/electronics",
    },
  },

  //
  // AGE 11–16 ROBOTICS COURSES
  //
  {
    id: "MECH",
    type: "horizontal",
    position: { x: 950, y: 850 },
    data: { label: "MECHANICAL + CODING", color: "#c084fc", collapsible: true },
  },
  {
    id: "SPRIME",
    type: "horizontal",
    position: { x: 1300, y: 820 },
    data: {
      label: "SPIKE Prime - 4 Levels",
      color: "#c084fc",
      link: "/classroom-courses/spike-prime",
    },
  },
  {
    id: "EV3",
    type: "horizontal",
    position: { x: 1300, y: 900 },
    data: {
      label: "EV3 - 4 Levels",
      color: "#c084fc",
      link: "/classroom-courses/robotics-ev3",
    },
  },
  {
    id: "SPYTHON",
    type: "horizontal",
    position: { x: 1300, y: 980 },
    data: {
      label: "SPIKE + Python - Levels",
      color: "#c084fc",
      link: "/classroom-courses/spike-prime",
    },
  },

  //
  // CORE CODING
  //
  {
    id: "CODING",
    type: "horizontal",
    position: { x: 950, y: 1100 },
    data: { label: "CORE CODING", color: "#0891b2", collapsible: true },
  },
  {
    id: "APP",
    type: "horizontal",
    position: { x: 1300, y: 1070 },
    data: {
      label: "Application Designing - 4 Levels",
      color: "#06b6d4",
      link: "/online-courses/app-designing",
    },
  },
  {
    id: "WEB",
    type: "horizontal",
    position: { x: 1300, y: 1150 },
    data: {
      label: "Web Designing - 4 Levels",
      color: "#06b6d4",
      link: "/online-courses/web-designing",
    },
  },
  {
    id: "PYTHON",
    type: "horizontal",
    position: { x: 1300, y: 1230 },
    data: {
      label: "Python",
      color: "#06b6d4",
      link: "/online-courses/python-language",
    },
  },
  {
    id: "PYBASIC",
    type: "horizontal",
    position: { x: 1650, y: 1200 },
    data: {
      label: "Basic - 3 Levels",
      color: "#06b6d4",
      link: "/online-courses/python-language",
    },
  },
  {
    id: "PYADVANCE",
    type: "horizontal",
    position: { x: 1650, y: 1280 },
    data: {
      label: "Advance - 2 Levels",
      color: "#06b6d4",
      link: "/online-courses/python-language",
    },
  },
  {
    id: "JAVA",
    type: "horizontal",
    position: { x: 1300, y: 1350 },
    data: {
      label: "Java - 3 Levels",
      color: "#06b6d4",
      link: "/online-courses/java",
    },
  },
  {
    id: "DSA",
    type: "horizontal",
    position: { x: 1300, y: 1430 },
    data: {
      label: "DSA - 2 Levels",
      color: "#06b6d4",
      link: "/online-courses/java",
    },
  },

  //
  // EMBEDDED SYSTEMS
  //
  {
    id: "EMBEDDED",
    type: "horizontal",
    position: { x: 950, y: 1550 },
    data: { label: "EMBEDDED", color: "#0891b2", collapsible: true },
  },
  {
    id: "ARDUINO",
    type: "horizontal",
    position: { x: 1300, y: 1520 },
    data: {
      label: "Basic Electronics + Arduino - 3 Levels",
      color: "#14b8a6",
      link: "/classroom-courses/arduino",
    },
  },
  {
    id: "IOT",
    type: "horizontal",
    position: { x: 1300, y: 1600 },
    data: { label: "IoT", color: "#14b8a6", link: "/classroom-courses/iot" },
  },
  {
    id: "RASP",
    type: "horizontal",
    position: { x: 1300, y: 1680 },
    data: { label: "Raspberry", color: "#14b8a6" },
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
              SKILL: [],
              WORKSHOPS: [],
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
      SKILL: [],
      WORKSHOPS: [],
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
export default function CoursesFlow() {
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
}
