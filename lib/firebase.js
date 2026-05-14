import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA4mkzm7rgrwNNDnD2oXhbGjS-3rUUL2gY",
  authDomain: "contract-analyzer-d52f6.firebaseapp.com",
  projectId: "contract-analyzer-d52f6",
  storageBucket: "contract-analyzer-d52f6.firebasestorage.app",
  messagingSenderId: "453449816303",
  appId: "1:453449816303:web:5e49f15a7641cc0c9ae31a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { signOut } from 'firebase/auth';
export default app;
