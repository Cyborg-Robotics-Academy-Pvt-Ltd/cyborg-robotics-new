import { NextResponse } from "next/server";
import crypto from "crypto";
import { adminAuth } from "@/lib/firebase-admin"; // src/lib/firebase-admin.ts

// Simple in-memory rate limit: max 20 signature requests per IP per 10 min.
// NOTE: resets on server restart and isn't shared across serverless instances
// (Vercel spins up multiple). Fine as a quick stopgap; swap for Upstash/Redis
// or a middleware-based limiter if this route sees real abuse.
const RATE_LIMIT = 20;
const WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT) {
    return true;
  }

  entry.count += 1;
  return false;
}

export async function POST(req: Request) {
  // Require a valid Firebase ID token — blocks anyone from hitting this
  // route directly without being logged into the admin panel.
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return NextResponse.json(
      { error: "Missing auth token" },
      { status: 401 },
    );
  }

  try {
    await adminAuth.verifyIdToken(token);
  } catch (err) {
    console.error("Token verification failed:", err);
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 },
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429 },
    );
  }

  const { paramsToSign } = await req.json();

  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiSecret) {
    return NextResponse.json(
      { error: "Cloudinary not configured" },
      { status: 500 },
    );
  }

  // Cloudinary requires params sorted alphabetically, joined as key=value&key=value,
  // then the api_secret appended before hashing.
  const sortedParams = Object.keys(paramsToSign)
    .sort()
    .map((key) => `${key}=${paramsToSign[key]}`)
    .join("&");

  const signature = crypto
    .createHash("sha1")
    .update(sortedParams + apiSecret)
    .digest("hex");

  return NextResponse.json({ signature });
}