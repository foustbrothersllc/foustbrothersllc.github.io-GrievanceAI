'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ups-black flex items-center justify-center">
        <p className="text-ups-gold text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ups-black">
      {/* Header */}
      <header className="border-b border-ups-brown bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/">
            <h1 className="text-3xl font-bold text-ups-gold hover:text-yellow-300 cursor-pointer">
              GRIEVANCE AI
            </h1>
          </Link>
          <button
            onClick={handleLogout}
            className="bg-ups-brown hover:bg-ups-gold text-ups-gold hover:text-ups-brown font-bold py-2 px-6 rounded transition-all duration-300 uppercase"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8">
          <h2 className="text-3xl font-bold text-ups-gold mb-4">Welcome, {user?.email}!</h2>
          <p className="text-gray-400 mb-8">
            This is your dashboard. More features coming soon!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 border-2 border-ups-brown rounded p-6">
              <h3 className="text-xl font-bold text-ups-gold mb-3">Upload Contract</h3>
              <p className="text-gray-400 mb-4">Upload a contract document for analysis.</p>
              <button className="bg-ups-brown hover:bg-ups-gold text-ups-gold hover:text-ups-brown font-bold py-2 px-4 rounded transition-all duration-300 uppercase">
                Choose File
              </button>
            </div>

            <div className="bg-gray-800 border-2 border-ups-brown rounded p-6">
              <h3 className="text-xl font-bold text-ups-gold mb-3">File Grievances</h3>
              <p className="text-gray-400 mb-4">Create and file grievance documents.</p>
              <button className="bg-ups-brown hover:bg-ups-gold text-ups-gold hover:text-ups-brown font-bold py-2 px-4 rounded transition-all duration-300 uppercase">
                New Grievance
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
