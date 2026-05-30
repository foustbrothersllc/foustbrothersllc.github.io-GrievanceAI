'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

const jobTypes = [
  'Feeder Driver',
  'Package Car Driver',
  'Sleeper Team',
  'Part-Time Hub/Preload',
  'Air Driver',
  'Combo Worker',
  'Mechanic',
  'Specialist',
  'Other',
];

export default function ContractQA() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [classification, setClassification] = useState('');
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (!u) { router.push('/login'); return; }
      setUser(u);
      try {
        const snap = await getDoc(doc(db, 'users', u.uid));
        if (snap.exists()) {
          const data = snap.data();
          setUserName(data.name || '');
          setIsAdmin(data.isAdmin === true);
        }
      } catch (e) {}
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setAsking(true);
    setError('');
    setResult(null);
    try {
      const response = await fetch('/api/contract-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classification, question: question.trim() })
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError('Request failed. Please try again.');
    } finally {
      setAsking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleAsk();
    }
  };

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
            {isAdmin && (
              <Link href="/admin" className="flex-1">
                <button className="w-full bg-ups-brown text-ups-gold px-3 py-2 rounded uppercase text-xs font-bold">🔑 Admin</button>
              </Link>
            )}
            <Link href="/settings" className="flex-1">
              <button className="w-full bg-ups-brown text-ups-gold px-3 py-2 rounded uppercase text-xs font-bold">⚙️ Settings</button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">

        {/* Page header */}
        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-ups-gold mb-1">📋 Contract Q&amp;A</h2>
          <p className="text-gray-400 text-sm">Ask anything about your contract — or say "show me Article 51" to read the contract directly.</p>
        </div>

        {error && (
          <div className="bg-red-900 text-red-100 p-4 rounded mb-6 text-sm">{error}</div>
        )}

        {/* Input card */}
        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-ups-gold mb-4">Ask a Question</h3>
          <div className="space-y-4">

            <div>
              <label className="block text-ups-gold font-semibold mb-2 text-sm">Job Classification <span className="text-gray-500 font-normal">(optional — helps with classification-specific answers)</span></label>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value)}
                className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white text-base"
                disabled={asking}
              >
                <option value="">Select your job type...</option>
                {jobTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-ups-gold font-semibold mb-2 text-sm">Your Question</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Try asking:\n• "When is my next raise and how much?"\n• "What are my meal break rights?"\n• "Show me Article 51"\n• "Show me the article about harassment"`}
                className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white h-40 text-base resize-none"
                disabled={asking}
              />
              <p className="text-gray-600 text-xs mt-1">Tip: Press Cmd+Enter / Ctrl+Enter to submit</p>
            </div>

            <button
              onClick={handleAsk}
              disabled={asking || !question.trim()}
              className="w-full bg-ups-brown text-ups-gold py-4 rounded uppercase font-bold text-base disabled:opacity-50 hover:bg-yellow-900 transition-colors"
            >
              {asking ? '⏳ Looking up your answer...' : '🔍 Ask'}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && (
          <>
            {/* Q&A Answer mode */}
            {result.mode === 'qa' && (
              <div className="bg-gray-900 border-2 border-ups-gold rounded-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-ups-brown">
                  <span className="text-2xl">💬</span>
                  <div>
                    <h3 className="text-xl font-bold text-ups-gold">Your Contract Answer</h3>
                    {result.provider && (
                      <p className="text-gray-600 text-xs">via {result.provider}</p>
                    )}
                  </div>
                </div>
                <div className="text-gray-100 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                  {result.answer}
                </div>
                <div className="mt-4 pt-3 border-t border-ups-brown">
                  <p className="text-gray-500 text-xs">💡 This is an explanation of your contract rights, not legal advice. Talk to your steward for official guidance.</p>
                </div>
              </div>
            )}

            {/* Article Lookup mode — found */}
            {result.mode === 'lookup' && result.found && (
              <div className="space-y-4 mb-6">
                {result.sections.map((section, idx) => (
                  <div key={idx} className="bg-gray-900 border-2 border-ups-gold rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-ups-brown">
                      <span className="text-2xl">📄</span>
                      <div>
                        <h3 className="text-xl font-bold text-ups-gold">
                          Contract Language — Article {section.articleNum}
                        </h3>
                        <p className="text-gray-400 text-xs">{section.contractName}</p>
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded p-4 text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-mono border-l-4 border-ups-gold overflow-auto max-h-[600px]">
                      {section.text}
                    </div>
                    <div className="mt-4 pt-3 border-t border-ups-brown">
                      <p className="text-gray-500 text-xs">📄 This is the raw contract text. Ask a question about it and the AI will explain it in plain English.</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Article Lookup mode — not found */}
            {result.mode === 'lookup' && !result.found && (
              <div className="bg-gray-900 border-2 border-ups-gold rounded-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">⚠️</span>
                  <h3 className="text-xl font-bold text-ups-gold">Article Not Found</h3>
                </div>
                <p className="text-gray-300 text-sm">{result.message}</p>
                <div className="mt-4 bg-gray-800 rounded p-3">
                  <p className="text-ups-gold text-xs font-bold mb-2">QUICK REFERENCE — COMMON ARTICLES:</p>
                  <div className="grid grid-cols-2 gap-1 text-gray-400 text-xs">
                    <span>Article 7 — Grievance Procedure</span>
                    <span>Article 17 — Short/Missing Pay</span>
                    <span>Article 18 — Safety & Equipment</span>
                    <span>Article 22 — Part-Time Pay</span>
                    <span>Article 37 — Dignity & 9.5 Rights</span>
                    <span>Article 41 — Full-Time Wages</span>
                    <span>Article 43 — Sleeper/Mileage</span>
                    <span>Article 48 — Seniority (Local)</span>
                    <span>Article 51 — Meal Breaks (Local)</span>
                    <span>Article 60 — Daily Guarantee (Local)</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Quick reference chips — shown before any result */}
        {!result && !asking && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
            <p className="text-gray-500 text-xs font-bold uppercase mb-3">Quick lookups — tap to fill</p>
            <div className="flex flex-wrap gap-2">
              {[
                'When is my next raise?',
                'Show me Article 51',
                'What are my meal break rights?',
                'Show me the article about harassment',
                'What is my daily guarantee?',
                'Show me Article 37',
                'What does Article 17 say?',
                'Show me the article about seniority',
                'What are my 9.5 rights?',
                'Show me the article about sleeper teams',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setQuestion(q)}
                  className="bg-gray-800 text-gray-300 text-xs px-3 py-1.5 rounded border border-gray-700 hover:border-ups-gold hover:text-ups-gold transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
