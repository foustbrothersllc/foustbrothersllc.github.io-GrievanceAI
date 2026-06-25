'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

export default function ContractQA() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [spellchecking, setSpellchecking] = useState(false);
  const [spellcheckEnabled, setSpellcheckEnabled] = useState(false);
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
          setIsAdmin(data.role === 'admin');
        }
      } catch (e) {}
      // Load app settings for spellcheck toggle
      try {
        const settingsSnap = await getDoc(doc(db, 'settings', 'app'));
        if (settingsSnap.exists()) {
          setSpellcheckEnabled(settingsSnap.data().spellcheckEnabled === true);
        }
      } catch (e) {}
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleSpellcheck = async () => {
    if (!question.trim()) return;
    setSpellchecking(true);
    setError('');
    try {
      const response = await fetch('/api/spellcheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: question.trim() })
      });
      const data = await response.json();
      if (data.corrected) setQuestion(data.corrected);
    } catch (err) {
      // Fail silently — spellcheck is optional
    } finally {
      setSpellchecking(false);
    }
  };

  const handleAsk = async () => {
    if (!question.trim()) return;
    setAsking(true);
    setError('');
    setResult(null);
    try {
      const response = await fetch('/api/contract-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classification: '', question: question.trim() })
      });
      const data = await response.json();
      if (data.error) setError(data.error);
      else setResult(data);
    } catch (err) {
      setError('Request failed. Please try again.');
    } finally {
      setAsking(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAsk();
  };

  if (loading) return (
    <div className="min-h-screen bg-ups-black flex items-center justify-center">
      <p className="text-ups-gold text-xl">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-ups-black">
      <header className="border-b border-ups-brown bg-gray-900 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center">
            <Link href="/hub">
              <h1 className="text-2xl font-bold text-ups-gold cursor-pointer">GRIEVANCE AI</h1>
            </Link>
            <div className="flex gap-2 items-center">
              {isAdmin && (
                <Link href="/admin">
                  <button className="bg-ups-brown text-ups-gold px-4 py-2 rounded uppercase text-sm font-bold">🔑 Admin</button>
                </Link>
              )}
              <Link href="/settings">
                <button className="bg-ups-brown text-ups-gold px-4 py-2 rounded uppercase text-sm font-bold">⚙️ Settings</button>
              </Link>
              <Link href="/hub">
                <button className="bg-ups-brown text-ups-gold px-4 py-2 rounded uppercase text-sm font-bold">🏠 Home</button>
              </Link>
              <button onClick={() => { signOut(auth); router.push('/'); }} className="bg-ups-brown text-ups-gold px-4 py-2 rounded uppercase text-sm font-bold">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-ups-gold mb-1">📋 Contract Q&amp;A</h2>
          <p className="text-gray-400 text-sm">Ask anything about your contract — or say "show me Article 51" to read the contract directly.</p>
        </div>

        {error && <div className="bg-red-900 text-red-100 p-4 rounded mb-6 text-sm">{error}</div>}

        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-ups-gold mb-4">Ask a Question</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-ups-gold font-semibold mb-2 text-sm">Your Question</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Try asking:\n• "I'm a feeder driver — can they send me home before 8 hours?"\n• "What are my meal break rights as a package car driver?"\n• "Show me Article 51"\n• "Show me the article about harassment"`}
                className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white h-40 text-base resize-none"
                disabled={asking || spellchecking}
              />
              <p className="text-gray-600 text-xs mt-1">Tip: Mention your job type in your question for the most accurate answer. Press Cmd+Enter / Ctrl+Enter to submit.</p>
            </div>

            {/* Spellcheck button — only shown when admin has it enabled */}
            {spellcheckEnabled && (
              <button
                onClick={handleSpellcheck}
                disabled={spellchecking || asking || !question.trim()}
                className="w-full bg-gray-700 text-gray-200 py-2 rounded font-bold text-sm disabled:opacity-50 hover:bg-gray-600 transition-colors border border-gray-600"
              >
                {spellchecking ? '⏳ Checking spelling...' : '✏️ Spellcheck'}
              </button>
            )}

            <button onClick={handleAsk} disabled={asking || spellchecking || !question.trim()} className="w-full bg-ups-brown text-ups-gold py-4 rounded uppercase font-bold text-base disabled:opacity-50 hover:bg-yellow-900 transition-colors">
              {asking ? '⏳ Looking up your answer...' : '🔍 Ask'}
            </button>
          </div>
        </div>

        {result && (
          <>
            {result.mode === 'qa' && (
              <div className="bg-gray-900 border-2 border-ups-gold rounded-lg p-6 mb-6">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-ups-brown">
                  <span className="text-2xl">💬</span>
                  <div>
                    <h3 className="text-xl font-bold text-ups-gold">Your Contract Answer</h3>
                    {result.provider && <p className="text-gray-600 text-xs">via {result.provider}</p>}
                  </div>
                </div>
                <div className="text-gray-100 text-sm leading-relaxed whitespace-pre-wrap font-mono">{result.answer}</div>
                <div className="mt-4 pt-3 border-t border-ups-brown">
                  <p className="text-gray-500 text-xs">💡 This is an explanation of your contract rights, not legal advice. Talk to your steward for official guidance.</p>
                </div>
              </div>
            )}

            {result.mode === 'lookup' && result.found && (
              <div className="space-y-4 mb-6">
                {result.sections.map((section, idx) => (
                  <div key={idx} className="bg-gray-900 border-2 border-ups-gold rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-ups-brown">
                      <span className="text-2xl">📄</span>
                      <div>
                        <h3 className="text-xl font-bold text-ups-gold">Contract Language — Article {section.articleNum}</h3>
                        <p className="text-gray-400 text-xs">{section.contractName}</p>
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded p-4 text-gray-200 text-sm leading-relaxed whitespace-pre-wrap font-mono border-l-4 border-ups-gold overflow-auto max-h-[600px]">{section.text}</div>
                    <div className="mt-4 pt-3 border-t border-ups-brown">
                      <p className="text-gray-500 text-xs">📄 This is the raw contract text. For interpretation, ask a question about it.</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {result.mode === 'lookup' && !result.found && (
              <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-6 mb-6">
                <p className="text-gray-400 text-sm">{result.message}</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
