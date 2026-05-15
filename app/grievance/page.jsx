'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Link from 'next/link';

function GrievanceContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generatingRemedy, setGeneratingRemedy] = useState(false);
  const [error, setError] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  const violation = searchParams.get('violation') || '';
  const classification = searchParams.get('classification') || '';
  const question = searchParams.get('question') || '';

  // Extract articles from violation text
  const extractArticles = (text) => {
    const matches = text.match(/Article\s+\d+[\w,\s]*/gi) || [];
    const unique = [...new Set(matches.map(a => a.trim()))];
    return unique.map(a => ({ text: a, selected: true }));
  };

  const [articles, setArticles] = useState([]);
  const [form, setForm] = useState({
    grievantName: '',
    grievantNameCustom: '',
    useCustomName: false,
    phone: '',
    employeeId: '',
    supervisor: '',
    runLoad: '',
    dateOfIncident: '',
    dateFiled: new Date().toISOString().split('T')[0],
    natureOfGrievance: '',
    remedy: ''
  });

  useEffect(() => {
    if (violation) {
      setArticles(extractArticles(violation));
      // Set nature of grievance from question
      setForm(f => ({ ...f, natureOfGrievance: question }));
    }
  }, [violation, question]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setForm(f => ({
              ...f,
              grievantName: data.name || '',
              phone: data.phone || '',
              employeeId: data.employeeId || ''
            }));
          }
        } catch (err) {
          console.error(err);
        }

        // Load all users for dropdown
        try {
          const { getDocs } = await import('firebase/firestore');
          const snapshot = await getDocs(collection(db, 'users'));
          setAllUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (err) {
          console.error(err);
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNameSelect = (e) => {
    const val = e.target.value;
    if (val === '__custom__') {
      setForm(f => ({ ...f, useCustomName: true, grievantName: '' }));
    } else {
      const selected = allUsers.find(u => u.name === val);
      setForm(f => ({
        ...f,
        useCustomName: false,
        grievantName: val,
        phone: selected?.phone || f.phone,
        employeeId: selected?.employeeId || f.employeeId
      }));
    }
  };

  const toggleArticle = (index) => {
    setArticles(prev => prev.map((a, i) => i === index ? { ...a, selected: !a.selected } : a));
  };

  const generateRemedy = async () => {
    setGeneratingRemedy(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classification,
          question: `Based on this violation: "${violation}" - Generate a specific remedy request for a grievance form. List the specific remedy (e.g., payment of X hours, cease and desist, make whole, etc.). Be specific and concise, 2-3 sentences max.`
        })
      });
      const data = await response.json();
      if (data.analysis) {
        // Extract just the remedy part
        const remedyText = data.analysis.replace(/^(YES|NO).*?:/i, '').trim();
        setForm(f => ({ ...f, remedy: remedyText }));
      }
    } catch (err) {
      setError('Failed to generate remedy');
    } finally {
      setGeneratingRemedy(false);
    }
  };

  const handleSave = async () => {
    const name = form.useCustomName ? form.grievantNameCustom : form.grievantName;
    if (!name || !form.dateOfIncident) {
      setError('Please fill in grievant name and date of incident');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await addDoc(collection(db, 'grievances'), {
        userId: user.uid,
        userEmail: user.email,
        classification,
        question,
        violation,
        articles: articles.filter(a => a.selected).map(a => a.text),
        form: { ...form, grievantName: name },
        createdAt: serverTimestamp()
      });
      setSaved(true);
    } catch (err) {
      setError('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => window.print();

  const selectedArticles = articles.filter(a => a.selected);
  const grievantName = form.useCustomName ? form.grievantNameCustom : form.grievantName;

  if (loading) return (
    <div className="min-h-screen bg-ups-black flex items-center justify-center">
      <p className="text-ups-gold">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-ups-black">
      {/* Screen Header */}
      <header className="border-b border-ups-brown bg-gray-900 p-6 print:hidden">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/"><h1 className="text-3xl font-bold text-ups-gold">GRIEVANCE AI</h1></Link>
          <div className="space-x-4">
            <Link href="/dashboard"><button className="bg-ups-brown text-ups-gold px-6 py-2 rounded uppercase">Dashboard</button></Link>
            <button onClick={() => { signOut(auth); router.push('/'); }} className="bg-ups-brown text-ups-gold px-6 py-2 rounded uppercase">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">

        {/* PRINT VERSION */}
        <div className="hidden print:block">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold uppercase">OFFICIAL GRIEVANCE FORM</h1>
            <h2 className="text-xl font-bold">Teamsters Local Union No. 391</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4 border border-black p-4">
            <div>
              <span className="font-bold">Grievant Name: </span>{grievantName}
            </div>
            <div>
              <span className="font-bold">Date Filed: </span>{form.dateFiled}
            </div>
            <div>
              <span className="font-bold">Classification: </span>{classification} — Violation
            </div>
            <div>
              <span className="font-bold">Date: </span>{form.dateOfIncident}
            </div>
            <div>
              <span className="font-bold">Supervisor: </span>{form.supervisor}
            </div>
            <div>
              <span className="font-bold">Run/Load #: </span>{form.runLoad}
            </div>
          </div>

          <div className="border border-black p-4 mb-4">
            <p className="font-bold mb-2">ARTICLES VIOLATED:</p>
            <p>{selectedArticles.map(a => a.text).join(', ')}</p>
          </div>

          <div className="border border-black p-4 mb-4" style={{minHeight: '150px'}}>
            <p className="font-bold mb-2">NATURE OF GRIEVANCE:</p>
            <p>{form.natureOfGrievance}</p>
            <br/>
            <p className="font-bold mb-2">AI Analysis Summary:</p>
            <p style={{fontSize: '11px'}}>{violation}</p>
          </div>

          <div className="border border-black p-4 mb-6" style={{minHeight: '100px'}}>
            <p className="font-bold mb-2">REMEDY REQUESTED:</p>
            <p>{form.remedy}</p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="border-b border-black mb-1 mt-8"></div>
              <p className="text-sm">Grievant Signature</p>
            </div>
            <div>
              <div className="border-b border-black mb-1 mt-8"></div>
              <p className="text-sm">Shop Steward Signature</p>
            </div>
          </div>
          <p className="text-xs mt-4 italic">Note: Ensure all evidence (logs, DIAD messages, unit numbers) is attached or cited. Provide copies to your Steward and keep one for your personal records.</p>
        </div>

        {/* SCREEN VERSION */}
        <div className="print:hidden">
          <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8 mb-6">
            <h2 className="text-3xl font-bold text-ups-gold mb-2">📄 File Grievance</h2>
            <p className="text-gray-400">Teamsters Local Union No. 391 — Official Grievance Form</p>
          </div>

          {error && <div className="bg-red-900 text-red-100 p-4 rounded mb-6">{error}</div>}
          {saved && <div className="bg-green-900 text-green-100 p-4 rounded mb-6">✅ Grievance saved!</div>}

          {/* Violation Summary */}
          <div className="bg-gray-900 border-2 border-red-700 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-red-400 mb-3">⚠️ Violation Found</h3>
            <p className="text-gray-300 text-sm whitespace-pre-wrap">{violation}</p>
          </div>

          {/* Articles */}
          {articles.length > 0 && (
            <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-ups-gold mb-3">Articles Violated</h3>
              <p className="text-gray-400 text-sm mb-4">Deselect any articles you don't want to include:</p>
              <div className="space-y-2">
                {articles.map((a, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={a.selected}
                      onChange={() => toggleArticle(i)}
                      className="w-4 h-4 accent-ups-gold"
                    />
                    <span className={`text-sm ${a.selected ? 'text-white' : 'text-gray-600 line-through'}`}>{a.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8 mb-6">
            <h3 className="text-2xl font-bold text-ups-gold mb-6">Grievant Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Name - dropdown + custom */}
              <div>
                <label className="block text-ups-gold font-semibold mb-2">Grievant Name *</label>
                <select
                  onChange={handleNameSelect}
                  value={form.useCustomName ? '__custom__' : form.grievantName}
                  className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white mb-2"
                >
                  <option value="">Select a user...</option>
                  {allUsers.map(u => (
                    <option key={u.id} value={u.name}>{u.name}</option>
                  ))}
                  <option value="__custom__">Type a name manually...</option>
                </select>
                {form.useCustomName && (
                  <input
                    type="text"
                    name="grievantNameCustom"
                    value={form.grievantNameCustom}
                    onChange={handleChange}
                    placeholder="Enter name manually"
                    className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white"
                  />
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-ups-gold font-semibold mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                  className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white"
                />
              </div>

              {/* Employee ID */}
              <div>
                <label className="block text-ups-gold font-semibold mb-2">Employee ID</label>
                <input
                  type="text"
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white"
                />
              </div>

              {/* Classification */}
              <div>
                <label className="block text-ups-gold font-semibold mb-2">Classification</label>
                <input
                  type="text"
                  value={classification}
                  readOnly
                  className="w-full bg-gray-700 border border-ups-brown rounded px-4 py-2 text-gray-300"
                />
              </div>

              {/* Date of Incident */}
              <div>
                <label className="block text-ups-gold font-semibold mb-2">Date of Incident *</label>
                <input
                  type="date"
                  name="dateOfIncident"
                  value={form.dateOfIncident}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white"
                />
              </div>

              {/* Date Filed */}
              <div>
                <label className="block text-ups-gold font-semibold mb-2">Date Filed</label>
                <input
                  type="date"
                  name="dateFiled"
                  value={form.dateFiled}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white"
                />
              </div>

              {/* Supervisor */}
              <div>
                <label className="block text-ups-gold font-semibold mb-2">Supervisor</label>
                <input
                  type="text"
                  name="supervisor"
                  value={form.supervisor}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white"
                />
              </div>

              {/* Run/Load # */}
              <div>
                <label className="block text-ups-gold font-semibold mb-2">Run/Load #</label>
                <input
                  type="text"
                  name="runLoad"
                  value={form.runLoad}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white"
                />
              </div>
            </div>

            {/* Nature of Grievance */}
            <div className="mb-4">
              <label className="block text-ups-gold font-semibold mb-2">Nature of Grievance</label>
              <textarea
                name="natureOfGrievance"
                value={form.natureOfGrievance}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white h-32"
              />
            </div>

            {/* Remedy */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-ups-gold font-semibold">Remedy Requested</label>
                <button
                  onClick={generateRemedy}
                  disabled={generatingRemedy}
                  className="bg-ups-gold text-ups-brown px-4 py-1 rounded text-sm font-bold disabled:opacity-50"
                >
                  {generatingRemedy ? 'Generating...' : '✨ AI Generate Remedy'}
                </button>
              </div>
              <textarea
                name="remedy"
                value={form.remedy}
                onChange={handleChange}
                placeholder="Click 'AI Generate Remedy' or type your own..."
                className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white h-32"
              />
            </div>
          </div>

          {/* Action Button */}
          <div>
            <button
              onClick={handlePrint}
              className="w-full bg-ups-gold text-ups-brown py-4 rounded uppercase font-bold text-base"
            >
              🖨️ Print / Download PDF
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function GrievancePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-ups-black flex items-center justify-center">
        <p className="text-ups-gold">Loading...</p>
      </div>
    }>
      <GrievanceContent />
    </Suspense>
  );
}
