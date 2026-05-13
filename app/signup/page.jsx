'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Account created:', userCredential.user.email);
      router.push('/dashboard');
    } catch (err) {
      console.error('Signup error:', err.code, err.message);
      
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use. Please sign in instead.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 6 characters.');
      } else {
        setError('Signup failed: ' + (err.message || 'Unknown error'));
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
          <p className="text-gray-400 mt-2">Create Your Account</p>
        </div>

        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-6 mb-6">
          {error && (
            <div className="bg-red-900 border-2 border-red-600 text-red-100 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
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

            <div>
              <label className="block text-ups-gold font-semibold mb-2 text-sm">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
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
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </button>
          </form>
        </div>

        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-6 text-center">
          <p className="text-gray-400 mb-3">Already have an account?</p>
          <Link href="/login">
            <button className="text-ups-gold font-semibold hover:text-yellow-300 transition-colors">
              Sign In
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
