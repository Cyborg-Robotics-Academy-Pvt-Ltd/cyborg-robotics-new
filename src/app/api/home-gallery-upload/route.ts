import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const cloudinaryUploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
      throw new Error("Missing required Cloudinary environment variables");
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
      });
    }

    const fileBlob = new Blob([await file.arrayBuffer()], { type: file.type });
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`;
    const cloudFormData = new FormData();
    cloudFormData.append("file", fileBlob);
    cloudFormData.append("upload_preset", cloudinaryUploadPreset);

    const cloudinaryResponse = await fetch(cloudinaryUrl, {
      method: "POST",
      body: cloudFormData,
    });
    const cloudinaryData = await cloudinaryResponse.json();

    if (!cloudinaryResponse.ok || !cloudinaryData.secure_url) {
      console.error("Cloudinary upload error:", cloudinaryData);
      return new Response(
        JSON.stringify({
          error: cloudinaryData.error?.message || "Cloudinary upload failed",
        }),
        { status: 500 },
      );
    }

    const imageUrl = cloudinaryData.secure_url;
    const fileId = `${file.name.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}`;
    const galleryDocRef = await adminDb.collection("homeGalleryImage").add({
      imageUrl,
      uploadedAt: new Date(),
      fileName: file.name,
      fileId,
    });

    return new Response(
      JSON.stringify({
        imageUrl,
        id: galleryDocRef.id,
        message: "Image uploaded successfully",
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 },
    );
  }
}
