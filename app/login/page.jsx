'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Import Firebase dynamically
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const { auth } = await import('@/lib/firebase');

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', userCredential.user.email);
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed: ' + (err.message || 'Unknown error'));
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
                className="w-full px-4 py-2 bg-gray-800 border-2 border-ups-brown rounded text-white placeholder-gray-600 focus:outline-none focus:border-ups-gold"
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
                className="w-full px-4 py-2 bg-gray-800 border-2 border-ups-brown rounded text-white placeholder-gray-600 focus:outline-none focus:border-ups-gold"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ups-brown hover:bg-ups-gold text-ups-gold hover:text-ups-brown font-bold py-3 px-4 rounded transition-all duration-300 disabled:opacity-50 uppercase"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>
        </div>

        <div className="text-center text-xs text-gray-600">
          <p>Firebase Authentication</p>
        </div>
      </div>
    </div>
  );
}
