'use client';

import { Suspense, useEffect, useState, useRef, useCallback } from 'react';
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
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
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
      const articleList = selectedArticles.map(a => a.text).join(', ');
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classification,
          question: `Based on this violation analysis and the articles violated (${articleList}):

VIOLATION: ${violation}

WORKER'S SITUATION: ${question}

Generate TWO things for a formal Teamsters Local 391 grievance form. Be specific, professional, and cite the articles.

Format EXACTLY like this with no extra text before or after:
NATURE: [Write 3-4 sentences in first person describing exactly what happened and how it violated the contract, referencing the specific articles]
REMEDY: [Write 2-3 sentences with the specific remedy requested, including make whole pay, cease and desist, or other appropriate remedies based on the violation]`
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const text = data.analysis || '';
      const natureMatch = text.match(/NATURE:\s*([\s\S]+?)(?=\nREMEDY:|$)/);
      const remedyMatch = text.match(/REMEDY:\s*([\s\S]+?)$/);

      if (natureMatch) setForm(f => ({ ...f, natureOfGrievance: natureMatch[1].trim() }));
      if (remedyMatch) setForm(f => ({ ...f, remedy: remedyMatch[1].trim() }));
    } catch (err) {
      setError('Failed to generate: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveAsPDF = async () => {
    try {
      // Dynamically import jsPDF
      const { jsPDF } = await import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'letter' });
      const margin = 0.75;
      const pageWidth = 8.5;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      // Helper functions
      const addText = (text, x, yPos, options = {}) => {
        pdf.text(text || '', x, yPos, options);
      };

      const addWrappedText = (text, x, yPos, maxWidth) => {
        const lines = pdf.splitTextToSize(text || '', maxWidth);
        pdf.text(lines, x, yPos);
        return lines.length * 0.18;
      };

      const drawRect = (x, yPos, w, h) => {
        pdf.rect(x, yPos, w, h);
      };

      // Title
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      addText('OFFICIAL GRIEVANCE FORM', pageWidth / 2, y, { align: 'center' });
      y += 0.25;
      addText('Teamsters Local Union No. 391', pageWidth / 2, y, { align: 'center' });
      y += 0.35;

      // Info grid
      pdf.setFontSize(10);
      const col1 = margin;
      const col2 = margin + contentWidth / 2;
      const rowH = 0.3;

      const rows = [
        [`Grievant Name: ${grievantName}`, `Date Filed: ${form.dateFiled}`],
        [`Classification: ${classification} — Violation`, `Violation Date: ${form.dateOfIncident}`],
        [`Supervisor: ${form.supervisor}`, `Run/Load #: ${form.runLoad}`],
      ];

      rows.forEach(([left, right]) => {
        drawRect(col1, y, contentWidth / 2, rowH);
        drawRect(col2, y, contentWidth / 2, rowH);
        pdf.setFont('helvetica', 'normal');
        addText(left, col1 + 0.05, y + 0.18);
        addText(right, col2 + 0.05, y + 0.18);
        y += rowH;
      });

      y += 0.1;

      // Articles
      const articlesText = selectedArticles.map(a => a.text).join(', ');
      const articlesBoxH = 0.4;
      drawRect(margin, y, contentWidth, articlesBoxH);
      pdf.setFont('helvetica', 'bold');
      addText('ARTICLES VIOLATED:', margin + 0.05, y + 0.15);
      pdf.setFont('helvetica', 'normal');
      addText(articlesText, margin + 0.05, y + 0.3);
      y += articlesBoxH + 0.1;

      // Nature of Grievance
      const natureLines = pdf.splitTextToSize(form.natureOfGrievance || '', contentWidth - 0.1);
      const natureH = Math.max(1.2, natureLines.length * 0.18 + 0.3);
      drawRect(margin, y, contentWidth, natureH);
      pdf.setFont('helvetica', 'bold');
      addText('NATURE OF GRIEVANCE:', margin + 0.05, y + 0.15);
      pdf.setFont('helvetica', 'normal');
      pdf.text(natureLines, margin + 0.05, y + 0.3);
      y += natureH + 0.1;

      // Remedy
      const remedyLines = pdf.splitTextToSize(form.remedy || '', contentWidth - 0.1);
      const remedyH = Math.max(1.0, remedyLines.length * 0.18 + 0.3);
      drawRect(margin, y, contentWidth, remedyH);
      pdf.setFont('helvetica', 'bold');
      addText('REMEDY REQUESTED:', margin + 0.05, y + 0.15);
      pdf.setFont('helvetica', 'normal');
      pdf.text(remedyLines, margin + 0.05, y + 0.3);
      y += remedyH + 0.3;

      // Signatures
      const sigWidth = contentWidth / 2 - 0.2;
      pdf.line(margin, y, margin + sigWidth, y);
      pdf.line(col2, y, col2 + sigWidth, y);
      y += 0.1;
      pdf.setFontSize(9);
      addText('Grievant Signature', margin, y);
      addText('Shop Steward Signature', col2, y);
      y += 0.3;

      // Note
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      const noteLines = pdf.splitTextToSize('Note: Ensure all evidence (logs, DIAD messages, unit numbers) is attached or cited. Provide copies to your Steward and keep one for your personal records.', contentWidth);
      pdf.text(noteLines, margin, y);

      // Generate blob URL for preview
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      setPdfPreviewUrl(url);

    } catch (err) {
      // Fallback to print if jsPDF fails
      console.error('jsPDF failed, falling back to print:', err);
      window.print();
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-ups-black flex items-center justify-center">
      <p className="text-ups-gold">Loading...</p>
    </div>
  );

  // PDF Preview Modal
  if (pdfPreviewUrl) {
    return (
      <div className="min-h-screen bg-ups-black flex flex-col">
        <div className="bg-gray-900 border-b border-ups-brown p-4 flex justify-between items-center">
          <h2 className="text-ups-gold font-bold text-lg">📄 PDF Preview</h2>
          <div className="flex gap-3">
            <a
              href={pdfPreviewUrl}
              download="grievance.pdf"
              className="bg-ups-gold text-ups-brown px-6 py-2 rounded uppercase font-bold text-sm"
            >
              💾 Download PDF
            </a>
            <button
              onClick={() => setPdfPreviewUrl(null)}
              className="bg-ups-brown text-ups-gold px-6 py-2 rounded uppercase font-bold text-sm"
            >
              ← Back
            </button>
          </div>
        </div>
        <iframe
          src={pdfPreviewUrl}
          className="flex-1 w-full"
          style={{ minHeight: 'calc(100vh - 70px)' }}
          title="Grievance PDF Preview"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ups-black">
      <header className="border-b border-ups-brown bg-gray-900 p-4">
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
              <label className="block text-ups-gold font-semibold mb-2 text-sm">Supervisor</label>
              <input type="text" name="supervisor" value={form.supervisor} onChange={handleChange} className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white text-base" />
            </div>

            <div>
              <label className="block text-ups-gold font-semibold mb-2 text-sm">Run/Load #</label>
              <input type="text" name="runLoad" value={form.runLoad} onChange={handleChange} className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white text-base" />
            </div>

            <div>
              <label className="block text-ups-gold font-semibold mb-2 text-sm">Nature of Grievance</label>
              <textarea ref={natureRef} name="natureOfGrievance" value={form.natureOfGrievance} onChange={handleChange} placeholder="Click 'Generate' below or type manually..." className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white text-base" style={{minHeight: '80px', overflow: 'hidden', resize: 'none'}} />
            </div>

            <div>
              <label className="block text-ups-gold font-semibold mb-2 text-sm">Remedy Requested</label>
              <textarea ref={remedyRef} name="remedy" value={form.remedy} onChange={handleChange} placeholder="Click 'Generate' below or type manually..." className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-3 text-white text-base" style={{minHeight: '80px', overflow: 'hidden', resize: 'none'}} />
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full bg-ups-brown text-ups-gold py-4 rounded uppercase font-bold text-base mb-4 disabled:opacity-50"
        >
          {generating ? '⏳ Generating Nature & Remedy...' : '✨ Generate Nature & Remedy'}
        </button>

        {/* Save as PDF Button */}
        <button
          onClick={handleSaveAsPDF}
          className="w-full bg-ups-gold text-ups-brown py-4 rounded uppercase font-bold text-base mb-8"
        >
          💾 Preview & Save as PDF
        </button>
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
