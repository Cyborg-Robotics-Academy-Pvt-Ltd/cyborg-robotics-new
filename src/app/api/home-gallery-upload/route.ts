import { adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const cloudinaryUploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
      throw new Error("Missing required Cloudinary environment variables");
    }

    // Retrieve form data from the request
    const formData = await req.formData();
    const file = formData.get("file") as File;

    // Check if a file was uploaded
    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
    }

    // Convert file to a Blob
    const fileArrayBuffer = await file.arrayBuffer();
    const fileBlob = new Blob([fileArrayBuffer], { type: file.type });

    // Construct the Cloudinary upload URL
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`;

    // Prepare form data for Cloudinary upload
    const cloudFormData = new FormData();
    cloudFormData.append("file", fileBlob);
    // Ensure the upload preset is defined before appending
    cloudFormData.append("upload_preset", cloudinaryUploadPreset);

    // Send the file to Cloudinary
    const cloudinaryResponse = await fetch(cloudinaryUrl, {
      method: "POST",
      body: cloudFormData,
    });

    // Parse the response from Cloudinary
    const cloudinaryData = await cloudinaryResponse.json();

    // Check for errors in the Cloudinary response
    if (!cloudinaryResponse.ok || !cloudinaryData.secure_url) {
      console.error('Cloudinary upload error:', cloudinaryData);
      return new Response(
        JSON.stringify({ error: cloudinaryData.error?.message || "Cloudinary upload failed" }),
        { status: 500 }
      );
    }

    // Get the secure URL of the uploaded image
    const imageUrl = cloudinaryData.secure_url;

    // Store the image URL in Firestore in the homeGalleryImage collection
    const timestamp = Date.now();
    const fileId = `${file.name.replace(/[^a-zA-Z0-9]/g, "_")}_${timestamp}`;
    
    const galleryDocRef = await adminDb.collection("homeGalleryImage").add({
      imageUrl, 
      uploadedAt: new Date(),
      fileName: file.name,
      fileId: fileId
    });

    // Return the image URL in the response
    return new Response(JSON.stringify({ 
      imageUrl,
      id: galleryDocRef.id,
      message: "Image uploaded successfully"
    }), { status: 200 });
  } catch (error) {
    // Handle any errors that occur during the upload process
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500 }
    );
  }
}