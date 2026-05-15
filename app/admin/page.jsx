'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, auth } from '@/lib/firebase';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';

const CONTRACTS = [
  {
    name: 'National Master UPS Agreement 2023-2028',
    url: 'https://raw.githubusercontent.com/foustbrothersllc/foustbrothersllc.github.io-GrievanceAI/main/master-agreement.txt'
  },
  {
    name: 'Atlantic Area Supplemental Agreement 2023-2028',
    url: 'https://raw.githubusercontent.com/foustbrothersllc/foustbrothersllc.github.io-GrievanceAI/main/local-agreement.txt'
  }
];

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [progress, setProgress] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadContracts();
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const loadContracts = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'contracts'));
      setContracts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      setError('Failed to load contracts');
    }
  };

  const handleLoadContracts = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      for (const contract of CONTRACTS) {
        setProgress(`Loading: ${contract.name}...`);

        const response = await fetch(contract.url);
        if (!response.ok) throw new Error(`Failed to fetch ${contract.name}`);
        const text = await response.text();

        await addDoc(collection(db, 'contracts'), {
          name: contract.name,
          text: text,
          createdAt: serverTimestamp(),
          uploadedBy: user.email,
          source: contract.url
        });
      }

      setSuccess('Both contracts loaded successfully into Firestore!');
      setProgress('');
      loadContracts();
    } catch (err) {
      setError(`Failed: ${err.message}`);
      setProgress('');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this contract?')) return;
    try {
      await deleteDoc(doc(db, 'contracts', id));
      loadContracts();
    } catch (err) {
      setError('Failed to delete');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('Delete ALL contracts? This will break analysis until you reload them.')) return;
    try {
      for (const c of contracts) {
        await deleteDoc(doc(db, 'contracts', c.id));
      }
      setContracts([]);
      setSuccess('All contracts deleted.');
    } catch (err) {
      setError('Failed to delete all contracts');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-ups-black flex items-center justify-center">
      <p className="text-ups-gold">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-ups-black">
      <header className="border-b border-ups-brown bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/"><h1 className="text-3xl font-bold text-ups-gold">GRIEVANCE AI</h1></Link>
          <div className="space-x-4">
            <Link href="/dashboard">
              <button className="bg-ups-brown text-ups-gold px-6 py-2 rounded uppercase">Dashboard</button>
            </Link>
            <button onClick={() => { signOut(auth); router.push('/'); }} className="bg-ups-brown text-ups-gold px-6 py-2 rounded uppercase">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-ups-gold mb-2">🔑 Admin Panel</h2>
          <p className="text-gray-400">Manage contracts for Grievance AI analysis</p>
        </div>

        {error && <div className="bg-red-900 text-red-100 p-4 rounded mb-6">{error}</div>}
        {success && <div className="bg-green-900 text-green-100 p-4 rounded mb-6">{success}</div>}
        {progress && <div className="bg-blue-900 text-blue-100 p-4 rounded mb-6">⏳ {progress}</div>}

        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-ups-gold mb-4">Load Contracts from GitHub</h3>
          <p className="text-gray-400 mb-6">This will fetch the contract text files from GitHub and save them to Firestore so Gemini can analyze them.</p>

          <div className="space-y-3 mb-6">
            {CONTRACTS.map((c, i) => (
              <div key={i} className="bg-gray-800 border border-ups-brown rounded p-4">
                <p className="text-ups-gold font-semibold">{c.name}</p>
                <p className="text-gray-500 text-sm mt-1 truncate">{c.url}</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleLoadContracts}
            disabled={saving}
            className="w-full bg-ups-gold text-ups-brown py-3 rounded uppercase font-bold disabled:opacity-50"
          >
            {saving ? progress || 'Loading...' : '⬇️ Load Contracts into Firestore'}
          </button>
        </div>

        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-ups-gold">Contracts in Firestore ({contracts.length})</h3>
            {contracts.length > 0 && (
              <button onClick={handleDeleteAll} className="bg-red-700 text-white px-4 py-2 rounded uppercase text-sm">
                Delete All
              </button>
            )}
          </div>

          {contracts.length > 0 ? (
            <div className="space-y-3">
              {contracts.map((c) => (
                <div key={c.id} className="bg-gray-800 border border-ups-brown rounded p-4 flex justify-between items-center">
                  <div>
                    <p className="text-white font-semibold">{c.name}</p>
                    <p className="text-gray-500 text-sm">{c.text?.length?.toLocaleString()} characters</p>
                  </div>
                  <button onClick={() => handleDelete(c.id)} className="bg-red-700 text-white px-4 py-2 rounded">Delete</button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No contracts loaded yet. Click the button above to load them.</p>
          )}
        </div>
      </main>
    </div>
  );
}
