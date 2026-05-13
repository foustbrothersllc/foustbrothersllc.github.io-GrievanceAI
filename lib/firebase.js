import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAdmkzm7rgcwNNDnD2oXhbGJs-3rUUL2gY",
  authDomain: "contract-analyzer-d52f6.firebaseapp.com",
  projectId: "contract-analyzer-d52f6",
  storageBucket: "contract-analyzer-d52f6.firebasestorage.app",
  messagingSenderId: "463449816303",
  appId: "1:463449816303:web:5e49f15a7641cc0c9ae31a",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
