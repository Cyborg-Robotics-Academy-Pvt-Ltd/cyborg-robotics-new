import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from '@/lib/firebase';

// Check for required Cloudinary environment variables
if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
    !process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
  throw new Error('Missing required Cloudinary environment variables');
}

export async function POST(req: Request) {
  try {
    // Retrieve form data from the request
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;
    const userType = formData.get("userType") as string;

    // Check if a file was uploaded
    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
    }

    // Convert file to a Blob
    const fileArrayBuffer = await file.arrayBuffer();
    const fileBlob = new Blob([fileArrayBuffer], { type: file.type });

    // Construct the Cloudinary upload URL
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;

    // Prepare form data for Cloudinary upload
    const cloudFormData = new FormData();
    cloudFormData.append("file", fileBlob);
    // Ensure the upload preset is defined before appending
    cloudFormData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);

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

    // Initialize Firestore
    const db = getFirestore(app);
    
    // If userId and userType are provided, update the user's profile image
    if (userId && userType) {
      // Determine the collection based on user type
      let collectionName = "students";
      switch (userType.toLowerCase()) {
        case "admin":
          collectionName = "admins";
          break;
        case "trainer":
          collectionName = "trainers";
          break;
        case "student":
          collectionName = "students";
          break;
      }
      
      // Create a document reference to the user
      const userDocRef = doc(db, collectionName, userId);
      
      // Update the user document with the profile image URL
      await setDoc(userDocRef, { profileimage: imageUrl }, { merge: true });
    } else {
      // Generate a unique ID for Firestore storage
      const timestamp = Date.now();
      const fileId = `${file.name.replace(/[^a-zA-Z0-9]/g, "_")}_${timestamp}`;
      
      // Create a document reference in the images collection
      const imageDocRef = doc(db, 'images', fileId);
      
      // Store the image URL in Firestore
      await setDoc(imageDocRef, { imageUrl, uploadedAt: new Date() });
    }

    // Return the image URL in the response
    return new Response(JSON.stringify({ imageUrl }), { status: 200 });
  } catch (error) {
    // Handle any errors that occur during the upload process
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500 }
    );
  }
}
