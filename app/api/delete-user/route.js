import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  return initializeApp({ credential: cert(serviceAccount) });
}

export async function POST(request) {
  try {
    const { userId } = await request.json();
    if (!userId) return Response.json({ error: 'Missing userId' }, { status: 400 });

    const app = getAdminApp();
    const adminAuth = getAuth(app);
    const adminDb = getFirestore(app);

    // Delete from Firebase Auth
    try {
      await adminAuth.deleteUser(userId);
    } catch (authErr) {
      // If user not found in Auth, continue to delete Firestore doc
      if (authErr.code !== 'auth/user-not-found') {
        throw new Error('Auth delete failed: ' + authErr.message);
      }
    }

    // Delete from Firestore
    await adminDb.collection('users').doc(userId).delete();

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
