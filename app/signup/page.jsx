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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const validatePassword = (pass) => {
    const errors = [];
    if (pass.length < 8) errors.push('At least 8 characters');
    if (!/[A-Z]/.test(pass)) errors.push('At least one capital letter');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass)) errors.push('At least one special character (!@#$%^&* etc.)');
    return errors;
  };

  const passwordErrors = validatePassword(password);
  const passwordsMatch = password === confirmPassword;

  const getStrengthColor = () => {
    if (passwordErrors.length === 3) return 'bg-red-600';
    if (passwordErrors.length === 2) return 'bg-orange-500';
    if (passwordErrors.length === 1) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthWidth = () => {
    const strength = 3 - passwordErrors.length;
    return ['w-1/4', 'w-2/4', 'w-3/4', 'w-full'][strength];
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (passwordErrors.length > 0) {
      setError('Password requirements not met: ' + passwordErrors.join(', '));
      return;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
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
          {error && <div className="bg-red-900 text-red-100 p-4 rounded mb-6 text-sm">{error}</div>}
          <form onSubmit={handleSignup} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white text-base"
              disabled={loading}
              required
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white text-base"
              disabled={loading}
              required
            />

            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white text-base"
                disabled={loading}
                required
              />
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-700 rounded-full">
                    <div className={`h-1.5 rounded-full transition-all ${getStrengthColor()} ${getStrengthWidth()}`}></div>
                  </div>
                  {passwordErrors.length > 0 ? (
                    <ul className="mt-2 space-y-1">
                      {passwordErrors.map((err, i) => (
                        <li key={i} className="text-red-400 text-xs flex items-center gap-1">
                          <span>✗</span> {err}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-green-400 text-xs mt-1">✓ Password meets all requirements</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className={`w-full bg-gray-800 border rounded px-4 py-3 text-white text-base ${
                  confirmPassword.length > 0
                    ? passwordsMatch ? 'border-green-500' : 'border-red-500'
                    : 'border-ups-brown'
                }`}
                disabled={loading}
                required
              />
              {confirmPassword.length > 0 && (
                passwordsMatch
                  ? <p className="text-green-400 text-xs mt-1">✓ Passwords match</p>
                  : <p className="text-red-400 text-xs mt-1">✗ Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || passwordErrors.length > 0 || !passwordsMatch || !confirmPassword}
              className="w-full bg-ups-brown text-ups-gold py-3 rounded uppercase font-bold disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
          <p className="text-gray-400 text-center mt-6 text-sm">Have an account? <Link href="/login"><span className="text-ups-gold cursor-pointer">Login</span></Link></p>
        </div>
      </div>
    </div>
  );
}
