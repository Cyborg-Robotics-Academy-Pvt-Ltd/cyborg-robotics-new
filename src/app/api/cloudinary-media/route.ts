import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export const runtime = "nodejs";

type ResourceType = "image" | "video";
type CloudinaryResource = {
  public_id: string;
  resource_type: "image" | "video";
  format?: string;
  bytes?: number;
  created_at?: string;
  secure_url: string;
  width?: number;
  height?: number;
  duration?: number;
};

async function requireAdmin(request: Request) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) throw new Error("Unauthorized");

  const decoded = await adminAuth.verifyIdToken(token);
  const admin = await adminDb.collection("admins").doc(decoded.uid).get();
  if (!admin.exists || ["inactive", "pending"].includes(admin.data()?.status)) {
    throw new Error("Forbidden");
  }
}

function configureCloudinary() {
  const cloud_name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  // API keys are safe to expose in upload clients, so older deployments may
  // already have this configured under the NEXT_PUBLIC name.
  const api_key = process.env.CLOUDINARY_API_KEY || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const api_secret =
    process.env.CLOUDINARY_API_SECRET ||
    process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;

  if (!cloud_name || !api_key || !api_secret) {
    const missing = [
      !cloud_name && "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
      !api_key && "CLOUDINARY_API_KEY (or NEXT_PUBLIC_CLOUDINARY_API_KEY)",
      !api_secret && "CLOUDINARY_API_SECRET (or NEXT_PUBLIC_CLOUDINARY_API_SECRET)",
    ].filter(Boolean).join(", ");
    throw new Error(`Cloudinary Admin API is not configured. Missing: ${missing}`);
  }

  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
}

function errorResponse(error: unknown) {
  const cloudinaryError =
    typeof error === "object" && error !== null && "error" in error
      ? (error as { error?: unknown }).error
      : undefined;
  const message =
    error instanceof Error
      ? error.message
      : typeof cloudinaryError === "string"
        ? cloudinaryError
        : typeof cloudinaryError === "object" && cloudinaryError !== null && "message" in cloudinaryError
          ? String((cloudinaryError as { message: unknown }).message)
          : typeof error === "object" && error !== null && "message" in error
            ? String((error as { message: unknown }).message)
            : "Cloudinary request failed";
  const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    configureCloudinary();

    const { searchParams } = new URL(request.url);
    const resourceType = searchParams.get("resource_type") === "image" ? "image" : "video";
    const nextCursor = searchParams.get("next_cursor") || undefined;
    const result = (await cloudinary.api.resources({
      resource_type: resourceType as ResourceType,
      type: "upload",
      max_results: 100,
      next_cursor: nextCursor,
      direction: "desc",
    })) as { resources: CloudinaryResource[]; next_cursor?: string };

    return NextResponse.json({
      resources: result.resources.map((resource) => ({
        publicId: resource.public_id,
        resourceType: resource.resource_type,
        format: resource.format,
        bytes: resource.bytes,
        createdAt: resource.created_at,
        secureUrl: resource.secure_url,
        width: resource.width,
        height: resource.height,
        duration: resource.duration,
      })),
      nextCursor: result.next_cursor ?? null,
    });
  } catch (error) {
    console.error("Cloudinary media list failed:", error);
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin(request);
    configureCloudinary();

    const body = await request.json();
    const publicId = typeof body.publicId === "string" ? body.publicId : "";
    const resourceType = body.resourceType === "image" ? "image" : body.resourceType === "video" ? "video" : null;
    if (!publicId || !resourceType) {
      return NextResponse.json({ error: "A valid public ID and resource type are required" }, { status: 400 });
    }

    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cloudinary media deletion failed:", error);
    return errorResponse(error);
  }
}
