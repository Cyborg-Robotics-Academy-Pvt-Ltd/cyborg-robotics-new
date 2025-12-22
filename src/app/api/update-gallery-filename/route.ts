import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { app } from '@/lib/firebase';

export async function PUT(req: Request) {
  try {
    // Get the imageId and newFileName from the request body
    const { imageId, newFileName, collectionName } = await req.json();

    // Validate inputs
    if (!imageId || !newFileName) {
      return new Response(JSON.stringify({ error: "Missing image ID or new file name" }), { status: 400 });
    }

    // Validate collection name
    if (collectionName !== "galleryImage" && collectionName !== "homeGalleryImage") {
      return new Response(JSON.stringify({ error: "Invalid collection name" }), { status: 400 });
    }

    // Initialize Firestore
    const db = getFirestore(app);
    
    // Update the document with the new file name
    const docRef = doc(db, collectionName, imageId);
    await updateDoc(docRef, { 
      fileName: newFileName,
      updatedAt: new Date()
    });

    // Return success response
    return new Response(JSON.stringify({ 
      message: "File name updated successfully"
    }), { status: 200 });
  } catch (error) {
    // Handle any errors that occur during the update process
    console.error('Update error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500 }
    );
  }
}