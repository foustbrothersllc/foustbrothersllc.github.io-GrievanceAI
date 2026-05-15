'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

const GEMINI_API_KEY = 'AIzaSyBCsWv144FkqsorpXiTC4_3mRjejj7msoA';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
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
            setUserName(userDoc.data().name || currentUser.email);
            setIsAdmin(userDoc.data().role === 'admin');
          } else {
            setUserName(currentUser.email);
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
          setUserName(currentUser.email);
        }

        try {
          const snapshot = await getDocs(collection(db, 'contracts'));
          setContracts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
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

  const handleAnalyze = async () => {
    if (!classification.trim()) {
      setError('Please select a job classification');
      return;
    }
    if (!question.trim()) {
      setError('Please ask a question');
      return;
    }

    setAnalyzing(true);
    setError('');
    setResults(null);

    try {
      const contractDump = contracts
        .map(c => `=== ${c.name} ===\n${c.text}`)
        .join('\n\n');

      const prompt = `You are a labor relations expert specializing in UPS Teamsters contracts.

A worker has asked the following question:
"${question}"

Their job classification is: ${classification}

Here are the relevant contracts to analyze:
${contractDump}

Based ONLY on the contract language above, answer whether there is a violation.

Start your response with either:
- "YES - VIOLATION FOUND:" if the contract supports their claim
- "NO - NO VIOLATION:" if the contract does not support their claim

Then explain clearly and specifically what the contract says about this situation, citing the relevant section or language if possible. Keep it concise and in plain language a worker can understand.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        }
      );

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) throw new Error('No response from Gemini');
      setResults(text);
    } catch (err) {
      setError(`Analysis failed: ${err.message}`);
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
            {isAdmin && (
              <Link href="/admin">
                <button className="bg-ups-brown text-ups-gold px-6 py-2 rounded uppercase">🔑 Admin</button>
              </Link>
            )}
            <Link href="/settings">
              <button className="bg-ups-brown text-ups-gold px-6 py-2 rounded uppercase">⚙️ Settings</button>
            </Link>
            <button onClick={() => { signOut(auth); router.push('/'); }} className="bg-ups-brown text-ups-gold px-6 py-2 rounded uppercase">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-ups-gold mb-2">Welcome, {userName}!</h2>
          <p className="text-gray-400">Check if contract violations apply to your position</p>
        </div>

        {error && <div className="bg-red-900 text-red-100 p-4 rounded mb-8">{error}</div>}

        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-ups-gold mb-6">Contract Analysis</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-ups-gold font-semibold mb-2">Job Classification</label>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value)}
                className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white"
                disabled={analyzing}
              >
                <option value="">Select your job type...</option>
                {jobTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-ups-gold font-semibold mb-2">Ask a Question</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., Can UPS send me home before I get my 8 hours?"
                className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white h-24"
                disabled={analyzing}
              />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={analyzing || contracts.length === 0}
              className="w-full bg-ups-brown text-ups-gold py-3 rounded uppercase font-bold disabled:opacity-50"
            >
              {analyzing ? 'Analyzing...' : contracts.length === 0 ? 'No Contracts Loaded' : 'Analyze'}
            </button>

            {contracts.length === 0 && !analyzing && (
              <p className="text-gray-500 text-sm text-center">No contracts have been uploaded yet. An admin needs to add contracts first.</p>
            )}
          </div>
        </div>

        {results && (
          <div className={`border-2 rounded-lg p-8 mb-8 ${results.includes('NO') ? 'bg-green-900 border-green-600 text-green-100' : 'bg-red-900 border-red-600 text-red-100'}`}>
            <h3 className="text-2xl font-bold mb-4">
              {results.includes('NO') ? '✅ No Violation Found' : '⚠️ Violation Found'}
            </h3>
            <p className="whitespace-pre-wrap mb-6">{results}</p>
            {results.includes('YES') && (
              <Link href={`/grievance?violation=${encodeURIComponent(results)}&classification=${classification}&question=${encodeURIComponent(question)}`}>
                <button className="w-full bg-ups-gold text-ups-brown py-2 rounded uppercase font-bold">
                  📄 File Grievance
                </button>
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
