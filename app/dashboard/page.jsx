'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Get user data including name and role
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserName(userDoc.data().name || currentUser.email);
            setIsAdmin(userDoc.data().role === 'admin');
          } else {
            setUserName(currentUser.email);
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setUserName(currentUser.email);
        }

        // Load contracts
        try {
          const snapshot = await getDocs(collection(db, 'contracts'));
          setContracts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
          console.error('Error loading contracts:', err);
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) return <div className="min-h-screen bg-ups-black flex items-center justify-center"><p className="text-ups-gold">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-ups-black">
      <header className="border-b border-ups-brown bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/"><h1 className="text-3xl font-bold text-ups-gold">GRIEVANCE AI</h1></Link>
          <div className="space-x-4">
            {isAdmin && (
              <Link href="/admin"><button className="bg-ups-brown text-ups-gold px-6 py-2 rounded uppercase">Admin</button></Link>
            )}
            <button onClick={() => { signOut(auth); router.push('/'); }} className="bg-ups-brown text-ups-gold px-6 py-2 rounded uppercase">Logout</button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-ups-gold mb-2">Welcome, {userName}!</h2>
          <p className="text-gray-400">Analyze contracts for labor law violations</p>
        </div>
        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8">
          <h3 className="text-2xl font-bold text-ups-gold mb-6">Available Contracts ({contracts.length})</h3>
          {contracts.length > 0 ? (
            <div className="space-y-3">
              {contracts.map((c) => (
                <div key={c.id} className="bg-gray-800 border border-ups-brown rounded p-4 flex justify-between items-center">
                  <div>
                    <p className="text-white font-semibold">{c.name}</p>
                    <p className="text-gray-500 text-sm">{c.text.substring(0, 100)}...</p>
                  </div>
                  <Link href={`/analyze?id=${c.id}`}><button className="bg-ups-brown text-ups-gold px-4 py-2 rounded">Analyze</button></Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No contracts yet. Admin can add them.</p>
          )}
        </div>
      </main>
    </div>
  );
}
