'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) router.push('/hub');
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if account is disabled in Firestore
      const userDoc = await getDoc(doc(db, 'users', userCred.user.uid));
      if (userDoc.exists() && userDoc.data().status === 'disabled') {
        await signOut(auth);
        setError('Your account has been disabled. Please contact your union representative for assistance.');
        setLoading(false);
        return;
      }

      router.push('/hub');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ups-black flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link href="/"><h1 className="text-4xl font-bold text-ups-gold text-center mb-12">GRIEVANCE AI</h1></Link>
        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8">
          <h2 className="text-2xl font-bold text-ups-gold mb-6 text-center">Login</h2>
          {error && <div className="bg-red-900 text-red-100 p-4 rounded mb-6">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white" disabled={loading} required />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white" disabled={loading} required />
            <button type="submit" disabled={loading} className="w-full bg-ups-brown text-ups-gold py-2 rounded uppercase font-bold">{loading ? 'Logging in...' : 'Login'}</button>
          </form>
          <p className="text-gray-400 text-center mt-6">No account? <Link href="/signup"><span className="text-ups-gold cursor-pointer">Sign up</span></Link></p>
        </div>
      </div>
    </div>
  );
}
