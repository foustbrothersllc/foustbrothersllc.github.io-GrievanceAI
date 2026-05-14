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
      setError('Failed to load contracts');
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
      console.error('Save error:', err);
      setError(`Failed to save contract: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContract = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contract?')) return;

    try {
      await deleteDoc(doc(db, 'contracts', id));
      setSuccess('Contract deleted successfully!');
      loadContracts();
    } catch (err) {
      console.error('Delete error:', err);
      setError(`Failed to delete contract: ${err.message}`);
    }
  };

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
      <header className="border-b border-ups-brown bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/">
            <h1 className="text-3xl font-bold text-ups-gold hover:text-yellow-300 cursor-pointer">
              GRIEVANCE AI
            </h1>
          </Link>
          <div className="space-x-4">
            <Link href="/dashboard">
              <button className="bg-ups-brown hover:bg-ups-gold text-ups-gold hover:text-ups-brown font-bold py-2 px-6 rounded transition-all duration-300 uppercase">
                Dashboard
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="bg-ups-brown hover:bg-ups-gold text-ups-gold hover:text-ups-brown font-bold py-2 px-6 rounded transition-all duration-300 uppercase"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-ups-gold mb-2">Admin Panel</h2>
          <p className="text-gray-400">Add and manage contracts</p>
        </div>

        {error && (
          <div className="bg-red-900 border-2 border-red-600 text-red-100 p-4 rounded mb-8">
            <p className="font-semibold">❌ Error</p>
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-900 border-2 border-green-600 text-green-100 p-4 rounded mb-8">
            <p>{success}</p>
          </div>
        )}

        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-ups-gold mb-6">Add New Contract</h3>
          
          <form onSubmit={handleSaveContract} className="space-y-6">
            <div>
              <label className="block text-ups-gold font-semibold mb-2">Contract Name</label>
              <input
                type="text"
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
                placeholder="e.g., Union Agreement 2024"
                className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-ups-gold"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-ups-gold font-semibold mb-2">Contract Text</label>
              <textarea
                value={contractText}
                onChange={(e) => setContractText(e.target.value)}
                placeholder="Paste or type the full contract text here..."
                className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-ups-gold h-64"
                disabled={saving}
              />
              <p className="text-gray-400 text-sm mt-2">
                {contractText.length} characters
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-ups-brown hover:bg-ups-gold text-ups-gold hover:text-ups-brown font-bold py-3 px-6 rounded transition-all duration-300 uppercase disabled:opacity-50"
            >
              {saving ? 'SAVING...' : 'SAVE CONTRACT'}
            </button>
          </form>
        </div>

        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8">
          <h3 className="text-2xl font-bold text-ups-gold mb-6">Shared Contracts ({contracts.length})</h3>
          
          {contracts.length > 0 ? (
            <div className="space-y-3">
              {contracts.map((contract) => (
                <div key={contract.id} className="bg-gray-800 border border-ups-brown rounded p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <p className="text-white font-semibold text-lg">{contract.name}</p>
                      <p className="text-gray-400 text-sm">Uploaded: {contract.uploadedAt}</p>
                      <p className="text-gray-500 text-sm mt-2">{contract.preview}</p>
                    </div>
                    <div className="space-x-2 ml-4">
                      <Link href={`/analyze?contract=${encodeURIComponent(contract.name)}`}>
                        <button className="bg-ups-brown hover:bg-ups-gold text-ups-gold hover:text-ups-brown font-bold py-2 px-4 rounded transition-all duration-300 uppercase text-sm">
                          Analyze
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDeleteContract(contract.id)}
                        className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-all duration-300 uppercase text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 border-2 border-ups-brown rounded-lg p-8 text-center">
              <p className="text-gray-400">No contracts yet. Add one above to get started!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
