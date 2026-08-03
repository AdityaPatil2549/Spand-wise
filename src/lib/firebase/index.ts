import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { env } from '@/config/env';

const firebaseConfig = {
 apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
 authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
 projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
 storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
 messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
 appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase app (only once — prevents re-initialization in Next.js hot reload)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence (IndexedDB) for optimistic UI support
// This allows the app to work offline and sync when reconnected
if (typeof window !== 'undefined') {
 enableIndexedDbPersistence(db).catch((err) => {
 if (err.code === 'failed-precondition') {
 // Multiple tabs open — persistence only works in one tab at a time
 console.warn('[Firestore] Persistence failed: multiple tabs open');
 } else if (err.code === 'unimplemented') {
 // Browser doesn't support persistence
 console.warn('[Firestore] Persistence not supported in this browser');
 }
 });
}

export default app;
