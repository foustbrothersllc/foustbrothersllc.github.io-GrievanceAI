'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

export default function Hub() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (!u) {
        router.push('/login');
        return;
      }
      setUser(u);
      try {
        const snap = await getDoc(doc(db, 'users', u.uid));
        if (snap.exists()) {
          const data = snap.data();
          setUserName(data.name || '');
          setIsAdmin(data.role === 'admin');
        }
      } catch (e) {
        // ignore
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen bg-ups-black flex items-center justify-center">
      <p className="text-ups-gold text-xl">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-ups-black">
      {/* Header */}
      <header className="border-b border-ups-brown bg-gray-900 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-2xl font-bold text-ups-gold">GRIEVANCE AI</h1>
            <div className="flex gap-2">
              <Link href="/hub">
                <button className="bg-ups-brown text-ups-gold px-4 py-2 rounded uppercase text-sm font-bold">🏠 Home</button>
              </Link>
              <button
                onClick={() => { signOut(auth); router.push('/'); }}
                className="bg-ups-brown text-ups-gold px-4 py-2 rounded uppercase text-sm font-bold"
              >
                Logout
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/settings" className="flex-1">
              <button className="w-full bg-ups-brown text-ups-gold px-3 py-2 rounded uppercase text-xs font-bold">⚙️ Settings</button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-2xl mx-auto p-6">
        {/* Welcome */}
        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-ups-gold mb-1">
            Welcome{userName ? `, ${userName}` : ''}!
          </h2>
          <p className="text-gray-400 text-sm">What would you like to do today?</p>
        </div>

        {/* Option Cards */}
        <div className="space-y-4">

          {/* Contract Q&A */}
          <Link href="/contract-qa">
            <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-6 cursor-pointer hover:border-ups-gold hover:bg-gray-800 transition-all duration-200 active:scale-95">
              <div className="flex items-center gap-4">
                <div className="text-4xl">📋</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-ups-gold mb-1">Contract Q&amp;A</h3>
                  <p className="text-gray-400 text-sm">
                    Ask questions about your contract. Get clear answers about your rights and what the contract says.
                  </p>
                </div>
                <div className="text-ups-gold text-2xl">›</div>
              </div>
            </div>
          </Link>

          {/* File a Grievance */}
          <Link href="/dashboard">
            <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-6 cursor-pointer hover:border-ups-gold hover:bg-gray-800 transition-all duration-200 active:scale-95">
              <div className="flex items-center gap-4">
                <div className="text-4xl">⚖️</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-ups-gold mb-1">File a Grievance</h3>
                  <p className="text-gray-400 text-sm">
                    Search for contract violations and generate a formal Teamsters Local 391 grievance form.
                  </p>
                </div>
                <div className="text-ups-gold text-2xl">›</div>
              </div>
            </div>
          </Link>

          {/* Admin Panel — only visible to admins */}
          {isAdmin && (
            <Link href="/admin">
              <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-6 cursor-pointer hover:border-ups-gold hover:bg-gray-800 transition-all duration-200 active:scale-95">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">🔑</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-ups-gold mb-1">Admin Panel</h3>
                    <p className="text-gray-400 text-sm">
                      Manage users, view activity, and configure system settings.
                    </p>
                  </div>
                  <div className="text-ups-gold text-2xl">›</div>
                </div>
              </div>
            </Link>
          )}

        </div>
      </main>
    </div>
  );
}
