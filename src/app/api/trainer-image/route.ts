import { NextRequest } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const trainerId = url.searchParams.get('trainerId');

    if (!trainerId) {
      return new Response(JSON.stringify({ error: 'trainerId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch trainer document from Firestore
    const trainerDocRef = doc(db, 'trainers', trainerId);
    const trainerDoc = await getDoc(trainerDocRef);

    if (!trainerDoc.exists()) {
      return new Response(JSON.stringify({ error: 'Trainer not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const trainerData = trainerDoc.data();
    
    // Get the profile image URL
    const profileImageUrl = trainerData.profileimage || trainerData.imageUrls?.[0];

    if (!profileImageUrl) {
      return new Response(JSON.stringify({ error: 'Profile image not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch the image from the external URL and return it
    try {
      const imageResponse = await fetch(profileImageUrl);
      
      if (!imageResponse.ok) {
        throw new Error('Failed to fetch image');
      }

      const imageBuffer = await imageResponse.arrayBuffer();
      const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

      return new Response(imageBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
      });
    } catch (error) {
      console.error('Error fetching image:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch profile image' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in API route:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}