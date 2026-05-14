'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { ref, listAll } from 'firebase/storage';
import { getStorage } from 'firebase/storage';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

const storage = getStorage();

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          const userData = userDoc.data();
          setIsAdmin(userData?.role === 'admin');
        } catch (err) {
          console.error('Error fetching user role:', err);
        }

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
      const contractsRef = ref(storage, 'contracts/shared');
      const result = await listAll(contractsRef);
      
      const contractList = result.items.map(item => ({
        name: item.name,
        path: item.fullPath,
        uploadedAt: new Date(item.metadata?.timeCreated).toLocaleDateString()
      }));
      
      setContracts(contractList);
    } catch (err) {
      console.error('Error loading contracts:', err);
      setError('Failed to load contracts');
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
          <div className="space-x-4 flex items-center">
            {isAdmin && (
              <Link href="/admin">
                <button className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-6 rounded transition-all duration-300 uppercase">
                  Admin Panel
                </button>
              </Link>
            )}
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
          <h2 className="text-3xl font-bold text-ups-gold mb-2">Welcome, {user?.email}!</h2>
          <p className="text-gray-400">
            {isAdmin ? 'Admin User - Contract Analysis & Grievance Filing' : 'Contract Analysis & Grievance Filing'}
          </p>
        </div>

        {error && (
          <div className="bg-red-900 border-2 border-red-600 text-red-100 p-4 rounded mb-8">
            {error}
          </div>
        )}

        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8">
          <h3 className="text-2xl font-bold text-ups-gold mb-6">Available Contracts</h3>
          
          {contracts.length > 0 ? (
            <div className="space-y-3">
              {contracts.map((contract, index) => (
                <div key={index} className="bg-gray-800 border border-ups-brown rounded p-4 flex justify-between items-center">
                  <div>
                    <p className="text-white font-semibold">{contract.name}</p>
                    <p className="text-gray-400 text-sm">Uploaded: {contract.uploadedAt}</p>
                  </div>
                  <Link href={`/analyze?contract=${encodeURIComponent(contract.name)}`}>
                    <button className="bg-ups-brown hover:bg-ups-gold text-ups-gold hover:text-ups-brown font-bold py-2 px-4 rounded transition-all duration-300 uppercase text-sm">
                      Analyze
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 border-2 border-ups-brown rounded-lg p-8 text-center">
              <p className="text-gray-400">No contracts available yet. {isAdmin && 'Upload one from the Admin Panel.'}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
