'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Link from 'next/link';

function AnalyzePageContent() {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const contractId = searchParams.get('id');
        if (contractId) {
          const snap = await getDoc(doc(db, 'contracts', contractId));
          if (snap.exists()) setContract({ id: snap.id, ...snap.data() });
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router, searchParams]);

  const handleAnalyze = async () => {
    if (!contract) return;
    setAnalyzing(true);
    setError('');
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractText: contract.text })
      });
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('Analysis failed');
    } finally {
      setAnalyzing(false);
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
            <Link href="/dashboard"><button className="bg-ups-brown text-ups-gold px-6 py-2 rounded uppercase">Dashboard</button></Link>
            <button onClick={() => { signOut(auth); router.push('/'); }} className="bg-ups-brown text-ups-gold px-6 py-2 rounded uppercase">Logout</button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-6">
        {contract && (
          <>
            <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8 mb-8">
              <h2 className="text-3xl font-bold text-ups-gold mb-2">{contract.name}</h2>
              <p className="text-gray-400">Analyzing for labor law violations</p>
            </div>
            {error && <div className="bg-red-900 text-red-100 p-4 rounded mb-8">{error}</div>}
            <button onClick={handleAnalyze} disabled={analyzing} className="bg-ups-brown text-ups-gold px-8 py-3 rounded uppercase font-bold mb-8">
              {analyzing ? 'Analyzing...' : 'Analyze Contract'}
            </button>
            {results && (
              <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8">
                <h3 className="text-2xl font-bold text-ups-gold mb-6">Results</h3>
                {results.violations && results.violations.length > 0 && (
                  <div className="bg-gray-800 border-l-4 border-red-600 p-6 mb-6">
                    <h4 className="text-xl font-bold text-red-400 mb-4">Violations Found ({results.violations.length})</h4>
                    <ul className="space-y-3">
                      {results.violations.map((v, i) => (
                        <li key={i} className="text-gray-300">
                          <p className="font-semibold">{v.type}</p>
                          <p className="text-sm text-gray-400">{v.description}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {results.summary && (
                  <div className="bg-gray-800 border border-ups-gold p-6">
                    <h4 className="text-xl font-bold text-ups-gold mb-4">Summary</h4>
                    <p className="text-gray-300">{results.summary}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-ups-black flex items-center justify-center">
        <p className="text-ups-gold">Loading...</p>
      </div>
    }>
      <AnalyzePageContent />
    </Suspense>
  );
}
