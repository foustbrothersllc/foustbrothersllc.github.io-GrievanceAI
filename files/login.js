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
      // TODO: Implement Firebase login
      console.log('Login attempt:', { email, password });
      
      // For now, show success message
      setTimeout(() => {
        alert('Login functionality coming soon!');
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ups-black flex items-center justify-center px-4">
      <div className="animate-fade-in max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-bold text-ups-gold hover:text-ups-gold cursor-pointer">
              CONTRACT ANALYZER
            </h1>
          </Link>
          <p className="text-gray-400 mt-2">Sign In to Your Account</p>
        </div>

        {/* Form Card */}
        <div className="card mb-6">
          {/* Error Message */}
          {error && <div className="error mb-4">{error}</div>}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
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
              />
            </div>

            {/* Password Field */}
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
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 mt-6"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>
        </div>

        {/* Signup Link */}
        <div className="card text-center">
          <p className="text-gray-400 mb-3">Don't have an account?</p>
          <Link href="/signup">
            <button className="text-ups-gold font-semibold hover:text-yellow-300">
              Create Account
            </button>
          </Link>
        </div>

        {/* Demo Info */}
        <div className="text-center mt-6 text-xs text-gray-600">
          <p>Demo: Try any email and password</p>
        </div>
      </div>
    </div>
  );
}
