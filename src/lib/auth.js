import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from './firebase';

// export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export async function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function loginWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function resetPassword(email) {
  return sendPasswordResetEmail(auth, email);
}