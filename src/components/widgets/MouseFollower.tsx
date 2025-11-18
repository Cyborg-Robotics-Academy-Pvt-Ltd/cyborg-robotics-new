"use client";

import React, { useEffect, useRef } from "react";

const MouseFollower: React.FC = () => {
  const followerRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const size = 9;

  useEffect(() => {
    if (!followerRef.current) return;

    const moveCircle = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };

      if (followerRef.current) {
        followerRef.current.style.transform = `translate(${e.clientX - size / 2}px, ${e.clientY - size / 2}px)`;
      }
    };

    const initDelayedMovement = () => {
      const x = posRef.current.x;
      const y = posRef.current.y;

      if (followerRef.current) {
        followerRef.current.style.transition = "transform 0.1s ease-out";
        followerRef.current.style.transform = `translate(${x - size / 2}px, ${y - size / 2}px)`;
      }
    };

    window.addEventListener("mousemove", moveCircle);

    // Initialize with delayed movement effect
    setTimeout(initDelayedMovement, 100);

    return () => {
      window.removeEventListener("mousemove", moveCircle);
    };
  }, []);

  return (
    <div
      ref={followerRef}
      className="fixed top-0 left-0 rounded-full pointer-events-none z-[9999]"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: "#892B2C",
        transform: "translate(-100px, -100px)",
        transition: "transform 0.05s ease-out",
      }}
    />
  );
};

export default MouseFollower;
