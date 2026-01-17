import { getFirestore, collection, addDoc, getDocs, query, orderBy, where, doc, getDoc, deleteDoc } from "firebase/firestore";
import { app } from '@/lib/firebase';

// Define the Photo type interface
interface Photo {
  id: string;
  imageUrl?: string;
  uploadedAt?: any;
  fileName?: string;
  fileId?: string;
  category?: string;
  fileSize?: number;
  fileType?: string;
  [key: string]: any; // Allow additional properties from Firestore
}

// Check for required Cloudinary environment variables
if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
    !process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
  throw new Error('Missing required Cloudinary environment variables');
}

// Handle GET request to fetch photos by category
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  try {
    const db = getFirestore(app);
    let q;

    if (category) {
      // Query photos by specific category
      q = query(
        collection(db, 'photo'),
        where('category', '==', category),
        orderBy('uploadedAt', 'desc')
      );
    } else {
      // Query all photos ordered by upload time
      q = query(
        collection(db, 'photo'),
        orderBy('uploadedAt', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    const photos: Photo[] = [];

    querySnapshot.forEach((doc) => {
      photos.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return new Response(JSON.stringify({ photos: photos as Photo[] }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Handle POST request to upload a photo
export async function POST(req: Request) {
  try {
    // Retrieve form data from the request
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const category = formData.get("category") as string;

    // Check if a file was uploaded
    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if category is provided
    if (!category) {
      return new Response(JSON.stringify({ error: "Category is required" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Convert file to a Blob
    const fileArrayBuffer = await file.arrayBuffer();
    const fileBlob = new Blob([fileArrayBuffer], { type: file.type });

    // Construct the Cloudinary upload URL
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;

    // Prepare form data for Cloudinary upload
    const cloudFormData = new FormData();
    cloudFormData.append("file", fileBlob);
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
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the secure URL of the uploaded image
    const imageUrl = cloudinaryData.secure_url;

    // Initialize Firestore
    const db = getFirestore(app);
    
    // Store the image URL in Firestore in the photo collection
    const timestamp = new Date();
    const fileId = `${file.name.replace(/[^a-zA-Z0-9]/g, "_")}_${Date.now()}`;
    
    // Create a document in the photo collection
    const photoCollection = collection(db, 'photo');
    const photoDocRef = await addDoc(photoCollection, { 
      imageUrl, 
      uploadedAt: timestamp,
      fileName: file.name,
      fileId: fileId,
      category: category,
      fileSize: file.size,
      fileType: file.type
    });

    // Return the image URL and document ID in the response
    return new Response(JSON.stringify({ 
      imageUrl,
      id: photoDocRef.id,
      category: category,
      message: "Photo uploaded successfully"
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    // Handle any errors that occur during the upload process
    console.error('Photo upload error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}