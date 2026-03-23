import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

const adminApp =
  getApps().length === 0
    ? initializeApp(
        projectId && clientEmail && privateKey
          ? {
              credential: cert({
                projectId,
                clientEmail,
                privateKey,
              }),
            }
          : undefined
      )
    : getApps()[0];

export const adminDb = getFirestore(adminApp);
