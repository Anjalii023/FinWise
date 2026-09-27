/**
 * Database client and repository layer for frontend Firestore & Firebase Auth.
 */
export {
  auth,
  db,
  logOut,
  signInWithGoogle,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from '../firebase';
export type { User } from 'firebase/auth';
