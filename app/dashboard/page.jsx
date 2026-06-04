'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [classification, setClassification] = useState('');
  const [question, setQuestion] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const jobTypes = ['Feeder Driver', 'Sleeper Team', 'Package Car Driver', 'Specialist', 'Mechanic', 'Combo Worker', 'Part Time'];

  const [spellchecking, setSpellchecking] = useState(false);
  const [spellcheckEnabled, setSpellcheckEnabled] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.status === 'disabled') {
              await signOut(auth);
              router.push('/blocked');
              return;
            }
            setUserName(data.name || currentUser.email);
            setIsAdmin(data.role === 'admin');
          } else {
            setUserName(currentUser.email);
          }
        } catch (err) {
          setUserName(currentUser.email);
        }
        // Load app settings for spellcheck toggle
        try {
          const settingsSnap = await getDoc(doc(db, 'settings', 'app'));
          if (settingsSnap.exists()) {
            setSpellcheckEnabled(settingsSnap.data().spellcheckEnabled === true);
          }
        } catch (e) {}
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleSpellcheck = async () => {
    if (!question.trim()) return;
    setSpellchecking(true);
    try {
      const response = await fetch('/api/spellcheck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: question.trim() })
      });
      const data = await response.json();
      if (data.corrected) setQuestion(data.corrected);
    } catch (err) {
      // Fail silently
    } finally {
      setSpellchecking(false);
    }
  };

  const translateDriverSlang = (userSpeech) => {
    let cleanedText = userSpeech;
    const slangMap = [
      { regex: /worked me to death|killed me with hours|forced over/i, tag: "excessive dispatch over 9.5 hours" },
      { regex: /cut me short|sent me home early|didn't get my time/i, tag: "sent home early before 8 hours" },
      { regex: /brought in an outside guy|coyote truck|rail trailer/i, tag: "vendor trailer foreign power contractor" },
      { regex: /truck is a piece of junk|broken down|bad brakes/i, tag: "red tag unsafe mechanical issue breakdown" },
      { regex: /skipped me|let a junior guy go|gave my run away/i, tag: "bypassed senior driver less senior" },
      { regex: /ate on the fly|no time to eat|supervisor rushed my break/i, tag: "worked through lunch no meal period" },
      { regex: /short check|missing pay|didn't pay me right/i, tag: "paid wrong rate short check missing pay" },
      { regex: /sleeper|team run|two man run/i, tag: "sleeper team premium service" },
      { regex: /retaliation|targeting me|out to get me/i, tag: "grievance retaliation punished for filing" },
      { regex: /14 hours|been out all day|driving forever/i, tag: "over 14 hours FMCSA violation" },
    ];
    slangMap.forEach(item => {
      if (item.regex.test(userSpeech)) {
        cleanedText += " [System Tag: User describes an issue related to " + item.tag + "]";
      }
    });
    return cleanedText;
  };

  const handleAnalyze = async () => {
    if (!question.trim()) { setError('Please describe your situation before analyzing.'); return; }
    setAnalyzing(true);
    setError('');
    setResults(null);
    try {
      const translatedQuestion = translateDriverSlang(question);
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classification, question: translatedQuestion })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setResults(data.analysis);
    } catch (err) {
      setError('Analysis failed: ' + err.message);
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
          <h2 className="text-2xl font-bold text-ups-gold mb-1">⚖️ File a Grievance</h2>
          <p className="text-gray-400 text-sm">Describe your situation and we'll check it against your contract.</p>
        </div>

        {error && <div className="bg-red-900 text-red-100 p-4 rounded mb-6 text-sm">{error}</div>}

        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-ups-gold mb-4">Contract Analysis</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-ups-gold font-semibold mb-2 text-sm">
                Job Classification <span className="text-gray-500 font-normal">(optional — helps get a more accurate result)</span>
              </label>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value)}
                className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white text-base"
                disabled={analyzing}
              >
                <option value="">Select your job type...</option>
                {jobTypes.map((type) => (<option key={type} value={type}>{type}</option>))}
              </select>
              <p className="text-gray-600 text-xs mt-1">If you don't select one, just mention your job in your description and it will be detected automatically.</p>
            </div>
            <div>
              <label className="block text-ups-gold font-semibold mb-2 text-sm">Describe Your Situation</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Describe what happened in your own words. e.g., 'I'm a feeder driver and they sent me home after 6 hours without my 8-hour guarantee.'"
                className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white h-48 text-base resize-none"
                disabled={analyzing || spellchecking}
              />
            </div>

            {/* Spellcheck button — only shown when admin has it enabled */}
            {spellcheckEnabled && (
              <button
                onClick={handleSpellcheck}
                disabled={spellchecking || analyzing || !question.trim()}
                className="w-full bg-gray-700 text-gray-200 py-2 rounded font-bold text-sm disabled:opacity-50 hover:bg-gray-600 transition-colors border border-gray-600"
              >
                {spellchecking ? '⏳ Checking spelling...' : '✏️ Spellcheck'}
              </button>
            )}

            <button
              onClick={handleAnalyze}
              disabled={analyzing || spellchecking || !question.trim()}
              className="w-full bg-ups-brown text-ups-gold py-4 rounded uppercase font-bold text-base disabled:opacity-50 hover:bg-yellow-900 transition-colors"
            >
              {analyzing ? '⏳ Analyzing... Please wait' : '🔍 Analyze'}
            </button>
          </div>
        </div>

        {results && (() => {
          const hasViolation = results.includes('OVERALL VERDICT: YES') || results.includes('YES - VIOLATION FOUND');
          return (
            <div className={`border-2 rounded-lg p-6 mb-6 ${hasViolation ? 'bg-red-900 border-red-600 text-red-100' : 'bg-green-900 border-green-600 text-green-100'}`}>
              <h3 className="text-xl font-bold mb-3">
                {hasViolation ? '⚠️ Violation(s) Found' : '✅ No Violations Found'}
              </h3>
              <p className="whitespace-pre-wrap mb-6 text-sm leading-relaxed">{results}</p>
              {hasViolation && (
                <Link href={`/grievance?violation=${encodeURIComponent(results)}&classification=${classification}&question=${encodeURIComponent(question)}`}>
                  <button className="w-full bg-ups-gold text-ups-brown py-4 rounded uppercase font-bold text-base">
                    📄 File Grievance
                  </button>
                </Link>
              )}
            </div>
          );
        })()}
      </main>
    </div>
  );
}
