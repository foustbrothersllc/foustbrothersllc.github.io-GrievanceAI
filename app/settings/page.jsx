'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Link from 'next/link';

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [address, setAddress] = useState('');
  const [buildingLocation, setBuildingLocation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits.length ? '(' + digits : '';
    if (digits.length <= 6) return '(' + digits.slice(0, 3) + ') ' + digits.slice(3);
    return '(' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6);
  };

  const handlePhoneChange = (e) => {
    setPhone(formatPhone(e.target.value));
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setName(data.name || '');
            setPhone(data.phone || '');
            setEmployeeId(data.employeeId || '');
            setAddress(data.address || '');
            setBuildingLocation(data.buildingLocation || '');
          }
        } catch (err) {
          setError('Failed to load settings');
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name cannot be empty'); return; }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name: name.trim(),
        phone: phone.trim(),
        employeeId: employeeId.trim(),
        address: address.trim(),
        buildingLocation: buildingLocation.trim()
      });
      setSuccess('Settings saved successfully!');
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
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
          <Link href="/hub"><h1 className="text-3xl font-bold text-ups-gold">GRIEVANCE AI</h1></Link>
          <div className="space-x-4">
            <Link href="/hub"><button className="bg-ups-brown text-ups-gold px-6 py-2 rounded uppercase">🏠 Home</button></Link>
            <button onClick={() => { signOut(auth); router.push('/'); }} className="bg-ups-brown text-ups-gold px-6 py-2 rounded uppercase">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-ups-gold mb-2">⚙️ Settings</h2>
          <p className="text-gray-400">Your info is auto-filled on grievance forms</p>
        </div>

        {error && <div className="bg-red-900 text-red-100 p-4 rounded mb-6">{error}</div>}
        {success && <div className="bg-green-900 text-green-100 p-4 rounded mb-6">{success}</div>}

        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8">
          <form onSubmit={handleSave} className="space-y-6">

            <div>
              <label className="block text-ups-gold font-semibold mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white"
                disabled={saving}
                required
              />
            </div>

            <div>
              <label className="block text-ups-gold font-semibold mb-2">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="e.g., (555) 123-4567"
                className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-ups-gold font-semibold mb-2">Employee ID</label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Your UPS Employee ID"
                className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-ups-gold font-semibold mb-2">Home Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., 123 Main St, Greensboro, NC 27401"
                className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white"
                disabled={saving}
              />
              <p className="text-gray-500 text-xs mt-1">Auto-filled on grievance forms as "Address of Filer"</p>
            </div>

            <div>
              <label className="block text-ups-gold font-semibold mb-2">Building Location</label>
              <input
                type="text"
                value={buildingLocation}
                onChange={(e) => setBuildingLocation(e.target.value)}
                placeholder="e.g., Greensboro Hub, Kernersville Center"
                className="w-full bg-gray-800 border border-ups-brown rounded px-4 py-2 text-white"
                disabled={saving}
              />
              <p className="text-gray-500 text-xs mt-1">Your UPS facility — auto-filled on grievance forms</p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-ups-brown text-ups-gold py-3 rounded uppercase font-bold"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
