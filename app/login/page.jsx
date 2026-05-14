'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
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
        <Link href="/">
          <h1 className="text-4xl font-bold text-ups-gold text-center mb-12 cursor-pointer">GRIEVANCE AI</h1>
        </Link>
        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8">
          <h2 className="text-2xl font-bold text-ups-gold mb-6 text-center">Login</h2>
          {error && (
            <div className="bg-red-900 border-2 border-red-600 text-red-100 p-4 rounded mb-6">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-ups-gold font-semibold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-ups-gold font-semibold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ups-brown hover:bg-ups-gold text-ups-gold hover:text-ups-brown font-bold py-2 rounded uppercase"
            >
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </button>
          </form>
          <p className="text-gray-400 text-center mt-6">
            Don't have an account? <Link href="/signup"><span className="text-ups-gold cursor-pointer">Sign up</span></Link>
          </p>
        </div>
      </div>
    </div>
  );
}
