import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User,
  Auth,
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Configure Firestore using the custom database ID from config if specified
export const db: Firestore = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

/**
 * Sign in using Google OAuth popup
 */
export async function signInWithGoogle(): Promise<{ name: string; email: string; uid: string }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    return {
      name: user.displayName || 'Anjali Bhat',
      email: user.email || 'anjaliextraa01@gmail.com',
      uid: user.uid,
    };
  } catch (err: any) {
    console.error('Google sign-in error:', err);
    // If popup fails (e.g. iframe popup restrictions or user closed), return sensible fallback
    if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
      throw new Error('Google sign-in popup was closed or blocked. Please allow popups or try again.');
    }
    throw err;
  }
}

/**
 * Sign out current user
 */
export async function logOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export {
  app,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
};
export type { User };
