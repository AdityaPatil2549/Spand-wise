import {
 GoogleAuthProvider,
 signInWithPopup,
 signInWithEmailAndPassword,
 createUserWithEmailAndPassword,
 sendEmailVerification,
 signOut as firebaseSignOut,
 onAuthStateChanged,
 updateProfile,
 type User,
 type Unsubscribe,
} from 'firebase/auth';
import { doc, updateDoc, serverTimestamp, getDoc, writeBatch, arrayUnion } from 'firebase/firestore';
import { auth, db } from './index';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Sign in with Google OAuth popup.
 * Creates or updates the user profile document in Firestore.
 */
export const signInWithGoogle = async (): Promise<User> => {
 const result = await signInWithPopup(auth, googleProvider);
 await upsertUserProfile(result.user);
 return result.user;
};

/**
 * Sign in with email and password.
 */
export const signInWithEmail = async (
 email: string,
 password: string
): Promise<User> => {
 const result = await signInWithEmailAndPassword(auth, email, password);
 return result.user;
};

/**
 * Create a new account with email and password.
 * Sends an email verification link.
 */
export const signUpWithEmail = async (
 email: string,
 password: string
): Promise<User> => {
 const result = await createUserWithEmailAndPassword(auth, email, password);
 await sendEmailVerification(result.user);
 await upsertUserProfile(result.user);
 return result.user;
};

/**
 * Sign out the current user.
 */
export const signOut = async (): Promise<void> => {
 await firebaseSignOut(auth);
};

/**
 * Subscribe to auth state changes.
 * Returns an unsubscribe function — must be called on component unmount.
 */
export const onAuthChange = (callback: (user: User | null) => void): Unsubscribe => {
 return onAuthStateChanged(auth, callback);
};


/**
 * Create or update the user profile document in Firestore.
 * Ensures the user has a householdId assigned and the Household document exists.
 */
const upsertUserProfile = async (user: User): Promise<void> => {
 const userRef = doc(db, 'users', user.uid);
 
 try {
 const userSnap = await getDoc(userRef);
 let householdId = user.uid; // default to their own UID
 
 if (userSnap.exists()) {
 const data = userSnap.data();
 if (data.householdId) {
 householdId = data.householdId;
 }
 }

 const batch = writeBatch(db);

 // Update or create User profile
 batch.set(
 userRef,
 {
 uid: user.uid,
 email: user.email,
 displayName: user.displayName,
 photoURL: user.photoURL,
 lastActive: serverTimestamp(),
 householdId,
 },
 { merge: true }
 );

 // If we are defaulting to their own UID, ensure the household doc exists
 if (householdId === user.uid) {
 const householdRef = doc(db, 'households', householdId);
 batch.set(
 householdRef,
 {
 id: householdId,
 members: [user.uid],
 createdBy: user.uid,
 createdAt: serverTimestamp(),
 },
 { merge: true }
 );
 }

 const writePromise = batch.commit();
 const timeoutPromise = new Promise((_, reject) => {
 setTimeout(() => reject(new Error('firestore-timeout')), 10000);
 });

 await Promise.race([writePromise, timeoutPromise]);
 } catch (err: unknown) {
 const isTimeout = err instanceof Error && err.message === 'firestore-timeout';
 if (isTimeout) {
 console.warn('[Firestore] Profile write timed out. Please ensure Firestore Database is created in your Firebase Console.');
 } else {
 console.error('[Firestore] Failed to write user profile:', err);
 }
 }
};

/**
 * Mark onboarding as complete for the current user.
 * Called after the user sets their first monthly budget.
 */
export const markOnboardingComplete = async (uid: string): Promise<void> => {
 const userRef = doc(db, 'users', uid);
 await updateDoc(userRef, {
 onboardingComplete: true,
 lastActive: serverTimestamp(),
 });
};

/**
 * Update the current user's profile (display name and photo URL).
 * Updates both Firebase Auth and the Firestore `users` document.
 */
export const updateUserProfileInfo = async (
 user: User,
 data: { displayName?: string; photoURL?: string }
): Promise<void> => {
 // 1. Update Firebase Auth Profile
 await updateProfile(user, data);

 // 2. Update Firestore User Document
 const userRef = doc(db, 'users', user.uid);
 await updateDoc(userRef, {
 ...data,
 lastActive: serverTimestamp(),
 });
};

/**
 * Join an existing household.
 * Verifies the household exists, updates the user's document, and adds the user to the household's members list.
 */
export const joinHousehold = async (uid: string, targetHouseholdId: string): Promise<void> => {
 const householdRef = doc(db, 'households', targetHouseholdId);
 const userRef = doc(db, 'users', uid);

 const householdSnap = await getDoc(householdRef);
 if (!householdSnap.exists()) {
 throw new Error('household-not-found');
 }

 const batch = writeBatch(db);
 batch.update(userRef, {
 householdId: targetHouseholdId,
 lastActive: serverTimestamp(),
 });
 batch.update(householdRef, {
 members: arrayUnion(uid),
 });

 await batch.commit();
};

