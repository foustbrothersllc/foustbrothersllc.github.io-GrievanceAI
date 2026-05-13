'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', userCredential.user.email);
      router.push('/dashboard');
    } catch (err) {
      console.error('Login error:', err.code, err.message);
      
      if (err.code === 'auth/user-not-found') {
        setError('Email not found. Please create an account.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many login attempts. Please try again later.');
      } else {
        setError('Login failed. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ups-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-bold text-ups-gold hover:text-yellow-300 cursor-pointer">
              GRIEVANCE AI
            </h1>
          </Link>
          <p className="text-gray-400 mt-2">Sign In to Your Account</p>
        </div>

        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-6 mb-6">
          {error && (
            <div className="bg-red-900 border-2 border-red-600 text-red-100 p-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-ups-gold font-semibold mb-2 text-sm">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
                className="w-full px-4 py-2 bg-gray-800 border-2 border-ups-brown rounded text-white placeholder-gray-600 focus:outline-none focus:border-ups-gold focus:ring-2 focus:ring-ups-gold/30"
              />
            </div>

            <div>
              <label className="block text-ups-gold font-semibold mb-2 text-sm">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
                className="w-full px-4 py-2 bg-gray-800 border-2 border-ups-brown rounded text-white placeholder-gray-600 focus:outline-none focus:border-ups-gold focus:ring-2 focus:ring-ups-gold/30"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ups-brown hover:bg-ups-gold text-ups-gold hover:text-ups-brown font-bold py-3 px-4 rounded transition-all duration-300 disabled:opacity-50 uppercase tracking-wide"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>
        </div>

        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-6 text-center">
          <p className="text-gray-400 mb-3">Don't have an account?</p>
          <Link href="/signup">
            <button className="text-ups-gold font-semibold hover:text-yellow-300 transition-colors">
              Create Account
            </button>
          </Link>
        </div>

        <div className="text-center mt-6 text-xs text-gray-600">
          <p>Secure Firebase Authentication</p>
        </div>
      </div>
    </div>
  );
}
