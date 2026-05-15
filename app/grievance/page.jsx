'use client';

import { Suspense, useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, getDocs, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Link from 'next/link';

function GrievanceContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingRemedy, setGeneratingRemedy] = useState(false);
  const [error, setError] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const natureRef = useRef(null);
  const remedyRef = useRef(null);

  const violation = searchParams.get('violation') || '';
  const classification = searchParams.get('classification') || '';
  const question = searchParams.get('question') || '';

  const extractArticles = (text) => {
    const matches = text.match(/Article\s+\d+[\w,.\s-]*/gi) || [];
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

  // Auto-resize textarea
  const autoResize = (ref) => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  };

  useEffect(() => { autoResize(natureRef); }, [form.natureOfGrievance]);
  useEffect(() => { autoResize(remedyRef); }, [form.remedy]);

  // Auto-generate nature and remedy when page loads
  const generateContent = useCallback(async () => {
    if (!violation || !classification || !question) return;
    setGeneratingRemedy(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classification,
          question: `Based on this contract violation analysis: "${violation}"
          
And the worker's original question: "${question}"

Generate TWO things for a formal Teamsters grievance form:
1. NATURE OF GRIEVANCE: A clear, professional 2-3 sentence description of the grievance in first person (e.g. "On [date], I was...")
2. REMEDY REQUESTED: A specific remedy citing the contract articles violated.

Format your response EXACTLY like this:
NATURE: [nature text here]
REMEDY: [remedy text here]`
        })
      });
      const data = await response.json();
      if (data.analysis) {
        const text = data.analysis;
        const natureMatch = text.match(/NATURE:\s*(.+?)(?=REMEDY:|$)/s);
        const remedyMatch = text.match(/REMEDY:\s*(.+?)$/s);
        if (natureMatch) setForm(f => ({ ...f, natureOfGrievance: natureMatch[1].trim() }));
        if (remedyMatch) setForm(f => ({ ...f, remedy: remedyMatch[1].trim() }));
      }
    } catch (err) {
      console.error('Failed to generate content:', err);
    } finally {
      setGeneratingRemedy(false);
    }
  }, [violation, classification, question]);

  useEffect(() => {
    if (violation) {
      setArticles(extractArticles(violation));
    }
  }, [violation]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            const rawPhone = data.phone || '';
            setForm(f => ({
              ...f,
              grievantName: data.name || '',
              phone: formatPhone(rawPhone),
              employeeId: data.employeeId || ''
            }));
          }
        } catch (err) {
          console.error(err);
        }

        try {
          const snapshot = await getDocs(collection(db, 'users'));
          setAllUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (err) {
          console.error(err);
        }

        // Auto-generate after user loads
        generateContent();
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router, generateContent]);

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits.length ? '(' + digits : '';
    if (digits.length <= 6) return '(' + digits.slice(0, 3) + ') ' + digits.slice(3);
    return '(' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    setForm({ ...form, phone: formatPhone(e.target.value) });
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
        phone: formatPhone(selected?.phone || f.phone),
        employeeId: selected?.employeeId || f.employeeId
      }));
    }
  };

  const toggleArticle = (index) => {
    setArticles(prev => prev.map((a, i) => i === index ? { ...a, selected: !a.selected } : a));
  };

  const handlePDF = () => {
    window.print();
  };

  const selectedArticles = articles.filter(a => a.selected);
  const grievantName = form.useCustomName ? form.grievantNameCustom : form.grievantName;

  if (loading) return (
    <div className="min-h-screen bg-ups-black flex items-center justify-center">
      <p className="text-ups-gold">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-ups-black">
      <style>{`
        @media print {
          @page { margin: 0.5in; size: letter; }
          body { -webkit-print-color-adjust: exact; }
          a[href]:after { content: none !important; }
          .no-print { display: none !important; }
        }
        textarea { resize: none; overflow: hidden; min-height: 80px; }
      `}</style>

      {/* Screen Header */}
      <header className="border-b border-ups-brown bg-gray-900 p-4 no-print">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-3">
            <Link href="/"><h1 className="text-xl font-bold text-ups-gold">GRIEVANCE AI</h1></Link>
            <button onClick={() => { signOut(auth); router.push('/'); }} className="bg-ups-brown text-ups-gold px-4 py-2 rounded uppercase text-sm font-bold">Logout</button>
          </div>
          <Link href="/dashboard">
            <button className="w-full bg-ups-brown text-ups-gold px-3 py-2 rounded uppercase text-sm font-bold">← Back to Dashboard</button>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">

        {/* PRINT VERSION */}
        <div className="hidden print:block" style={{fontFamily: 'Arial, sans-serif', fontSize: '12px'}}>
          <div style={{textAlign: 'center', marginBottom: '16px'}}>
            <div style={{fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase'}}>OFFICIAL GRIEVANCE FORM</div>
            <div style={{fontSize: '14px', fontWeight: 'bold'}}>Teamsters Local Union No. 391</div>
          </div>

          <table style={{width: '100%', borderCollapse: 'collapse', marginBottom: '8px'}}>
            <tbody>
              <tr>
                <td style={{border: '1px solid black', padding: '6px', width: '50%'}}><strong>Grievant Name:</strong> {grievantName}</td>
                <td style={{border: '1px solid black', padding: '6px', width: '50%'}}><strong>Date Filed:</strong> {form.dateFiled}</td>
              </tr>
              <tr>
                <td style={{border: '1px solid black', padding: '6px'}}><strong>Classification:</strong> {classification} — Violation</td>
                <td style={{border: '1px solid black', padding: '6px'}}><strong>Violation Date:</strong> {form.dateOfIncident}</td>
              </tr>
              <tr>
                <td style={{border: '1px solid black', padding: '6px'}}><strong>Supervisor:</strong> {form.supervisor}</td>
                <td style={{border: '1px solid black', padding: '6px'}}><strong>Run/Load #:</strong> {form.runLoad}</td>
              </tr>
            </tbody>
          </table>

          <div style={{border: '1px solid black', padding: '8px', marginBottom: '8px'}}>
            <div style={{fontWeight: 'bold', marginBottom: '4px'}}>ARTICLES VIOLATED:</div>
            <div>{selectedArticles.map(a => a.text).join(', ')}</div>
          </div>

          <div style={{border: '1px solid black', padding: '8px', marginBottom: '8px', minHeight: '120px'}}>
            <div style={{fontWeight: 'bold', marginBottom: '4px'}}>NATURE OF GRIEVANCE:</div>
            <div style={{whiteSpace: 'pre-wrap'}}>{form.natureOfGrievance}</div>
          </div>

          <div style={{border: '1px solid black', padding: '8px', marginBottom: '16px', minHeight: '100px'}}>
            <div style={{fontWeight: 'bold', marginBottom: '4px'}}>REMEDY REQUESTED:</div>
            <div style={{whiteSpace: 'pre-wrap'}}>{form.remedy}</div>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '24px'}}>
            <div>
              <div style={{borderBottom: '1px solid black', marginBottom: '4px', height: '30px'}}></div>
              <div style={{fontSize: '11px'}}>Grievant Signature</div>
            </div>
            <div>
              <div style={{borderBottom: '1px solid black', marginBottom: '4px', height: '30px'}}></div>
              <div style={{fontSize: '11px'}}>Shop Steward Signature</div>
            </div>
          </div>
          <p style={{fontSize: '10px', marginTop: '12px', fontStyle: 'italic'}}>Note: Ensure all evidence (logs, DIAD messages, unit numbers) is attached or cited. Provide copies to your Steward and keep one for your personal records.</p>
        </div>

        {/* SCREEN VERSION */}
        <div className="print:hidden">
          <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-6 mb-4">
            <h2 className="text-2xl font-bold text-ups-gold mb-1">📄 File Grievance</h2>
            <p className="text-gray-400 text-sm">Teamsters Local Union No. 391</p>
          </div>

          {error && <div className="bg-red-900 text-red-100 p-4 rounded mb-4 text-sm">{error}</div>}

          {generatingRemedy && (
            <div className="bg-blue-900 text-blue-100 p-4 rounded mb-4 text-sm">
              ⏳ AI is drafting your Nature of Grievance and Remedy...
            </div>
          )}

          {/* Violation Summary */}
          <div className="bg-gray-900 border-2 border-red-700 rounded-lg p-4 mb-4">
            <h3 className="text-base font-bold text-red-400 mb-2">⚠️ Violation Found</h3>
            <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">{violation}</p>
          </div>

          {/* Articles */}
          {articles.length > 0 && (
            <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-4 mb-4">
              <h3 className="text-base font-bold text-ups-gold mb-2">Articles Violated</h3>
              <p className="text-gray-400 text-xs mb-3">Deselect any you don't want to include:</p>
              <div className="space-y-2">
                {articles.map((a, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <input type="checkbox" checked={a.selected} onChange={() => toggleArticle(i)} className="w-5 h-5 accent-ups-gold" />
                    <span className={`text-sm ${a.selected ? 'text-white' : 'text-gray-600 line-through'}`}>{a.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-4 mb-4">
            <h3 className="text-xl font-bold text-ups-gold mb-4">Grievant Information</h3>

            <div className="space-y-4">
              {/* Name dropdown + custom */}
              <div>
                <label className="block text-ups-gold font-semibold mb-2 text-sm">Grievant Name *</label>
                <select
                  onChange={handleNameSelect}
                  value={form.useCustomName ? '__custom__' : form.grievantName}
                  className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white text-base mb-2"
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
                    className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white text-base"
                  />
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-ups-gold font-semibold mb-2 text-sm">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handlePhoneChange}
                  placeholder="(336) 555-1234"
                  className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white text-base"
                />
              </div>

              {/* Employee ID */}
              <div>
                <label className="block text-ups-gold font-semibold mb-2 text-sm">Employee ID</label>
                <input
                  type="text"
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white text-base"
                />
              </div>

              {/* Classification */}
              <div>
                <label className="block text-ups-gold font-semibold mb-2 text-sm">Classification</label>
                <input
                  type="text"
                  value={classification}
                  readOnly
                  className="w-full bg-gray-700 border border-ups-brown rounded px-4 py-3 text-gray-300 text-base"
                />
              </div>

              {/* Date of Incident */}
              <div>
                <label className="block text-ups-gold font-semibold mb-2 text-sm">Date of Incident *</label>
                <input
                  type="date"
                  name="dateOfIncident"
                  value={form.dateOfIncident}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white text-base"
                />
              </div>

              {/* Date Filed */}
              <div>
                <label className="block text-ups-gold font-semibold mb-2 text-sm">Date Filed</label>
                <input
                  type="date"
                  name="dateFiled"
                  value={form.dateFiled}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white text-base"
                />
              </div>

              {/* Supervisor */}
              <div>
                <label className="block text-ups-gold font-semibold mb-2 text-sm">Supervisor</label>
                <input
                  type="text"
                  name="supervisor"
                  value={form.supervisor}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white text-base"
                />
              </div>

              {/* Run/Load */}
              <div>
                <label className="block text-ups-gold font-semibold mb-2 text-sm">Run/Load #</label>
                <input
                  type="text"
                  name="runLoad"
                  value={form.runLoad}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white text-base"
                />
              </div>

              {/* Nature of Grievance - auto-expanding */}
              <div>
                <label className="block text-ups-gold font-semibold mb-2 text-sm">Nature of Grievance</label>
                <textarea
                  ref={natureRef}
                  name="natureOfGrievance"
                  value={form.natureOfGrievance}
                  onChange={handleChange}
                  placeholder={generatingRemedy ? 'AI is drafting this...' : 'Describe the grievance...'}
                  className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white text-base"
                  style={{minHeight: '80px', overflow: 'hidden', resize: 'none'}}
                />
              </div>

              {/* Remedy - auto-expanding */}
              <div>
                <label className="block text-ups-gold font-semibold mb-2 text-sm">Remedy Requested</label>
                <textarea
                  ref={remedyRef}
                  name="remedy"
                  value={form.remedy}
                  onChange={handleChange}
                  placeholder={generatingRemedy ? 'AI is drafting this...' : 'Remedy will be auto-generated...'}
                  className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white text-base"
                  style={{minHeight: '80px', overflow: 'hidden', resize: 'none'}}
                />
              </div>
            </div>
          </div>

          {/* PDF Button */}
          <button
            onClick={handlePDF}
            className="w-full bg-ups-gold text-ups-brown py-4 rounded uppercase font-bold text-base mb-8"
          >
            💾 Save as PDF
          </button>
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
