'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Link from 'next/link';

function GrievanceContent() {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const violation = searchParams.get('violation') || '';
  const classification = searchParams.get('classification') || '';
  const question = searchParams.get('question') || '';

  const [form, setForm] = useState({
    employeeName: '',
    employeeId: '',
    steward: '',
    supervisor: '',
    dateOfIncident: '',
    dateReported: new Date().toISOString().split('T')[0],
    location: '',
    witnesses: '',
    additionalDetails: '',
    remedy: ''
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const name = userDoc.data().name || '';
            setUserName(name);
            setForm(f => ({ ...f, employeeName: name }));
          }
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

  const handleSave = async () => {
    if (!form.employeeName || !form.dateOfIncident) {
      setError('Please fill in your name and date of incident at minimum');
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
        form,
        createdAt: serverTimestamp()
      });
      setSaved(true);
    } catch (err) {
      setError('Failed to save grievance: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="min-h-screen bg-ups-black flex items-center justify-center">
      <p className="text-ups-gold">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-ups-black">
      <header className="border-b border-ups-brown bg-gray-900 p-6 print:hidden">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/"><h1 className="text-3xl font-bold text-ups-gold">GRIEVANCE AI</h1></Link>
          <div className="space-x-4">
            <Link href="/dashboard">
              <button className="bg-ups-brown text-ups-gold px-6 py-2 rounded uppercase">Dashboard</button>
            </Link>
            <button onClick={() => { signOut(auth); router.push('/'); }} className="bg-ups-brown text-ups-gold px-6 py-2 rounded uppercase">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* Print Header */}
        <div className="hidden print:block text-center mb-8">
          <h1 className="text-3xl font-bold">TEAMSTERS LOCAL UNION</h1>
          <h2 className="text-2xl font-bold mt-2">GRIEVANCE FORM</h2>
          <p className="mt-2">United Parcel Service</p>
        </div>

        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8 mb-6 print:border print:border-black print:bg-white print:text-black">
          <h2 className="text-3xl font-bold text-ups-gold mb-2 print:text-black">📄 File Grievance</h2>
          <p className="text-gray-400 print:text-gray-700">Complete the form below to file a formal grievance</p>
        </div>

        {error && <div className="bg-red-900 text-red-100 p-4 rounded mb-6 print:hidden">{error}</div>}
        {saved && <div className="bg-green-900 text-green-100 p-4 rounded mb-6 print:hidden">✅ Grievance saved successfully!</div>}

        {/* Violation Summary */}
        <div className="bg-gray-900 border-2 border-red-700 rounded-lg p-6 mb-6 print:border print:border-black print:bg-white print:text-black">
          <h3 className="text-xl font-bold text-red-400 mb-3 print:text-black">⚠️ Violation Found</h3>
          <p className="text-gray-300 text-sm mb-2 print:text-black"><strong>Job Classification:</strong> {classification}</p>
          <p className="text-gray-300 text-sm mb-3 print:text-black"><strong>Issue:</strong> {question}</p>
          <div className="bg-gray-800 rounded p-4 print:bg-gray-100">
            <p className="text-gray-300 text-sm whitespace-pre-wrap print:text-black">{violation}</p>
          </div>
        </div>

        {/* Grievance Form */}
        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8 mb-6 print:border print:border-black print:bg-white print:text-black">
          <h3 className="text-2xl font-bold text-ups-gold mb-6 print:text-black">Employee Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-ups-gold font-semibold mb-2 print:text-black">Employee Name *</label>
              <input type="text" name="employeeName" value={form.employeeName} onChange={handleChange}
                className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white print:border-black print:bg-white print:text-black" />
            </div>
            <div>
              <label className="block text-ups-gold font-semibold mb-2 print:text-black">Employee ID / Badge #</label>
              <input type="text" name="employeeId" value={form.employeeId} onChange={handleChange}
                className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white print:border-black print:bg-white print:text-black" />
            </div>
            <div>
              <label className="block text-ups-gold font-semibold mb-2 print:text-black">Job Classification</label>
              <input type="text" value={classification} readOnly
                className="w-full bg-gray-700 border border-ups-brown rounded px-4 py-2 text-gray-300 print:border-black print:bg-white print:text-black" />
            </div>
            <div>
              <label className="block text-ups-gold font-semibold mb-2 print:text-black">Location / Building</label>
              <input type="text" name="location" value={form.location} onChange={handleChange}
                placeholder="e.g., Hub 123, Feeder Dept"
                className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white print:border-black print:bg-white print:text-black" />
            </div>
            <div>
              <label className="block text-ups-gold font-semibold mb-2 print:text-black">Date of Incident *</label>
              <input type="date" name="dateOfIncident" value={form.dateOfIncident} onChange={handleChange}
                className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white print:border-black print:bg-white print:text-black" />
            </div>
            <div>
              <label className="block text-ups-gold font-semibold mb-2 print:text-black">Date Reported</label>
              <input type="date" name="dateReported" value={form.dateReported} onChange={handleChange}
                className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white print:border-black print:bg-white print:text-black" />
            </div>
            <div>
              <label className="block text-ups-gold font-semibold mb-2 print:text-black">Supervisor Name</label>
              <input type="text" name="supervisor" value={form.supervisor} onChange={handleChange}
                className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white print:border-black print:bg-white print:text-black" />
            </div>
            <div>
              <label className="block text-ups-gold font-semibold mb-2 print:text-black">Union Steward</label>
              <input type="text" name="steward" value={form.steward} onChange={handleChange}
                className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white print:border-black print:bg-white print:text-black" />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-ups-gold font-semibold mb-2 print:text-black">Witnesses</label>
            <input type="text" name="witnesses" value={form.witnesses} onChange={handleChange}
              placeholder="Names of any witnesses"
              className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white print:border-black print:bg-white print:text-black" />
          </div>

          <div className="mb-4">
            <label className="block text-ups-gold font-semibold mb-2 print:text-black">Additional Details</label>
            <textarea name="additionalDetails" value={form.additionalDetails} onChange={handleChange}
              placeholder="Describe exactly what happened in your own words..."
              className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white h-32 print:border-black print:bg-white print:text-black" />
          </div>

          <div className="mb-4">
            <label className="block text-ups-gold font-semibold mb-2 print:text-black">Remedy Requested</label>
            <textarea name="remedy" value={form.remedy} onChange={handleChange}
              placeholder="What remedy are you requesting? (e.g., payment of 8 hours guarantee pay, cease and desist, etc.)"
              className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white h-24 print:border-black print:bg-white print:text-black" />
          </div>
        </div>

        {/* Signature area for print */}
        <div className="hidden print:block border border-black p-6 mb-6">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="font-bold mb-8">Employee Signature:</p>
              <div className="border-b border-black mb-2"></div>
              <p className="text-sm">Date: _______________</p>
            </div>
            <div>
              <p className="font-bold mb-8">Union Steward Signature:</p>
              <div className="border-b border-black mb-2"></div>
              <p className="text-sm">Date: _______________</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 print:hidden">
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className="flex-1 bg-ups-brown text-ups-gold py-3 rounded uppercase font-bold disabled:opacity-50"
          >
            {saving ? 'Saving...' : saved ? '✅ Saved' : '💾 Save Grievance'}
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 bg-ups-gold text-ups-brown py-3 rounded uppercase font-bold"
          >
            🖨️ Print / Download PDF
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
