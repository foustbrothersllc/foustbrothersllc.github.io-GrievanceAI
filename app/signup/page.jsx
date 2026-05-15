'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import Link from 'next/link';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCred.user.uid), {
        name: name.trim(),
        email,
        role: 'user',
        createdAt: new Date()
      });
      router.push('/dashboard');
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
          <h2 className="text-2xl font-bold text-ups-gold mb-6 text-center">Sign Up</h2>
          {error && <div className="bg-red-900 text-red-100 p-4 rounded mb-6">{error}</div>}
          <form onSubmit={handleSignup} className="space-y-4">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white" disabled={loading} required />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white" disabled={loading} required />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white" disabled={loading} required />
            <button type="submit" disabled={loading} className="w-full bg-ups-brown text-ups-gold py-2 rounded uppercase font-bold">{loading ? 'Creating account...' : 'Sign Up'}</button>
          </form>
          <p className="text-gray-400 text-center mt-6">Have an account? <Link href="/login"><span className="text-ups-gold cursor-pointer">Login</span></Link></p>
        </div>
      </div>
    </div>
  );
}
