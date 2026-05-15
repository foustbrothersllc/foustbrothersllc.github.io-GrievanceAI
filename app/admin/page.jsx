'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, auth, sendPasswordResetEmail } from '@/lib/firebase';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import Link from 'next/link';

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        loadUsers();
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const loadUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      setError('Failed to load users');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setSuccess(`Role updated to ${newRole}`);
      loadUsers();
    } catch (err) {
      setError('Failed to update role');
    }
  };

  const handleDisable = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'disabled' ? 'active' : 'disabled';
    if (!window.confirm(`Are you sure you want to ${newStatus === 'disabled' ? 'disable' : 'enable'} this account?`)) return;
    try {
      await updateDoc(doc(db, 'users', userId), { status: newStatus });
      setSuccess(`Account ${newStatus === 'disabled' ? 'disabled' : 'enabled'} successfully`);
      loadUsers();
    } catch (err) {
      setError('Failed to update account status');
    }
  };

  const handlePasswordReset = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(`Password reset email sent to ${email}`);
    } catch (err) {
      setError('Failed to send password reset email');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user from Firestore? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      setSuccess('User deleted');
      loadUsers();
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
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
            <Link href="/dashboard">
              <button className="bg-ups-brown text-ups-gold px-6 py-2 rounded uppercase">Dashboard</button>
            </Link>
            <button onClick={() => { signOut(auth); router.push('/'); }} className="bg-ups-brown text-ups-gold px-6 py-2 rounded uppercase">Logout</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-ups-gold mb-2">🔑 Admin Panel</h2>
          <p className="text-gray-400">Manage users and contracts</p>
        </div>

        {error && <div className="bg-red-900 text-red-100 p-4 rounded mb-6">{error}</div>}
        {success && <div className="bg-green-900 text-green-100 p-4 rounded mb-6">{success}</div>}

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2 rounded uppercase font-bold ${activeTab === 'users' ? 'bg-ups-gold text-ups-brown' : 'bg-ups-brown text-ups-gold'}`}
          >
            👥 Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('contracts')}
            className={`px-6 py-2 rounded uppercase font-bold ${activeTab === 'contracts' ? 'bg-ups-gold text-ups-brown' : 'bg-ups-brown text-ups-gold'}`}
          >
            📄 Contracts
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8">
            <h3 className="text-2xl font-bold text-ups-gold mb-6">User Management</h3>
            {users.length === 0 ? (
              <p className="text-gray-400">No users found.</p>
            ) : (
              <div className="space-y-4">
                {users.map((u) => (
                  <div key={u.id} className={`bg-gray-800 border rounded-lg p-6 ${u.status === 'disabled' ? 'border-red-700 opacity-60' : 'border-ups-brown'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-white font-bold text-lg">{u.name || 'No name'}</p>
                        <p className="text-gray-400">{u.email}</p>
                        <p className="text-gray-500 text-sm">Joined: {formatDate(u.createdAt)}</p>
                        {u.status === 'disabled' && <p className="text-red-400 text-sm font-bold mt-1">⛔ DISABLED</p>}
                      </div>
                      <span className={`px-3 py-1 rounded text-sm font-bold uppercase ${u.role === 'admin' ? 'bg-ups-gold text-ups-brown' : 'bg-gray-700 text-gray-300'}`}>
                        {u.role || 'user'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {/* Role toggle */}
                      {u.role === 'admin' ? (
                        <button
                          onClick={() => handleRoleChange(u.id, 'user')}
                          disabled={u.id === user?.uid}
                          className="bg-gray-700 text-white px-4 py-2 rounded text-sm disabled:opacity-30"
                        >
                          Remove Admin
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRoleChange(u.id, 'admin')}
                          className="bg-ups-gold text-ups-brown px-4 py-2 rounded text-sm font-bold"
                        >
                          Make Admin
                        </button>
                      )}

                      {/* Disable/Enable */}
                      <button
                        onClick={() => handleDisable(u.id, u.status)}
                        disabled={u.id === user?.uid}
                        className={`px-4 py-2 rounded text-sm disabled:opacity-30 ${u.status === 'disabled' ? 'bg-green-700 text-white' : 'bg-yellow-700 text-white'}`}
                      >
                        {u.status === 'disabled' ? '✅ Enable Account' : '⛔ Disable Account'}
                      </button>

                      {/* Password Reset */}
                      <button
                        onClick={() => handlePasswordReset(u.email)}
                        className="bg-blue-700 text-white px-4 py-2 rounded text-sm"
                      >
                        📧 Send Password Reset
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={u.id === user?.uid}
                        className="bg-red-700 text-white px-4 py-2 rounded text-sm disabled:opacity-30"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contracts Tab */}
        {activeTab === 'contracts' && (
          <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8">
            <h3 className="text-2xl font-bold text-ups-gold mb-4">Contracts</h3>
            <p className="text-gray-400 mb-6">Contracts are loaded directly from GitHub. To update contracts, push new versions to your GitHub repo.</p>
            <div className="space-y-3">
              <div className="bg-gray-800 border border-ups-brown rounded p-4">
                <p className="text-ups-gold font-semibold">Atlantic Area Supplemental Agreement 2023-2028</p>
                <p className="text-gray-500 text-sm mt-1">local-agreement.txt</p>
                <a href="https://raw.githubusercontent.com/foustbrothersllc/foustbrothersllc.github.io-GrievanceAI/main/local-agreement.txt" target="_blank" rel="noreferrer" className="text-blue-400 text-sm">View file →</a>
              </div>
              <div className="bg-gray-800 border border-ups-brown rounded p-4">
                <p className="text-ups-gold font-semibold">National Master UPS Agreement 2023-2028</p>
                <p className="text-gray-500 text-sm mt-1">master-agreement.txt</p>
                <a href="https://raw.githubusercontent.com/foustbrothersllc/foustbrothersllc.github.io-GrievanceAI/main/master-agreement.txt" target="_blank" rel="noreferrer" className="text-blue-400 text-sm">View file →</a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
