'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import Link from 'next/link';

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [contractName, setContractName] = useState('');
  const [contractText, setContractText] = useState('');
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
      const querySnapshot = await getDocs(collection(db, 'contracts'));
      const contractList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        uploadedAt: doc.data().createdAt?.toDate().toLocaleDateString() || 'Unknown',
        preview: doc.data().text.substring(0, 100) + '...'
      }));
      setContracts(contractList);
    } catch (err) {
      console.error('Error loading contracts:', err);
    }
  };

  const handleSaveContract = async (e) => {
    e.preventDefault();
    
    if (!contractName.trim()) {
      setError('Please enter a contract name');
      return;
    }

    if (!contractText.trim()) {
      setError('Please enter contract text');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await addDoc(collection(db, 'contracts'), {
        name: contractName,
        text: contractText,
        createdAt: serverTimestamp(),
        uploadedBy: user.email
      });

      setSuccess(`"${contractName}" saved successfully! ✅`);
      setContractName('');
      setContractText('');
      loadContracts();
    } catch (err) {
      setError(`Failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContract = async (id) => {
    if (!window.confirm('Delete this contract?')) return;
    try {
      await deleteDoc(doc(db, 'contracts', id));
      setSuccess('Deleted!');
      loadContracts();
    } catch (err) {
      setError(`Failed: ${err.message}`);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (loading) return <div className="min-h-screen bg-ups-black flex items-center justify-center"><p className="text-ups-gold">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-ups-black">
      <header className="border-b border-ups-brown bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/"><h1 className="text-3xl font-bold text-ups-gold">GRIEVANCE AI</h1></Link>
          <div className="space-x-4">
            <Link href="/dashboard"><button className="bg-ups-brown text-ups-gold px-6 py-2 rounded uppercase">Dashboard</button></Link>
            <button onClick={handleLogout} className="bg-ups-brown text-ups-gold px-6 py-2 rounded uppercase">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-ups-gold mb-2">Admin Panel</h2>
        </div>

        {error && <div className="bg-red-900 text-red-100 p-4 rounded mb-8">{error}</div>}
        {success && <div className="bg-green-900 text-green-100 p-4 rounded mb-8">{success}</div>}

        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-ups-gold mb-6">Add Contract</h3>
          <form onSubmit={handleSaveContract} className="space-y-4">
            <input type="text" value={contractName} onChange={(e) => setContractName(e.target.value)} placeholder="Contract Name" className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white" disabled={saving} />
            <textarea value={contractText} onChange={(e) => setContractText(e.target.value)} placeholder="Paste contract text..." className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white h-64" disabled={saving} />
            <button type="submit" disabled={saving} className="w-full bg-ups-brown text-ups-gold py-2 rounded uppercase">{saving ? 'Saving...' : 'Save'}</button>
          </form>
        </div>

        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8">
          <h3 className="text-2xl font-bold text-ups-gold mb-6">Contracts ({contracts.length})</h3>
          {contracts.length > 0 ? (
            <div className="space-y-3">
              {contracts.map((c) => (
                <div key={c.id} className="bg-gray-800 border border-ups-brown rounded p-4 flex justify-between">
                  <div><p className="text-white font-semibold">{c.name}</p><p className="text-gray-500 text-sm">{c.preview}</p></div>
                  <button onClick={() => handleDeleteContract(c.id)} className="bg-red-700 text-white px-4 py-2 rounded">Delete</button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No contracts yet</p>
          )}
        </div>
      </main>
    </div>
  );
}
