'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Link from 'next/link';

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setName(userDoc.data().name || '');
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError('Failed to load settings');
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleSaveName = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name: name.trim()
      });
      setSuccess('Display name updated successfully!');
    } catch (err) {
      setError('Failed to update name');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-ups-black flex items-center justify-center"><p className="text-ups-gold">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-ups-black">
      <header className="border-b border-ups-brown bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/"><h1 className="text-3xl font-bold text-ups-gold">GRIEVANCE AI</h1></Link>
          <div className="space-x-4">
            <Link href="/dashboard"><button className="bg-ups-brown text-ups-gold px-6 py-2 rounded uppercase">Dashboard</button></Link>
            <button onClick={() => { signOut(auth); router.push('/'); }} className="bg-ups-brown text-ups-gold px-6 py-2 rounded uppercase">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-ups-gold mb-2">Settings</h2>
          <p className="text-gray-400">Manage your account preferences</p>
        </div>

        {error && <div className="bg-red-900 text-red-100 p-4 rounded mb-8">{error}</div>}
        {success && <div className="bg-green-900 text-green-100 p-4 rounded mb-8">{success}</div>}

        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8">
          <h3 className="text-2xl font-bold text-ups-gold mb-6">Display Name</h3>
          
          <form onSubmit={handleSaveName} className="space-y-4">
            <div>
              <label className="block text-ups-gold font-semibold mb-2">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white"
                disabled={saving}
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-ups-brown text-ups-gold py-2 rounded uppercase font-bold"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
