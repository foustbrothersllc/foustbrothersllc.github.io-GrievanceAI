'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

const translateDriverSlang = (userSpeech) => {
  let cleanedText = userSpeech;
  const slangMap = [
    { regex: /worked me to death|killed me with hours|forced over/i, tag: "excessive dispatch over 9.5 hours" },
    { regex: /cut me short|sent me home early|didn't get my time/i, tag: "sent home early before 8 hours" },
    { regex: /brought in an outside guy|coyote truck|rail trailer/i, tag: "vendor trailer foreign power contractor" },
    { regex: /truck is a piece of junk|broken down|bad brakes/i, tag: "red tag unsafe mechanical issue breakdown" },
    { regex: /skipped me|let a junior guy go|gave my run away/i, tag: "bypassed senior driver less senior" },
    { regex: /ate on the fly|no time to eat|supervisor rushed my break/i, tag: "worked through lunch no meal period" },
    { regex: /short check|didn't pay me right|missing from my check/i, tag: "paid wrong rate short check missing pay" },
    { regex: /pulled me off my run|took my load|gave my load away/i, tag: "bypassed less senior" },
    { regex: /made me drive too long|too many hours driving|over my hours/i, tag: "feeder driver over 14 hours FMCSA" },
    { regex: /retaliated|targeting me|out to get me after my grievance/i, tag: "grievance retaliation punished for filing" },
  ];
  slangMap.forEach(item => {
    if (item.regex.test(userSpeech)) {
      cleanedText += ' [System Tag: User describes an issue related to ' + item.tag + ']';
    }
  });
  return cleanedText;
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [classification, setClassification] = useState('');
  const [question, setQuestion] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const jobTypes = ['Feeder Driver', 'Sleeper Team', 'Package Car Driver', 'Specialist', 'Mechanic', 'Combo Worker', 'Part Time'];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            // Check if account is blocked
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
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

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
    if (!classification.trim()) { setError('Please select a job classification'); return; }
    if (!question.trim()) { setError('Please ask a question'); return; }

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
          {/* Top row - logo and logout */}
          <div className="flex justify-between items-center mb-3">
            <Link href="/"><h1 className="text-2xl font-bold text-ups-gold">GRIEVANCE AI</h1></Link>
            <button onClick={() => { signOut(auth); router.push('/'); }} className="bg-ups-brown text-ups-gold px-4 py-2 rounded uppercase text-sm font-bold">Logout</button>
          </div>
          {/* Bottom row - nav buttons */}
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
        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-ups-gold mb-1">Welcome, {userName}!</h2>
          <p className="text-gray-400 text-sm">Check if contract violations apply to your situation</p>
        </div>

        {error && <div className="bg-red-900 text-red-100 p-4 rounded mb-6 text-sm">{error}</div>}

        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-ups-gold mb-4">Contract Analysis</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-ups-gold font-semibold mb-2 text-sm">Job Classification</label>
              <select value={classification} onChange={(e) => setClassification(e.target.value)} className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white text-base" disabled={analyzing}>
                <option value="">Select your job type...</option>
                {jobTypes.map((type) => (<option key={type} value={type}>{type}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-ups-gold font-semibold mb-2 text-sm">Ask a Question</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., Can UPS send me home before I get my 8 hours? Describe your situation in detail."
                className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white h-48 text-base"
                disabled={analyzing}
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="w-full bg-ups-brown text-ups-gold py-4 rounded uppercase font-bold text-base disabled:opacity-50"
            >
              {analyzing ? '⏳ Analyzing... Please wait' : 'Analyze'}
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
