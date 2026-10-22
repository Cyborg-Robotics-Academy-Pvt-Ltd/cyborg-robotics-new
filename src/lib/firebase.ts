import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import type { Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app =
  getApps().find((existingApp) => existingApp.name === "[DEFAULT]") ??
  initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth only on the client side. Consumers can await authReady so
// they never subscribe before the dynamically imported Firebase Auth is ready.
let auth: Auth | null = null;
let resolveAuthReady: (instance: Auth | null) => void = () => {};
const authReady = new Promise<Auth | null>((resolve) => {
  resolveAuthReady = resolve;
});
let analytics = null;

if (typeof window !== 'undefined') {
  // Import auth-related modules only on client side
  import('firebase/auth').then(({ getAuth, setPersistence, browserLocalPersistence }) => {
    auth = getAuth(app);
    resolveAuthReady(auth);
    // Enable persistent auth state
    setPersistence(auth, browserLocalPersistence).catch(err => {
      console.error('Failed to set auth persistence:', err);
    });
  }).catch((error) => {
    console.error('Failed to initialize Firebase Auth:', error);
    resolveAuthReady(null);
  });

  // Import analytics only on client side
  import('firebase/analytics').then(({ getAnalytics }) => {
    analytics = getAnalytics(app);
  });
}

export { app, analytics, auth, authReady, db };
