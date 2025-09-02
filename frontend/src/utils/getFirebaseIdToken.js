import { getAuth } from 'firebase/auth';

export async function getFirebaseIdToken() {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
  } catch (err) {
    // Ignore
  }
  return null;
} 