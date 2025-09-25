import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';

// Initialize Firebase Admin (for server-side operations)
const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
};

let adminApp;
try {
  // Check if app is already initialized
  if (!getApps().length) {
    adminApp = initializeApp(firebaseAdminConfig, 'admin');
  } else {
    adminApp = getApps().find(app => app?.name === 'admin') || getApps()[0];
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
  // Fallback initialization
  adminApp = initializeApp(firebaseAdminConfig);
}

// Initialize Admin SDK services
const adminDb = getFirestore(adminApp);
const adminAuth = getAuth(adminApp);
const adminRTDB = getDatabase(adminApp);

export { adminApp, adminDb, adminAuth, adminRTDB };