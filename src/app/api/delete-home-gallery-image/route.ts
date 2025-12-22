import { getFirestore, doc, deleteDoc } from "firebase/firestore";
import { app } from '@/lib/firebase';

export async function DELETE(req: Request) {
  try {
    // Get the imageId from the URL search parameters
    const url = new URL(req.url);
    const imageId = url.searchParams.get('imageId');

    // Check if imageId was provided
    if (!imageId) {
      return new Response(JSON.stringify({ error: "Missing image ID" }), { status: 400 });
    }

    // Initialize Firestore
    const db = getFirestore(app);
    
    // Delete the document from the homeGalleryImage collection
    const galleryDocRef = doc(db, 'homeGalleryImage', imageId);
    await deleteDoc(galleryDocRef);

    // Return success response
    return new Response(JSON.stringify({ 
      message: "Image deleted successfully"
    }), { status: 200 });
  } catch (error) {
    // Handle any errors that occur during the delete process
    console.error('Delete error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500 }
    );
  }
}