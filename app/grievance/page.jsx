'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Link from 'next/link';

function GrievanceContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
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

  const autoResize = (ref) => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  };

  useEffect(() => { autoResize(natureRef); }, [form.natureOfGrievance]);
  useEffect(() => { autoResize(remedyRef); }, [form.remedy]);

  useEffect(() => {
    if (violation) setArticles(extractArticles(violation));
  }, [violation]);

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
              phone: formatPhone(data.phone || ''),
              employeeId: data.employeeId || ''
            }));
          }
        } catch (err) { console.error(err); }

        try {
          const snapshot = await getDocs(collection(db, 'users'));
          setAllUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (err) { console.error(err); }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits.length ? '(' + digits : '';
    if (digits.length <= 6) return '(' + digits.slice(0, 3) + ') ' + digits.slice(3);
    return '(' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handlePhoneChange = (e) => setForm({ ...form, phone: formatPhone(e.target.value) });

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

  const selectedArticles = articles.filter(a => a.selected);
  const grievantName = form.useCustomName ? form.grievantNameCustom : form.grievantName;

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const response = await fetch('/api/grievance-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grievantName,
          dateOfIncident: form.dateOfIncident,
          runLoad: form.runLoad,
          classification,
          selectedArticles: selectedArticles.map(a => a.text),
          violation,
          question
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      if (data.nature) setForm(f => ({ ...f, natureOfGrievance: data.nature }));
      if (data.remedy) setForm(f => ({ ...f, remedy: data.remedy }));
    } catch (err) {
      setError('Failed to generate: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveAsPDF = () => {
    const articlesText = selectedArticles.map(a => a.text).join(', ');
    const currentName = form.useCustomName ? form.grievantNameCustom : form.grievantName;
    const currentPhone = form.phone || '';
    const currentEmployeeId = form.employeeId || '';

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Grievance Form - ${currentName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 8.5in; background: white; color: black; }
    body { font-family: Arial, sans-serif; font-size: 12px; padding: 0.75in; }
    h1 { font-size: 16px; text-align: center; text-transform: uppercase; margin-bottom: 4px; }
    h2 { font-size: 14px; text-align: center; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    td { border: 1px solid black; padding: 6px 8px; width: 50%; vertical-align: top; }
    .section { border: 1px solid black; padding: 8px; margin-bottom: 12px; min-height: 80px; }
    .section-title { font-weight: bold; margin-bottom: 6px; font-size: 11px; text-transform: uppercase; }
    .section-content { white-space: pre-wrap; line-height: 1.5; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-top: 30px; }
    .sig-block {}
    .sig-line { border-bottom: 1px solid black; margin-bottom: 4px; height: 40px; }
    .sig-label { font-size: 10px; }
    .note { font-size: 9px; font-style: italic; margin-top: 12px; }
    @media print {
      html, body { width: 100%; }
      @page { size: letter; margin: 0.75in; }
      body { padding: 0; }
      a { display: none; }
    }
    @media screen {
      body { max-width: 8.5in; margin: 0 auto; box-shadow: 0 0 10px rgba(0,0,0,0.3); min-height: 11in; }
    }
  </style>
</head>
<body>
  <h1>Official Grievance Form</h1>
  <h2>Teamsters Local Union No. 391</h2>
  <table>
    <tr>
      <td><strong>Grievant Name:</strong> ${currentName}</td>
      <td><strong>Phone:</strong> ${currentPhone}</td>
    </tr>
    <tr>
      <td><strong>Employee ID:</strong> ${currentEmployeeId}</td>
      <td><strong>Date Filed:</strong> ${form.dateFiled}</td>
    </tr>
    <tr>
      <td><strong>Classification:</strong> ${classification} &mdash; Violation</td>
      <td><strong>Violation Date:</strong> ${form.dateOfIncident}</td>
    </tr>
    <tr>
      <td><strong>Immediate Supervisor:</strong> ${form.supervisor}</td>
      <td><strong>Run/Load #:</strong> ${form.runLoad}</td>
    </tr>
  </table>
  <div class="section">
    <div class="section-title">Articles Violated:</div>
    <div class="section-content">${articlesText}</div>
  </div>
  <div class="section">
    <div class="section-title">Nature of Grievance:</div>
    <div class="section-content">${form.natureOfGrievance}</div>
  </div>
  <div class="section">
    <div class="section-title">Remedy Requested:</div>
    <div class="section-content">${form.remedy}</div>
  </div>
  <div class="signatures">
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-label">Grievant Signature</div>
    </div>
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-label">Shop Steward Signature</div>
    </div>
  </div>
  <div class="note">Note: Ensure all evidence (logs, DIAD messages, unit numbers) is attached or cited. Provide copies to your Steward and keep one for your personal records.</div>
  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');
    if (!newWindow) alert('Please allow popups for this site to preview the PDF');
  };

  if (loading) return (
    <div className="min-h-screen bg-ups-black flex items-center justify-center">
      <p className="text-ups-gold">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-ups-black">
      <header className="border-b border-ups-brown bg-gray-900 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-3">
            <Link href="/"><h1 className="text-xl font-bold text-ups-gold">GRIEVANCE AI</h1></Link>
          </div>
          <Link href="/dashboard">
            <button className="w-full bg-ups-brown text-ups-gold px-3 py-2 rounded uppercase text-sm font-bold">← Back to Dashboard</button>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-6 mb-4">
          <h2 className="text-2xl font-bold text-ups-gold mb-1">📄 File Grievance</h2>
          <p className="text-gray-400 text-sm">Teamsters Local Union No. 391</p>
        </div>

        {error && <div className="bg-red-900 text-red-100 p-4 rounded mb-4 text-sm">{error}</div>}

        {/* Violation Summary */}
        <div className="bg-gray-900 border-2 border-red-700 rounded-lg p-4 mb-4">
          <h3 className="text-base font-bold text-red-400 mb-2">⚠️ Violation Found</h3>
          <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">{violation}</p>
        </div>

        {/* Articles */}
        {articles.length > 0 && (
          <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-4 mb-4">
            <h3 className="text-base font-bold text-ups-gold mb-2">Articles Violated</h3>
            <p className="text-gray-400 text-xs mb-3">Deselect any you don't want to include — only selected articles will be used:</p>
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

            <div>
              <label className="block text-ups-gold font-semibold mb-2 text-sm">Grievant Name *</label>
              <select onChange={handleNameSelect} value={form.useCustomName ? '__custom__' : form.grievantName} className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white text-base mb-2">
                <option value="">Select a user...</option>
                {allUsers.map(u => (<option key={u.id} value={u.name}>{u.name}</option>))}
                <option value="__custom__">Type a name manually...</option>
              </select>
              {form.useCustomName && (
                <input type="text" name="grievantNameCustom" value={form.grievantNameCustom} onChange={handleChange} placeholder="Enter name manually" className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white text-base" />
              )}
            </div>

            <div>
              <label className="block text-ups-gold font-semibold mb-2 text-sm">Phone Number</label>
              <input type="tel" name="phone" value={form.phone} onChange={handlePhoneChange} placeholder="(336) 555-1234" className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white text-base" />
            </div>

            <div>
              <label className="block text-ups-gold font-semibold mb-2 text-sm">Employee ID</label>
              <input type="text" name="employeeId" value={form.employeeId} onChange={handleChange} className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white text-base" />
            </div>

            <div>
              <label className="block text-ups-gold font-semibold mb-2 text-sm">Classification</label>
              <input type="text" value={classification} readOnly className="w-full bg-gray-700 border border-ups-brown rounded px-4 py-3 text-gray-300 text-base" />
            </div>

            <div>
              <label className="block text-ups-gold font-semibold mb-2 text-sm">Date of Incident *</label>
              <input type="date" name="dateOfIncident" value={form.dateOfIncident} onChange={handleChange} className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white text-base" />
            </div>

            <div>
              <label className="block text-ups-gold font-semibold mb-2 text-sm">Date Filed</label>
              <input type="date" name="dateFiled" value={form.dateFiled} onChange={handleChange} className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white text-base" />
            </div>

            <div>
              <label className="block text-ups-gold font-semibold mb-2 text-sm">Immediate Supervisor (who you report to)</label>
              <input type="text" name="supervisor" value={form.supervisor} onChange={handleChange} className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white text-base" />
            </div>

            <div>
              <label className="block text-ups-gold font-semibold mb-2 text-sm">Run/Load #</label>
              <input type="text" name="runLoad" value={form.runLoad} onChange={handleChange} className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white text-base" />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-ups-gold text-ups-brown py-4 rounded uppercase font-bold text-base disabled:opacity-50"
            >
              {generating ? '⏳ Generating...' : '✨ Generate Nature & Remedy'}
            </button>

            <div>
              <label className="block text-ups-gold font-semibold mb-2 text-sm">Nature of Grievance</label>
              <textarea ref={natureRef} name="natureOfGrievance" value={form.natureOfGrievance} onChange={handleChange} placeholder="Click Generate above or type manually..." className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white text-base" style={{minHeight: '80px', overflow: 'hidden', resize: 'none'}} />
            </div>

            <div>
              <label className="block text-ups-gold font-semibold mb-2 text-sm">Remedy Requested</label>
              <textarea ref={remedyRef} name="remedy" value={form.remedy} onChange={handleChange} placeholder="Click Generate above or type manually..." className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white text-base" style={{minHeight: '80px', overflow: 'hidden', resize: 'none'}} />
            </div>
          </div>
        </div>

        {/* Save as PDF Button */}
        <button onClick={handleSaveAsPDF} className="w-full bg-ups-gold text-ups-brown py-4 rounded uppercase font-bold text-base mb-8">
          💾 Preview & Save as PDF
        </button>
      </main>
    </div>
  );
}

export default function GrievancePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ups-black flex items-center justify-center"><p className="text-ups-gold">Loading...</p></div>}>
      <GrievanceContent />
    </Suspense>
  );
}
