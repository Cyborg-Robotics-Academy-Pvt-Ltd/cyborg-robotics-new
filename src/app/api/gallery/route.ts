import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";
import { app } from '@/lib/firebase';

export async function GET() {
  try {
    // Initialize Firestore
    const db = getFirestore(app);
    
    // Query the galleryImage collection ordered by uploadedAt timestamp
    const galleryCollection = collection(db, 'galleryImage');
    const q = query(galleryCollection, orderBy('uploadedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    // Map the documents to an array of image data
    const images = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Return the images in the response
    return new Response(JSON.stringify(images), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    // Handle any errors that occur during the fetch process
    console.error('Fetch gallery images error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500 }
    );
  }
}