'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';

export default function ContractQA() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [spellchecking, setSpellchecking] = useState(false);
  const [spellcheckEnabled, setSpellcheckEnabled] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showClassInfo, setShowClassInfo] = useState(false);
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
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // Real-time listener for spellcheck setting — updates instantly when admin toggles
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'app'), (snap) => {
      if (snap.exists()) {
        setSpellcheckEnabled(snap.data().spellcheckEnabled !== false);
      } else {
        setSpellcheckEnabled(true); // default on if doc doesn't exist yet
      }
    }, () => {
      setSpellcheckEnabled(true); // fail safe
    });
    return () => unsub();
  }, []);

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

        {/* Classification Info Panel */}
        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg mb-6 overflow-hidden">
          <button
            onClick={() => setShowClassInfo(!showClassInfo)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">ℹ️</span>
              <div>
                <p className="text-ups-gold font-bold text-sm">Not sure which contract covers you?</p>
                <p className="text-gray-400 text-xs">Tap to see the difference between classifications</p>
              </div>
            </div>
            <span className="text-ups-gold text-xl">{showClassInfo ? '▲' : '▼'}</span>
          </button>

          {showClassInfo && (
            <div className="px-6 pb-6 border-t border-ups-brown">
              <p className="text-gray-400 text-xs mt-4 mb-4">Just ask your question in plain English — you don't need to select anything. But if you're not sure what rules apply to you, here's the quick breakdown:</p>

              <div className="space-y-3">
                <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-ups-gold">
                  <p className="text-ups-gold font-bold text-sm mb-1">🚛 Feeder Driver / Sleeper Team</p>
                  <p className="text-gray-300 text-xs">You drive tractor-trailers between hubs or on over-the-road runs. You're covered by the Atlantic Area Supplement for your daily guarantee (8 hrs), meal period, and bid rights. Sleeper teams have additional mileage and split-pay rules under Article 43.</p>
                </div>

                <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-yellow-500">
                  <p className="text-ups-gold font-bold text-sm mb-1">📦 Package Car Driver</p>
                  <p className="text-gray-300 text-xs">You deliver and pick up packages on a daily route. You have an 8-hour daily guarantee, 9.5 overtime protections (if opted in), and route bid rights. Your harassment and dignity rights come from Article 37 of the National Master.</p>
                </div>

                <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
                  <p className="text-ups-gold font-bold text-sm mb-1">🔧 Mechanic</p>
                  <p className="text-gray-300 text-xs">You maintain and repair UPS vehicles or equipment. Your pay rates, apprenticeship rules, and tool allowances are covered under the local Maintenance articles. Journeyman, Automotive Helper, and Maintenance Handyman rates are all different — ask specifically about your sub-classification.</p>
                </div>

                <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-orange-500">
                  <p className="text-ups-gold font-bold text-sm mb-1">📡 Specialist</p>
                  <p className="text-gray-300 text-xs">Specialists are operational support employees — typically working in dispatch, yard control, inbounding, outbounding, or similar hub coordination roles. You are a full-time bargaining unit employee with an 8-hour daily guarantee. Your seniority, bid rights, and discipline protections follow the Atlantic Area Supplement.</p>
                </div>

                <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-green-500">
                  <p className="text-ups-gold font-bold text-sm mb-1">🔄 Combo Worker (22.4 / Inside-Outside)</p>
                  <p className="text-gray-300 text-xs">You work a split shift combining inside hub work and driving. You have an 8-hour daily guarantee and are covered under Article 22 of the National Master for work preservation. Your rights differ from a regular package car driver — especially on overtime and bid priority.</p>
                </div>

                <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-purple-500">
                  <p className="text-ups-gold font-bold text-sm mb-1">📬 Part-Time (Hub / Preload / Air Driver)</p>
                  <p className="text-gray-300 text-xs">You work a single sort or shift inside the building, or drive air packages. Your daily guarantee is 3.5 hours under Article 22 of the National Master. Part-time air drivers have a separate pay progression and slightly different guarantee rules than hub workers.</p>
                </div>

                <div className="bg-gray-800 rounded-lg p-4 border-l-4 border-gray-500">
                  <p className="text-ups-gold font-bold text-sm mb-1">✈️ Full-Time Air Driver</p>
                  <p className="text-gray-300 text-xs">You drive an air route full-time (typically Next Day Air or airport shuttle). You have an 8-hour daily and 40-hour weekly guarantee. Your pay progression and top rate are separate from ground package car drivers.</p>
                </div>
              </div>

              <p className="text-gray-500 text-xs mt-4">💡 Tip: Just mention your job in your question — e.g. "I'm a feeder driver and..." — and the AI will apply the right contract rules automatically.</p>
            </div>
          )}
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
