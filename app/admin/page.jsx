
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { ref, uploadBytes, listAll, deleteObject } from 'firebase/storage';
import { getStorage } from 'firebase/storage';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';

const storage = getStorage();

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Check if user is admin
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          const userData = userDoc.data();
          
          if (userData?.role === 'admin') {
            setIsAdmin(true);
            loadContracts();
            loadUsers();
          } else {
            // Not admin, redirect to dashboard
            router.push('/dashboard');
          }
        } catch (err) {
          console.error('Error checking admin status:', err);
          router.push('/dashboard');
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const loadContracts = async () => {
    try {
      const contractsRef = ref(storage, 'contracts/shared');
      const result = await listAll(contractsRef);
      
      const contractList = result.items.map(item => ({
        name: item.name,
        path: item.fullPath,
        uploadedAt: new Date(item.metadata?.timeCreated).toLocaleDateString()
      }));
      
      setContracts(contractList);
    } catch (err) {
      console.error('Error loading contracts:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        email: doc.data().email,
        role: doc.data().role || 'user',
        createdAt: doc.data().createdAt
      }));
      
      setUsers(usersList);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'application/json'];
    const validExtensions = ['.pdf', '.json'];
    
    const hasValidType = validTypes.includes(file.type);
    const hasValidExtension = validExtensions.some(ext => file.name.endsWith(ext));

    if (!hasValidType && !hasValidExtension) {
      setError('Please upload a PDF or JSON file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const contractRef = ref(storage, `contracts/shared/${file.name}`);
      await uploadBytes(contractRef, file);
      
      setSuccess(`${file.name} uploaded successfully!`);
      loadContracts();
      e.target.value = '';
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload contract');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteContract = async (path) => {
    if (!window.confirm('Are you sure you want to delete this contract?')) return;

    try {
      const fileRef = ref(storage, path);
      await deleteObject(fileRef);
      setSuccess('Contract deleted successfully!');
      loadContracts();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete contract');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ups-black flex items-center justify-center">
        <p className="text-ups-gold text-xl">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-ups-black flex items-center justify-center">
        <p className="text-red-400 text-xl">Access Denied - Admin Only</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ups-black">
      <header className="border-b border-ups-brown bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/">
            <h1 className="text-3xl font-bold text-ups-gold hover:text-yellow-300 cursor-pointer">
              GRIEVANCE AI
            </h1>
          </Link>
          <div className="space-x-4">
            <Link href="/dashboard">
              <button className="bg-ups-brown hover:bg-ups-gold text-ups-gold hover:text-ups-brown font-bold py-2 px-6 rounded transition-all duration-300 uppercase">
                Dashboard
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="bg-ups-brown hover:bg-ups-gold text-ups-gold hover:text-ups-brown font-bold py-2 px-6 rounded transition-all duration-300 uppercase"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-ups-gold mb-2">Admin Panel</h2>
          <p className="text-gray-400">Manage contracts and users</p>
        </div>

        {error && (
          <div className="bg-red-900 border-2 border-red-600 text-red-100 p-4 rounded mb-8">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900 border-2 border-green-600 text-green-100 p-4 rounded mb-8">
            {success}
          </div>
        )}

        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-ups-gold mb-6">Upload Contract</h3>
          
          <div className="border-2 border-dashed border-ups-brown rounded-lg p-8 text-center mb-6 hover:border-ups-gold transition-colors">
            <label className="cursor-pointer">
              <div className="text-ups-gold text-6xl mb-4">📄</div>
              <p className="text-ups-gold font-semibold mb-2">Choose a Contract File</p>
              <p className="text-gray-400 text-sm mb-4">PDF or JSON</p>
              <input
                type="file"
                accept=".pdf,.json"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <button
                onClick={(e) => e.currentTarget.parentElement.parentElement.querySelector('input').click()}
                disabled={uploading}
                className="bg-ups-brown hover:bg-ups-gold text-ups-gold hover:text-ups-brown font-bold py-2 px-6 rounded transition-all duration-300 uppercase disabled:opacity-50"
              >
                {uploading ? 'UPLOADING...' : 'SELECT FILE'}
              </button>
            </label>
          </div>

          <p className="text-gray-400 text-sm text-center">
            Maximum file size: 10MB • Supported formats: PDF, JSON
          </p>
        </div>

        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-ups-gold mb-6">Shared Contracts ({contracts.length})</h3>
          
          {contracts.length > 0 ? (
            <div className="space-y-3">
              {contracts.map((contract, index) => (
                <div key={index} className="bg-gray-800 border border-ups-brown rounded p-4 flex justify-between items-center">
                  <div>
                    <p className="text-white font-semibold">{contract.name}</p>
                    <p className="text-gray-400 text-sm">Uploaded: {contract.uploadedAt}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteContract(contract.path)}
                    className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-all duration-300 uppercase text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 border-2 border-ups-brown rounded-lg p-8 text-center">
              <p className="text-gray-400">No contracts uploaded yet.</p>
            </div>
          )}
        </div>

        <div className="bg-gray-900 border-2 border-ups-brown rounded-lg p-8">
          <h3 className="text-2xl font-bold text-ups-gold mb-6">Users ({users.length})</h3>
          
          {users.length > 0 ? (
            <div className="space-y-3">
              {users.map((u) => (
                <div key={u.id} className="bg-gray-800 border border-ups-brown rounded p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-semibold">{u.email}</p>
                      <p className="text-gray-400 text-sm">
                        Role: <span className={u.role === 'admin' ? 'text-red-400' : 'text-ups-gold'}>{u.role}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 border-2 border-ups-brown rounded-lg p-8 text-center">
              <p className="text-gray-400">No users found.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
