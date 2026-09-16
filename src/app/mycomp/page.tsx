"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { githubDark } from "@uiw/codemirror-theme-github";

declare global {
  interface Window {
    loadPyodide: any;
  }
}

const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Categories", href: "#categories" },
  { label: "Scoring", href: "#scoring" },
  { label: "Timeline", href: "#timeline" },
  { label: "Rewards", href: "#rewards" },
  { label: "FAQ", href: "#faq" },
];

const BADGES = [
  { label: "CodeFest 1.0", variant: "solid" as const },
  { label: "Python-based", variant: "outline" as const, icon: "🐍" },
  { label: "Submission-based hackathon", variant: "outline" as const },
];

const STATS = [
  {
    value: "Ages 11–21",
    label: "Two categories",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <path
          d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20c0-3.3 3.6-6 8-6s8 2.7 8 6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    value: "100% Python",
    label: "Coding language",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <path
          d="M9 3h6a2 2 0 012 2v3H7V5a2 2 0 012-2zM7 8h10v8a2 2 0 01-2 2H9a2 2 0 01-2-2V8z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <circle cx="9.5" cy="5.5" r="0.6" fill="currentColor" />
        <circle cx="14.5" cy="18.5" r="0.6" fill="currentColor" />
      </svg>
    ),
  },
  {
    value: "Submission",
    label: "Video + source code",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
        <path
          d="M5 4h11l3 3v13a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M9 13l2 2 4-4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const DEFAULT_CODE = `# CodeFest 1.0 — build your entry
class Participant:
    def build_project(self):
        idea = "solve a real problem"
        stack = "Python"
        return self.submit(idea, stack)

    def submit(self, idea, stack):
        return f"Submitted: {idea} using {stack}"

print(Participant().build_project())`;

const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js";

/* ---------------- Try-it callout (points at the Run button) ---------------- */

function TryItCallout({
  dismissed,
  onDismiss,
}: {
  dismissed: boolean;
  onDismiss: () => void;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (dismissed) return null;

  return (
    <motion.div
      initial={
        prefersReducedMotion ? false : { opacity: 0, y: -10, scale: 0.96 }
      }
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="absolute -top-16 right-2 z-20 hidden sm:block lg:-top-[4.5rem] lg:right-10"
    >
      <div className="relative -rotate-[2deg] rounded-2xl border border-orange-200/80 bg-white/95 px-4 py-3 shadow-[0_18px_38px_-16px_rgba(220,38,38,0.35)] backdrop-blur-sm">
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] text-[#94A3B8] shadow-sm ring-1 ring-slate-200 transition hover:text-[#475569]"
        >
          ✕
        </button>

        <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-[#C2410C] ring-1 ring-orange-200/80">
          <span className="h-1.5 w-1.5 rounded-full bg-[#f97316]" />
          For trial
        </span>

        <p className="font-syne whitespace-nowrap text-[14px] font-bold leading-tight text-[#0B1220]">
          Try it yourself!
          <span
            aria-hidden
            className={`ml-1 inline-block w-[2px] translate-y-[1px] bg-[#dc2626] ${
              prefersReducedMotion ? "" : "animate-pulse"
            }`}
            style={{ height: "0.85em" }}
          />
        </p>
        <p className="mt-0.5 whitespace-nowrap text-[11.5px] text-[#64748B]">
          Type your Python code &amp; click Run
        </p>

        {/* curved hand-drawn arrow, sweeping down to the Run button */}
        <svg
          viewBox="0 0 120 100"
          className="pointer-events-none absolute left-1/2 top-full h-[92px] w-[130px] -translate-x-[62%] text-[#f97316]"
          aria-hidden
        >
          <path
            d="M14 4 C 6 30, 30 40, 46 46 C 74 54, 88 58, 100 78"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="1 7"
          />
          <path
            d="M100 78 L91 68 M100 78 L86 82"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </motion.div>
  );
}

/* ---------------- Python Playground ---------------- */

type OutputLine = { text: string; isError: boolean };

function PythonPlayground() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState<OutputLine[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "running">("idle");
  const [copied, setCopied] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [calloutDismissed, setCalloutDismissed] = useState(false);
  const [hasEdited, setHasEdited] = useState(false);

  const prefersReducedMotion = useReducedMotion();
  const pyodideRef = useRef<any>(null);
  const loadingPromiseRef = useRef<Promise<any> | null>(null);
  const editorWrapRef = useRef<HTMLDivElement>(null);
  // avoids re-binding the keydown listener on every keystroke
  const codeRef = useRef(code);
  const statusRef = useRef(status);
  codeRef.current = code;
  statusRef.current = status;

  function loadScriptOnce(src: string) {
    return new Promise<void>((resolve, reject) => {
      const existing = document.querySelector(
        `script[src="${src}"]`,
      ) as HTMLScriptElement | null;
      if (existing) {
        if (window.loadPyodide) return resolve();
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () =>
          reject(new Error("Failed to load Pyodide script")),
        );
        return;
      }
      const s = document.createElement("script");
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load Pyodide script"));
      document.body.appendChild(s);
    });
  }

  async function loadPyodideOnce() {
    if (pyodideRef.current) return pyodideRef.current;
    // dedupe concurrent calls (e.g. double-click before first resolves)
    if (loadingPromiseRef.current) return loadingPromiseRef.current;

    setStatus("loading");
    setLoadError(null);

    loadingPromiseRef.current = (async () => {
      try {
        await loadScriptOnce(PYODIDE_CDN);
        const instance = await window.loadPyodide();
        pyodideRef.current = instance;
        return instance;
      } catch (err: any) {
        setLoadError(err?.message || "Couldn't load the Python runtime.");
        throw err;
      } finally {
        loadingPromiseRef.current = null;
      }
    })();

    return loadingPromiseRef.current;
  }

  const runCode = useCallback(async () => {
    setCalloutDismissed(true);
    setOutput([]);
    let pyodide;
    try {
      pyodide = await loadPyodideOnce();
    } catch {
      setStatus("idle");
      return;
    }

    setStatus("running");
    pyodide.setStdout({
      batched: (s: string) => {
        if (!s) return;
        setOutput((p) => [...p, { text: s, isError: false }]);
      },
    });

    try {
      await Promise.race([
        pyodide.runPythonAsync(codeRef.current),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timed out (10s limit)")), 10000),
        ),
      ]);
    } catch (err: any) {
      const message = String(err?.message ?? err)
        .split("\n")
        .pop();
      setOutput((p) => [...p, { text: `Error: ${message}`, isError: true }]);
    } finally {
      setStatus("idle");
    }
  }, []);

  function resetCode() {
    setCode(DEFAULT_CODE);
    setOutput([]);
    setLoadError(null);
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard permission denied / insecure context — fail silently, no crash
    }
  }

  // Cmd/Ctrl+Enter to run — bound once, reads latest state via refs
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isRunShortcut = (e.metaKey || e.ctrlKey) && e.key === "Enter";
      if (!isRunShortcut) return;
      if (!editorWrapRef.current?.contains(document.activeElement)) return;
      e.preventDefault();
      if (statusRef.current === "idle") runCode();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [runCode]);

  const isBusy = status !== "idle";

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      className="relative w-full"
    >
      <div
        className="absolute -inset-6 rounded-[2rem] opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(60% 60% at 30% 20%, rgba(8,85,171,0.22) 0%, rgba(8,85,171,0) 70%), radial-gradient(50% 50% at 85% 85%, rgba(168,27,30,0.10) 0%, rgba(168,27,30,0) 70%)",
        }}
      />

      <TryItCallout
        dismissed={calloutDismissed}
        onDismiss={() => setCalloutDismissed(true)}
      />

      <div
        ref={editorWrapRef}
        className="relative rounded-[1.4rem] overflow-hidden bg-[#08111f] border border-white/10 shadow-[0_35px_90px_-28px_rgba(37,99,235,0.5)] rotate-0 lg:rotate-[0.5deg] focus-within:ring-2 focus-within:ring-[#60a5fa]/40 transition-all duration-500 hover:-translate-y-1 hover:rotate-0"
      >
        <div className="flex items-center gap-2 px-4 py-3.5 bg-[#111a28] border-b border-white/10">
          <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
          <span className="ml-2 text-sm" aria-hidden>
            🐍
          </span>
          <span className="text-xs text-gray-400 font-mono truncate">
            codefest_submission.py
          </span>

          <span className="ml-2 hidden items-center gap-1 rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-gray-500 sm:flex">
            {"</>"}
          </span>
          <span className="hidden items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 sm:flex">
            <span
              className={`h-1.5 w-1.5 rounded-full bg-emerald-400 ${
                prefersReducedMotion ? "" : "animate-pulse"
              }`}
            />
            Editable
          </span>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={copyCode}
              className="hidden sm:flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md text-gray-400 hover:text-gray-200 hover:bg-white/5 transition-colors"
              aria-label="Copy code"
            >
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={resetCode}
              disabled={isBusy}
              className="hidden sm:flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md text-gray-400 hover:text-gray-200 hover:bg-white/5 disabled:opacity-40 transition-colors"
              aria-label="Reset code"
            >
              Reset
            </button>
            <button
              onClick={runCode}
              disabled={isBusy}
              className="relative flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-md bg-green-600 hover:bg-green-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400"
              aria-label="Run code (Cmd or Ctrl + Enter)"
            >
              {!calloutDismissed && !prefersReducedMotion && (
                <span className="absolute inset-0 -z-10 rounded-md bg-green-500/60 animate-ping" />
              )}
              {status === "loading" ? (
                <>
                  <span className="h-3 w-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Loading…
                </>
              ) : status === "running" ? (
                <>
                  <span className="h-3 w-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Running…
                </>
              ) : (
                <>▶ Run</>
              )}
            </button>
          </div>
        </div>

        <div className="relative">
          <CodeMirror
            value={code}
            onChange={(val) => {
              setCode(val);
              if (!hasEdited) setHasEdited(true);
            }}
            onFocus={() => setCalloutDismissed(true)}
            theme={githubDark}
            extensions={[python()]}
            basicSetup={{ lineNumbers: true, foldGutter: false }}
            style={{ fontSize: 13.5 }}
            height="310px"
          />
          {!hasEdited && (
            <div className="pointer-events-none absolute bottom-2.5 right-3 flex items-center gap-1.5 rounded-md bg-black/50 px-2 py-1 font-mono text-[10px] text-gray-400 backdrop-blur-sm">
              <span
                className={`inline-block h-3 w-[2px] bg-emerald-400 ${
                  prefersReducedMotion ? "" : "animate-pulse"
                }`}
              />
              click to edit
            </div>
          )}
        </div>

        <div className="border-t border-white/10 bg-black/40">
          <div className="flex items-center justify-between px-4 pt-2.5">
            <span className="text-[10px] uppercase tracking-wide text-gray-500 font-mono">
              Output
            </span>
            <span className="hidden sm:inline text-[10px] text-gray-600 font-mono">
              ⌘/Ctrl + Enter to run
            </span>
          </div>
          <AnimatePresence mode="wait">
            {loadError ? (
              <motion.div
                key="load-error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-4 pb-3 pt-1.5 text-xs font-mono text-red-400"
              >
                {loadError} — check your connection and try again.
              </motion.div>
            ) : output.length > 0 ? (
              <motion.div
                key="output"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-4 pb-3 pt-1.5 text-xs font-mono max-h-32 overflow-y-auto whitespace-pre-wrap"
              >
                {output.map((line, i) => (
                  <div
                    key={i}
                    className={line.isError ? "text-red-400" : "text-green-400"}
                  >
                    {`>>> ${line.text}`}
                  </div>
                ))}
              </motion.div>
            ) : (
              <div className="px-4 pb-3 pt-1.5 text-xs font-mono text-gray-600">
                Run your code to see output here.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

/* ---------------- Navbar ---------------- */

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-3 z-50 mx-auto max-w-[1400px] rounded-2xl border bg-white/90 backdrop-blur-xl transition-all duration-300 ${
        scrolled
          ? "border-gray-200/90 shadow-[0_14px_45px_-24px_rgba(15,23,42,0.35)]"
          : "border-gray-200/70 shadow-[0_8px_30px_-25px_rgba(15,23,42,0.28)]"
      }`}
    >
      <nav className="flex items-center justify-between px-4 py-3.5 sm:px-5 lg:px-7">
        <Link href="#" className="flex items-center gap-2.5">
          <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#b91c1c] via-[#dc2626] to-[#f97316] text-lg shadow-[0_8px_20px_-8px_rgba(220,38,38,0.7)]">
            🤖
          </div>
          <div className="leading-tight">
            <p className="font-syne text-[15px] font-bold tracking-tight text-[#0B1220]">
              Cyborg
            </p>
            <p className="text-[10px] font-medium tracking-wide text-[#64748B]">
              Robotics Academy
            </p>
          </div>
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="relative py-2 text-[14px] font-semibold text-[#475569] transition hover:text-[#0F172A] after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-gradient-to-r after:from-[#dc2626] after:to-[#f97316] after:transition-all hover:after:w-full"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:block">
          <button className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#b91c1c] to-[#dc2626] px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_24px_-12px_rgba(185,28,28,0.8)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-12px_rgba(185,28,28,0.9)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dc2626]">
            Register now
            <span className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </button>
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white/80 text-[#0B1220] lg:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0855AB]"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            {open ? (
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden rounded-b-2xl border-t border-gray-200 bg-white/95 lg:hidden"
          >
            <ul className="flex flex-col gap-1 px-6 py-4">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-2 py-2.5 text-[15px] font-medium text-[#3A4250] hover:bg-gray-50"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <button className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#A81B1E] px-5 py-3 text-sm font-semibold text-white">
                  Register now →
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ---------------- Hero ---------------- */

function Hero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative min-h-[calc(100vh-82px)] overflow-hidden bg-[#fbfcff]">
      {/* soft decorative corner shapes — minimal, low opacity, brand-tinted */}
      <div
        className="pointer-events-none absolute -top-32 -right-40 h-[520px] w-[520px] rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(8,85,171,0.10) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -left-32 h-[420px] w-[420px] rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(168,27,30,0.07) 0%, transparent 70%)",
        }}
      />

      {/* premium background decorations */}
      <div className="pointer-events-none absolute right-[-90px] top-24 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.12),transparent_68%)] blur-2xl" />
      <div className="pointer-events-none absolute left-[-120px] bottom-[-180px] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.08),transparent_68%)] blur-2xl" />

      {/* dot-grid — top right, matching reference */}
      <div
        className="pointer-events-none absolute right-6 top-10 hidden h-32 w-32 opacity-60 sm:block lg:right-10 lg:top-14"
        style={{
          backgroundImage: "radial-gradient(#93c5fd 1.5px, transparent 1.5px)",
          backgroundSize: "14px 14px",
        }}
      />

      {/* dot-grid — bottom left, matching reference */}
      <div
        className="pointer-events-none absolute bottom-10 left-6 hidden h-32 w-32 opacity-50 sm:block lg:bottom-16 lg:left-10"
        style={{
          backgroundImage: "radial-gradient(#93c5fd 1.5px, transparent 1.5px)",
          backgroundSize: "14px 14px",
        }}
      />

      {/* small spark/flash accent — top-right of the editor card, matching reference */}
      <motion.div
        initial={
          prefersReducedMotion ? false : { opacity: 0, scale: 0.7, rotate: -10 }
        }
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none absolute right-4 top-[20%] z-10 hidden text-[#f97316] lg:block xl:right-8"
        aria-hidden
      >
        <svg viewBox="0 0 40 40" fill="none" className="h-9 w-9">
          <path
            d="M20 2v10M20 28v10M2 20h10M28 20h10M8 8l7 7M32 8l-7 7M8 32l7-7M32 32l-7-7"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </motion.div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 h-36 w-full opacity-70"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(239,246,255,0.8))",
        }}
      />
      <div className="relative mx-auto grid max-w-[1400px] gap-12 px-5 py-16 sm:px-8 md:py-20 lg:grid-cols-12 lg:items-center lg:gap-10 lg:px-10 lg:py-24 xl:gap-16">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 xl:col-span-6"
        >
          <div className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#64748B]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#dc2626]" />
            National-level Python innovation challenge
          </div>
          <div className="mb-7 flex flex-wrap gap-2.5">
            {BADGES.map((b) => (
              <span
                key={b.label}
                className={
                  b.variant === "solid"
                    ? "rounded-full bg-[#A81B1E] px-3.5 py-1.5 text-xs font-semibold text-white"
                    : "flex items-center gap-1.5 rounded-full border border-gray-200 px-3.5 py-1.5 text-xs font-semibold text-[#3A4250] transition-colors hover:border-gray-300 hover:bg-gray-50"
                }
              >
                {b.icon && <span>{b.icon}</span>}
                {b.label}
              </span>
            ))}
          </div>

          <h1 className="font-syne max-w-[720px] text-[3rem] font-extrabold leading-[1.02] tracking-[-0.045em] text-[#0B1220] sm:text-[4rem] lg:text-[4.55rem] xl:text-[5rem]">
            Build it.{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, #dc2626 0%, #f97316 100%)",
              }}
            >
              Code it.
            </span>
            <br />
            Ship your Python idea.
          </h1>

          <p className="mt-7 max-w-[58ch] text-[16px] leading-7 text-[#64748B] sm:text-[17px]">
            A national-level Python hackathon for ages 11–21. Conceptualize a
            real product, build it in Python, and submit your video and source
            code for evaluation — no live coding rounds, build on your own time.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button className="group flex h-[52px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#b91c1c] via-[#dc2626] to-[#f97316] px-7 text-[15px] font-bold text-white shadow-[0_16px_30px_-16px_rgba(220,38,38,0.85)] transition hover:-translate-y-1 hover:shadow-[0_20px_34px_-16px_rgba(220,38,38,0.9)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dc2626]">
              Register now
              <span className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </button>
            <button className="flex h-[52px] items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-7 text-[15px] font-bold text-[#0F172A] shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:bg-white hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]">
              View rule book
            </button>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-3 border-t border-slate-200/80 pt-8 sm:gap-7">
            {STATS.map((s) => (
              <div key={s.label} className="group cursor-default">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 text-[#2563EB] ring-1 ring-slate-200/70 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
                  {s.icon}
                </div>
                <p className="text-[14px] font-extrabold text-[#0F172A] sm:text-[15px]">
                  {s.value}
                </p>
                <p className="text-[11px] leading-snug text-[#64748B] sm:text-xs">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="lg:col-span-6 xl:col-span-6">
          <PythonPlayground />
        </div>
      </div>
    </section>
  );
}

/* ---------------- Page ---------------- */

const page = () => {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      {/* About / Categories / Scoring / Timeline / Rewards / FAQ sections go here */}
    </main>
  );
};

export default page;
