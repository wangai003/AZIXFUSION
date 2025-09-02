import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export const googleSignIn = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  // You can add more user info mapping here if needed
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
};

export const googleSignOut = async () => {
  await signOut(auth);
};