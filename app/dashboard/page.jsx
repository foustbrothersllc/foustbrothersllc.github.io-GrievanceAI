'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { signOut } from 'firebase/auth';

export default function AnalyzePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [contractName, setContractName] = useState('');
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const contract = searchParams.get('contract');
        if (contract) setContractName(decodeURIComponent(contract));
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, searchParams]);

  const handleAnalyze = async () => {
    if (!contractName) {
      setError('No contract selected');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractName,
          userId: user.uid,
        }),
      });

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setAnalysisResults(data);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze contract');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
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

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-ups-gold mb-2">Contract Analysis</h2>
          <p className="text-gray-400">Analyze {contractName} for potential violations</p>
        </div>

        {error && (
          <div className="bg-red-900 border-2 border-red-600 text-red-100 p-4 rounded mb-8">
            {error}
          </div>
        )}

        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-ups-gold mb-6">Analysis Options</h3>
          
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="bg-ups-brown hover:bg-ups-gold text-ups-gold hover:text-ups-brown font-bold py-3 px-8 rounded transition-all duration-300 uppercase disabled:opacity-50"
          >
            {analyzing ? 'ANALYZING...' : 'ANALYZE CONTRACT'}
          </button>
        </div>

        {analysisResults && (
          <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8">
            <h3 className="text-2xl font-bold text-ups-gold mb-6">Analysis Results</h3>
            
            <div className="space-y-6">
              {/* Violations */}
              {analysisResults.violations && analysisResults.violations.length > 0 && (
                <div className="bg-gray-800 border border-red-600 rounded p-6">
                  <h4 className="text-xl font-bold text-red-400 mb-4">
                    ⚠️ Potential Violations Found ({analysisResults.violations.length})
                  </h4>
                  <ul className="space-y-3">
                    {analysisResults.violations.map((violation, idx) => (
                      <li key={idx} className="text-gray-300 border-l-4 border-red-600 pl-4">
                        <p className="font-semibold">{violation.type}</p>
                        <p className="text-sm text-gray-400">{violation.description}</p>
                        <p className="text-sm text-gray-500 mt-1">Section: {violation.section}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Compliant Clauses */}
              {analysisResults.compliant && analysisResults.compliant.length > 0 && (
                <div className="bg-gray-800 border border-green-600 rounded p-6">
                  <h4 className="text-xl font-bold text-green-400 mb-4">
                    ✅ Compliant Clauses ({analysisResults.compliant.length})
                  </h4>
                  <ul className="space-y-2">
                    {analysisResults.compliant.map((clause, idx) => (
                      <li key={idx} className="text-gray-300">✓ {clause}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Summary */}
              <div className="bg-gray-800 border border-ups-gold rounded p-6">
                <h4 className="text-xl font-bold text-ups-gold mb-4">Summary</h4>
                <p className="text-gray-300">{analysisResults.summary}</p>
              </div>

              {/* File Grievance Button */}
              <Link href={`/grievance?violations=${encodeURIComponent(JSON.stringify(analysisResults.violations))}`}>
                <button className="w-full bg-ups-brown hover:bg-ups-gold text-ups-gold hover:text-ups-brown font-bold py-3 px-8 rounded transition-all duration-300 uppercase">
                  File Grievance Based on Analysis
                </button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
