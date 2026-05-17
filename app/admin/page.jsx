'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import Link from 'next/link';

const PROTECTED_EMAIL = 'Jakef91@gmail.com';

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

  const isMasterAdmin = (u) => u.email?.toLowerCase() === PROTECTED_EMAIL.toLowerCase();
  const isProtected = (u) => isMasterAdmin(u) || u.protected === true;
  const canToggleProtected = user?.email?.toLowerCase() === PROTECTED_EMAIL.toLowerCase();

  const handleToggleProtected = async (u) => {
    if (isMasterAdmin(u)) { setError('Master admin protection cannot be changed.'); return; }
    const newProtected = !u.protected;
    try {
      await updateDoc(doc(db, 'users', u.id), { protected: newProtected });
      setSuccess(`Account ${newProtected ? 'protected' : 'unprotected'} successfully`);
      loadUsers();
    } catch (err) {
      setError('Failed to update protection status');
    }
  };

  const handleRoleChange = async (u, newRole) => {
    if (isProtected(u)) { setError('This account is protected and cannot be modified.'); return; }
    try {
      await updateDoc(doc(db, 'users', u.id), { role: newRole });
      setSuccess(`Role updated to ${newRole}`);
      loadUsers();
    } catch (err) {
      setError('Failed to update role');
    }
  };

  const handleDisable = async (u) => {
    if (isProtected(u)) { setError('This account is protected and cannot be disabled.'); return; }
    const newStatus = u.status === 'disabled' ? 'active' : 'disabled';
    if (!window.confirm(`Are you sure you want to ${newStatus === 'disabled' ? 'block access for' : 'restore access for'} this account?`)) return;
    try {
      await updateDoc(doc(db, 'users', u.id), { status: newStatus });
      setSuccess(`Account access ${newStatus === 'disabled' ? 'blocked' : 'restored'} successfully`);
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

  const handleDeleteUser = async (u) => {
    if (isProtected(u)) { setError('This account is protected and cannot be deleted.'); return; }
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'users', u.id));
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
      <header className="border-b border-ups-brown bg-gray-900 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-3">
            <Link href="/"><h1 className="text-2xl font-bold text-ups-gold">GRIEVANCE AI</h1></Link>
          </div>
          <Link href="/dashboard">
            <button className="w-full bg-ups-brown text-ups-gold px-3 py-2 rounded uppercase text-sm font-bold">← Back to Dashboard</button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-6 mb-6">
          <h2 className="text-3xl font-bold text-ups-gold mb-2">🔑 Admin Panel</h2>
          <p className="text-gray-400">Manage users and contracts</p>
        </div>

        {error && <div className="bg-red-900 text-red-100 p-4 rounded mb-6">{error}</div>}
        {success && <div className="bg-green-900 text-green-100 p-4 rounded mb-6">{success}</div>}

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          <button onClick={() => setActiveTab('users')} className={`flex-1 py-2 rounded uppercase font-bold text-sm ${activeTab === 'users' ? 'bg-ups-gold text-ups-brown' : 'bg-ups-brown text-ups-gold'}`}>
            👥 Users ({users.length})
          </button>
          <button onClick={() => setActiveTab('contracts')} className={`flex-1 py-2 rounded uppercase font-bold text-sm ${activeTab === 'contracts' ? 'bg-ups-gold text-ups-brown' : 'bg-ups-brown text-ups-gold'}`}>
            📄 Contracts
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-6">
            <h3 className="text-xl font-bold text-ups-gold mb-4">User Management</h3>
            {users.length === 0 ? (
              <p className="text-gray-400">No users found.</p>
            ) : (
              <div className="space-y-4">
                {users.map((u) => (
                  <div key={u.id} className={`bg-gray-800 border rounded-lg p-4 ${u.status === 'disabled' ? 'border-red-700 opacity-60' : isProtected(u) ? 'border-ups-gold' : 'border-ups-brown'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-white font-bold">{u.name || 'No name'}</p>
                          {isMasterAdmin(u) && <span className="text-xs bg-ups-gold text-ups-brown px-2 py-0.5 rounded font-bold">MASTER ADMIN</span>}
                          {!isMasterAdmin(u) && u.protected && <span className="text-xs bg-purple-700 text-white px-2 py-0.5 rounded font-bold">🛡️ PROTECTED</span>}
                        </div>
                        <p className="text-gray-400 text-sm">{u.email}</p>
                        <p className="text-gray-500 text-xs">Joined: {formatDate(u.createdAt)}</p>
                        {u.status === 'disabled' && <p className="text-red-400 text-xs font-bold mt-1">⛔ DISABLED</p>}
                      </div>
                      <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${u.role === 'admin' ? 'bg-ups-gold text-ups-brown' : 'bg-gray-700 text-gray-300'}`}>
                        {u.role || 'user'}
                      </span>
                    </div>

                    {!isProtected(u) && (
                      <div className="flex flex-wrap gap-2">
                        {canToggleProtected && u.role === 'admin' && (
                          <button onClick={() => handleRoleChange(u, 'user')} className="bg-gray-700 text-white px-3 py-1.5 rounded text-xs">Remove Admin</button>
                        )}
                        {canToggleProtected && u.role !== 'admin' && (
                          <button onClick={() => handleRoleChange(u, 'admin')} className="bg-ups-gold text-ups-brown px-3 py-1.5 rounded text-xs font-bold">Make Admin</button>
                        )}
                        <button onClick={() => handleDisable(u)} className={`px-3 py-1.5 rounded text-xs ${u.status === 'disabled' ? 'bg-green-700 text-white' : 'bg-yellow-700 text-white'}`}>
                          {u.status === 'disabled' ? '✅ Restore Access' : '⛔ Block Access'}
                        </button>
                        <button onClick={() => handlePasswordReset(u.email)} className="bg-blue-700 text-white px-3 py-1.5 rounded text-xs">📧 Reset Password</button>
                        {canToggleProtected && (
                          <button onClick={() => handleToggleProtected(u)} className="bg-purple-700 text-white px-3 py-1.5 rounded text-xs">
                            🛡️ Protect
                          </button>
                        )}
                        <button onClick={() => handleDeleteUser(u)} className="bg-red-700 text-white px-3 py-1.5 rounded text-xs">🗑️ Delete</button>
                      </div>
                    )}

                    {isProtected(u) && !isMasterAdmin(u) && (
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => handlePasswordReset(u.email)} className="bg-blue-700 text-white px-3 py-1.5 rounded text-xs">📧 Reset Password</button>
                        {canToggleProtected && (
                          <button onClick={() => handleToggleProtected(u)} className="bg-purple-900 text-white px-3 py-1.5 rounded text-xs">
                            🛡️ Remove Protection
                          </button>
                        )}
                      </div>
                    )}

                    {isMasterAdmin(u) && (
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => handlePasswordReset(u.email)} className="bg-blue-700 text-white px-3 py-1.5 rounded text-xs">📧 Reset Password</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contracts Tab */}
        {activeTab === 'contracts' && (
          <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-6">
            <h3 className="text-xl font-bold text-ups-gold mb-4">Contracts</h3>
            <p className="text-gray-400 mb-4 text-sm">Contracts load directly from GitHub. To update, push new versions to your repo.</p>
            <div className="space-y-3">
              <div className="bg-gray-800 border border-ups-brown rounded p-4">
                <p className="text-ups-gold font-semibold text-sm">Atlantic Area Supplemental Agreement 2023-2028</p>
                <p className="text-gray-500 text-xs mt-1">local-agreement.txt</p>
                <a href="https://raw.githubusercontent.com/foustbrothersllc/foustbrothersllc.github.io-GrievanceAI/main/local-agreement.txt" target="_blank" rel="noreferrer" className="text-blue-400 text-xs">View file →</a>
              </div>
              <div className="bg-gray-800 border border-ups-brown rounded p-4">
                <p className="text-ups-gold font-semibold text-sm">National Master UPS Agreement 2023-2028</p>
                <p className="text-gray-500 text-xs mt-1">master-agreement.txt</p>
                <a href="https://raw.githubusercontent.com/foustbrothersllc/foustbrothersllc.github.io-GrievanceAI/main/master-agreement.txt" target="_blank" rel="noreferrer" className="text-blue-400 text-xs">View file →</a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
