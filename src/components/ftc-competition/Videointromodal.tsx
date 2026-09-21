"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { X, Volume2, VolumeX } from "lucide-react";

interface VideoIntroModalProps {
  /** Path to the 9:16 video (mp4) */
  videoSrc: string;
  /** Optional poster image shown before the video loads */
  posterSrc?: string;
  /**
   * sessionStorage key used to remember the popup has already been shown
   * this browser session. Change it if you ever run multiple modals.
   */
  storageKey?: string;
  /** Show every time instead of once per session (default: false) */
  alwaysShow?: boolean;
  /** Milliseconds after opening before muted video playback begins (default: 0) */
  autoPlayDelayMs?: number;
  /** Milliseconds after opening before the video auto-unmutes (default: 3500) */
  unmuteDelayMs?: number;
}

export default function VideoIntroModal({
  videoSrc,
  posterSrc,
  storageKey = "ftc_intro_video_shown",
  alwaysShow = false,
  autoPlayDelayMs = 0,
  unmuteDelayMs = 3500,
}: VideoIntroModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Decide whether to show, on mount only (client-side)
  useEffect(() => {
    const shouldShow = alwaysShow || !sessionStorage.getItem(storageKey);
    if (shouldShow) {
      setIsOpen(true);
    }
  }, [alwaysShow, storageKey]);

  // Lock background scroll while open, move focus to close button
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    if (!alwaysShow) {
      sessionStorage.setItem(storageKey, "true");
    }
  }, [alwaysShow, storageKey]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  // Video starts autoplay muted (required by browsers), then we
  // automatically unmute it a few seconds in. Some browsers still refuse
  // an unrequested unmute, so we swallow that quietly and leave the
  // manual mute/unmute button as a fallback.
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      const video = videoRef.current;
      if (!video) return;
      video.muted = true;
      video
        .play()
        .then(() => setIsMuted(true))
        .catch(() => {
          // Browser refused unmuted playback — stay muted, user can
          // tap the speaker icon themselves.
          video.muted = true;
          setIsMuted(true);
        });
    }, autoPlayDelayMs);

    return () => clearTimeout(timer);
  }, [isOpen, autoPlayDelayMs]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      const video = videoRef.current;
      if (!video || video.paused) return;
      video.muted = false;
      setIsMuted(false);
    }, autoPlayDelayMs + unmuteDelayMs);

    return () => clearTimeout(timer);
  }, [isOpen, autoPlayDelayMs, unmuteDelayMs]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Introduction video"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-[fadeIn_300ms_ease]"
      onMouseDown={(e) => {
        // Close only when the backdrop itself (not the video card) is clicked
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Video card */}
      <div className="relative w-full max-w-[380px] aspect-[9/16] max-h-[88vh] rounded-2xl overflow-hidden shadow-2xl bg-black">
        <video
          ref={videoRef}
          src={videoSrc}
          poster={posterSrc}
          muted={isMuted}
          preload="metadata"
          loop
          playsInline
          controls={false}
          className="w-full h-full object-cover"
        />

        {/* Close button */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={handleClose}
          aria-label="Close video"
          className="absolute top-3 right-3 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-black/50 text-white border border-white/30 backdrop-blur-sm transition-transform duration-150 hover:scale-105 hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <X size={18} strokeWidth={2.4} />
        </button>

        {/* Mute/unmute toggle */}
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? "Unmute video" : "Mute video"}
          className="absolute bottom-3 right-3 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-black/50 text-white border border-white/30 backdrop-blur-sm transition-transform duration-150 hover:scale-105 hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {isMuted ? (
            <VolumeX size={18} strokeWidth={2.4} />
          ) : (
            <Volume2 size={18} strokeWidth={2.4} />
          )}
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          div[role="dialog"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
