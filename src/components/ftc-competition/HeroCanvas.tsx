// components/HeroCanvas.tsx
"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import { useFrameSequence } from "@/hooks/useFrameSequence";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { HeroOverlays } from "./HeroOverlays";
import Image from "next/image";

const FRAME_COUNT = 192;
const SECTION_BG_STYLE = { backgroundColor: "#000000" };

// Cap the drawn image to this fraction of the viewport (both axes).
const MAX_SIZE_RATIO = 0.65; // 65vh / 65vw equivalent

function getFrameUrl(index: number) {
  return `/frames/robot-explode/frame-${String(index + 1).padStart(4, "0")}.png`;
}

export function HeroCanvas() {
  const pinRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isPinned, setIsPinned] = useState(false);
  const [isNearViewport, setIsNearViewport] = useState(false);

  const getUrl = useMemo(() => (i: number) => getFrameUrl(i), []);

  const { images, isReady } = useFrameSequence({
    frameCount: FRAME_COUNT,
    getFrameUrl: getUrl,
    enabled: isNearViewport && !prefersReducedMotion,
  });

  // progress lives in a ref — updated on scroll, read by rAF loop.
  // Overlays still need a render-triggering value, so we get both.
  const { progress, progressRef } = useScrollProgress(pinRef);

  const lastDrawnIndex = useRef(-1);

  // Use a fixed viewport layer while this section owns the scroll. This avoids
  // sticky positioning being broken by a parent layout's overflow styles.
  useEffect(() => {
    const section = pinRef.current;
    if (!section || prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  useEffect(() => {
    const updatePinState = () => {
      const section = pinRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      // Hold the last frame through the section's remaining viewport space,
      // rather than revealing the container's black background.
      setIsPinned(rect.top <= 0 && rect.bottom > 0);
    };

    updatePinState();
    window.addEventListener("scroll", updatePinState, { passive: true });
    window.addEventListener("resize", updatePinState);

    return () => {
      window.removeEventListener("scroll", updatePinState);
      window.removeEventListener("resize", updatePinState);
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || !isNearViewport || !isPinned) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lastDrawnIndex.current = -1;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (index: number) => {
      const img = images[index];
      if (!img) return;

      // Clear to transparent instead of filling a flat color — lets the
      // shared section background on the parent show through around the
      // contained image on every frame.
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const cw = window.innerWidth;
      const ch = window.innerHeight;

      // Contain-fit within a capped box, centered — not full-bleed cover.
      const maxW = cw * MAX_SIZE_RATIO;
      const maxH = ch * MAX_SIZE_RATIO;
      const scale = Math.min(maxW / img.width, maxH / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      const x = (cw - w) / 2;
      const y = (ch - h) / 2;
      ctx.drawImage(img, x, y, w, h);
    };

    const findLoadedFrame = (targetIndex: number) => {
      for (let i = targetIndex; i >= 0; i -= 1) {
        if (images[i]) return i;
      }
      for (let i = targetIndex + 1; i < FRAME_COUNT; i += 1) {
        if (images[i]) return i;
      }
      return -1;
    };

    const loop = () => {
      const targetIndex = Math.min(
        FRAME_COUNT - 1,
        Math.round(progressRef.current * (FRAME_COUNT - 1)),
      );
      const frameIndex = findLoadedFrame(targetIndex);

      if (frameIndex >= 0 && lastDrawnIndex.current !== frameIndex) {
        draw(frameIndex);
        lastDrawnIndex.current = frameIndex;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
    // images identity changes as frames finish loading — intentional re-run.
    // progressRef is a ref, never triggers re-run. prefersReducedMotion is stable per mount.
  }, [images, prefersReducedMotion, isNearViewport, isPinned]);

  if (prefersReducedMotion) {
    return (
      <section className="relative w-full" style={SECTION_BG_STYLE}>
        <div className="flex min-h-screen items-center justify-center rounded-4xl">
          <Image
            src={getFrameUrl(FRAME_COUNT - 1)}
            alt="FTC competition "
            className="max-h-[65vh] max-w-[85vw] object-cover rounded-2xl"
          />
        </div>
      </section>
    );
  }

  return (
    <div
      ref={pinRef}
      className="relative isolate"
      style={{ height: "300vh", ...SECTION_BG_STYLE }}
    >
      <div
        className={`${isPinned ? "fixed inset-0 z-40" : "absolute inset-x-0 top-0"} h-screen w-full overflow-hidden`}
        style={SECTION_BG_STYLE}
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        <HeroOverlays progress={progress} />
        {!isReady && (
          <div
            className="absolute inset-0 flex items-center justify-center text-sm tracking-widest"
            style={{ color: "rgba(237,232,224,0.55)", ...SECTION_BG_STYLE }}
          >
            LOADING
          </div>
        )}
      </div>
    </div>
  );
}
